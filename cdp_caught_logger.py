# cdp_caught_logger.py  (SW injector only)
import json
import time
import requests
from websocket import WebSocketApp
from overseer import logger

# Use the project's existing logging pipeline (overseer.setup_logger -> intention_entitled.log).
logger = logger.getChild("cdp_logger")


PORT = None

# --- SW prelude injector (ServiceWorkerGlobalScope) ---
SW_INJECT_ENABLED = True
SW_PRIMARY = None
SW_LANGS = None
SW_HC = None
SW_DM = None
_RUNNING = False



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


def _build_sw_prelude(language: str, normalized_languages: list[str], hardware_concurrency: int, device_memory: float) -> str:
    # literals via json.dumps; no placeholders
    return (f"""
(() => {{
  'use strict';
  const G = globalThis;

  const primary = {json.dumps(language, ensure_ascii=False)};
  const langs   = {json.dumps(normalized_languages, ensure_ascii=False)};
  const hc      = {json.dumps(hardware_concurrency)};
  const dm      = {json.dumps(device_memory)};

  if (typeof primary !== 'string' || !primary) throw new Error('THW: SW language invalid');
  if (!Array.isArray(langs) || !langs.length) throw new Error('THW: SW languages invalid');
  if (!Number.isFinite(Number(hc)) || Number(hc) <= 0) throw new Error('THW: SW hardwareConcurrency invalid');
  if (!Number.isFinite(Number(dm)) || Number(dm) <= 0) throw new Error('THW: SW deviceMemory invalid');
  try {{ Object.freeze(langs); }} catch(e) {{}}

  const nav = G.navigator;
  if (!nav) throw new Error('THW: SW navigator missing');
  const proto = Object.getPrototypeOf(nav);
  if (!proto) throw new Error('THW: SW navigator proto missing');

  function defAcc(key, getter) {{
    const d = Object.getOwnPropertyDescriptor(proto, key);
    if (d && d.configurable === false) throw new Error('THW: SW ' + key + ' non-configurable');
    Object.defineProperty(proto, key, {{
      get: getter,
      configurable: true,
      enumerable: d ? !!d.enumerable : false,
      set: undefined
    }});
  }}

  defAcc('language',  function(){{ return primary; }});
  defAcc('languages', function(){{ return langs; }});
  defAcc('hardwareConcurrency', function(){{ return Number(hc); }});
  defAcc('deviceMemory', function(){{ return Number(dm); }});

  if (nav.languages[0] !== nav.language) throw new Error('THW: SW language != languages[0]');
}})();
""").strip()

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
    global _RUNNING
    if _RUNNING:
        return
    _RUNNING = True

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

    msg_id = {"v": 0}
    sess_id = {}       # per-session counters
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
            "  deviceMemory: nav.deviceMemory"
            " };"
            "})()"
        )

    pending = {}
    pending_sess = {}  # (sessionId, innerId) -> str tag

    fatal = {"err": None}

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
        if method == "Runtime.evaluate" and params and isinstance(params, dict):
            try:
                expr = params.get("expression")
                if expr == sw_prelude:
                    tag = "Runtime.evaluate:sw_prelude"
                elif expr == sanity_expr:
                    tag = "Runtime.evaluate:sw_sanity"
            except Exception:
                pass
        pending_sess[(sessionId, mid)] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}, "sessionId": sessionId}))

    def on_open(ws):
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
                _fatal(ws, f"session cmd failed: {tag or 'unknown'}", msg.get("error"))
                return
            # Runtime.evaluate may include exceptionDetails inside result.
            if sid and tag in ("Runtime.evaluate", "Runtime.evaluate:sw_prelude", "Runtime.evaluate:sw_sanity"):
                res = msg.get("result") or {}
                exc = res.get("exceptionDetails")
                if exc:
                    _fatal(ws, "sw prelude Runtime.evaluate exceptionDetails", exc)
                    return
                if tag == "Runtime.evaluate:sw_sanity":
                    try:
                        out = (res.get("result") or {}).get("value")
                        exp = {
                            "language": SW_PRIMARY,
                            "languages": SW_LANGS,
                            "hardwareConcurrency": SW_HC,
                            "deviceMemory": SW_DM,
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
                        logger.info("SW inject: sanity OK target values match profile")
                    except Exception as e:
                        _fatal(ws, "sw sanity: parse/compare failed", e)
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
        logger.info("SW inject: attached service_worker targetId=%s sessionId=%s url=%r", tid, sessionId, turl)

        if do_prelude:
            try:
                logger.info("SW inject: injecting prelude+sanity targetId=%s sessionId=%s", tid, sessionId)
                send_sess(ws, sessionId, "Runtime.enable")
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
        _fatal(ws, "cdp websocket error", err)

    def on_close(ws, code, msg):
        global _RUNNING
        _RUNNING = False
        if code is not None or msg:
            logger.error("SW inject: websocket closed code=%r msg=%r", code, msg)

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.run_forever()
    if fatal["err"]:
        raise fatal["err"]
