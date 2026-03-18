# cdp_catapult.py  (SW injector only)
import atexit
import json
import time
import threading
import subprocess
import requests
import pathlib
from pathlib import Path
from websocket import WebSocketApp
from tools.tools_infra.overseer import logger

# Use the project's existing logging pipeline (overseer.setup_logger -> intention_entitled.log).
logger = logger.getChild("cdp_catapult")
sw_relay_logger = logger.getChild("sw_relay")

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[2]

SCRIPTS_WORKERSCOPE = PROJECT_ROOT / "assets" / "scripts" / "workerscope"
PORT = None
# --- SW prelude injector (ServiceWorkerGlobalScope) ---
SW_INJECT_ENABLED = True
SW_PRIMARY = None
SW_LANGS = None
SW_HC = None
SW_DM = None
SW_META = None
# --- Dedicated/Shared Worker CDP_GLOBAL_SEED injector (WorkerGlobalScope) ---
WORKER_SEED_INJECT_ENABLED = True
CDP_GLOBAL_SEED = None
_RUNNING_WORKER_SEED = False
_WORKER_SEED_AUTOATTACH_READY = threading.Event()
_RUNNING = False
_SW_WS = None
_WORKER_SEED_WS = None
_SW_STOPPING = False
_WORKER_SEED_STOPPING = False
_SW_DIAG_BINDING = "__SW_REPORT_DIAG__"


def _is_ws_disconnect_error(err) -> bool:
    if err is None:
        return False
    name = getattr(err.__class__, "__name__", "")
    text = str(err or "")
    text_low = text.lower()
    return (
        name == "WebSocketConnectionClosedException"
        or "connection to remote host was lost" in text_low
        or "connection is already closed" in text_low
        or "socket is already closed" in text_low
    )


def _collect_cdp_tcp_clients(port: int):
    """
    Best-effort OS snapshot of TCP clients connected to the CDP port.
    Returns (listener_pid, clients_by_pid) or None if unavailable.
    """
    try:
        raw = subprocess.check_output(
            ["netstat", "-ano", "-p", "tcp"],
            encoding="utf-8",
            errors="ignore",
        )
    except Exception as e:
        logger.warning("CDP diag: netstat unavailable port=%s err=%r", port, e)
        return None

    suffix = f":{port}"
    listener_pid = None
    clients_by_pid = {}
    for ln in raw.splitlines():
        line = ln.strip()
        if not line.startswith("TCP"):
            continue
        parts = line.split()
        if len(parts) < 5:
            continue
        local_addr, remote_addr, state, pid = parts[1], parts[2], parts[3].upper(), parts[4]
        if local_addr.endswith(suffix) and state == "LISTENING":
            listener_pid = pid
        if local_addr.endswith(suffix) and state == "ESTABLISHED":
            clients_by_pid.setdefault(pid, set()).add(remote_addr)
    return listener_pid, clients_by_pid


def log_cdp_runtime_diag(tag: str):
    port = PORT
    t = threading.current_thread()
    logger.info(
        "CDP diag: tag=%s thread=%s ident=%s native_id=%s port=%s",
        tag,
        t.name,
        t.ident,
        getattr(t, "native_id", None),
        port,
    )
    if not port:
        logger.warning("CDP diag: PORT is not set")
        return

    snap = _collect_cdp_tcp_clients(int(port))
    if snap is None:
        return
    listener_pid, clients_by_pid = snap
    pid_parts = []
    for pid, remotes in sorted(clients_by_pid.items(), key=lambda kv: (str(kv[0]))):
        pid_parts.append(f"{pid}:{len(remotes)}")
    logger.info(
        "CDP diag: listener_pid=%s established_client_pids=%s total_clients=%d",
        listener_pid,
        ",".join(pid_parts) if pid_parts else "none",
        len(clients_by_pid),
    )


def _log_sw_relay_diag(session_id: str, target_id: str, payload):
    record = payload if isinstance(payload, dict) else {}
    level = str(record.get("level") or "info").lower()
    code = str(record.get("code") or "sw_relay:unknown")
    ctx = record.get("ctx") if isinstance(record.get("ctx"), dict) else {}
    err = record.get("error") if isinstance(record.get("error"), dict) else None
    row = {
        "sessionId": session_id,
        "targetId": target_id,
        "level": level,
        "code": code,
        "ctx": ctx,
        "error": err,
    }
    line = json.dumps(row, ensure_ascii=False, sort_keys=True)
    if level in ("error", "fatal"):
        sw_relay_logger.error("SW relay diag: %s", line)
    elif level == "warn":
        sw_relay_logger.warning("SW relay diag: %s", line)
    else:
        sw_relay_logger.info("SW relay diag: %s", line)



