import json, time, threading, queue
import requests
from websocket import WebSocketApp
from collections import deque
import logging
from overseer import logger

logger = logger.getChild("cdp_logger")

PORT = None
OUT = "devtools_caught_exceptions.jsonl"

# фильтр: чтобы не тонуть в шуме
INCLUDE = ()


# --- optional SW prelude injector (no Fetch, no extra files) ---
SW_INJECT_ENABLED = False
SW_PRIMARY = None
SW_LANGS = None

def enable_sw_language_inject(language: str, normalized_languages: list[str]):
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
    # literals are produced here via json.dumps; no placeholders
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




q = queue.Queue(maxsize=20000)

# --- causality buffers ---
MAX_CAUSE_EVENTS = 200
recent_network = deque(maxlen=MAX_CAUSE_EVENTS)
recent_async = deque(maxlen=MAX_CAUSE_EVENTS)

def now():
    return time.time()

def writer():
    buf = []
    last = time.time()
    flush_n = 200
    flush_t = 0.5

    while True:
        try:
            item = q.get(timeout=0.2)
            buf.append(item)
        except queue.Empty:
            pass

        now = time.time()
        if buf and (len(buf) >= flush_n or (now - last) >= flush_t):
            try:
                with open(OUT, "a", encoding="utf-8") as f:
                    for obj in buf:
                        f.write(json.dumps(obj, ensure_ascii=False) + "\n")
                try:
                    logger.info("CDP writer flushed %d events to %s", len(buf), OUT)
                except Exception:
                    pass
            except Exception:
                try:
                    logger.exception("CDP writer failed to write to OUT=%r", OUT)
                except Exception:
                    pass
            buf.clear()
            last = now

