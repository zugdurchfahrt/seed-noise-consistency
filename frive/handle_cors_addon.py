from mitmproxy import http
import json
from collections import deque
from overseer import setup_logger
proxy_logger = setup_logger().getChild("proxy")
proxy_logger.info("Модуль logs/proxy_full.log")
LOG_PATH = "mitmproxy_full_log.txt"  


# ===== OUTBOUND HEADERS-REQUESTS HANDLING =====
# Minimum base set: other CORS headers are set only on preflight
BASE_CORS = {
    "Access-Control-Allow-Credentials": "true",
}
IGNORED_KEYWORDS = ["copilot", "github", "vscode", "visualstudio"]

# Domain suffixes for ignore (точное совпадение TLD и поддоменов)
IGNORED_HOSTS = [
    ".google.com", ".gstatic.com", ".googleusercontent.com",
    ".yandex.ru", ".yandex.net",
    ".github.com",
    ".exp-tas.com",
    ".visualstudio.com",
    ".vscode-sync.trafficmanager.net",
    ".chatgpt.com",
    ".facebook.com", ".doubleclick.net",
    ".apple.com", ".windowsupdate.com",
    ".microsoft.com", ".cloudflare.com",
    ".challenge.cloudflare.com",
    '.challenges.cloudflare.com',
    ".akamaihd.net",
    ".perimeterx.net",
    ".hcaptcha.com",
    ".recaptcha.net",
]

# Proxy/network infrastructure headings that need to be removed from the request
STRIP_HEADERS = [
    # Standard
    "connection", "proxy-connection", "via", "forwarded",
    "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto",
    "x-forwarded-port", "x-forwarded-server", "x-forwarded-by",
    "x-real-ip", "x-client-ip", "x-cluster-client-ip", "true-client-ip",
    # CDN /Providers
    "cf-connecting-ip", "cf-ray", "cf-ipcountry", "cf-visitor", "cdn-loop",
    "fastly-client-ip", "x-fastly-request-id", "x-fastly-debug",
    "akamai-origin-hop", "akamai-ghost", "akamai-cache-status",
    "x-akamai-session-info", "x-akamai-edgescape",
    "x-azure-ref", "x-azure-fdid", "x-azure-clientip", "x-msedge-ref",
    # AWS / CloudFront / ALB
    "x-amzn-trace-id", "x-amzn-via", "x-amz-cf-id", "x-amz-cf-pop",
    "x-amz-cf-pop-tls", "x-amz-cf-xff",
    # Прочие CDN/WAF
    "x-sucuri-id",
    #Diagnostic/cache/backend tags (rarely found in Request, but sometimes proxied)
    "x-cache", "x-cache-hits", "x-served-by", "x-cdn", "x-cloud-trace-context",
    "x-request-id", "x-correlation-id", "x-timer",
    # Трейсинг (если не используешь распределённый трейсинг через прокси — лучше скрыть)
    "traceparent", "tracestate",
    "x-b3-traceid", "x-b3-spanid", "x-b3-parentspanid", "x-b3-sampled", "x-b3-flags",
]

# Prefixes to cut (in case of new variations)
STRIP_PREFIXES = [
    "cf-", "fastly-", "x-fastly-", "akamai-", "x-akamai-",
    "x-amzn-", "x-amz-", "x-azure-", "x-msedge-",
    "x-vercel-", "x-heroku-", "x-fly-", "flyio-", "x-sucuri-",
]

STRIP_HEADERS_SET = set(h.lower() for h in STRIP_HEADERS)

def strip_proxy_headers(headers):
    for h in list(headers.keys()):
        kl = h.lower()
        if kl in STRIP_HEADERS_SET or any(kl.startswith(p) for p in STRIP_PREFIXES):
            del headers[h]

def _matches_suffix(host: str, suffixes: list[str]) -> bool:
    h = (host or "").lower()
    for s in suffixes or []:
        if not s: 
            continue
        s = s.lower()
        if h == s.lstrip(".") or h.endswith(s):
            return True
    return False




def is_ignored(flow: http.HTTPFlow) -> bool:
    """
    Smart ignore:
    - If the host is not from the list of Ignor, do not ignore;
    - If a host from IGNORED_HOSTS (by keyword or suffix), но есть ошибка/челлендж — не игнорируем (логируем);
    - otherwise ignore .
    """
    host = (flow.request.host or "").lower()

    # Hit the key word or domen suffix?
    matched = any(kw in host for kw in IGNORED_KEYWORDS) or _matches_suffix(host, IGNORED_HOSTS)
    if not matched:
        return False

    # Is there an answer? —verify, Isn't it "bad"
    resp = getattr(flow, "response", None)
    if resp is not None:
        sc = getattr(resp, "status_code", None)
        if sc and sc >= 400:
            return False  # ошибки всегда логируем, даже для игнор-хостов

        # Signs of challenge, even with 2xx
        h = {k.lower(): v for k, v in resp.headers.items()}
        set_cookie_l = (h.get("set-cookie", "") or "").lower()
        server_l     = (h.get("server", "") or "").lower()
        if ("cloudflare" in server_l) or any(t in set_cookie_l for t in ["__cf_bm", "cf_clearance", "ak_bmsc", "datadome"]):
            return False  # челленджи тоже логируем

    # Ordinary background traffic - ignore
    return True

