import atexit
import json
import threading

from websocket import WebSocketApp

import tools.generators.cdp_catapult as cdp
from tools.tools_infra.overseer import logger


logger = logger.getChild("cdp_worker_env")

_ENABLED = False
_RUNNING = False
_STOPPING = False
_WS = None
_CONFIG = None


def enable_worker_env_inject(*, language, normalized_languages, hardware_concurrency, user_agent, navigator_platform):
    global _ENABLED, _CONFIG
    if not isinstance(language, str) or not language.strip():
        raise ValueError("Worker env CDP: language must be non-empty str")
    if not isinstance(normalized_languages, list) or not normalized_languages:
        raise ValueError("Worker env CDP: normalized_languages must be non-empty list")
    for item in normalized_languages:
        if not isinstance(item, str) or not item.strip():
            raise ValueError("Worker env CDP: bad languages entry")
    if not isinstance(hardware_concurrency, (int, float)) or int(hardware_concurrency) <= 0:
        raise ValueError("Worker env CDP: hardware_concurrency must be positive number")
    if not isinstance(user_agent, str) or not user_agent.strip():
        raise ValueError("Worker env CDP: user_agent must be non-empty str")
    if navigator_platform not in ("Win32", "MacIntel"):
        raise ValueError(f"Worker env CDP: invalid navigator_platform {navigator_platform!r}")

    _CONFIG = {
        "userAgentOverride": {
            "userAgent": user_agent,
            "acceptLanguage": ",".join(normalized_languages),
            "platform": navigator_platform,
        },
        "hardwareConcurrencyOverride": {
            "hardwareConcurrency": int(hardware_concurrency),
        },
        "expected": {
            "language": language,
            "languages": normalized_languages[:],
            "hardwareConcurrency": int(hardware_concurrency),
        },
    }
    _ENABLED = True


def stop():
    global _STOPPING
    ws = _WS
    if ws is None:
        return False
    _STOPPING = True
    try:
        ws.keep_running = False
    except Exception:
        pass
    try:
        ws.close()
    except Exception:
        return False
    return True


def _stop_atexit():
    try:
        stop()
    except Exception:
        pass


atexit.register(_stop_atexit)