threading.Thread(target=writer, daemon=True).start()
logger.info("writer set")


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
    try:
        sess_id = {}          # per-session counters
        injected = set()      # targetId set

        def send_sess(ws, sessionId, method, params=None):
            if sessionId not in sess_id:
                sess_id[sessionId] = 0
            sess_id[sessionId] += 1
            inner = {"id": sess_id[sessionId], "method": method, "params": params or {}}
            send(ws, "Target.sendMessageToTarget", {
                "sessionId": sessionId,
                "message": json.dumps(inner)
            })

        sw_prelude = None
        if SW_INJECT_ENABLED:
            sw_prelude = _build_sw_prelude(SW_PRIMARY, SW_LANGS)

        def _handle_target_attach(ws, msg):
            nonlocal sw_prelude
            p = msg.get("params") or {}
            sessionId = p.get("sessionId")
            info = p.get("targetInfo") or {}
            ttype = info.get("type")
            tid = info.get("targetId")

            if not sessionId or not tid:
                return False

            # with waitForDebuggerOnStart=true every attached target is paused;
            # we MUST resume non-SW targets, иначе подвиснет весь браузер.
            if ttype != "service_worker":
                try:
                    send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                except Exception:
                    pass
                return True

            if tid in injected:
                try:
                    send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                except Exception:
                    pass
                return True

            injected.add(tid)

            if not sw_prelude:
                # нет прелюда — нельзя держать SW на паузе
                try:
                    send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                except Exception:
                    pass
                return True

            logger.info("SW attach: injecting prelude into targetId=%s", tid)
            try:
                send_sess(ws, sessionId, "Runtime.enable")
                send_sess(ws, sessionId, "Runtime.evaluate", {
                    "expression": sw_prelude,
                    "awaitPromise": True
                })
            except Exception:
                logger.exception("SW prelude injection failed for targetId=%s", tid)
            finally:
                try:
                    send_sess(ws, sessionId, "Runtime.runIfWaitingForDebugger")
                except Exception:
                    pass
            return True

        ws_url = get_ws_url()
    except Exception:
        logger.exception("CDP logger failed to get ws url from 127.0.0.1:%s", PORT)
        return

    msg_id = {"v": 0}

    def send(ws, method, params=None):
        msg_id["v"] += 1
        ws.send(json.dumps({"id": msg_id["v"], "method": method, "params": params or {}}))

    # --- режимы ---
    # "all"  = ловит caught+uncaught, НО будет микро-пауза (бывает заметной)
    # "none" = без паузы, но тогда ловим только Runtime.exceptionThrown (в основном uncaught)
    PAUSE_STATE = "all"   # <-- поставь "all", если тебе именно caught важнее лагов

    def on_open(ws):
        send(ws, "Runtime.enable")

        if PAUSE_STATE == "all":
            send(ws, "Debugger.enable")
            send(ws, "Debugger.setAsyncCallStackDepth", {"maxDepth": 32})
            send(ws, "Debugger.setPauseOnExceptions", {"state": "all"})
            logger.info("CDP caught logger attached (PAUSE=all): %s", OUT)

            
            _push({
                "ts": time.time(),
                "mode": "__cdp_attached__",
                "port": PORT,
            })
        else:
            # без паузы
            logger.info("CDP exception logger attached (PAUSE=none): %s", OUT)
        
        send(ws, "Network.enable")
        
        if SW_INJECT_ENABLED:
            send(ws, "Target.setDiscoverTargets", {"discover": True})
            send(ws, "Target.setAutoAttach", {
                "autoAttach": True,
                "waitForDebuggerOnStart": True,
                "flatten": True
            })
            logger.info("SW injector enabled (autoAttach+waitForDebuggerOnStart)")




    def _push(item):
        try:
            q.put_nowait(item)
        except queue.Full:
            pass

    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
            return

        method = msg.get("method")
        
        # -------- Network: request initiators --------
        if method == "Network.requestWillBeSent":
            p = msg.get("params") or {}
            initiator = p.get("initiator") or {}
            recent_network.append({
                "ts": now(),
                "type": initiator.get("type"),
                "url": (p.get("request") or {}).get("url"),
                "stack": (initiator.get("stack") or {}).get("callFrames"),
            })
            return

        if method == "Network.webSocketFrameReceived":
            p = msg.get("params") or {}
            recent_network.append({
                "ts": now(),
                "type": "websocket",
                "payload": (p.get("response") or {}).get("payloadData"),
            })
            return

        # -------- Async causality --------
        if method == "Debugger.paused":
            p = msg.get("params") or {}
            if p.get("asyncStackTrace"):
                recent_async.append({
                    "ts": now(),
                    "asyncStack": p.get("asyncStackTrace"),
                })
        
        if method == "Target.attachedToTarget":
            _handle_target_attach(ws, msg)
            return


        # --- режим без пауз: Runtime.exceptionThrown ---
        if PAUSE_STATE != "all":
            if method != "Runtime.exceptionThrown":
                return
            p = msg.get("params") or {}
            details = p.get("exceptionDetails") or {}
            ex = details.get("exception") or {}
            desc = details.get("text") or ex.get("description") or ex.get("value")

            url = (details.get("url") or "")
            line = details.get("lineNumber")
            col = details.get("columnNumber")

            if INCLUDE and not any(s in (url or "") for s in INCLUDE):
                return

            _push({
                "ts": time.time(),
                "top": {"function": None, "url": url, "line": line, "column": col},
                "exception": desc,
                "frames": [],
                "mode": "Runtime.exceptionThrown",
            })
            return

        # --- режим caught+uncaught: Debugger.paused ---
        if method != "Debugger.paused":
            return

        p = msg.get("params") or {}
        if p.get("reason") != "exception":
            try:
                send(ws, "Debugger.resume")
            except Exception:
                pass
            return

        # резюмим сразу
        try:
            send(ws, "Debugger.resume")
        except Exception:
            pass

        t_now = now()
        causality = {
            "network": [
                x for x in recent_network
                if t_now - x["ts"] < 5.0
            ],
            "async": [
                x for x in recent_async
                if t_now - x["ts"] < 5.0
            ],
        }

        call_frames = p.get("callFrames") or []
        top = call_frames[0] if call_frames else {}
        url = top.get("url") or ""
        if INCLUDE and not any(s in url for s in INCLUDE):
            return

        loc = top.get("location") or {}
        data = p.get("data") or {}
        desc = data.get("description") or data.get("value")

        _push({
            "ts": time.time(),
            "top": {
                "function": top.get("functionName") or None,
                "url": url,
                "line": loc.get("lineNumber"),
                "column": loc.get("columnNumber"),
            },
            "exception": desc,
            "frames": [
                {
                    "function": f.get("functionName") or None,
                    "url": f.get("url") or None,
                    "line": (f.get("location") or {}).get("lineNumber"),
                    "column": (f.get("location") or {}).get("columnNumber"),
                }
                for f in call_frames[:6]
            ],
            "causality": causality,
            "mode": "Debugger.paused",
        })



    def on_error(ws, err):
        try:
            logger.exception("CDP websocket error: %r", err)
        except Exception:
            pass

    def on_close(ws, code, msg):
        try:
            logger.error("CDP websocket closed: code=%r msg=%r", code, msg)
        except Exception:
            pass



    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    logger.info("CDP websocket starting: %s", ws_url)
    ws.run_forever()