def enable_sw_language_inject(language: str, normalized_languages: list[str], hardware_concurrency: int, device_memory: float):
    """
    Enable ServiceWorker injection for navigator.language / navigator.languages.
    Call this BEFORE starting run().

    No logging, no writers, no Debugger/Network hooks.
    """
    global SW_INJECT_ENABLED, SW_PRIMARY, SW_LANGS, SW_HC, SW_DM
    if not isinstance(language, str) or not language.strip():
        raise ValueError("SW inject: language must be non-empty str")
    if not isinstance(normalized_languages, list) or not normalized_languages:
        raise ValueError("SW inject: normalized_languages must be non-empty list")
    for x in normalized_languages:
        if not isinstance(x, str) or not x.strip():
            raise ValueError("SW inject: bad languages entry")
    
    SW_PRIMARY = language
    SW_LANGS = normalized_languages
    if not isinstance(hardware_concurrency, (int, float)) or hardware_concurrency <= 0:
        raise ValueError("SW inject: hardware_concurrency must be positive number")
    SW_HC = int(hardware_concurrency)
    if not isinstance(device_memory, (int, float)) or device_memory <= 0:
        raise ValueError("SW inject: device_memory must be positive number")
    SW_DM = float(device_memory)
    SW_INJECT_ENABLED = True


def enable_worker_seed_inject(global_seed: str):
    """
    Enable Dedicated/Shared worker injection for CDP_GLOBAL_SEED.
    Call this BEFORE starting run_worker_seed().
    This contract is mandatory wherever worker bootstrap expects CDP_GLOBAL_SEED.
    """
    global WORKER_SEED_INJECT_ENABLED, CDP_GLOBAL_SEED
    if not isinstance(global_seed, str) or not global_seed.strip():
        raise ValueError("Worker seed inject: global_seed must be non-empty str")
    CDP_GLOBAL_SEED = global_seed
    WORKER_SEED_INJECT_ENABLED = True
    _WORKER_SEED_AUTOATTACH_READY.clear()


def wait_worker_seed_ready(timeout_s: float = 10.0) -> bool:
    deadline = time.time() + float(timeout_s)
    while time.time() < deadline:
        if _WORKER_SEED_AUTOATTACH_READY.is_set():
            return True
        if not _RUNNING_WORKER_SEED and _WORKER_SEED_WS is None:
            return False
        time.sleep(0.02)
    return _WORKER_SEED_AUTOATTACH_READY.is_set()


def stop():
    global _SW_STOPPING
    ws = _SW_WS
    if ws is None:
        return False
    _SW_STOPPING = True
    try:
        ws.keep_running = False
    except Exception:
        pass
    try:
        ws.close()
    except Exception:
        return False
    return True


def stop_worker_seed():
    global _WORKER_SEED_STOPPING
    ws = _WORKER_SEED_WS
    if ws is None:
        return False
    _WORKER_SEED_STOPPING = True
    _WORKER_SEED_AUTOATTACH_READY.clear()
    try:
        ws.keep_running = False
    except Exception:
        pass
    try:
        ws.close()
    except Exception:
        return False
    return True


def _stop_injectors_atexit():
    try:
        stop_worker_seed()
    except Exception:
        pass
    try:
        stop()
    except Exception:
        pass


atexit.register(_stop_injectors_atexit)


def _build_sw_prelude(language: str, normalized_languages: list[str], hardware_concurrency: int, device_memory: float) -> str:
    if not isinstance(SW_META, dict) or not SW_META:
        raise ValueError("SW inject: expected_client_hints missing")

    prelude_path = SCRIPTS_WORKERSCOPE / "sw_prelude.js"
    if not prelude_path.exists():
        raise FileNotFoundError(prelude_path)

    sw_prelude_js = prelude_path.read_text("utf-8")
    sw_env_js = f"""
(() => {{
  'use strict';
  const G = globalThis;
  const nextEnv = {{
    primary: {json.dumps(language, ensure_ascii=False)},
    langs: {json.dumps(normalized_languages, ensure_ascii=False)},
    hc: {json.dumps(hardware_concurrency)},
    dm: {json.dumps(device_memory)},
    meta: {json.dumps(SW_META, ensure_ascii=False)}
  }};
  const prev = Object.getOwnPropertyDescriptor(G, '__SW_ENV__');
  if (prev && prev.configurable === false) {{
    const cur = ('value' in prev) ? prev.value : G.__SW_ENV__;
    const curJson = JSON.stringify(cur);
    const nextJson = JSON.stringify(nextEnv);
    if (curJson !== nextJson) {{
      throw new Error('SW inject: __SW_ENV__ non-configurable mismatch');
    }}
    return;
  }}
  Object.defineProperty(G, '__SW_ENV__', {{
    value: nextEnv,
    writable: true,
    configurable: true,
    enumerable: false
  }});
}})();
//# sourceURL=sw_prelude_env.js
"""
    return (sw_env_js + "\n" + sw_prelude_js).strip()