class CORSBypass:
    BUFFER_SIZE = 300

    def __init__(self):
        self.ring_buffer = deque(maxlen=self.BUFFER_SIZE)
        self.all_logs = []  # накопление «сырого» текста как в окне

        data = {}
        try:
            with open("profile.json", "r", encoding="utf-8") as f:
                data = json.load(f)
            self.profile = data.get("profile", {})
            self.expected_client_hints = data.get("expected_client_hints", {})
            proxy_logger.info("[CORSBypass] profile.json loaded")
        except Exception:
            proxy_logger.warning("[CORSBypass] failed to load profile.json, using defaults")
            self.profile = {}
            self.expected_client_hints = {}
        self.ch_per_host = {}
        self.passthrough_suffixes = data.get("passthrough_suffixes", [])

    def log_request(self, flow: http.HTTPFlow, phase: str) -> None:
        if is_ignored(flow):
            return
        try:
            # === Online record to the file ===
            with open(LOG_PATH, "a", encoding="utf-8") as f:
                f.write(f"==== {phase.upper()} ====\n")
                f.write(f"{flow.request.method} {flow.request.pretty_url}\n")
                for k, v in flow.request.headers.items():
                    f.write(f"{k}: {v}\n")
                if flow.response:
                    f.write(f"Status: {flow.response.status_code}\n")
                    for k, v in flow.response.headers.items():
                        f.write(f"{k}: {v}\n")
                f.write("\n" + "="*40 + "\n\n")

            msg = [
                f"==== {phase.upper()} ===",
                f"{flow.request.method} {flow.request.pretty_url}"
            ]
            for k, v in flow.request.headers.items():
                msg.append(f"{k}: {v}")
            if flow.response:
                msg.append(f"<< response {flow.response.status_code} >>")
                for k, v in flow.response.headers.items():
                    msg.append(f"{k}: {v}")
            msg.append("=" * 40)
            logline = "\n".join(msg)
            proxy_logger.info(logline)

            # save both in a structured buffer and in raw text
            self.ring_buffer.append({
                "phase": phase,
                "url": flow.request.pretty_url,
                "method": flow.request.method,
                "request_headers": dict(flow.request.headers),
                "response_code": flow.response.status_code if flow.response else None,
                "response_headers": dict(flow.response.headers) if flow.response else None,
            })
            self.all_logs.append(logline)
        except Exception as e:
            proxy_logger.error(f"[CORSBypass] log write failed: {e}", exc_info=True)

    def request(self, flow: http.HTTPFlow) -> None:
        if is_ignored(flow):
            return
        # ADD: challenge endpoints → pass-through (Do not touch the request headlines)
        path_l = (flow.request.path or "").lower()
        if ("/cdn-cgi/" in path_l) or ("/challenge" in path_l) or ("/captcha" in path_l):
            return
        self.log_request(flow, "request")
        strip_proxy_headers(flow.request.headers)

    def response(self, flow: http.HTTPFlow) -> None:
        if is_ignored(flow):
            return
        self.log_request(flow, "response")

        # Remember Accept-CH, To understand that the server really asks
        host = flow.request.host
        accept_ch = flow.response.headers.get("Accept-CH")
        if accept_ch:
            self.ch_per_host[host] = [h.strip() for h in accept_ch.split(",") if h.strip()]
            proxy_logger.info(f"[CORSBypass] {host} requests CH: {self.ch_per_host[host]}")

        path_l       = (flow.request.path or "").lower()
        set_cookie_l = (flow.response.headers.get("Set-Cookie","") or "").lower()
        server_l     = (flow.response.headers.get("Server","") or "").lower()

        if ("/cdn-cgi/" in path_l) or ("/challenge" in path_l) or ("/captcha" in path_l) \
        or ("__cf_bm" in set_cookie_l) or ("cf_clearance" in set_cookie_l) \
        or ("ak_bmsc" in set_cookie_l) or ("datadome" in set_cookie_l) \
        or ("cloudflare" in server_l):
            return

        #Careful correction Content-Type: Only for 2xxA and when the client expected JSON
        ct = flow.response.headers.get("Content-Type", "")
        content = (flow.response.content or b"").strip()
        req_accept = flow.request.headers.get("Accept", "")
        if (
            flow.response.status_code and 200 <= flow.response.status_code < 300 and
            ct.startswith("text/html") and (content.startswith(b"{") or content.startswith(b"[")) and
            ("application/json" in req_accept)
        ):
            flow.response.headers["Content-Type"] = "application/json"
            proxy_logger.info(
                f"[CORSBypass] Corrected Content-Type to application/json for {flow.request.pretty_url}"
            )

        # Analytics/Alerts on answers
        resp = flow.response
        host = (flow.request.host or "").lower()
        h = {k.lower(): v for k, v in resp.headers.items()}

        is_block_code = resp.status_code in {401,403,429,503}
        is_cf = any(k in h for k in ["cf-ray","cf-cache-status","server"]) and ("cloudflare" in h.get("server","").lower())
        has_challenge = (
            "__cf_bm" in (h.get("set-cookie","").lower()) or
            "ak_bmsc" in (h.get("set-cookie","").lower()) or
            "datadome" in (h.get("set-cookie","").lower()) or
            "/cdn-cgi/challenge" in (resp.text or "")[:4096].lower()
        )

        if is_block_code and (is_cf or has_challenge):
            self._enable_passthrough_for_host(host, flow)
        
        critical_statuses = {401, 403, 429, 500, 503}
        body_lower = (resp.text or "")[:1000].lower()  # Only the first 1000 characters
        keywords = [
            "access denied", "forbidden", "banned", "suspicious", "captcha", "challenge",
            "block", "not allowed", "permission", "unusual activity"
        ]
        is_critical = resp.status_code in critical_statuses or any(kw in body_lower for kw in keywords)
        alert_headers = [k for k in resp.headers.keys() if k.lower().startswith("x-") or "block" in k.lower()]
        if is_critical or alert_headers:
            from datetime import datetime
            alert_context = list(self.ring_buffer)[-10:]
            ctx_lines = [
                f"[{x['phase']}] {x['method']} {x['url']} {x['response_code']}"
                for x in alert_context if x.get('url')
            ]
            proxy_logger.warning(
                f"!!! ALERT !!! [{flow.request.pretty_url}]\n"
                f"Time: {datetime.utcnow().isoformat()}\n"
                f"Status: {resp.status_code} | "
                f"Headers: {[k + ':' + v for k, v in resp.headers.items() if k.lower().startswith('x-') or 'block' in k.lower()]} | "
                f"Body: {body_lower[:300]}\n"
                f"Prev 10 events:\n" + "\n".join(ctx_lines)
            )
        self._apply_cors(flow)
        
    def _enable_passthrough_for_host(self, host: str, flow: http.HTTPFlow):
        try:
            # Local import: otherwise when starting a script without mitmproxy  - ModuleNotFoundError: No module named 'mitmproxy'.
            import re
            from mitmproxy import ctx
            labels = (host or "").split(".")
            two_level_tlds = {"co.uk","com.au","co.jp","com.br","com.mx","com.tr","com.sg","com.hk"}
            tail2 = ".".join(labels[-2:]) if len(labels) >= 2 else host
            root = ".".join(labels[-3:]) if tail2 in two_level_tlds and len(labels) >= 3 else tail2

            pattern = rf"^(?:.+\.)?{re.escape(root)}$"
            pats = list(ctx.options.ignore_hosts)
            if pattern not in pats:
                pats.append(pattern)
                ctx.options.ignore_hosts = pats
                proxy_logger.warning(f"[CORSBypass] Escalate to TLS passthrough for: .{root}")
                # Close the current server connect— The next attempt will go to tunnel
                try:
                    flow.server_conn.close()
                except Exception:
                    pass
        except Exception as e:
            proxy_logger.error(f"[CORSBypass] Failed to enable passthrough: {e}")

    def _apply_cors(self, flow: http.HTTPFlow) -> None:
        url = flow.request.pretty_url
        origin = flow.request.headers.get("Origin")
        is_preflight = flow.request.method.upper() == "OPTIONS"

        # Если Origin отсутствует — не выставляем CORS вовсе
        if not origin:
            proxy_logger.info(f"[CORSBypass] No Origin — skip CORS: {url}")
            return

        if is_preflight:
            # We form dynamically preflight-answer
            acrh = flow.request.headers.get("Access-Control-Request-Headers")
            acrm = flow.request.headers.get("Access-Control-Request-Method")
            methods = {acrm} if acrm else {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}

            headers = {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": ", ".join(sorted(m for m in methods if m)),
                "Access-Control-Allow-Headers": acrh or "Content-Type",
                "Access-Control-Max-Age": "3600",
                # Correct Vary for cache
                "Vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
            }

            # Private Network Access — Only if requested
            if flow.request.headers.get("Access-Control-Request-Private-Network") == "true":
                headers["Access-Control-Allow-Private-Network"] = "true"

            flow.response = http.Response.make(200, b"", headers)
            proxy_logger.info(f"[CORSBypass] Preflight OPTIONS patched: {url}")
            return

        # Ordinary answer: echo-Origin + -Credentials + Vary: Origin
        flow.response.headers["Access-Control-Allow-Origin"] = origin
        flow.response.headers["Access-Control-Allow-Credentials"] = "true"

        prev_vary = flow.response.headers.get("Vary")
        if prev_vary:
            if "origin" not in prev_vary.lower():
                flow.response.headers["Vary"] = f"{prev_vary}, Origin"
        else:
            flow.response.headers["Vary"] = "Origin"

        proxy_logger.info(f"[CORSBypass] CORS patched: {url}")


    def done(self):
        """
        ordinary mitmproxy hook (If the completion is correct).
        """

addons = [CORSBypass()]
