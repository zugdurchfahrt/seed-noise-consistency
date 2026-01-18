import json, time, threading, queue
import requests
from websocket import WebSocketApp
import logging
from overseer import logger

logger = logger.getChild("cdp_logger")

PORT = None
OUT = "devtools_caught_exceptions.jsonl"

# фильтр: чтобы не тонуть в шуме
INCLUDE = ()

q = queue.Queue(maxsize=20000)

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
            send(ws, "Debugger.setAsyncCallStackDepth", {"maxDepth": 0})
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

