# cdp_catapult.py  (SW bootstrap only)
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

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[2]

SCRIPTS_WORKERSCOPE = PROJECT_ROOT / "assets" / "scripts" / "workerscope"
SCRIPTS_WINDOW_CORE = PROJECT_ROOT / "assets" / "scripts" / "window" / "core"
SCRIPTS_WINDOW_GRAPHICS = PROJECT_ROOT / "assets" / "scripts" / "window" / "patches" / "graphics"
PORT = None
# --- SW bootstrap prelude (ServiceWorkerGlobalScope) ---
SW_BOOTSTRAP_ENABLED = True
SW_PRIMARY = None
SW_LANGS = None
SW_HC = None
SW_DM = None
SW_META = None
SW_WEBGL = None
SW_BOOTSTRAP_ENV = None
SEED_INJECT_ENABLED = False
CDP_GLOBAL_SEED = None
_RUNNING = False
_SW_WS = None
_SW_STOPPING = False
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
    data = ctx.get("data") if isinstance(ctx.get("data"), dict) else {}
    outcome = str(data.get("outcome") or "").lower()
    high_signal = (
        level in ("error", "fatal")
        or outcome in ("throw", "rollback")
        or err is not None
    )
    if not high_signal:
        return
    summary = {
        "code": code,
        "stage": ctx.get("stage"),
        "key": ctx.get("key"),
        "message": ctx.get("message"),
        "outcome": data.get("outcome"),
        "reason": data.get("reason"),
        "sessionId": session_id,
        "targetId": target_id,
    }
    if err:
        summary["error"] = err
    line = json.dumps(summary, ensure_ascii=False, sort_keys=True)
    if level in ("error", "fatal"):
        logger.error("SW relay blocker: %s", line)
    else:
        logger.warning("SW relay blocker: %s", line)



def enable_sw_bootstrap_env(
    *,
    language: str,
    normalized_languages: list[str],
    hardware_concurrency: int,
    device_memory: float,
    meta: dict,
    webgl: dict,
    user_agent: str,
    navigator_platform: str,
):
    """
    Enable ServiceWorker bootstrap env.
    Call this BEFORE starting run().

    No logging, no writers, no Debugger/Network hooks.
    """
    global SW_BOOTSTRAP_ENABLED, SW_PRIMARY, SW_LANGS, SW_HC, SW_DM, SW_META, SW_WEBGL, SW_BOOTSTRAP_ENV
    if not isinstance(language, str) or not language.strip():
        raise ValueError("SW bootstrap: language must be non-empty str")
    if not isinstance(normalized_languages, list) or not normalized_languages:
        raise ValueError("SW bootstrap: normalized_languages must be non-empty list")
    for x in normalized_languages:
        if not isinstance(x, str) or not x.strip():
            raise ValueError("SW bootstrap: bad languages entry")
    if not isinstance(hardware_concurrency, (int, float)) or hardware_concurrency <= 0:
        raise ValueError("SW bootstrap: hardware_concurrency must be positive number")
    if not isinstance(device_memory, (int, float)) or device_memory <= 0:
        raise ValueError("SW bootstrap: device_memory must be positive number")
    if not isinstance(meta, dict) or not meta:
        raise ValueError("SW bootstrap: expected_client_hints missing")
    brands = meta.get("brands")
    full_version_list = meta.get("fullVersionList")
    if not isinstance(brands, list) or not brands:
        raise ValueError("SW bootstrap: expected_client_hints.brands missing")
    if not isinstance(full_version_list, list) or not full_version_list:
        raise ValueError("SW bootstrap: expected_client_hints.fullVersionList missing")
    for key in ("platform", "platformVersion", "uaFullVersion", "architecture", "bitness", "model"):
        if not isinstance(meta.get(key), str):
            raise ValueError(f"SW bootstrap: expected_client_hints.{key} missing")
    if not isinstance(meta.get("mobile"), bool):
        raise ValueError("SW bootstrap: expected_client_hints.mobile missing")
    if not isinstance(meta.get("wow64"), bool):
        raise ValueError("SW bootstrap: expected_client_hints.wow64 missing")
    if not isinstance(meta.get("formFactors"), list):
        raise ValueError("SW bootstrap: expected_client_hints.formFactors missing")
    for list_key, entries in (("brands", brands), ("fullVersionList", full_version_list)):
        for item in entries:
            if not isinstance(item, dict):
                raise ValueError(f"SW bootstrap: expected_client_hints.{list_key} entry invalid")
            if not isinstance(item.get("brand"), str) or not item.get("brand").strip():
                raise ValueError(f"SW bootstrap: expected_client_hints.{list_key} brand missing")
            if not isinstance(item.get("version"), str) or not item.get("version").strip():
                raise ValueError(f"SW bootstrap: expected_client_hints.{list_key} version missing")
    if not isinstance(webgl, dict) or not webgl:
        raise ValueError("SW bootstrap: webgl snapshot missing")
    for key in ("vendor", "renderer", "unmaskedVendor", "unmaskedRenderer"):
        value = webgl.get(key)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"SW bootstrap: bad webgl.{key}")
    if not isinstance(user_agent, str) or not user_agent.strip():
        raise ValueError("SW bootstrap: user_agent must be non-empty str")
    if navigator_platform not in ("Win32", "MacIntel"):
        raise ValueError(f"SW bootstrap: invalid navigator_platform {navigator_platform!r}")

    SW_PRIMARY = language
    SW_LANGS = normalized_languages[:]
    SW_HC = int(hardware_concurrency)
    SW_DM = float(device_memory)
    SW_META = dict(meta)
    sw_ua_data = {
        "brands": [dict(item) for item in brands],
        "mobile": meta["mobile"],
        "platform": meta["platform"],
        "he": {
            "architecture": meta["architecture"],
            "bitness": meta["bitness"],
            "model": meta["model"],
            "platformVersion": meta["platformVersion"],
            "uaFullVersion": meta["uaFullVersion"],
            "fullVersionList": [dict(item) for item in full_version_list],
            "wow64": meta["wow64"],
            "formFactors": list(meta["formFactors"]),
        },
    }
    SW_WEBGL = {
        "vendor": webgl["vendor"],
        "renderer": webgl["renderer"],
        "unmaskedVendor": webgl["unmaskedVendor"],
        "unmaskedRenderer": webgl["unmaskedRenderer"],
    }
    SW_BOOTSTRAP_ENV = {
        "primary": SW_PRIMARY,
        "langs": SW_LANGS[:],
        "acceptLanguageCdp": ",".join(SW_LANGS) if SW_LANGS else SW_PRIMARY,
        "hc": SW_HC,
        "dm": SW_DM,
        "meta": dict(SW_META),
        "uaData": sw_ua_data,
        "webgl": dict(SW_WEBGL),
        "userAgent": user_agent,
        "navigatorPlatform": navigator_platform,
    }
    SW_BOOTSTRAP_ENABLED = True


