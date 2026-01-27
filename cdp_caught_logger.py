# cdp_caught_logger.py  (SW injector only)
import json
import time
import requests
from websocket import WebSocketApp

PORT = None

# --- SW prelude injector (ServiceWorkerGlobalScope) ---
SW_INJECT_ENABLED = True
SW_PRIMARY = None
SW_LANGS = None
SW_HC = None
SW_DM = None
# Injection mode: "both" | "worker_only" | "prelude_only"
SW_INJECT_MODE = "both"
# Auto-attach strategy: "service_worker_only" avoids pausing non-SW targets.
SW_AUTOATTACH_MODE = "service_worker_only"  # or "all_targets"

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
        raise RuntimeError("CDP PORT is not set")

    deadline = time.time() + 10.0
    last_err = None

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

    raise RuntimeError(f"CDP /json not available on 127.0.0.1:{port}; last_err={last_err!r}")


def run():
    """
    Lightweight SW injector loop:
    - connects to CDP
    - auto-attaches to targets with waitForDebuggerOnStart=true
    - resumes non-service_worker targets immediately
    - for service_worker targets: Runtime.enable + Runtime.evaluate(prelude) + resume
    """
    global _RUNNING
    if _RUNNING:
        return
    _RUNNING = True

    if not SW_INJECT_ENABLED:
        _RUNNING = False
        return
    if SW_INJECT_MODE not in ("both", "worker_only", "prelude_only"):
        _RUNNING = False
        return

    do_prelude = SW_INJECT_MODE in ("both", "prelude_only")
    do_resume = SW_INJECT_MODE in ("both", "worker_only")

    try:
        ws_url = get_ws_url()
    except Exception:
        _RUNNING = False
        return

    msg_id = {"v": 0}
    sess_id = {}       # per-session counters
    injected = set()   # targetId set
    sw_prelude = None
    if do_prelude:
        sw_prelude = _build_sw_prelude(SW_PRIMARY, SW_LANGS, SW_HC, SW_DM)

    pending = {}

    def send(ws, method, params=None, tag=None):
        msg_id["v"] += 1
        mid = msg_id["v"]
        if tag:
            pending[mid] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))

    def send_sess(ws, sessionId, method, params=None):
        if sessionId not in sess_id:
            sess_id[sessionId] = 0
        sess_id[sessionId] += 1
        inner = {"id": sess_id[sessionId], "method": method, "params": params or {}}
        send(ws, "Target.sendMessageToTarget", {"sessionId": sessionId, "message": json.dumps(inner)})

    def on_open(ws):
        send(ws, "Target.setDiscoverTargets", {"discover": True})

        params = {
            "autoAttach": True,
            # Pause SW on start for controlled injection/diagnostics.
            "waitForDebuggerOnStart": True,
            "flatten": True,
        }

        if SW_AUTOATTACH_MODE == "service_worker_only":
            params["filter"] = [{"type": "service_worker", "exclude": False}]

        # важно: ставим tag, иначе обработка ошибки фильтра не сработает
        tag = "autoattach_sw_only" if SW_AUTOATTACH_MODE == "service_worker_only" else None
        send(ws, "Target.setAutoAttach", params, tag=tag)


 

        
    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
            return

        if "id" in msg:
            tag = pending.pop(msg.get("id"), None)
            if tag == "autoattach_sw_only" and msg.get("error"):
                # Filter unsupported: disable module to avoid all-targets fallback.
                try:
                    global SW_INJECT_ENABLED
                    SW_INJECT_ENABLED = False
                except Exception:
                    pass
                try:
                    ws.close()
                except Exception:
                    pass
            return

        if msg.get("method") != "Target.attachedToTarget":
            return

        p = msg.get("params") or {}
        sessionId = p.get("sessionId")
        info = p.get("targetInfo") or {}
        ttype = info.get("type")
        tid = info.get("targetId")

        if not sessionId or not tid:
            return

        # Hard isolation: this module must never touch non-SW targets.
        if ttype != "service_worker":
            return

        if tid in injected:
            if do_resume:
                try:
                    send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                except Exception:
                    pass
            return

        injected.add(tid)

        if do_prelude:
            try:
                send_sess(ws, sessionId, "Runtime.enable")
                send_sess(ws, sessionId, "Runtime.evaluate", {
                    "expression": sw_prelude,
                    "awaitPromise": True
                })
            except Exception:
                # Intentionally ignore: no logger, no writer
                pass

        if do_resume:
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception:
                pass

    def on_error(ws, err):
        pass

    def on_close(ws, code, msg):
        global _RUNNING
        _RUNNING = False

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.run_forever()