def _build_worker_seed_prelude(global_seed: str) -> str:
    if not isinstance(global_seed, str) or not global_seed.strip():
        raise ValueError("Worker seed inject: global_seed must be non-empty str")
    return f"""
(() => {{
  'use strict';
  const G = globalThis;
  const seed = {json.dumps(global_seed, ensure_ascii=False)};
  const d = Object.getOwnPropertyDescriptor(G, 'CDP_GLOBAL_SEED');
  if (d && d.configurable === false) {{
    const cur = ('value' in d) ? d.value : G.CDP_GLOBAL_SEED;
    if (String(cur) !== String(seed)) {{
      throw new Error('WorkerSeed: CDP_GLOBAL_SEED non-configurable mismatch');
    }}
    return;
  }}
  try {{
    Object.defineProperty(G, 'CDP_GLOBAL_SEED', {{
      value: String(seed),
      writable: false,
      configurable: false,
      enumerable: false
    }});
  }} catch (e) {{
    const writer = (typeof G.__DEGRADE__ === 'function') ? G.__DEGRADE__ : null;
    if (writer && typeof writer.diag === 'function') {{
      writer.diag('error', 'worker_seed_env:apply:define_failed', {{
        module: 'worker_seed_env',
        diagTag: 'worker_seed_env',
        surface: 'worker_seed_env',
        key: 'CDP_GLOBAL_SEED',
        stage: 'apply',
        message: 'CDP_GLOBAL_SEED define failed',
        type: 'browser structure missing data',
        data: {{ outcome: 'throw', reason: 'define_failed' }}
      }}, e);
    }} else if (writer) {{
      writer('worker_seed_env:apply:define_failed', e, {{
        level: 'error',
        module: 'worker_seed_env',
        diagTag: 'worker_seed_env',
        surface: 'worker_seed_env',
        key: 'CDP_GLOBAL_SEED',
        stage: 'apply',
        message: 'CDP_GLOBAL_SEED define failed',
        type: 'browser structure missing data',
        data: {{ outcome: 'throw', reason: 'define_failed' }}
      }});
    }}
    throw e;
  }}
}})();
//# sourceURL=worker_seed_env.js
""".strip()

def get_ws_url():
    port = PORT
    if not port:
        logger.error("SW inject: CDP PORT is not set (PATCH_SKIPPED)")
        raise RuntimeError("CDP PORT is not set")

    first_attempt_ts = time.time()
    deadline = time.time() + 10.0
    last_err = None

    logger.info("SW inject: probing CDP /json endpoints on 127.0.0.1:%s (timeout=10s)", port)

    while time.time() < deadline:
        try:
            r = requests.get(f"http://127.0.0.1:{port}/json/version", timeout=0.5)
            info = r.json()
            ws = info.get("webSocketDebuggerUrl")
            if ws:
                return ws
        except Exception as e:
            last_err = e

        try:
            r = requests.get(f"http://127.0.0.1:{port}/json", timeout=0.5)
            targets = r.json()
            browser = next((t for t in targets if t.get("type") == "browser" and t.get("webSocketDebuggerUrl")), None)
            if browser:
                return browser["webSocketDebuggerUrl"]
        except Exception as e:
            last_err = e

        time.sleep(0.2)

    elapsed = time.time() - first_attempt_ts
    logger.error(
        "SW inject: CDP /json not available on 127.0.0.1:%s after %.2fs; last_err=%r (PATCH_SKIPPED)",
        port, elapsed, last_err
    )
    raise RuntimeError(f"CDP /json not available on 127.0.0.1:{port}; last_err={last_err!r}")