def enable_seed_inject(global_seed: str):
    global SEED_INJECT_ENABLED, CDP_GLOBAL_SEED
    if not isinstance(global_seed, str) or not global_seed.strip():
        raise ValueError("Worker seed inject: global_seed must be non-empty str")
    CDP_GLOBAL_SEED = global_seed
    SEED_INJECT_ENABLED = True



def _canonicalize_language_list_for_compare(value):
    if not isinstance(value, list):
        return None
    out = []
    seen = set()
    for entry in value:
        if not isinstance(entry, str) or not entry.strip():
            return None
        if entry not in seen:
            seen.add(entry)
            out.append(entry)
    return out


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


def _stop_injectors_atexit():
    try:
        stop()
    except Exception:
        pass


atexit.register(_stop_injectors_atexit)


def _build_sw_bootstrap_prelude(sw_env: dict) -> str:
    if not isinstance(sw_env, dict) or not sw_env:
        raise ValueError("SW inject: env missing")
    ua_data = sw_env.get("uaData")
    webgl = sw_env.get("webgl")
    if not isinstance(ua_data, dict) or not ua_data:
        raise ValueError("SW inject: uaData snapshot missing")
    if not isinstance(webgl, dict) or not webgl:
        raise ValueError("SW inject: webgl snapshot missing")
    for key in ("vendor", "renderer", "unmaskedVendor", "unmaskedRenderer"):
        value = webgl.get(key)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"SW inject: bad webgl.{key}")
    if not isinstance(CDP_GLOBAL_SEED, str) or not CDP_GLOBAL_SEED.strip():
        raise ValueError("SW inject: CDP_GLOBAL_SEED missing for pipeline export layer")
    prelude_path = SCRIPTS_WORKERSCOPE / "sw_prelude.js"
    reflect_path = SCRIPTS_WORKERSCOPE / "set_reflect.js"
    core_window_path = SCRIPTS_WINDOW_CORE / "core_window.js"
    prng_path = SCRIPTS_WINDOW_CORE / "prng_seed.js"
    canvas_path = SCRIPTS_WINDOW_GRAPHICS / "canvas.js"
    context_path = SCRIPTS_WINDOW_CORE / "context.js"
    sw_env_json = json.dumps({
        "scopeKind": "service",
        "lane": "runtime",
        "ua": sw_env.get("userAgent"),
        "language": sw_env.get("primary"),
        "languages": sw_env.get("langs"),
        "deviceMemory": sw_env.get("dm"),
        "hardwareConcurrency": sw_env.get("hc"),
        "uaData": ua_data,
        "webgl": webgl,
    }, ensure_ascii=False)
    sw_prelude_js = prelude_path.read_text("utf-8")
    sw_reflect_js = reflect_path.read_text("utf-8")
    sw_inline_core_window = core_window_path.read_text("utf-8")
    sw_inline_prng = "\n".join([
        _build__seed_value(str(CDP_GLOBAL_SEED)),
        prng_path.read_text("utf-8"),
    ])
    sw_inline_canvas = canvas_path.read_text("utf-8")
    sw_inline_context = context_path.read_text("utf-8")
    inline_sources = "\n".join([
        "const __SW_BOOTSTRAP_ENV__ = " + sw_env_json + ";",
        "const __SW_INLINE_CORE_WINDOW__ = " + json.dumps(sw_inline_core_window, ensure_ascii=False) + ";",
        "const __SW_INLINE_PRNG__ = " + json.dumps(sw_inline_prng, ensure_ascii=False) + ";",
        "const __SW_INLINE_CANVAS_PATCH__ = " + json.dumps(sw_inline_canvas, ensure_ascii=False) + ";",
        "const __SW_INLINE_CONTEXT_PATCH__ = " + json.dumps(sw_inline_context, ensure_ascii=False) + ";",
    ])
    return (inline_sources + "\n" + sw_reflect_js + "\n" + sw_prelude_js).strip()


