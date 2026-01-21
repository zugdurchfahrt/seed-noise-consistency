# cdp_caught_logger.py  (SW injector only)
import json
import time
import threading
import requests
from websocket import WebSocketApp

PORT = None

# --- SW prelude injector (ServiceWorkerGlobalScope) ---
SW_INJECT_ENABLED = False
SW_PRIMARY = None
SW_LANGS = None

_RUNNING = False


def enable_sw_language_inject(language: str, normalized_languages: list[str]):
    """
    Enable ServiceWorker injection for navigator.language / navigator.languages.
    Call this BEFORE starting run().

    No logging, no writers, no Debugger/Network hooks.
    """
    global SW_INJECT_ENABLED, SW_PRIMARY, SW_LANGS
    if not isinstance(language, str) or not language.strip():
        raise ValueError("SW inject: language must be non-empty str")
    if not isinstance(normalized_languages, list) or not normalized_languages:
        raise ValueError("SW inject: normalized_languages must be non-empty list")
    for x in normalized_languages:
        if not isinstance(x, str) or not x.strip():
            raise ValueError("SW inject: bad languages entry")

    SW_INJECT_ENABLED = True
    SW_PRIMARY = language
    SW_LANGS = normalized_languages


def _build_sw_prelude(language: str, normalized_languages: list[str]) -> str:
    # literals via json.dumps; no placeholders
    return (f"""
(() => {{
  'use strict';
  const G = globalThis;

  const primary = {json.dumps(language, ensure_ascii=False)};
  const langs   = {json.dumps(normalized_languages, ensure_ascii=False)};

  if (typeof primary !== 'string' || !primary) throw new Error('THW: SW language invalid');
  if (!Array.isArray(langs) || !langs.length) throw new Error('THW: SW languages invalid');
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
            r = requests.get(f"http://127.0.0.1:{port}/json", timeout=0.5)
            targets = r.json()
            page = next((t for t in targets if t.get("type") == "page" and t.get("webSocketDebuggerUrl")), None)
            if page:
                return page["webSocketDebuggerUrl"]
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

    try:
        ws_url = get_ws_url()
    except Exception:
        _RUNNING = False
        return

    msg_id = {"v": 0}
    sess_id = {}       # per-session counters
    injected = set()   # targetId set
    sw_prelude = _build_sw_prelude(SW_PRIMARY, SW_LANGS)

    def send(ws, method, params=None):
        msg_id["v"] += 1
        ws.send(json.dumps({"id": msg_id["v"], "method": method, "params": params or {}}))

    def send_sess(ws, sessionId, method, params=None):
        if sessionId not in sess_id:
            sess_id[sessionId] = 0
        sess_id[sessionId] += 1
        inner = {"id": sess_id[sessionId], "method": method, "params": params or {}}
        send(ws, "Target.sendMessageToTarget", {"sessionId": sessionId, "message": json.dumps(inner)})

    def on_open(ws):
        # only what we need for auto-attach
        send(ws, "Target.setDiscoverTargets", {"discover": True})
        send(ws, "Target.setAutoAttach", {
            "autoAttach": True,
            "waitForDebuggerOnStart": True,
            "flatten": True
        })

    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
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

        # Every attached target is paused (waitForDebuggerOnStart=true).
        # Always resume non-SW targets immediately to avoid freezes.
        if ttype != "service_worker":
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception:
                pass
            return

        if tid in injected:
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception:
                pass
            return

        injected.add(tid)

        try:
            send_sess(ws, sessionId, "Runtime.enable")
            send_sess(ws, sessionId, "Runtime.evaluate", {
                "expression": sw_prelude,
                "awaitPromise": True
            })
        except Exception:
            # Intentionally ignore: no logger, no writer
            pass
        finally:
            try:
                send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
            except Exception:
                pass

    def on_error(ws, err):
        pass

    def on_close(ws, code, msg):
        pass

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.run_forever()