def run():
    """
    Lightweight SW injector loop:
    - connects to CDP
    - auto-attaches to targets with waitForDebuggerOnStart=false (do NOT pause SW on start)
    - uses "flatten" protocol (required for browser-level auto-attach)
    - resumes non-service_worker targets immediately
    - for service_worker targets: Runtime.enable + Runtime.evaluate(prelude) + sanity + (optional) resume
    """
    global _RUNNING, _SW_WS, _SW_STOPPING
    if _RUNNING:
        return
    _RUNNING = True
    _SW_STOPPING = False

    if not SW_INJECT_ENABLED:
        _RUNNING = False
        logger.error("SW inject: disabled flag encountered (PATCH_SKIPPED)")
        raise RuntimeError("SW inject: disabled")

    do_prelude = True
    do_resume = True

    try:
        ws_url = get_ws_url()
    except Exception as e:
        _RUNNING = False
        logger.exception("SW inject: get_ws_url failed (PATCH_SKIPPED)")
        raise ValueError("SW inject: fail") from e

    logger.info("SW inject: CDP websocket starting: %s", ws_url)
    log_cdp_runtime_diag("sw_run_before_ws")

    msg_id = {"v": 0}
    injected = set()   # targetId set
    sw_prelude = None
    if do_prelude:
        sw_prelude = _build_sw_prelude(SW_PRIMARY, SW_LANGS, SW_HC, SW_DM)

    # Post-inject sanity probe (read back values in the SW context).
    sanity_expr = None
    if do_prelude:
        sanity_expr = (
            "(() => {"
            " const nav = globalThis.navigator;"
            " if (!nav) return null;"
            " return {"
            "  language: nav.language,"
            "  languages: nav.languages,"
            "  hardwareConcurrency: nav.hardwareConcurrency,"
            "  deviceMemory: nav.deviceMemory,"
             "  uad: nav.userAgentData ? {"
             "    platform: nav.userAgentData.platform,"
             "    mobile: nav.userAgentData.mobile,"
             "    brands: nav.userAgentData.brands,"
             "    fullVersionList: nav.userAgentData.fullVersionList"
             "  } : null"
             " };"
             "})()"
         )

    pending = {}
    pending_sess = {}  # (sessionId, innerId) -> str tag
    session_targets = {}

    fatal = {"err": None, "disconnect": False}

    def _patch_skipped(reason, err=None):
        if err is not None:
            logger.error("SW inject: PATCH_SKIPPED %s err=%r", reason, err)
        else:
            logger.error("SW inject: PATCH_SKIPPED %s", reason)

    def _fatal(ws, reason, err=None):
        if fatal["err"] is None:
            fatal["err"] = RuntimeError(reason)
        _patch_skipped(reason, err)
        try:
            ws.close()
        except Exception:
            pass

    def send(ws, method, params=None, tag=None):
        msg_id["v"] += 1
        mid = msg_id["v"]
        if tag:
            pending[mid] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))

    def send_sess(ws, sessionId, method, params=None):
        # Flatten protocol: include sessionId at the top level.
        msg_id["v"] += 1
        mid = msg_id["v"]
        tag = method
        if params and isinstance(params, dict):
            try:
                if method == "Runtime.evaluate":
                    expr = params.get("expression")
                    if expr == sw_prelude:
                        tag = "Runtime.evaluate:sw_prelude"
                    elif expr == sanity_expr:
                        tag = "Runtime.evaluate:sw_sanity"
                elif method == "Runtime.addBinding" and params.get("name") == _SW_DIAG_BINDING:
                    tag = "Runtime.addBinding:sw_diag"
            except Exception:
                pass
        pending_sess[(sessionId, mid)] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}, "sessionId": sessionId}))

    def on_open(ws):
        log_cdp_runtime_diag("sw_on_open")
        send(ws, "Target.setDiscoverTargets", {"discover": True})

        params = {
            "autoAttach": True,
            # IMPORTANT: do NOT pause SW on start. If the CDP websocket drops, a paused SW can
            # manifest as downstream "NetworkError" / dead worker symptoms.
            "waitForDebuggerOnStart": False,
            # Required for browser-level auto-attach.
            "flatten": True,
            "filter": [{"type": "service_worker", "exclude": False}],
        }

        # важно: ставим tag, иначе обработка ошибки фильтра не сработает
        send(ws, "Target.setAutoAttach", params, tag="autoattach_sw_only")
        logger.info("SW inject: enabled (autoAttach) filter=service_worker")

       
    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
            return

        if "id" in msg:
            mid = msg.get("id")
            sid = msg.get("sessionId")
            tag = None
            if sid:
                tag = pending_sess.pop((sid, mid), None)
            if tag is None:
                tag = pending.pop(mid, None)
            if tag == "autoattach_sw_only" and msg.get("error"):
                _fatal(ws, "autoattach filter unsupported", msg.get("error"))
                return
            # Session-level response error handling (flatten protocol).
            if sid and msg.get("error"):
                if tag == "Runtime.addBinding:sw_diag":
                    logger.warning(
                        "SW inject: diag relay binding unavailable sessionId=%s target=%r err=%r",
                        sid,
                        session_targets.get(sid),
                        msg.get("error"),
                    )
                    return
                _fatal(ws, f"session cmd failed: {tag or 'unknown'}", msg.get("error"))
                return
            # Runtime.evaluate may include exceptionDetails inside result.
            if sid and tag in ("Runtime.evaluate", "Runtime.evaluate:sw_prelude", "Runtime.evaluate:sw_sanity"):
                res = msg.get("result") or {}
                exc = res.get("exceptionDetails")
                if exc:
                    _fatal(ws, "sw prelude Runtime.evaluate exceptionDetails", exc)
                    return
                if tag == "Runtime.evaluate:sw_prelude":
                    logger.info("SW inject: prelude applied (UAD branch)")
                if tag == "Runtime.evaluate:sw_sanity":
                    try:
                        out = (res.get("result") or {}).get("value")
                        exp = {
                            "language": SW_PRIMARY,
                            "languages": SW_LANGS,
                            "hardwareConcurrency": SW_HC,
                            "deviceMemory": SW_DM,
                            "uad": SW_META,
                        }
                        if not isinstance(out, dict):
                            _fatal(ws, "sw sanity: bad result type", out)
                            return
                        if out.get("language") != exp["language"] or list(out.get("languages") or []) != list(exp["languages"]):
                            _fatal(ws, "sw sanity: language mismatch", {"expected": exp, "got": out})
                            return
                        if int(out.get("hardwareConcurrency") or 0) != int(exp["hardwareConcurrency"]):
                            _fatal(ws, "sw sanity: hardwareConcurrency mismatch", {"expected": exp, "got": out})
                            return
                        if float(out.get("deviceMemory") or 0.0) != float(exp["deviceMemory"]):
                            _fatal(ws, "sw sanity: deviceMemory mismatch", {"expected": exp, "got": out})
                            return
                        uad = out.get("uad") or {}
                        if not isinstance(uad, dict):
                            _fatal(ws, "sw sanity: uad bad result type", {"expected": exp, "got": out})
                            return
                        if uad.get("platform") != exp["uad"].get("platform"):
                            _fatal(ws, "sw sanity: uad platform mismatch", {"expected": exp, "got": out})
                            return
                        if uad.get("mobile") != exp["uad"].get("mobile"):
                            _fatal(ws, "sw sanity: uad mobile mismatch", {"expected": exp, "got": out})
                            return
                        if list(uad.get("brands") or []) != list(exp["uad"].get("brands") or []):
                            _fatal(ws, "sw sanity: uad brands mismatch", {"expected": exp, "got": out})
                            return
                        if list(uad.get("fullVersionList") or []) != list(exp["uad"].get("fullVersionList") or []):
                            _fatal(ws, "sw sanity: uad fullVersionList mismatch", {"expected": exp, "got": out})
                            return
                        logger.info("SW inject: sanity OK target values match profile")
                    except Exception as e:
                        _fatal(ws, "sw sanity: parse/compare failed", e)
            return

        if msg.get("method") == "Runtime.bindingCalled":
            params = msg.get("params") or {}
            sid = msg.get("sessionId")
            if params.get("name") != _SW_DIAG_BINDING or not sid:
                return
            target_info = session_targets.get(sid) or {}
            try:
                payload = json.loads(params.get("payload") or "{}")
            except Exception as e:
                logger.warning(
                    "SW relay diag: payload parse failed sessionId=%s targetId=%s err=%r raw=%r",
                    sid,
                    target_info.get("targetId"),
                    e,
                    params.get("payload"),
                )
                return
            _log_sw_relay_diag(sid, target_info.get("targetId"), payload)
            return

        if msg.get("method") == "Target.detachedFromTarget":
            params = msg.get("params") or {}
            sid = params.get("sessionId") or msg.get("sessionId")
            if sid:
                session_targets.pop(sid, None)
            return

        if msg.get("method") != "Target.attachedToTarget":
            return

        p = msg.get("params") or {}
        sessionId = p.get("sessionId") or msg.get("sessionId")
        info = p.get("targetInfo") or {}
        ttype = info.get("type")
        tid = info.get("targetId")
        turl = info.get("url")

        if not sessionId or not tid:
            return

        # Hard isolation: this module must never touch non-SW targets.
        if ttype != "service_worker":
            _patch_skipped(f"non-sw target attached: {ttype}")
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception as e:
                _fatal(ws, "resume non-sw target failed", e)
            return



        if tid in injected:
            return

        injected.add(tid)
        session_targets[sessionId] = {"targetId": tid, "url": turl}
        logger.info("SW inject: attached service_worker targetId=%s sessionId=%s url=%r", tid, sessionId, turl)

        if do_prelude:
            try:
                logger.info("SW inject: injecting prelude+sanity targetId=%s sessionId=%s", tid, sessionId)
                send_sess(ws, sessionId, "Runtime.enable")
                send_sess(ws, sessionId, "Runtime.addBinding", {
                    "name": _SW_DIAG_BINDING
                })
                send_sess(ws, sessionId, "Runtime.evaluate", {
                    "expression": sw_prelude,
                    "awaitPromise": True
                })
                send_sess(ws, sessionId, "Runtime.evaluate", {
                    "expression": sanity_expr,
                    "returnByValue": True,
                    "awaitPromise": False
                })
            except Exception as e:
                _fatal(ws, "sw prelude inject failed", e)
            finally:
                if do_resume:
                    try:
                        send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                        logger.info("SW inject: resumed service_worker targetId=%s", tid)
                    except Exception as e:
                        _fatal(ws, "sw resume failed", e)
        else:
            if do_resume:
                try:
                    send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                except Exception as e:
                    _fatal(ws, "sw resume failed", e)


    def on_error(ws, err):
        if _is_ws_disconnect_error(err):
            fatal["disconnect"] = True
            logger.warning("SW inject: websocket disconnected; stopping loop err=%r", err)
            try:
                ws.close()
            except Exception:
                pass
            return
        _fatal(ws, "cdp websocket error", err)

    def on_close(_ws, code, msg):
        global _RUNNING, _SW_WS, _SW_STOPPING
        _RUNNING = False
        _SW_WS = None
        if _SW_STOPPING:
            logger.info("SW inject: websocket closed by stop request code=%r msg=%r", code, msg)
        elif fatal["disconnect"]:
            logger.info("SW inject: websocket closed after disconnect code=%r msg=%r", code, msg)
        elif code is not None or msg:
            logger.error("SW inject: websocket closed code=%r msg=%r", code, msg)
        _SW_STOPPING = False

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    _SW_WS = ws
    try:
        ws.run_forever()
    finally:
        _SW_WS = None
        _RUNNING = False
        _SW_STOPPING = False
    if fatal["err"]:
        raise fatal["err"]