def _build_sw_user_agent_override(sw_env: dict) -> dict:
    if not isinstance(sw_env, dict) or not sw_env:
        raise ValueError("SW inject: env missing")
    user_agent = sw_env.get("userAgent")
    accept_language_cdp = sw_env.get("acceptLanguageCdp")
    navigator_platform = sw_env.get("navigatorPlatform")
    meta = sw_env.get("meta")
    if not isinstance(user_agent, str) or not user_agent.strip():
        raise ValueError("SW inject: userAgent missing for CDP override")
    if not isinstance(accept_language_cdp, str) or not accept_language_cdp.strip():
        raise ValueError("SW inject: acceptLanguageCdp missing for CDP override")
    if navigator_platform not in ("Win32", "MacIntel"):
        raise ValueError(f"SW inject: invalid navigatorPlatform {navigator_platform!r}")
    if not isinstance(meta, dict) or not meta:
        raise ValueError("SW inject: expected_client_hints missing")
    return {
        "userAgent": user_agent,
        "acceptLanguage": accept_language_cdp,
        "platform": navigator_platform,
        "userAgentMetadata": dict(meta),
    }


def _build__seed_value(global_seed: str) -> str:
    if not isinstance(global_seed, str) or not global_seed.strip():
        raise ValueError("Worker seed inject: global_seed must be non-empty str")
    return f"""
(() => {{
  'use strict';
  const G = globalThis;
  const seed = {json.dumps(global_seed, ensure_ascii=False)};
  try {{
    const d = Object.getOwnPropertyDescriptor(G, 'CDP_GLOBAL_SEED');
    if (d && d.configurable === false) {{
      const cur = ('value' in d) ? d.value : G.CDP_GLOBAL_SEED;
      if (String(cur) !== String(seed)) {{
        throw new Error('WorkerSeed: CDP_GLOBAL_SEED non-configurable mismatch');
      }}
      return;
    }}
  }} catch (e) {{
  }}
  try {{
    Object.defineProperty(G, 'CDP_GLOBAL_SEED', {{
      value: String(seed),
      writable: false,
      configurable: true,
      enumerable: false
    }});
  }} catch (e) {{
    try {{ G.CDP_GLOBAL_SEED = String(seed); }} catch (_e) {{}}
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
    - auto-attaches to service_worker targets with waitForDebuggerOnStart=true
    - uses "flatten" protocol (required for browser-level auto-attach)
    - resumes non-service_worker targets immediately
    - for service_worker targets: Runtime.enable + Runtime.evaluate(prelude) + sanity + (optional) resume
    """
    global _RUNNING, _SW_WS, _SW_STOPPING
    if _RUNNING:
        return
    _RUNNING = True
    _SW_STOPPING = False

    if not SW_BOOTSTRAP_ENABLED:
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

    logger.info("SW bootstrap: CDP websocket starting: %s", ws_url)
    log_cdp_runtime_diag("sw_run_before_ws")

    msg_id = {"v": 0}
    injected = set()   # targetId set
    sw_bootstrap_prelude = None
    sw_user_agent_override = None
    sw_expected = None
    seed_enabled = SEED_INJECT_ENABLED is True
    _seed_value = str(CDP_GLOBAL_SEED or "") if seed_enabled else ""
    sanity_expr = None
    if do_prelude:
        if not isinstance(SW_BOOTSTRAP_ENV, dict):
            _RUNNING = False
            raise RuntimeError("SW bootstrap: SW_BOOTSTRAP_ENV missing")
        sw_expected = {
            "language": SW_BOOTSTRAP_ENV.get("primary"),
            "languages": list(SW_BOOTSTRAP_ENV.get("langs") or []),
            "hardwareConcurrency": int(SW_BOOTSTRAP_ENV.get("hc")),
            "deviceMemory": float(SW_BOOTSTRAP_ENV.get("dm")),
            "meta": SW_BOOTSTRAP_ENV.get("meta"),
            "uad": SW_BOOTSTRAP_ENV.get("uaData"),
        }
        if (
            isinstance(sw_expected["meta"], dict)
            and sw_expected["meta"].get("language") is not None
            and sw_expected["meta"].get("language") != sw_expected["language"]
        ):
            _RUNNING = False
            raise RuntimeError("SW bootstrap: SW_BOOTSTRAP_ENV language mismatch")
        if (
            isinstance(sw_expected["meta"], dict)
            and sw_expected["meta"].get("languages") is not None
            and list(sw_expected["meta"].get("languages") or []) != sw_expected["languages"]
        ):
            _RUNNING = False
            raise RuntimeError("SW bootstrap: SW_BOOTSTRAP_ENV languages mismatch")
        if (
            isinstance(sw_expected["meta"], dict)
            and sw_expected["meta"].get("hardwareConcurrency") is not None
            and int(sw_expected["meta"].get("hardwareConcurrency")) != int(sw_expected["hardwareConcurrency"])
        ):
            _RUNNING = False
            raise RuntimeError("SW bootstrap: SW_BOOTSTRAP_ENV hardwareConcurrency mismatch")
        sw_bootstrap_prelude = _build_sw_bootstrap_prelude(SW_BOOTSTRAP_ENV)
    seed_expected_value = None
    if seed_enabled:
        if not _seed_value:
            _RUNNING = False
            raise RuntimeError("Worker seed inject: CDP_GLOBAL_SEED missing")
        seed_expected_value = _seed_value
        _seed_value = _build__seed_value(_seed_value)


    # Post-inject probes in the service scope.
    seed_sanity_expr = None
    tostring_sanity_expr = None
    if do_prelude:
        seed_sanity_expr = (
            "(() => {"
            " const G = globalThis;"
            " let cdpGlobalSeed = null;"
            " try { cdpGlobalSeed = String(G.CDP_GLOBAL_SEED); } catch (e) {}"
            " return { cdpGlobalSeed };"
            "})()"
        )
        tostring_sanity_expr = (
            "(() => {"
            " const G = globalThis;"
            " const C = (G && G.FernwehContext && typeof G.FernwehContext === 'object') ? G.FernwehContext : null;"
            " const stateRoot = (C && C.state && typeof C.state === 'object') ? C.state : null;"
            " const wrkState = (stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === 'object') ? stateRoot.__WRK__ : null;"
            " const runtimeRoot = (wrkState && wrkState.runtime && typeof wrkState.runtime === 'object') ? wrkState.runtime : null;"
            " let coreToStringStateOk = null;"
            " try {"
            "   const s = runtimeRoot && runtimeRoot.__CORE_TOSTRING_STATE__;"
            "   coreToStringStateOk = !!(s && s.__CORE_TOSTRING_STATE__ === true && typeof s.nativeToString === 'function' && s.overrideMap instanceof WeakMap && s.proxyTargetMap instanceof WeakMap);"
            " } catch (e) {}"
            " let toStringBaselineOk = null;"
            " try {"
            "   const fpToStringDesc = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');"
            "   const existingToString = fpToStringDesc && fpToStringDesc.value;"
            "   const currentRealmToString = (typeof existingToString === 'function') ? existingToString : Function.prototype.toString;"
            "   const s = runtimeRoot && runtimeRoot.__CORE_TOSTRING_STATE__;"
            "   const nativeToString = (s && typeof s.nativeToString === 'function') ? s.nativeToString : null;"
            "   toStringBaselineOk = !!(fpToStringDesc"
            "     && typeof existingToString === 'function'"
            "     && typeof currentRealmToString === 'function'"
            "     && (!nativeToString || (currentRealmToString === nativeToString && Object.getPrototypeOf(currentRealmToString) === Object.getPrototypeOf(nativeToString))));"
            " } catch (e) {}"
            " return { coreToStringStateOk, toStringBaselineOk };"
            "})()"
        )

        logger.info("Worker seed inject: seed prepared len=%s", len(_seed_value))
    sw_user_agent_override = _build_sw_user_agent_override(SW_BOOTSTRAP_ENV)
    sw_hardware_concurrency_override = None
    if isinstance(SW_BOOTSTRAP_ENV, dict):
        sw_hardware_concurrency = SW_BOOTSTRAP_ENV.get("hc")
        if isinstance(sw_hardware_concurrency, (int, float)) and int(sw_hardware_concurrency) > 0:
            sw_hardware_concurrency_override = {
                "hardwareConcurrency": int(sw_hardware_concurrency),
            }


    pending = {}
    pending_sess = {}  # (sessionId, innerId) -> str tag
    session_targets = {}
    pending_sw_resume = {}

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

    def _resume_sw_session(ws, sessionId, why):
        meta = pending_sw_resume.pop(sessionId, None)
        if not meta or not do_resume:
            return
        try:
            send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            logger.info(
                "SW inject: resumed service_worker targetId=%s reason=%s",
                meta.get("targetId"),
                why,
            )
        except Exception as e:
            _fatal(ws, "sw resume failed", e)

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
                    if expr == sw_bootstrap_prelude:
                        tag = "Runtime.evaluate:sw_bootstrap_prelude"
                    elif _seed_value and expr == _seed_value:
                        tag = "Runtime.evaluate:_seed_value"
                    elif seed_sanity_expr and expr == seed_sanity_expr:
                        tag = "Runtime.evaluate:cdp_seed_sanity"
                    elif tostring_sanity_expr and expr == tostring_sanity_expr:
                        tag = "Runtime.evaluate:cdp_tostring_sanity"
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
            # Pause SW before client code so prelude lands before navigator reads.
            "waitForDebuggerOnStart": True,
            # Required for browser-level auto-attach.
            "flatten": True,
            "filter": [{"type": "service_worker", "exclude": False}],
        }

        # важно: ставим tag, иначе обработка ошибки фильтра не сработает
        send(ws, "Target.setAutoAttach", params, tag="autoattach_sw_only")
        logger.info(
            "SW bootstrap: enabled (autoAttach) filter=%s",
            "service_worker",
        )
        if seed_enabled:
            logger.info("Worker seed inject: enabled (autoAttach) filter=service_worker")

       
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
                if tag == "Runtime.evaluate:sw_bootstrap_prelude":
                    _resume_sw_session(ws, sid, "prelude_error")
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
            if sid and tag in ("Runtime.evaluate", "Runtime.evaluate:sw_bootstrap_prelude", "Runtime.evaluate:_seed_value", "Runtime.evaluate:cdp_seed_sanity", "Runtime.evaluate:cdp_tostring_sanity"):
                res = msg.get("result") or {}
                exc = res.get("exceptionDetails")
                if exc:
                    if tag == "Runtime.evaluate:sw_bootstrap_prelude":
                        _resume_sw_session(ws, sid, "prelude_exception")
                    _fatal(ws, "sw prelude Runtime.evaluate exceptionDetails", exc)
                    return
                if tag == "Runtime.evaluate:sw_bootstrap_prelude":
                    logger.info("SW bootstrap: prelude applied (UAD branch)")
                    if tostring_sanity_expr:
                        try:
                            send_sess(ws, sid, "Runtime.evaluate", {
                                "expression": tostring_sanity_expr,
                                "returnByValue": True,
                                "awaitPromise": False,
                            })
                        except Exception as e:
                            _resume_sw_session(ws, sid, "tostring_sanity_send_failed")
                            _fatal(ws, "service toString sanity send failed", e)
                    else:
                        _resume_sw_session(ws, sid, "prelude_applied")
                if tag == "Runtime.evaluate:cdp_seed_sanity":
                    try:
                        out = (res.get("result") or {}).get("value")
                        got_seed = out.get("cdpGlobalSeed") if isinstance(out, dict) else None
                        if not isinstance(got_seed, str) or got_seed != seed_expected_value:
                            _fatal(
                                ws,
                                "service marker sanity: mismatch",
                                {"expected_len": len(seed_expected_value or ""), "got": out},
                            )
                            return
                        target_info = session_targets.get(sid) or {}
                        logger.info(
                            "SW inject: seed accepted; CDP_GLOBAL_SEED verified type=%s targetId=%s url=%r seed_len=%s",
                            target_info.get("type"),
                            target_info.get("targetId"),
                            target_info.get("url"),
                            len(seed_expected_value or ""),
                        )
                    except Exception as e:
                        _fatal(ws, "service seed sanity: parse/compare failed", e)
                if tag == "Runtime.evaluate:cdp_tostring_sanity":
                    try:
                        out = (res.get("result") or {}).get("value")
                        if not bool(out.get("coreToStringStateOk")):
                            _fatal(ws, "service marker sanity: coreToStringState missing/invalid", {"got": out})
                            return
                        if not bool(out.get("toStringBaselineOk")):
                            _fatal(ws, "service marker sanity: Function.prototype.toString baseline invalid", {"got": out})
                            return
                        target_info = session_targets.get(sid) or {}
                        logger.info(
                            "SW inject: toString sanity accepted targetId=%s url=%r coreToStringStateOk=%r toStringBaselineOk=%r",
                            target_info.get("targetId"),
                            target_info.get("url"),
                            out.get("coreToStringStateOk") if isinstance(out, dict) else None,
                            out.get("toStringBaselineOk") if isinstance(out, dict) else None,
                        )
                        _resume_sw_session(ws, sid, "tostring_sanity_ok")
                    except Exception as e:
                        _fatal(ws, "service toString sanity: parse/compare failed", e)
            return

        if msg.get("method") == "Target.targetCreated":
            p = msg.get("params") or {}
            info = p.get("targetInfo") or {}
            ttype = info.get("type")
            tid = info.get("targetId")
            turl = info.get("url")
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
                pending_sw_resume.pop(sid, None)
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

        if seed_enabled and ttype in ("service_worker"):
            if tid in injected:
                return
            session_targets[sessionId] = {"targetId": tid, "url": turl, "type": ttype}
            logger.info("Worker seed inject: attached %s targetId=%s sessionId=%s url=%r", ttype, tid, sessionId, turl)
            try:
                send_sess(ws, sessionId, "Runtime.enable")
                send_sess(ws, sessionId, "Runtime.evaluate", {"expression": _seed_value, "awaitPromise": True})
                send_sess(ws, sessionId, "Runtime.evaluate", {"expression": seed_sanity_expr, "returnByValue": True, "awaitPromise": False})
            except Exception as e:
                _fatal(ws, "worker seed inject failed", e)


        # Hard isolation: this module must never touch unrelated non-SW targets.
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
        if do_prelude and do_resume:
            pending_sw_resume[sessionId] = {"targetId": tid, "url": turl}
        logger.info("SW inject: attached service_worker targetId=%s sessionId=%s url=%r", tid, sessionId, turl)

        if do_prelude:
            try:
                logger.info("SW bootstrap: injecting prelude+sanity targetId=%s sessionId=%s", tid, sessionId)
                send_sess(ws, sessionId, "Emulation.setUserAgentOverride", sw_user_agent_override)
                if sw_hardware_concurrency_override is not None:
                    send_sess(ws, sessionId, "Emulation.setHardwareConcurrencyOverride", sw_hardware_concurrency_override)
                send_sess(ws, sessionId, "Runtime.enable")
                send_sess(ws, sessionId, "Runtime.addBinding", {
                    "name": _SW_DIAG_BINDING
                })
                send_sess(ws, sessionId, "Runtime.evaluate", {
                    "expression": sw_bootstrap_prelude,
                    "awaitPromise": True
                })
            except Exception as e:
                _resume_sw_session(ws, sessionId, "prelude_send_failed")
                _fatal(ws, "sw bootstrap prelude inject failed", e)
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
            logger.info("SW bootstrap: websocket closed by stop request code=%r msg=%r", code, msg)
        elif fatal["disconnect"]:
            logger.info("SW bootstrap: websocket closed after disconnect code=%r msg=%r", code, msg)
        elif code is not None or msg:
            logger.error("SW bootstrap: websocket closed code=%r msg=%r", code, msg)
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