def run():
    global _RUNNING, _STOPPING, _WS
    if _RUNNING:
        return
    _RUNNING = True
    _STOPPING = False

    if not _ENABLED or not isinstance(_CONFIG, dict):
        _RUNNING = False
        logger.error("Worker env CDP: disabled or missing config")
        raise RuntimeError("Worker env CDP: disabled")

    try:
        ws_url = cdp.get_ws_url()
    except Exception as e:
        _RUNNING = False
        logger.exception("Worker env CDP: get_ws_url failed")
        raise RuntimeError("Worker env CDP: get_ws_url failed") from e

    logger.info("Worker env CDP: websocket starting: %s", ws_url)
    cdp.log_cdp_runtime_diag("worker_env_before_ws")

    msg_id = {"v": 0}
    pending = {}
    pending_sess = {}
    injected = set()
    manual_attach_sent = set()
    session_targets = {}
    fatal = {"err": None, "disconnect": False}

    def _fatal(ws, reason, err=None):
        if fatal["err"] is None:
            fatal["err"] = RuntimeError(reason)
        if err is not None:
            logger.error("Worker env CDP: %s err=%r", reason, err)
        else:
            logger.error("Worker env CDP: %s", reason)
        try:
            ws.close()
        except Exception:
            pass

    def _drop_target_state(target_id):
        if not target_id:
            return
        injected.discard(target_id)
        manual_attach_sent.discard(target_id)

    def _cleanup_session_state(session_id):
        if not session_id:
            return None
        meta = session_targets.pop(session_id, None)
        for key in [key for key in list(pending_sess.keys()) if key[0] == session_id]:
            pending_sess.pop(key, None)
        return meta

    def _cleanup_all():
        pending.clear()
        pending_sess.clear()
        injected.clear()
        manual_attach_sent.clear()
        session_targets.clear()

    def send(ws, method, params=None, tag=None):
        msg_id["v"] += 1
        mid = msg_id["v"]
        if tag:
            pending[mid] = tag
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))

    def send_sess(ws, session_id, method, params=None):
        msg_id["v"] += 1
        mid = msg_id["v"]
        pending_sess[(session_id, mid)] = method
        ws.send(json.dumps({
            "id": mid,
            "method": method,
            "params": params or {},
            "sessionId": session_id,
        }))

    def on_open(ws):
        cdp.log_cdp_runtime_diag("worker_env_on_open")
        send(ws, "Target.setDiscoverTargets", {"discover": True})
        send(ws, "Target.setAutoAttach", {
            "autoAttach": True,
            "waitForDebuggerOnStart": True,
            "flatten": True,
            "filter": [
                {"type": "worker", "exclude": False},
                {"type": "shared_worker", "exclude": False},
            ],
        }, tag="autoattach_worker_env")
        logger.info("Worker env CDP: enabled filter=worker,shared_worker expected=%r", _CONFIG.get("expected"))

    def on_message(ws, message):
        try:
            msg = json.loads(message)
        except Exception:
            return

        if "id" in msg:
            mid = msg.get("id")
            sid = msg.get("sessionId")
            tag = pending_sess.pop((sid, mid), None) if sid else None
            if tag is None:
                tag = pending.pop(mid, None)
            if tag == "autoattach_worker_env" and msg.get("error"):
                _fatal(ws, "autoattach filter unsupported", msg.get("error"))
                return
            if isinstance(tag, str) and tag.startswith("attach_worker_env:"):
                if msg.get("error"):
                    tid = tag.split(":", 1)[1] if ":" in tag else "unknown"
                    logger.warning("Worker env CDP: manual attach failed targetId=%s err=%r", tid, msg.get("error"))
                return
            if sid and msg.get("error"):
                _fatal(ws, f"session command failed: {tag or 'unknown'}", msg.get("error"))
                return
            return

        if msg.get("method") == "Target.targetCreated":
            info = (msg.get("params") or {}).get("targetInfo") or {}
            ttype = info.get("type")
            tid = info.get("targetId")
            if ttype in ("worker", "shared_worker") and tid and tid not in injected and tid not in manual_attach_sent:
                manual_attach_sent.add(tid)
                try:
                    send(ws, "Target.attachToTarget", {"targetId": tid, "flatten": True}, tag=f"attach_worker_env:{tid}")
                except Exception as e:
                    logger.warning("Worker env CDP: manual attach send failed targetId=%s err=%r", tid, e)
            return

        if msg.get("method") == "Target.targetDestroyed":
            _drop_target_state((msg.get("params") or {}).get("targetId"))
            return

        if msg.get("method") == "Target.detachedFromTarget":
            sid = (msg.get("params") or {}).get("sessionId") or msg.get("sessionId")
            meta = _cleanup_session_state(sid)
            if meta:
                _drop_target_state(meta.get("targetId"))
            return

        if msg.get("method") != "Target.attachedToTarget":
            return

        params = msg.get("params") or {}
        session_id = params.get("sessionId") or msg.get("sessionId")
        info = params.get("targetInfo") or {}
        ttype = info.get("type")
        tid = info.get("targetId")
        turl = info.get("url")
        if not session_id or not tid:
            return
        if ttype not in ("worker", "shared_worker"):
            try:
                send_sess(ws, session_id, "Runtime.runIfWaitingForDebugger")
            except Exception as e:
                _fatal(ws, "resume non-worker target failed", e)
            return
        if tid in injected:
            return

        injected.add(tid)
        session_targets[session_id] = {"targetId": tid, "type": ttype, "url": turl}
        logger.info("Worker env CDP: attached %s targetId=%s sessionId=%s url=%r", ttype, tid, session_id, turl)
        try:
            send_sess(ws, session_id, "Emulation.setUserAgentOverride", _CONFIG["userAgentOverride"])
            send_sess(ws, session_id, "Emulation.setHardwareConcurrencyOverride", _CONFIG["hardwareConcurrencyOverride"])
            send_sess(ws, session_id, "Runtime.runIfWaitingForDebugger")
        except Exception as e:
            _fatal(ws, "worker env apply failed", e)

    def on_error(ws, err):
        if cdp._is_ws_disconnect_error(err):
            fatal["disconnect"] = True
            logger.warning("Worker env CDP: websocket disconnected; stopping loop err=%r", err)
            try:
                ws.close()
            except Exception:
                pass
            return
        _fatal(ws, "cdp websocket error", err)

    def on_close(_ws, code, msg):
        global _RUNNING, _STOPPING, _WS
        _RUNNING = False
        _WS = None
        _cleanup_all()
        if _STOPPING:
            logger.info("Worker env CDP: websocket closed by stop request code=%r msg=%r", code, msg)
        elif fatal["disconnect"]:
            logger.info("Worker env CDP: websocket closed after disconnect code=%r msg=%r", code, msg)
        elif code is not None or msg:
            logger.error("Worker env CDP: websocket closed code=%r msg=%r", code, msg)
        _STOPPING = False

    ws = WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    _WS = ws
    try:
        ws.run_forever()
    finally:
        _WS = None
        _RUNNING = False
        _STOPPING = False
        _cleanup_all()
    if fatal["err"]:
        raise fatal["err"]
