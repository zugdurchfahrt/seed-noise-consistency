import os
import re
import subprocess
import socket
import uuid
import json
import time
import hashlib
import random
import logging
import pathlib
from pathlib import Path
from datetime import datetime
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.chrome.options import Options
import undetected_chromedriver as uc
# ----------------------- DICTS-----------------------
from depo_browser import chrome_versions, edge_versions, safari_versions, firefox_versions
from datashell_win32 import data_4_win32
from macintel import macintel_data
# ----------------------- MODULES-----------------------
from plugins_dict import build_plugins_profile
from tools import (
    build_device_metrics,
    normalize_languages,
    choose_device_memory_and_cpu,
    override_user_agent_data,
    determine_browser_brand_and_versions,
    build_expected_client_hints,
    apply_ua_overrides,
)
from vpn_utils import VPNClient 
from rand_met import generate_font_manifest
from overseer import logger, setup_logger
from headers_adapter import build_accept_language
# ----------------------- LOGGING SETUP -----------------------
setup_logger(child_levels={
    "main": logging.INFO,
    "vpn_utils": logging.DEBUG,    
    "rand_met": logging.INFO,
    "plugins_dict": logging.DEBUG, 
})
# -----------------------CONSTANT VARIABLES-----------------------
OPENVPN_PATH        = r"C:\YOUR\FOLDER\PATH\openvpn.exe"
PROJECT_ROOT        = pathlib.Path(__file__).resolve().parent
USER_DATA_DIR       = PROJECT_ROOT / 'user_data'
CONFIG_DIR          = PROJECT_ROOT / 'configs'
ASSETS_DIR          = PROJECT_ROOT / 'assets'
SCRIPTS_DIR         = ASSETS_DIR / 'scripts'
MANIFEST_PATH       = ASSETS_DIR / 'Manifest' / 'fonts-manifest.json'
PATCH_OUT           = ASSETS_DIR / 'JS_fonts_patch' / 'font_patch.generated.js'
# ----------------------- GLOBAL VARIABLES -----------------------
country_data = None
# ----------------------- PROFILE FUNCTION -----------------------
def get_random_profile(country_data, platform):
    return {}

# ---Fetch interception via CDP ---
def _install_fetch_interceptor(driver, rules, extra_headers_fn=None, blocked_headers=None):
    """
    Fetch.enable + Fetch.requestPaused: modify only requests that match the patterns.
    Domain lists are taken dynamically from the page (window.__CDP_ALLOW_SUFFIXES / __CDP_IGNORED_SUFFIXES),
    which are synchronized with window.HeadersInterceptor.addAllow/addIgnore.
    If rules is empty (as in the current build), Fetch interception is not active; header injection is performed only at the level of Network.setExtraHTTPHeaders (CDP) and JS patch.
    """
    driver.execute_cdp_cmd("Fetch.enable", {"patterns": (rules or [])})
    blocked = {h.lower() for h in (blocked_headers or [])}

    def _is_blocked(name: str) -> bool:
        n = name.lower()
        return (
            n in blocked
            or n in {"accept", "origin", "cookie", "authorization"}
            or n.startswith("sec-ch-")
            or n in {"dpr", "viewport-width", "sec-ch-dpr", "sec-ch-viewport-width"}
        )

    def _to_header_list(hdict: dict) -> list[dict]:
        return [{"name": k, "value": str(v)} for k, v in hdict.items()]

    def _host(url: str) -> str:
        try:
            from urllib.parse import urlparse
            return (urlparse(url).hostname or "").lower()
        except Exception:
            return ""

    def _matches_suffix(host: str, suffixes: list[str]) -> bool:
        h = (host or "").lower()
        for s in suffixes or []:
            if not s: continue
            s = s.lower()
            if not s.startswith("."): s = "." + s
            if h == s[1:] or h.endswith(s):
                return True
        return False

    def _get_lists():
        # Read the current lists from the window. returnByValue is mandaratory
        try:
            res = driver.execute_cdp_cmd("Runtime.evaluate", {
                "expression": "(function(){return {allow: (window.__CDP_ALLOW_SUFFIXES||[]), ignore: (window.__CDP_IGNORED_SUFFIXES||[])}})()",
                "returnByValue": True
            })
            val = (res.get("result") or {}).get("value") or {}
            allow = [str(x).lower() for x in val.get("allow", [])]
            ignore = [str(x).lower() for x in val.get("ignore", [])]
            return allow, ignore
        except Exception:
            return [], []
        
    # SINGLE SAFELISTED POLICY FOR not-allowed (use only safelisted - same keys as in JS SAFE_LISTED)
    SAFE_LISTED = {"accept-language"}
    
    def _on_paused(ev):
        rid = ev.get("requestId")
        try:
            req = ev.get("request", {}) or {}
            url = req.get("url", "")
            method = req.get("method", "GET")
            host = _host(url)
            allow, ignore = _get_lists()
            if _matches_suffix(host, ignore):
                driver.execute_cdp_cmd("Fetch.continueRequest", {"requestId": rid})
                return
            # ------------------ REQUEST STAGE: clearing prohibited headers ------------------
            base = {k: v for k, v in (req.get("headers") or {}).items() if not _is_blocked(k)}
            # Deciding what to add: extra_headers_fn usually only gives safelisted.
            extra = (extra_headers_fn or (lambda *_: {}))(url, method, ev.get("resourceType"))
            # # If the host is not in allow - just in case, we do not allow anything except what is already allowed by the _is_blocked set (safelisted will pass)
            if not _matches_suffix(host, allow):
                # Inject only safelisted, so that the script behavior coincides with JS
                for k, v in (extra or {}).items():
                    if k.lower() in SAFE_LISTED and not _is_blocked(k):
                        base[k] = v
            else:
                for k, v in (extra or {}).items():
                    if not _is_blocked(k):
                        base[k] = v
            driver.execute_cdp_cmd("Fetch.continueRequest", {
                "requestId": rid,
                "headers": _to_header_list(base),
            })
        except Exception:
            logger.exception("Fetch.requestPaused handler failed")
            if rid:
                driver.execute_cdp_cmd("Fetch.continueRequest", {"requestId": rid})
    driver.add_cdp_listener("Fetch.requestPaused", _on_paused)