def run_worker_seed():
    """
    Dedicated/Shared worker seed injector loop:
    - connects to CDP
    - auto-attaches to worker/shared_worker with waitForDebuggerOnStart=true (pauses on start)
    - Runtime.evaluate(seed prelude) before resuming

    IMPORTANT: if the CDP websocket drops mid-session, paused workers may remain paused.
    """
    global _RUNNING_WORKER_SEED, _WORKER_SEED_WS, _WORKER_SEED_STOPPING
    if _RUNNING_WORKER_SEED:
        return
    _RUNNING_WORKER_SEED = True
    _WORKER_SEED_STOPPING = False
    _WORKER_SEED_AUTOATTACH_READY.clear()

    if not WORKER_SEED_INJECT_ENABLED:
        _RUNNING_WORKER_SEED = False
        _WORKER_SEED_AUTOATTACH_READY.clear()
        logger.error("Worker seed inject: contract violation: injector is disabled while worker bootstrap expects CDP_GLOBAL_SEED")
        raise RuntimeError("Worker seed inject: disabled")
    if not isinstance(CDP_GLOBAL_SEED, str) or not CDP_GLOBAL_SEED.strip():
        _RUNNING_WORKER_SEED = False
        _WORKER_SEED_AUTOATTACH_READY.clear()
        logger.error("Worker seed inject: contract violation: CDP_GLOBAL_SEED missing; enable_worker_seed_inject() must run before worker bootstrap")
        raise RuntimeError("Worker seed inject: seed missing")

    try:
        ws_url = get_ws_url()
    except Exception as e:
        _RUNNING_WORKER_SEED = False
        _WORKER_SEED_AUTOATTACH_READY.clear()
        logger.exception("Worker seed inject: get_ws_url failed (PATCH_SKIPPED)")
        raise ValueError("Worker seed inject: fail") from e

    logger.info("Worker seed inject: seed prepared len=%s", len(str(CDP_GLOBAL_SEED)))

    logger.warning("Worker seed inject: CDP websocket starting (waitForDebuggerOnStart=true): %s", ws_url)
    log_cdp_runtime_diag("worker_seed_before_ws")

    msg_id = {"v": 0}
    injected = set()   # targetId set
    injecting = set()  # targetId set (attached, prelude/sanity in progress)
    manual_attach_sent = set()  # targetId set for emergency fallback manual attach
    fallback_attach_timers = {}  # targetId -> Timer
    created_targets = {}  # targetId -> {type,url}
    autoattach_state = {"ready": False}
    sess_meta = {}  # sessionId -> {targetId,type,url}
    target_injection_state = {}  # targetId -> {primary_session, duplicate_sessions, prelude_ok, sanity_ok, resumed, type, url}
    seed_prelude = _build_worker_seed_prelude(CDP_GLOBAL_SEED)
    sanity_expr = (
        "(() => {"
        " const G = globalThis;"
        " let cdpGlobalSeed = null;"
        " try { cdpGlobalSeed = String(G.CDP_GLOBAL_SEED); } catch (e) {}"
        " let coreToStringStateOk = null;"
        " try {"
        "   const s = G.__CORE_TOSTRING_STATE__;"
        "   coreToStringStateOk = !!(s && s.__CORE_TOSTRING_STATE__ === true);"
        " } catch (e) {}"
        " let ensureMarkAsNativeType = null;"
        " try { ensureMarkAsNativeType = (typeof G.__ensureMarkAsNative); } catch (e) {}"
        " return { cdpGlobalSeed, coreToStringStateOk, ensureMarkAsNativeType };"
        "})()"
    )



    pending = {}
    pending_sess = {}  # (sessionId, innerId) -> str tag
    fatal = {"err": None, "disconnect": False}

    def _patch_skipped(reason, err=None):
        if err is not None:
            logger.error("Worker seed inject: PATCH_SKIPPED %s err=%r", reason, err)
        else:
            logger.error("Worker seed inject: PATCH_SKIPPED %s", reason)

    def _fatal(ws, reason, err=None):
        if fatal["err"] is None:
            fatal["err"] = RuntimeError(reason)
        _patch_skipped(reason, err)
        try:
            ws.close()
        except Exception:
            pass

    def _cancel_fallback_timer(target_id):
        timer = fallback_attach_timers.pop(target_id, None)
        if timer is None:
            return
        try:
            timer.cancel()
        except Exception:
            pass

    def _drop_target_state(target_id):
        if not target_id:
            return
        _cancel_fallback_timer(target_id)
        created_targets.pop(target_id, None)
        manual_attach_sent.discard(target_id)
        injecting.discard(target_id)
        target_injection_state.pop(target_id, None)

    def _cleanup_session_state(session_id):
        if not session_id:
            return None
        meta = sess_meta.pop(session_id, None)
        for key in [k for k in list(pending_sess.keys()) if k[0] == session_id]:
            pending_sess.pop(key, None)
        if meta:
            target_id = meta.get("targetId")
            state = target_injection_state.get(target_id)
            if state:
                if state.get("primary_session") == session_id:
                    _drop_target_state(target_id)
                else:
                    state.get("duplicate_sessions", set()).discard(session_id)
        return meta

    def _cleanup_worker_runtime_state():
        for timer in list(fallback_attach_timers.values()):
            try:
                timer.cancel()
            except Exception:
                pass
        fallback_attach_timers.clear()
        created_targets.clear()
        manual_attach_sent.clear()
        sess_meta.clear()
        pending_sess.clear()
        pending.clear()
        injected.clear()
        injecting.clear()
        target_injection_state.clear()

    def _maybe_resume_injected_target(ws, target_id):
        state = target_injection_state.get(target_id)
        if not state or state.get("resumed"):
            return
        if not state.get("prelude_ok") or not state.get("sanity_ok"):
            return
        session_ids = [state.get("primary_session")] + sorted(state.get("duplicate_sessions", set()))
        for session_id in session_ids:
            if not session_id:
                continue
            try:
                send_sess(ws, session_id, "Runtime.runIfWaitingForDebugger")
            except Exception as e:
                _fatal(
                    ws,
                    "worker resume failed",
                    {"sessionId": session_id, "target": sess_meta.get(session_id) or state, "error": repr(e)},
                )
                return
        state["resumed"] = True
        injecting.discard(target_id)
        injected.add(target_id)

    def _schedule_manual_attach_fallback(ws, target_id: str, target_type: str, target_url: str):
        if not target_id:
            return
        created_targets[target_id] = {"type": target_type, "url": target_url}
        if not autoattach_state["ready"]:
            return
        if target_id in injected or target_id in manual_attach_sent or target_id in fallback_attach_timers:
            return

        def _manual_attach_fallback():
            fallback_attach_timers.pop(target_id, None)
            if fatal["err"] is not None or _WORKER_SEED_STOPPING or not autoattach_state["ready"]:
                return
            info = created_targets.get(target_id)
            if info is None or target_id in injected or target_id in manual_attach_sent:
                return
            manual_attach_sent.add(target_id)
            logger.warning(
                "Worker seed inject: auto-attach missing for %s targetId=%s url=%r -> manual fallback attach",
                info.get("type"),
                target_id,
                info.get("url"),
            )
            try:
                send(
                    ws,
                    "Target.attachToTarget",
                    {"targetId": target_id, "flatten": True},
                    tag=f"attach_worker_seed:{target_id}",
                )
            except Exception as e:
                _fatal(ws, "manual attach send failed", {"targetId": target_id, "target": info, "error": repr(e)})

        timer = threading.Timer(0.5, _manual_attach_fallback)
        timer.daemon = True
        fallback_attach_timers[target_id] = timer
        timer.start()

    def send(ws, method, params=None, tag=None):
        msg_id["v"] += 1
        mid = msg_id["v"]
        if tag:
            pending[mid] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))

    def send_sess(ws, sessionId, method, params=None):
        msg_id["v"] += 1
        mid = msg_id["v"]
        tag = method
        if method == "Runtime.evaluate" and params and isinstance(params, dict):
            try:
                expr = params.get("expression")
                if expr == seed_prelude:
                    tag = "Runtime.evaluate:worker_seed_prelude"
                elif expr == sanity_expr:
                    tag = "Runtime.evaluate:worker_seed_sanity"
            except Exception:
                pass
        pending_sess[(sessionId, mid)] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}, "sessionId": sessionId}))

    def on_open(ws):
        log_cdp_runtime_diag("worker_seed_on_open")
        send(ws, "Target.setDiscoverTargets", {"discover": True})
        params = {
            "autoAttach": True,
            "waitForDebuggerOnStart": True,
            "flatten": True,
            "filter": [
                {"type": "worker", "exclude": False},
                {"type": "shared_worker", "exclude": False},
            ],
        }
        send(ws, "Target.setAutoAttach", params, tag="autoattach_worker_seed")
        logger.info("Worker seed inject: enabled (autoAttach) filter=worker,shared_worker")

    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
            return

        if "id" in msg:
            mid = msg.get("id")
            sid = msg.get("sessionId")
            tag = None
            if sid:
                tag = pending_sess.pop((sid, mid), None)
            if tag is None:
                tag = pending.pop(mid, None)
            if tag == "autoattach_worker_seed" and msg.get("error"):
                _fatal(ws, "autoattach filter unsupported", msg.get("error"))
                return
            if tag == "autoattach_worker_seed":
                autoattach_state["ready"] = True
                _WORKER_SEED_AUTOATTACH_READY.set()
                for target_id, info in list(created_targets.items()):
                    _schedule_manual_attach_fallback(
                        ws,
                        target_id,
                        info.get("type"),
                        info.get("url"),
                    )
                return
            if isinstance(tag, str) and tag.startswith("attach_worker_seed:"):
                if msg.get("error"):
                    tid = tag.split(":", 1)[1] if ":" in tag else "unknown"
                    _fatal(
                        ws,
                        "worker seed manual attach failed",
                        {
                            "targetId": tid,
                            "target": created_targets.get(tid),
                            "error": msg.get("error"),
                        },
                    )
                    return
                return
            if sid and msg.get("error"):
                _fatal(
                    ws,
                    f"worker seed session cmd failed: {tag or 'unknown'}",
                    {"sessionId": sid, "target": sess_meta.get(sid), "error": msg.get("error")},
                )
                return
            if sid and tag in ("Runtime.evaluate", "Runtime.evaluate:worker_seed_prelude", "Runtime.evaluate:worker_seed_sanity"):
                res = msg.get("result") or {}
                exc = res.get("exceptionDetails")
                if exc:
                    _fatal(ws, "worker seed Runtime.evaluate exceptionDetails", exc)
                    return
                meta = sess_meta.get(sid) or {}
                tid = meta.get("targetId")
                state = target_injection_state.get(tid) if tid else None
                if tag == "Runtime.evaluate:worker_seed_prelude":
                    if state:
                        state["prelude_ok"] = True
                        _maybe_resume_injected_target(ws, tid)
                if tag == "Runtime.evaluate:worker_seed_sanity":
                    try:
                        out = (res.get("result") or {}).get("value")
                        expected_seed = str(CDP_GLOBAL_SEED)
                        got_seed = out.get("cdpGlobalSeed") if isinstance(out, dict) else None
                        if not isinstance(got_seed, str) or got_seed != expected_seed:
                            _fatal(
                                ws,
                                "worker seed sanity: mismatch",
                                {"expected_len": len(expected_seed), "got": out, "target": sess_meta.get(sid)},
                            )
                            return
                        ttype = meta.get("type")
                        turl = meta.get("url")
                        if state:
                            state["sanity_ok"] = True
                        logger.info(
                            "Worker seed inject: sanity logging successful; CDP_GLOBAL_SEED verified type=%s targetId=%s url=%r seed_len=%s",
                            ttype,
                            tid,
                            turl,
                            len(expected_seed),
                        )
                        if state:
                            _maybe_resume_injected_target(ws, tid)
                    except Exception as e:
                        _fatal(ws, "worker seed sanity: parse/compare failed", e)
            return

        if msg.get("method") == "Target.targetCreated":
            p = msg.get("params") or {}
            info = p.get("targetInfo") or {}
            ttype = info.get("type")
            tid = info.get("targetId")
            turl = info.get("url")
            if ttype in ("worker", "shared_worker") and tid:
                _schedule_manual_attach_fallback(ws, tid, ttype, turl)
            return

        if msg.get("method") == "Target.targetDestroyed":
            p = msg.get("params") or {}
            _drop_target_state(p.get("targetId"))
            return

        if msg.get("method") == "Target.detachedFromTarget":
            p = msg.get("params") or {}
            sid = p.get("sessionId") or msg.get("sessionId")
            meta = _cleanup_session_state(sid)
            if meta:
                _drop_target_state(meta.get("targetId"))
            return

        if msg.get("method") != "Target.attachedToTarget":
            return

        p = msg.get("params") or {}
        sessionId = p.get("sessionId") or msg.get("sessionId")
        info = p.get("targetInfo") or {}
        ttype = info.get("type")
        tid = info.get("targetId")
        turl = info.get("url")

        if not sessionId or not tid:
            return
        _cancel_fallback_timer(tid)
        created_targets.pop(tid, None)
        if ttype not in ("worker", "shared_worker"):
            _patch_skipped(f"non-worker target attached: {ttype}")
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception as e:
                _fatal(ws, "resume non-worker target failed", e)
            return
        sess_meta[sessionId] = {"targetId": tid, "type": ttype, "url": turl}
        if tid in injected:
            logger.warning(
                "Worker seed inject: duplicate attached session targetId=%s sessionId=%s url=%r; resuming duplicate session only",
                tid,
                sessionId,
                turl,
            )
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception as e:
                _fatal(ws, "worker duplicate session resume failed", e)
            return
        if tid in injecting:
            logger.warning(
                "Worker seed inject: duplicate attached session targetId=%s sessionId=%s url=%r; waiting for primary prelude+sanity",
                tid,
                sessionId,
                turl,
            )
            state = target_injection_state.get(tid)
            if state is not None:
                state.setdefault("duplicate_sessions", set()).add(sessionId)
            return
        injecting.add(tid)
        target_injection_state[tid] = {
            "primary_session": sessionId,
            "duplicate_sessions": set(),
            "prelude_ok": False,
            "sanity_ok": False,
            "resumed": False,
            "type": ttype,
            "url": turl,
        }

        logger.info("Worker seed inject: attached %s targetId=%s sessionId=%s url=%r", ttype, tid, sessionId, turl)
        try:
            send_sess(ws, sessionId, "Runtime.enable")
            send_sess(ws, sessionId, "Runtime.evaluate", {"expression": seed_prelude, "awaitPromise": True})
            send_sess(ws, sessionId, "Runtime.evaluate", {"expression": sanity_expr, "returnByValue": True, "awaitPromise": False})
        except Exception as e:
            _fatal(ws, "worker seed inject failed", e)

    def on_error(ws, err):
        if _is_ws_disconnect_error(err):
            fatal["disconnect"] = True
            logger.warning("Worker seed inject: websocket disconnected; stopping loop err=%r", err)
            try:
                ws.close()
            except Exception:
                pass
            return
        _fatal(ws, "cdp websocket error", err)

    def on_close(_ws, code, msg):
        global _RUNNING_WORKER_SEED, _WORKER_SEED_WS, _WORKER_SEED_STOPPING
        _RUNNING_WORKER_SEED = False
        _WORKER_SEED_WS = None
        _WORKER_SEED_AUTOATTACH_READY.clear()
        _cleanup_worker_runtime_state()
        if _WORKER_SEED_STOPPING:
            logger.info("Worker seed inject: websocket closed by stop request code=%r msg=%r", code, msg)
        elif fatal["disconnect"]:
            logger.info("Worker seed inject: websocket closed after disconnect code=%r msg=%r", code, msg)
        elif code is not None or msg:
            logger.error("Worker seed inject: websocket closed code=%r msg=%r", code, msg)
        _WORKER_SEED_STOPPING = False

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    _WORKER_SEED_WS = ws
    try:
        ws.run_forever()
    finally:
        _WORKER_SEED_WS = None
        _RUNNING_WORKER_SEED = False
        _WORKER_SEED_STOPPING = False
        _WORKER_SEED_AUTOATTACH_READY.clear()
        _cleanup_worker_runtime_state()
    if fatal["err"]:
        raise fatal["err"]
