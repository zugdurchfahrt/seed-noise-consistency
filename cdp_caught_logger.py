import json, time, threading, queue
import requests
from websocket import WebSocketApp
import logging
from overseer import logger

logger = logger.getChild("cdp_logger")

PORT = 9222
OUT = "devtools_caught_exceptions.jsonl"

# фильтр: чтобы не тонуть в шуме
INCLUDE = ("page_bundle.js", "assets/scripts", "nav_total_set.js")

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
            except Exception:
                pass
            buf.clear()
            last = now

threading.Thread(target=writer, daemon=True).start()
logger.info("writer set")


def get_ws_url():
    deadline = time.time() + 10.0
    last_err = None

    while time.time() < deadline:
        try:
            r = requests.get(f"http://127.0.0.1:{PORT}/json", timeout=0.5)
            targets = r.json()
            page = next((t for t in targets if t.get("type") == "page" and t.get("webSocketDebuggerUrl")), None)
            if page:
                return page["webSocketDebuggerUrl"]
        except Exception as e:
            last_err = e
            time.sleep(0.2)

    raise RuntimeError(f"CDP /json not available on 127.0.0.1:{PORT}; last_err={last_err!r}")


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

    def on_open(ws):
        send(ws, "Runtime.enable")
        send(ws, "Debugger.enable")
        send(ws, "Debugger.setAsyncCallStackDepth", {"maxDepth": 0})  # быстрее
        send(ws, "Debugger.setPauseOnExceptions", {"state": "all"})
        logger.info("CDP caught logger attached: %s", OUT)


    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
            return

        if msg.get("method") != "Debugger.paused":
            return

        p = msg.get("params") or {}
        if p.get("reason") != "exception":
            # всегда резюмим
            try:
                send(ws, "Debugger.resume")
            except Exception:
                pass
            return

        # РЕЗЮМ СРАЗУ И БЕЗ ОЖИДАНИЯ (главное)
        try:
            send(ws, "Debugger.resume")
        except Exception:
            pass

        # быстрый отбор + запись в очередь
        call_frames = p.get("callFrames") or []
        top = call_frames[0] if call_frames else {}
        url = top.get("url") or ""
        if INCLUDE and not any(s in url for s in INCLUDE):
            return

        loc = top.get("location") or {}
        data = p.get("data") or {}
        desc = data.get("description") or data.get("value")

        item = {
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
        }

        try:
            q.put_nowait(item)
        except queue.Full:
            pass

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message)
    ws.run_forever()
    logger.info("logger is running")