# ----------------------- function init_driver -----------------------
def init_driver(
    profile, country_data, platform, user_agent, screen_width, screen_height,
    webgl_vendor, webgl_renderer, webgl_unmasked_vendor, webgl_unmasked_renderer, devices_conf, generated_version, generated_platform, generated_platform_version,
    generated_oscpu, expected_client_hints, vendor_value, language, normalized_languages, device_memory_value, hardware_concurrency_value, device_dpr_value,
    plugins, mimeTypes, gpu_vendor, gpu_architecture, gpu_type,
):
    global global_seed
    timezone = country_data["timezone"]
    offset_minutes = country_data["offset_minutes"]
    latitude = country_data["latitude"]
    longitude = country_data["longitude"]
    proxy = Proxy()
    proxy.proxy_type = ProxyType.MANUAL
    proxy.http_proxy = "127.0.0.1:8080"
    proxy.ssl_proxy = "127.0.0.1:8080"
    chrome_options = Options()
    chrome_options.proxy = proxy
    chrome_options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
    chrome_options.add_argument(f"--user-agent={user_agent}")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument(f"--window-size={screen_width},{screen_height}")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-features=AsyncDNS")
    chrome_options.add_argument("--start-maximized")
    chrome_options.binary_location = r"C:\\YOUR\\FOLDER\\PATH\\chrome-win64\\chrome.exe"
    driver = uc.Chrome(
        driver_executable_path=r"C:\\YOUR\\FOLDER\\PATH\\chromedriver-win64\\chromedriver.exe",
        options=chrome_options,
    )
    logger.info("Initiating Webdriver...")
    driver._stealth_seed = global_seed

    def setup_engine(driver, timezone, latitude, longitude, accuracy=100, blocked_urls=None, device_metrics=None):
        """
        Centralized module for setting browser engine parameters via CDP.
        device_metrics — dict: {screen_width, screen_height, deviceScaleFactor, mobile, screenWidth, screenHeight, screenOrientation}
        Patching the browser engine's operating principles and initial patching of objects
        """
        # 1. Net setting commands
        driver.execute_cdp_cmd("Network.enable", {})
        if blocked_urls:
            driver.execute_cdp_cmd("Network.setBlockedURLs", {"urls": blocked_urls})
        # 2. Timezone, Geolocatioon first setting 
        driver.execute_cdp_cmd("Emulation.setTimezoneOverride", {"timezoneId": timezone})
        driver.execute_cdp_cmd("Emulation.setGeolocationOverride", {
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": accuracy,
        })
        # 3. Device Metrics (screen scales, including navigator.mobile)
        if device_metrics:
            driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", device_metrics)
    setup_engine(
        driver,
        timezone="Arctic/Longyearbyen",
        latitude=90.0,
        longitude=135.0,
        accuracy=100,
        blocked_urls=["stun:*", "turn:*"] ,
        device_metrics={
            "width": 1920,
            "height": 1080,
            "deviceScaleFactor": 1,
            "mobile": False,
            "screenWidth": 1920,
            "screenHeight": 1080,
            "screenOrientation": {"type": "landscapePrimary", "angle": 0}
        }
    )
    # --- Initial fonts patch ---
    generate_font_manifest(MANIFEST_PATH, platform)
    
    # --- Assembling main bundle (DOM/Canvas/WebGL etc) ---
    def build_page_bundle(init_params: str) -> str:
        parts = [
            init_params,
            Path(SCRIPTS_DIR / "set_log.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "RTCPeerConnection.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "hide_webdriver.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "env_params.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "nav_total_set.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "wrk.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "screen.js").read_text("utf-8"),
            Path(PATCH_OUT).read_text("utf-8"),
            Path(SCRIPTS_DIR / "font_module.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "canvas.js").read_text("utf-8"),
            Path(PROJECT_ROOT / "WEBGL_DICKts.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "webgl.js").read_text("utf-8"),
            Path(PROJECT_ROOT / "WebgpuWL.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "webgpu.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "audiocontext.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "context.js").read_text("utf-8"),
            Path(SCRIPTS_DIR / "headers_interceptor.js").read_text("utf-8"),
            # --- Launching modules in window ---
            """
            try { LOGGingModule(window); } catch(_) {}
            try { RtcpeerconnectionPatchModule(window); } catch(_) {}
            try { HideWebdriverPatchModule(window); } catch(_) {}
            try { EnvParamsPatchModule(window); } catch(_) {}
            try { NavTotalSetPatchModule(window); } catch(_) {}
            try { ScreenPatchModule(window); } catch(_) {}
            try { FontPatchModule(window); } catch(_) {}
            try { CanvasPatchModule(window); } catch(_) {}
            try { WEBglDICKts(window); } catch(_) {}
            try { WebglPatchModule(window); } catch(_) {}
            try { WebgpuWLBootstrap(window); } catch(_) {}
            try { WebGPUPatchModule(window); } catch(_) {}
            try { AudioContextModule(window); } catch(_) {}
            try { ContextPatchModule(window); } catch(_) {}
            try { HeadersInterceptor(window); } catch(_) {}
            // ——— Register all hooks here ———
            try { if (typeof registerAllHooks === 'function') registerAllHooks(); } catch(_) {}
            (function applyAllPatchesCustomOrder(win) {
            try {
                const C = win.CanvasPatchContext; if (!C) return;
                if (C.applyCanvasElementPatches) C.applyCanvasElementPatches();
                if (C.applyOffscreenPatches)     C.applyOffscreenPatches();
                if (C.applyCtx2DContextPatches)  C.applyCtx2DContextPatches();
                if (C.applyWebGLContextPatches)  C.applyWebGLContextPatches();
            } catch(_) {}
            })(window);
            """
        ]
        return "\n;\n".join(parts)
    
    # --- creation of window.__ objects ---
    init_params = f"""
    // ——— Globals Bootstrap ———
    window.__GLOBAL_SEED                = {json.dumps(global_seed)};  
    window.__EXPECTED_CLIENT_HINTS      = {json.dumps(expected_client_hints, ensure_ascii=False)};
    window.__NAV_PLATFORM__             = {json.dumps(profile['platform'], ensure_ascii=False)};
    window.__GENERATED_PLATFORM         = {json.dumps(generated_platform, ensure_ascii=False)};
    window.__GENERATED_PLATFORM_VERSION = {json.dumps(generated_platform_version, ensure_ascii=False)};
    window.__USER_AGENT                 = {json.dumps(user_agent, ensure_ascii=False)};
    window.__VENDOR                     = {json.dumps(vendor_value, ensure_ascii=False)};
    window.__LATITUDE__                 = {json.dumps(latitude)};
    window.__LONGITUDE__                = {json.dumps(longitude)};
    window.__TIMEZONE__                 = {json.dumps(timezone)};
    window.__OFFSET_MINUTES__           = {json.dumps(offset_minutes)};
    window.__WIDTH                      = {json.dumps(screen_width)};
    window.__HEIGHT                     = {json.dumps(screen_height)};
    window.__COLOR_DEPTH                = 24;
    window.__DPR                        = {json.dumps(device_dpr_value)};
    window.__primaryLanguage            = {json.dumps(profile['language'], ensure_ascii=False)};
    window.__normalizedLanguages        = {json.dumps(profile['languages'], ensure_ascii=False)};
    window.__cpu                        = {json.dumps(hardware_concurrency_value)};
    window.__memory                     = {json.dumps(device_memory_value)};
    window.__WEBGL_RENDERER__           = {json.dumps(webgl_renderer, ensure_ascii=False)};
    window.__WEBGL_VENDOR__             = {json.dumps(webgl_vendor, ensure_ascii=False)};
    window.__WEBGL_UNMASKED_VENDOR__    = {json.dumps(webgl_unmasked_vendor, ensure_ascii=False)};
    window.__WEBGL_UNMASKED_RENDERER__  = {json.dumps(webgl_unmasked_renderer, ensure_ascii=False)};
    window.__GPU_TYPE__                 = {json.dumps(gpu_type, ensure_ascii=False)};
    window.__GPU_ARCHITECTURE__         = {json.dumps(gpu_architecture, ensure_ascii=False)};
    window.__GPU_VENDOR__               = {json.dumps(gpu_vendor, ensure_ascii=False)};
    window.__DEVICES_LABELS             = {json.dumps(devices_conf, ensure_ascii=False)};
    window.__FULL_VERSION_LIST          = {json.dumps(expected_client_hints.get('fullVersionList'), ensure_ascii=False)};
    window.__UA_FULL_VERSION            = {json.dumps(expected_client_hints.get('uaFullVersion'), ensure_ascii=False)};
    window.__PLUGIN_PROFILES__          = {json.dumps(profile.get("plugins", []), ensure_ascii=False)};
    window.__PLUGIN_MIMETYPES__         = {json.dumps(profile.get("mimeTypes", []), ensure_ascii=False)};
    """
    page_js = build_page_bundle(init_params) + "\n//# sourceURL=page_bundle.js"
    
    # ---  CDP PROCESSING STAGE---
    # --- userAgent и userAgentMetadata CDP ---
    driver.execute_cdp_cmd('Network.setUserAgentOverride', {
        'userAgent': profile['user_agent'],
        'userAgentMetadata': expected_client_hints
    })

    # --- prepare worker_bootstrap_js ---
    core = Path(SCRIPTS_DIR / "WORKER_PATCH_SRC.js").read_text("utf-8")
    worker_bootstrap_js = f"""
    (() => {{
    const BR = (window.__ENV_BRIDGE__ = window.__ENV_BRIDGE__ || {{}});
    if (!Object.prototype.hasOwnProperty.call(BR, 'urls')) {{
        Object.defineProperty(BR, 'urls', {{ value: {{}}, writable: false, configurable: false }});
    }}

    const core = {json.dumps(core)};
    try {{
        const classic = URL.createObjectURL(new Blob([core], {{ type: 'text/javascript' }}));
        const module  = URL.createObjectURL(new Blob(["/*module*/\\n", core, "\\nexport{{}};"], {{ type: 'text/javascript' }}));
        BR.urls.workerPatchClassic = BR.urls.workerPatchClassic || classic;
        BR.urls.workerPatchModule  = BR.urls.workerPatchModule  || module;
    }} catch (_e) {{}}

    BR.inlinePatch = BR.inlinePatch || core;
    try {{ Object.freeze(BR.urls); }} catch(_) {{}}

    function boot() {{
        try {{
        if (window.WorkerPatchHooks && window.WorkerPatchHooks.initAll) {{
            window.WorkerPatchHooks.initAll({{ publishHE: true }});
            console.info('[DIAG]', window.WorkerPatchHooks.diag && window.WorkerPatchHooks.diag());
        }}
        }} catch (_) {{}}
    }}

    if ('WorkerPatchHooks' in window && window.WorkerPatchHooks) {{
        boot();
    }} else {{
        let _h;
        Object.defineProperty(window, 'WorkerPatchHooks', {{
        configurable: true,
        get() {{ return _h; }},
        set(v) {{ _h = v; try {{ boot(); }} catch(_) {{}} }}
        }});
    }}
    }})();
    //# sourceURL=worker_bootstrap_init.js
    """

    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": worker_bootstrap_js})
    driver.execute_cdp_cmd("Runtime.evaluate", {"expression": worker_bootstrap_js, "awaitPromise": False})

    # Connect page_js (wrk.js and so on)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": page_js})
    driver.execute_cdp_cmd("Runtime.evaluate", {"expression": page_js, "awaitPromise": False})

    #--- Setting up Client hints ---
    is_safari = "Safari" in user_agent and ("Chrome" not in user_agent and "Edg/" not in user_agent)
    is_firefox = "Firefox" in user_agent and ("Chrome" not in user_agent and "Edg/" not in user_agent)
    if is_firefox or is_safari:
        safelisted_headers = {
                "Accept-Language": build_accept_language(profile.get("languages") or [profile.get("language")]),
                "Sec-CH-UA": "",
                # "Sec-CH-UA-Mobile": "?0" if not expected_client_hints.get("mobile") else "?1",
                # "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
            }
    else:
        safelisted_headers = {
        # Main client hints
        # "Accept": str(expected_client_hints["accept"]),
        "Accept-Language": build_accept_language(profile.get("languages") or [profile.get("language")]),
        # "Sec-CH-UA": expected_client_hints["sec_ch_ua"],
        # "Sec-CH-UA-Mobile": "?0" if not expected_client_hints.get("mobile") else "?1",
        # "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
        }
    driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", {"headers":  safelisted_headers})
    
    # window.__HEADERS__ — Basic set for JS-paatch. На cross-origin  safelisted (accept-language). Keys like sec-ch-* will be ignored by JS (CDP-only).
    headers_window_js = f"""
    window.__HEADERS__ = {json.dumps(safelisted_headers, ensure_ascii=False)};
    console.log("[headers_interceptor.js] window.__HEADERS__ injected (safelisted only)");
    """
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": headers_window_js})
    logger.info("window.__HEADERS__ injected (safelisted only)")
    
    # Headers interceptor bridge to sync allow/ignore  CDP with Fetch interceptor
    headers_bridge_js = """
    (function () {
      const g = window;
      // Starting ignore list for CDP interceptor: challenge domains are not touched
      const CH_PASS = ['.cloudflare.com','.challenge.cloudflare.com','.akamaihd.net','.perimeterx.net','.hcaptcha.com','.recaptcha.net'];
      g.__CDP_ALLOW_SUFFIXES   = g.__CDP_ALLOW_SUFFIXES   || [];
      g.__CDP_IGNORED_SUFFIXES = g.__CDP_IGNORED_SUFFIXES || [];
      CH_PASS.forEach(s => { if (!g.__CDP_IGNORED_SUFFIXES.includes(s)) g.__CDP_IGNORED_SUFFIXES.push(s); });
      function norm(s){ return !s ? s : (s[0] === "." ? s : "." + s); }
      function wire(){
        const api = g.HeadersInterceptor;
        if (!api) return;
        // 1) Поднять актуальные наборы из JS-интерсептора
        const allowFromJs  = (api.listAllow?.()  || []).map(norm);
        const ignoreFromJs = (api.listIgnore?.() || []).map(norm);

        g.__CDP_ALLOW_SUFFIXES   = Array.from(new Set([...(g.__CDP_ALLOW_SUFFIXES || []), ...allowFromJs]));
        g.__CDP_IGNORED_SUFFIXES = Array.from(new Set([...(g.__CDP_IGNORED_SUFFIXES || []), ...ignoreFromJs]));

        // 2) Обернуть методы, чтобы любые дальнейшие изменения синхронизировались
        const _addAllow  = api.addAllow?.bind(api);
        const _addIgnore = api.addIgnore?.bind(api);

        if (_addAllow) {
          api.addAllow = function(s){
            try { _addAllow(s); } finally {
              s = norm(s);
              if (s && !g.__CDP_ALLOW_SUFFIXES.includes(s)) g.__CDP_ALLOW_SUFFIXES.push(s);
            }
          };
        }
        if (_addIgnore) {
          api.addIgnore = function(s){
            try { _addIgnore(s); } finally {
              s = norm(s);
              if (s && !g.__CDP_IGNORED_SUFFIXES.includes(s)) g.__CDP_IGNORED_SUFFIXES.push(s);
            }
          };
        }
        g.__HEADERS_BRIDGE_READY__ = true;
        console.log("[headers_interceptor.js] CDP bridge ready");
      }

      if (document.readyState === "complete" || document.readyState === "interactive") wire();
      else g.addEventListener("DOMContentLoaded", wire);
      })();
      """
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": headers_bridge_js})

    # modification via Fetch.enable/Fetch.requestPaused  prepared, but in this build rules=[], so interception is disabled (no-op) 
    fetch_rules = []
    
    _install_fetch_interceptor(
        driver,
        fetch_rules,
        extra_headers_fn=lambda url, method, rtype: safelisted_headers,
        blocked_headers=[]
    )
    
    logger.info("All fingerprint stealth  patches successfully injected into new document") 
    logger.info("WebDriver launched successfully")
    return driver
# ----------------------- Bound zone is over beyond this line-----------------------

# ----------------------- Function configure_profile --------------------------------
def configure_profile(driver, primary_language: str, normalized_languages: list[str], country_data: dict):
    """
    Configures the browser profile for a given driver based on language and country-specific data.
    This function finally sets up timezone, geolocation, device metrics, after initial setting ealier, and adds relevant cookies for Google and YouTube
    based on the provided primary country data. It also setup the
    Args:
        driver: The browser driver instance supporting the `execute_cdp_cmd` method (e.g., Selenium WebDriver).
        primary_language (str): The primary language code to use for the profile (e.g., 'en', 'ru').
        normalized_languages (list[str]): A list of normalized language codes for the profile.
        country_data (dict): Dictionary containing country-specific data. Expected keys:
            - "timezone" (str): Timezone ID (e.g., 'Europe/Moscow').
            - "offset_minutes" (int): Timezone offset in minutes.
            - "latitude" (float): Latitude for geolocation.
            - "longitude" (float): Longitude for geolocation.
            - "domain" (str): Country-specific domain suffix (e.g., 'ru', 'com').
    Raises:
        Exception: Logs and raises any exceptions encountered during profile configuration.
    """
    try:
        timezone = country_data["timezone"]
        offset_minutes = country_data["offset_minutes"]
        latitude = country_data["latitude"]
        longitude = country_data["longitude"]
        domain = country_data["domain"]
        language = primary_language
        normalized_languages = normalized_languages
        # ----------------------- Regional setting setup--------------------------------
        
        # Timezone override
        driver.execute_cdp_cmd("Emulation.setTimezoneOverride", {"timezoneId": timezone})
        logger.info(f"[profile] Setting timezone: {timezone}, {offset_minutes}")

        # Geolocation override
        logger.info("[profile] Setting geolocation: %.4f,%.4f", latitude, longitude)
        driver.execute_cdp_cmd(
            "Emulation.setGeolocationOverride",
            {"latitude": latitude, "longitude": longitude, "accuracy": 100}
        )
        # Languages stable final setting
        lang_js = f"""
            (() => {{
            Object.defineProperty(navigator, 'language', {{
                get: () => window.__primaryLanguage,
                configurable: true
            }});
            Object.defineProperty(navigator, 'languages', {{
                get: () => window.__normalizedLanguages,
                configurable: true
            }});
            console.log('languages override applied:', window.__primaryLanguage, window.__normalizedLanguages);
        }})();
        """
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": lang_js})
        
        device_metrics = build_device_metrics(profile)
        driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", device_metrics)
        
        # ----------------------- Regional Cookies setup--------------------------------
        google_url = f"https://www.google.{domain}" if language != "en" else "https://www.google.com"
        youtube_url = f"https://www.youtube.{domain}" if language != "en" else "https://www.youtube.com"
        google_domain_str = f"google.{domain}" if language != "en" else "google.com"
        google_cookies = [
            {"name": "CONSENT", "value": f"YES+{language}.{language}+V10", "domain": google_domain_str, "path": "/"},
            {"name": "NID", "value": f"511={language}_random_{int(time.time())}", "domain": google_domain_str, "path": "/"},
        ]
        for cookie in google_cookies:
            try:
                cookie["url"] = google_url
                driver.execute_cdp_cmd("Network.setCookie", cookie)
                logger.info(f"Google Cookies set: {cookie['name']} for {google_url}")
            except Exception as e:
                logger.error(f"Error setting Google cookies {cookie['name']}: {e}")
        youtube_domain_str = f".youtube.{domain}" if language != "en" else ".youtube.com"
        youtube_cookies = [
            {"name": "PREF", "value": f"f1=50000000&hl={language}&tz={timezone.replace('/', '.')}", "domain": youtube_domain_str, "path": "/"},
        ]
        for cookie in youtube_cookies:
            try:
                cookie["url"] = youtube_url
                driver.execute_cdp_cmd("Network.setCookie", cookie)
                logger.info(f"Youtube Cookies set: {cookie['name']} для {youtube_url}")
            except Exception as e:
                logger.error(f"Error setting Youtube cookies {cookie['name']}: {e}")
        logger.info(f"Regional alignment done: {country_data}")
    except Exception as e:
        logger.error(f"configure_profile error: {e}", exc_info=True)
        
# ----------------------- Thr main function -----------------------
def main(): 
    global global_seed, profile
    global_seed = uuid.uuid4().hex
    seed_int = int(hashlib.md5(global_seed.encode('utf-8')).hexdigest()[:8], 16)
    random.seed(seed_int)
    os.environ['__GLOBAL_SEED'] = global_seed
    logger.info(f"Seed for the current session has been generated: {global_seed}")
    client = VPNClient(config_dir=CONFIG_DIR, openvpn_path=OPENVPN_PATH)
    try:
        json_path = "profile.json"
        if os.path.exists(json_path):
            os.remove(json_path)
            logger.info("Previous profile.json had been deleted")

        client.verify()
        client.prepare()
        logger.info("preparation completed")
        client.connect()
        client.post()
        # -------- Getting country_data from VPN module -------------------
        data = client.get_details()
        country_data = data["country_data"]
        profile = get_random_profile(country_data, None)
        
        # -------- Your PLATFORM and BROWSER preferences for random selection -------------------
        config = {
            # Supported platforms List
            "enabled_platforms": ["Win32", "MacIntel"],
            # Setting probabilities (weight) of platform selection when generating a profile
            "platform_weights": [0.8, 0.2],
            # Probabilities of browser selection for each platform:
            "browser_weights": {
                "Win32": (["chrome", "firefox", "edge"], [0.6, 0.01, 0.39]),
                "MacIntel": (["chrome", "firefox", "safari"], [0.29, 0.01, 0.7]),
            },
        }
        # --------PLATFORM selection -------------------
        platform = random.choices(config["enabled_platforms"],
                                weights=config["platform_weights"], k=1)[0]
        data = data_4_win32 if platform == "Win32" else macintel_data
        # -------- OS selection -------------------
        os_opt = random.choice(data["os_options"]) # dict: {os_info, os_name, os_version}
        os_info = os_opt["os_info"]
        os_name = os_opt["os_name"].replace("(", "").replace(")", "").strip()

        if not isinstance(os_info, str):
            raise ValueError("os_info must be a string")
        if platform == "Win32" and ("NT" not in os_info):
            raise ValueError(f"os_info='{os_info}' does not contain 'NT'")
        if platform == "MacIntel" and ("Mac OS X" not in os_info):
            raise ValueError(f"os_info='{os_info}' does not contain 'Mac OS X'")

        # normalize for MAC OS versions "15_4" -> "15.4.0"
        def _norm_ver(v: str) -> str:
            s = str(v).replace("_", ".")
            parts = [p for p in s.split(".") if p]
            while len(parts) < 3:
                parts.append("0")
            return ".".join(parts[:3])

        # --- different path for Win and Mac
        if os_opt.get("os_version"):
            platform_version = _norm_ver(os_opt["os_version"])  # like "10.0.0" / "15.0.0" / "19.0.0"
        else:
            if platform == "Win32":
                if "Windows 10" in os_name:
                    platform_version = "10.0.0"
                elif "Windows 11" in os_name:
                    platform_version = "19.0.0" if "19" in os_name else "15.0.0"
            elif platform == "MacIntel":
                m = re.search(r"Mac OS X\s+([\d_\.]+)", os_info)
                platform_version = _norm_ver(m.group(1)) if m else None
        logger.debug(
            f"OS: {os_name}, platform={platform}, platform_version={platform_version or 'n/a'}"
        )
        
        # --------BROWSER selection -------------------
        browser_choice = random.choices(
            *config["browser_weights"][platform], k=1
        )[0]
        # as Windows version branches are hard-pinned to kernel browser versions
        CHROMIUM_PREFIX_MAP = {
            "10.0.0": ("134.","135."),
            "15.0.0": ("135.", "136.", "137."),
            "19.0.0": ("137.", "138.", "139.", "140."),
        }

        def pick_chromium_major(platform_version: str) -> str:
            prefixes = CHROMIUM_PREFIX_MAP.get(platform_version)
            if not prefixes:
                # for macOS use whole pool, without being tied to browser kernel version
                return random.choice([v.split(".")[0] for v in chrome_versions])
            return random.choice(prefixes).rstrip(".")  # "134" / "135" / "137"

        def pick_product_version(src: list[str], major: str) -> str:
            """
            src        — list of Chrome or Edge
            major      — major Chromium version (string, for exmp "134")
            return     — full_version (string "134.0.6998.43")
            """
            filt = [v for v in src if v.startswith(major + ".")]
            if not filt:
                #  Avoiding incompatible version pairs
                raise RuntimeError(f"No builds {major}.* in source")
            return random.choice(filt)
        
        def split_version(version: str) -> tuple[str, str]:
            """
            full: 'X.Y.Z.W'
            ua:   'X.Y.0.0'  <-- UA format for compatibility
            """
            parts = version.split(".")
            if len(parts) < 2:
                raise ValueError(f"incorrect version: {version}")
            return version, f"{parts[0]}.{parts[1]}.0.0"

        # --------User Agent string construction -------------------
        if browser_choice in ("chrome", "edge"):
            if platform == "Win32":
                chromium_major = pick_chromium_major(platform_version)
                if browser_choice == "chrome":
                    version = pick_product_version(chrome_versions, chromium_major)
                    version, version_ua = split_version(version)
                    base_ua = (f"Mozilla/5.0 ({os_info}) AppleWebKit/537.36 "
                            f"(KHTML, like Gecko) Chrome/{version_ua} Safari/537.36")
                    user_agent = base_ua
                else:  # edge (Windows)
                    version = pick_product_version(edge_versions, chromium_major)
                    version, version_ua = split_version(version)
                    chrome_ua = f"{chromium_major}.0.0.0"  #  as  Chrome-part UA = major core
                    base_ua = (f"Mozilla/5.0 ({os_info}) AppleWebKit/537.36 "
                            f"(KHTML, like Gecko) Chrome/{chrome_ua} Safari/537.36")
                    user_agent = base_ua + f" Edg/{version_ua}"
            else:  # MacIntel
                if browser_choice == "chrome":
                    # macOS does not have binding to Windows CHROMIUM_PREFIX_MAP
                    version = random.choice(chrome_versions)
                    version, version_ua = split_version(version)
                    os_info_chrome = os_info  # formatted for typing like "Macintosh; Intel Mac OS X 10_15_7"
                    user_agent = (
                        f"Mozilla/5.0 ({os_info_chrome}) AppleWebKit/537.36 "
                        f"(KHTML, like Gecko) Chrome/{version_ua} Safari/537.36"
                    )
        elif browser_choice == "firefox":
            version = random.choice(firefox_versions)
            user_agent = f"Mozilla/5.0 ({os_info}; rv:{version}) Gecko/20100101 Firefox/{version}"
        elif browser_choice == "safari":
            version = random.choice(safari_versions)
            os_info_safari = os_info.replace("_", ".")
            user_agent = f"Mozilla/5.0 ({os_info_safari}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{version} Safari/605.1.15"
        else:
            raise RuntimeError("Unsupported browser")
        logger.debug(f"Final UA: {user_agent}")
        if not user_agent:
            raise Exception("Did not suceed generatiting user-agent")
        
        # ----------------------- NAVIGATOR OBJECTS SETTING IN PYTHON -----------------------
        # ---------- navigator.vendor  ----------
        vendor_value = "" if "Firefox" in user_agent else "Apple Computer, Inc." if "Safari" in user_agent and "Chrome" not in user_agent and "Edg/" not in user_agent else "Google Inc."
        # ---------- navigator.language и navigator.languages  ----------
        language, languages = normalize_languages(country_data["languages"])
        # -------- navigator.deviceMemory и navigator.hardwareConcurrency-------------------
        # deviceMemory — real values, identical for win/mac
        mem_mac = [(8, 55), (4, 35), (2, 7), (1, 3)]
        mem_win = [(8, 55), (4, 35), (2, 7), (1, 3)]
        # hardwareConcurrency 
        cpu_mac = [(4, 20), (8, 50), (10, 20), (12, 10)]
        cpu_win = [(2, 10), (4, 40), (6, 20), (8, 20), (12, 10)]
        device_memory_value, hardware_concurrency_value = choose_device_memory_and_cpu(platform, mem_win, cpu_win, mem_mac, cpu_mac)

        # -----------------------  navigator.plugins и navigator.mimeTypes -----------------------
        plugins_final, mime_types_final = build_plugins_profile(browser_choice, strict=False)

        # ----------------------- mediaDevices.enumerateDevices -----------------------
        audioinput = random.choice(data["microphone"])['name']
        videoinput = random.choice(data["videoinput"])['name']
        audiooutput = random.choice(data["headphone"])['name']
        devices_conf = {"audioinput": audioinput, "videoinput": videoinput, "audiooutput": audiooutput}
    
        # ----------------------------Setting up GPU and Screen -----------------------
        gpu = random.choice(data["GPU"])
        gpu_architecture = str(gpu.get("architecture", "")).strip()
        gpu_type = str(gpu.get("type", ""))
        gpu_name = gpu["name"]
        gpu_code = gpu["prod_code"]
        
        screen_res = random.choice(gpu["resolution"])
        # screen_res = "1920x1080"
        screen_width, screen_height = map(int, screen_res.split("x"))
        
        # ----------------------- devicespixelratio AKA deviceScaleFactor(CDP)  -----------------------
        dpr_map = {
            "1920x1080": 1.0,
            "2560x1440": 1.25,
            "3840x2160": 2.0,
            "7680x4320": 3.0,
        }
        device_dpr_value = dpr_map.get(screen_res)
        if device_dpr_value is None:
            raise ValueError(f"unknown screen resolution: {screen_res!r}")        
    
        # ----------------------- WebGL VENDOR, RENDERER -----------------------
        def get_webgl_vendor_renderer(gpu_name, gpu_code, user_agent, platform, debug_info=False):
            if debug_info:
                if "Firefox" in user_agent:
                    webgl_vendor = ""
                elif "Safari" in user_agent and "Chrome" not in user_agent and "Edg/" not in user_agent:
                    webgl_vendor = "Apple Computer, Inc."
                else:
                    webgl_vendor = "WebKit"
                webgl_renderer = "WebKit WebGL"
                return webgl_vendor, webgl_renderer
            else:
                if platform == "Win32":
                    short_vendor = "AMD" if "AMD" in gpu_name or "Radeon" in gpu_name else "NVIDIA"
                    webgl_unmasked_vendor = f"Google Inc. ({short_vendor})"
                    webgl_unmasked_renderer = f"ANGLE ({short_vendor}, {gpu_name} ({gpu_code}) Direct3D11 vs_5_0 ps_5_0, D3D11)"
                elif platform == "MacIntel":
                    webgl_unmasked_vendor = "Apple Inc."
                    webgl_unmasked_renderer = gpu_name
                return webgl_unmasked_vendor, webgl_unmasked_renderer
            
        gpu_vendor = "amd" if "AMD" in gpu_name or "Radeon" in gpu_name else "nvidia"
        webgl_vendor, webgl_renderer = get_webgl_vendor_renderer(gpu_name, gpu_code, user_agent, platform, debug_info=True)
        webgl_unmasked_vendor, webgl_unmasked_renderer = get_webgl_vendor_renderer(gpu_name, gpu_code, user_agent, platform, debug_info=False)
        
        # ----------------------- Setting up full profile  -----------------------
        profile = {
            "platform": platform,
            "os_info": os_info,
            "os_name": os_name,
            "platform_version": platform_version,
            "user_agent": user_agent,
            "browser_version": version,
            "screen_width": screen_width,
            "screen_height": screen_height,
            "device_dpr_value": device_dpr_value,
            "webgl_vendor": webgl_vendor,
            "webgl_renderer": webgl_renderer,
            "webgl_unmasked_vendor": webgl_unmasked_vendor,
            "webgl_unmasked_renderer": webgl_unmasked_renderer,
            "gpu_type": gpu_type,
            "gpu_architecture": gpu_architecture,
            "gpu_vendor": gpu_vendor,
            "devices_conf": devices_conf,
            "vendor_value": vendor_value,
            "languages": languages,
            "language": language,
            "deviceMemory": device_memory_value,
            "hardwareConcurrency": hardware_concurrency_value,
            "plugins": plugins_final,
            "mimeTypes": mime_types_final,
            "accept_language": build_accept_language(languages),
        }

        if profile["platform"]  == "Win32":
            generated_platform = "Windows"
        elif profile["platform"]  == "MacIntel":
            generated_platform = "macOS"
        
        generated_oscpu = profile["os_info"] if profile["platform"] == "Win32" and "firefox" in user_agent.lower() else f"Intel Mac OS X {profile['platform_version']}" if "firefox" in user_agent.lower() else None
        generated_platform_version = profile["platform_version"]
        generated_version = profile["browser_version"]
        browser_version = profile["browser_version"]
        browser_brand, major_version, browser_version = determine_browser_brand_and_versions(user_agent, profile)
        expected_client_hints = build_expected_client_hints(
            profile, generated_platform, browser_brand, major_version, browser_version
        )
        # ----------------------- Python final logging  -----------------------
        logger.info(f"profile['user_agent'] = {profile.get('user_agent')}")
        logger.info(f"profile: {profile}")
        logger.info("user_agent: %s", profile["user_agent"])
        logger.info("full profile: %s", json.dumps(profile, indent=4))
        
        # ----------------------- Own data collection  -----------------------
        save_dir = "profiles"
        os.makedirs(save_dir, exist_ok=True)
        filename = f"profile_{datetime.now():%Y%m%d_%H%M%S_%f}.json"
        filepath = os.path.join(save_dir, filename)
        data = {
            "profile": profile,
            "expected_client_hints": expected_client_hints,
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # collecting data from variables 
        data = {
            "profile": profile,  
            "expected_client_hints": expected_client_hints  
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info("new profile.json created for mitmproxy") 
        
        # --- mitmproxy start ---
        mitmproxy_proc = subprocess.Popen([
            "mitmproxy", "-s", "handle_cors_addon.py"
        ])

        def wait_for_port(host, port, timeout=10):
            start = time.time()
            while time.time() - start < timeout:
                try:
                    with socket.create_connection((host, port), timeout=1):
                        return True
                except OSError:
                    time.sleep(0.5)
            return False

        if not wait_for_port("127.0.0.1", 8080):
            raise RuntimeError("mitmproxy not launched")
                
        driver = init_driver(
            profile, country_data, profile["platform"], profile["user_agent"],
            profile["screen_width"], profile["screen_height"], profile["webgl_vendor"], profile["webgl_renderer"],
            profile["webgl_unmasked_vendor"], profile["webgl_unmasked_renderer"], 
            profile["devices_conf"], generated_version, generated_platform, generated_platform_version,
            generated_oscpu, expected_client_hints, profile["vendor_value"], profile["language"], profile["languages"],
            profile["deviceMemory"], profile["hardwareConcurrency"], profile["device_dpr_value"],
            profile["plugins"], profile["mimeTypes"], profile["gpu_vendor"], profile["gpu_architecture"], profile["gpu_type"]
        )
        # ----------------------- ADDITIONAL CDP REPEAT PATCHING IF NEEDED  -----------------------
        if browser_brand == "Safari":
            override_user_agent_data(driver, browser_brand)
        elif browser_brand == "Firefox":
            logger.info("UA data submitted via CDP for Firefox/Safari")
        else:
            apply_ua_overrides(driver, profile, expected_client_hints, browser_brand)
            logger.info("UA data submitted via CDP")
        # ----------------------- Call local setting def  -----------------------
        configure_profile(driver, profile["language"], profile["languages"], country_data)       

        # ----------------------- YOUR DESTINATION POINT, PLEASE MIND THE GAP -----------------------
        driver.get("https://disney.com/") 
        
        # PLEASE, DO NO REMOVE THIS input, AS IT PROTECTS DEVTOOLS FROM PERMANENT MALFUNCTION, OTHER Explicit Waits, EC, DONT WORK HERE AS WELL!
        time.sleep(0.5)
        input("press Enter for exit...")
        
    except Exception as e:
        logger.error(f"Error in main block: {e}", exc_info=True)
        logger.info(f"Error: {e}")
        # ----------------------- THAT'S ALL, FOLKS!  -----------------------
    finally:
        # Wait for mitmproxy to complete, then close the file
        mitmproxy_proc.terminate()
        mitmproxy_proc.wait()
if __name__ == "__main__":
    main()
    
