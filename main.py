import os
import re
import threading
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
import sys
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException
import undetected_chromedriver as uc

# -----------------------CONSTANT VARIABLES-----------------------
OPENVPN_PATH             = r"C:\YOUR\FOLDER\PATH\openvpn.exe"
PROJECT_ROOT             = pathlib.Path(__file__).resolve().parent
TOOLS                    = PROJECT_ROOT / 'tools'
GENERATORS               = TOOLS / 'generators'
TOOLS_RUNTIME            = TOOLS / 'tools_runtime'
TOOLS_INFRA              = TOOLS / 'tools_infra'
PROFILE_DATA_SRC         = PROJECT_ROOT / 'profile_data_source'
CORS_ADDON               = TOOLS_RUNTIME / 'handle_cors_addon.py'
USER_DATA_DIR            = PROJECT_ROOT / 'user_data'
CONFIG_DIR               = PROJECT_ROOT / 'configs'
ASSETS                   = PROJECT_ROOT / 'assets'
SCRIPTS                  = ASSETS / 'scripts'
SCRIPTS_WINDOW           = SCRIPTS / 'window'
SCRIPTS_CORE             = SCRIPTS_WINDOW / 'core'
SCRIPTS_PATCHES          = SCRIPTS_WINDOW / 'patches'
SCRIPTS_PATCHES_GRAPHICS = SCRIPTS_PATCHES / 'graphics'
SCRIPTS_PATCHES_MEDIA    = SCRIPTS_PATCHES / 'media'
SCRIPTS_PATCHES_NAV      = SCRIPTS_PATCHES / 'navigator'
SCRIPTS_PATCHES_STEALTH  = SCRIPTS_PATCHES / 'stealth'
SCRIPTS_WORKERSCOPE      = SCRIPTS / 'workerscope'
MANIFEST_PATH            = ASSETS / 'Manifest' / 'fonts-manifest.json'
PATCH_OUT                = ASSETS / 'JS_fonts_patch' / 'font_patch.generated.js'
CHROME_BINARY            = os.getenv("CHROME_BINARY", r"C:\\55555\\switch\\port\\chrome-win64\\chrome.exe")
CHROMEDRIVER_PATH        = os.getenv("CHROMEDRIVER_PATH", r"C:\\55555\\switch\\port\\chromedriver-win64\\chromedriver.exe")

# Только папки. Никаких путей к файлам.
PY_MODULE_DIRS = [
    PROJECT_ROOT,  # если что-то ещё осталось в корне
    PROJECT_ROOT / "tools" / "tools_infra",
    PROJECT_ROOT / "tools" / "tools_runtime",
    PROJECT_ROOT / "tools" / "generators",
    PROJECT_ROOT / "profile_data_source",  # если ты туда клал данные/модули
]

for d in PY_MODULE_DIRS:
    if not d.exists():
        raise FileNotFoundError(d)
    sys.path.insert(0, str(d))
# ----------------------- DICTS-----------------------
from profile_data_source.depo_browser import chrome_versions, edge_versions, safari_versions, firefox_versions
from profile_data_source.datashell_win32 import data_4_win32
from profile_data_source.macintel import macintel_data
# ----------------------- MODULES-----------------------
import tools.tools_runtime.cdp_catapult as cdp
from profile_data_source.plugins_dict import build_plugins_profile
from tools.tools_runtime.helpers import (
    build_device_metrics,
    normalize_languages,
    choose_device_memory_and_cpu,
    determine_browser_brand_and_versions,
    build_expected_client_hints,
    apply_ua_overrides,
    inject_uach_strip_window,
)
from tools.tools_infra.vpn_utils import VPNClient
from tools.tools_infra.overseer import logger, setup_logger
from tools.tools_runtime.headers_adapter import build_accept_language
from tools.generators.rand_met import generate_font_manifest
# ----------------------- LOGGING SETUP -----------------------
setup_logger(child_levels={
    "main": logging.INFO,
    "vpn_utils": logging.DEBUG,
    "rand_met": logging.INFO,
    "plugins_dict": logging.DEBUG,
})

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
            # If the host is not in allow - just in case, we do not allow anything except what is already allowed by the _is_blocked set (safelisted will pass)
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
    proxy.http_proxy = "127.0.0.1:8082"
    proxy.ssl_proxy = "127.0.0.1:8082"
    chrome_options = Options()
    chrome_options.proxy = proxy
    chrome_options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
    chrome_options.add_argument(f"--user-agent={user_agent}")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--no-sandbox")
    vscode_cdp_debug = os.getenv("VSCODE_CDP_DEBUG", "").strip() == "1"
    chrome_debug_port_raw = os.getenv("CHROME_DEBUG_PORT", "9222").strip()
    if chrome_debug_port_raw.lower() in {"0", "auto"}:
        raise ValueError("CHROME_DEBUG_PORT must be a fixed integer port")
    try:
        chrome_debug_port = int(chrome_debug_port_raw)
    except ValueError as exc:
        raise ValueError("CHROME_DEBUG_PORT must be an integer") from exc
    chrome_options.add_argument(f"--remote-debugging-port={chrome_debug_port}")
    chrome_options.add_argument("--remote-debugging-address=127.0.0.1")
    chrome_options.add_argument("--remote-allow-origins=*")
    chrome_options.add_argument(f"--window-size={screen_width},{screen_height}")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-features=AsyncDNS")
    chrome_options.add_argument("--start-maximized")
    if vscode_cdp_debug and os.getenv("AUTO_OPEN_DEVTOOLS") == "1":
        chrome_options.add_argument("--auto-open-devtools-for-tabs")
    chrome_options.binary_location = CHROME_BINARY
    driver_kwargs = {
        "driver_executable_path": CHROMEDRIVER_PATH,
        "options": chrome_options,
    }
    driver_kwargs["port"] = chrome_debug_port
    driver = uc.Chrome(
        **driver_kwargs,
    )
    logger.info("Initiating Webdriver...")
    driver._stealth_seed = global_seed

    def _get_cdp_port(driver, user_data_dir):
        # 1) самый надёжный вариант: debuggerAddress от chromedriver
        opts = driver.capabilities.get("goog:chromeOptions", {})
        addr = opts.get("debuggerAddress")
        if addr and ":" in addr:
            return int(addr.rsplit(":", 1)[1])

        # 2) fallback: DevToolsActivePort в профиле
        p = Path(user_data_dir) / "DevToolsActivePort"
        for _ in range(50):  # до ~5 сек
            if p.exists():
                return int(p.read_text(encoding="utf-8").splitlines()[0].strip())
            time.sleep(0.1)

        # 3) fallback: requested port
        return chrome_debug_port
    
    cdp.PORT = _get_cdp_port(driver, USER_DATA_DIR)
    if vscode_cdp_debug and cdp.PORT != chrome_debug_port:
        raise RuntimeError(f"CDP port mismatch: requested {chrome_debug_port}, got {cdp.PORT}")
    logger.info("Chrome DevTools port: %s", cdp.PORT)
          
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
        try:
            driver.execute_cdp_cmd("Emulation.setTimezoneOverride", {"timezoneId": timezone})
        except WebDriverException as e:
            msg = str(e)
            if "Timezone override is already in effect" not in msg:
                raise
            logger.warning("Timezone override already in effect; skipping initial override")
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
      
    cdp.SW_META = expected_client_hints
    cdp.enable_sw_language_inject(language, normalized_languages, hardware_concurrency_value, device_memory_value)
      
    sw_thread = threading.Thread(target=cdp.run, daemon=True, name="cdp_sw_injector")
    sw_thread.start()
    logger.info("Thread started name=%s ident=%s on port %s", sw_thread.name, sw_thread.ident, cdp.PORT)
    cdp.log_cdp_runtime_diag("main_after_sw_thread_start")

    # Inject global seed into Dedicated/Shared workers via CDP as CDP_GLOBAL_SEED (pauses workers on start).
    # if the CDP websocket drops mid-session, paused workers may remain paused.
    if os.getenv("CDP_WORKER_SEED_INJECT", "1") == "1":
        cdp.enable_worker_seed_inject(global_seed)
        worker_seed_thread = threading.Thread(
            target=cdp.run_worker_seed,
            daemon=True,
            name="cdp_worker_seed_injector",
        )
        worker_seed_thread.start()
        logger.info(
            "Worker seed injector thread started name=%s ident=%s on port %s",
            worker_seed_thread.name,
            worker_seed_thread.ident,
            cdp.PORT,
        )
    cdp.log_cdp_runtime_diag("main_after_worker_seed_thread_start")


    # --- Assembling main bundle (DOM/Canvas/WebGL etc) ---
    def build_page_bundle(init_params: str) -> str:
        parts = [
            init_params,
            # --- set_log ---
            Path(SCRIPTS_CORE / "set_log.js").read_text("utf-8"),
            "LOGGingModule(window);",
            Path(SCRIPTS_CORE / "probe.js").read_text("utf-8"),
            # --- core window ---
            Path(SCRIPTS_CORE / "core_window.js").read_text("utf-8"),
            "CoreWindowModule(window);",
            # --- RTC ---
            Path(SCRIPTS_PATCHES_MEDIA / "RTCPeerConnection.js").read_text("utf-8"),
            "RtcpeerconnectionPatchModule(window);",
            # --- hide_webdriver (markAsNative provider) ---
            Path(SCRIPTS_PATCHES_STEALTH / "hide_webdriver.js").read_text("utf-8"),
            "HideWebdriverPatchModule(window);",
            # --- workers (bootstrap/hooks). No direct module call here unless you have one.
            Path(SCRIPTS_WORKERSCOPE / "wrk.js").read_text("utf-8"),
            "WrkModule(window);",
            # --- rng params ---
            Path(SCRIPTS_CORE / "prng_seed.js").read_text("utf-8"),
            "RNGsetModule(window);",
            # --- nav total set ---
            Path(SCRIPTS_PATCHES_NAV / "nav_total_set.js").read_text("utf-8"),
            "NavTotalSetPatchModule(window);",
            # --- screen ---
            Path(SCRIPTS_PATCHES_GRAPHICS / "screen.js").read_text("utf-8"),
            "ScreenPatchModule(window);",
            # --- generated patch output ---
            Path(PATCH_OUT).read_text("utf-8"),
            # --- fonts ---
            Path(SCRIPTS_PATCHES_MEDIA / "font_module.js").read_text("utf-8"),
            "FontPatchModule(window);",
            # --- canvas ---
            Path(SCRIPTS_PATCHES_GRAPHICS / "canvas.js").read_text("utf-8"),
            "CanvasPatchModule(window);",
            # --- webgl extra ---
            Path(SCRIPTS_PATCHES_GRAPHICS / "WEBGL_DICKts.js").read_text("utf-8"),
            "WEBglDICKts(window);",
            # --- webgl ---
            Path(SCRIPTS_PATCHES_GRAPHICS / "webgl.js").read_text("utf-8"),
            "WebglPatchModule(window);",
            # --- webgpu WL ---
            Path(SCRIPTS_PATCHES_GRAPHICS / "WebgpuWL.js").read_text("utf-8"),
            "WebgpuWLBootstrap(window);",
            # --- webgpu ---
            Path(SCRIPTS_PATCHES_GRAPHICS / "webgpu.js").read_text("utf-8"),
            "WebGPUPatchModule(window);",
            # --- audiocontext ---
            Path(SCRIPTS_PATCHES_MEDIA / "audiocontext.js").read_text("utf-8"),
            "AudioContextModule(window);",
            # --- context ---
            Path(SCRIPTS_CORE / "context.js").read_text("utf-8"),
            "ContextPatchModule(window);",
            """
            // —————— Register all hooks here ——————//
            if (typeof window.registerAllHooks === 'function') window.registerAllHooks();
            (function applyAllPatchesCustomOrder(win) {
                const C = window.CanvasPatchContext; if (!C) return;
                if (C.applyCanvasElementPatches) C.applyCanvasElementPatches();
                if (C.applyOffscreenPatches)     C.applyOffscreenPatches();
                if (C.applyCtx2DContextPatches)  C.applyCtx2DContextPatches();
                if (C.applyWebGLContextPatches)  C.applyWebGLContextPatches();
            // ——— Worker env diagnostics (pre-bootstrap) ———//
            // console.info('[DIAG.preBoot]', window.WorkerPatchHooks.diag && window.WorkerPatchHooks.diag());
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

    // Languages stable final setting (moved here to guarantee availability before nav_total_set.js)
    // FrozenArray semantics (минимально приближенно): массив заморожен
    if (Array.isArray(window.__normalizedLanguages)) {{
        Object.freeze(window.__normalizedLanguages);
    }}
    // fail-fast: типы и консистентность
    if (typeof window.__primaryLanguage !== 'string' || !window.__primaryLanguage) {{
        throw new Error('THW: __primaryLanguage invalid');
    }}
    if (!Array.isArray(window.__normalizedLanguages) || window.__normalizedLanguages.length === 0) {{
        throw new Error('THW: __normalizedLanguages invalid');
    }}
    if (window.__normalizedLanguages[0] !== window.__primaryLanguage) {{
        throw new Error('THW: language != languages[0]');
    }}
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
    window.__PLUGIN_PROFILES__          = {json.dumps(profile.get("plugins", []), ensure_ascii=False)};
    """
    page_js = build_page_bundle(init_params) + "\n//# sourceURL=page_bundle.js"
    
    # ---  CDP PROCESSING STAGE---
    # --- patch userAgent and userAgentMetadata via CDP ---
    browser_brand, _, _ = determine_browser_brand_and_versions(user_agent, profile)
    apply_ua_overrides(driver, profile, expected_client_hints, browser_brand)
    inject_uach_strip_window(driver, user_agent)

    # --- Workers Initial patch reading ---
    core = Path(SCRIPTS_WORKERSCOPE / "WORKER_PATCH_SRC.js").read_text("utf-8")
    logger.info("WORKER_PATCH_SRC.initated")
    set_reflect = Path(SCRIPTS_WORKERSCOPE / "set_reflect.js").read_text("utf-8")

    # --- publish worker core into __ENV_BRIDGE__ (stable for external worker_bootstrap.js) ---
    worker_bootstrap_env_js = f"""
    (() => {{
        const BR = (window.__ENV_BRIDGE__ = window.__ENV_BRIDGE__ || {{}});
        if (!BR || typeof BR !== 'object') throw new Error('WorkerBootstrap: __ENV_BRIDGE__ missing');
        const core = {json.dumps(core)};
        const set_reflect = {json.dumps(set_reflect)};
        if (!BR.inlinePatch) {{
            BR.inlinePatch = core;
        }} else if (BR.inlinePatch !== core) {{
            throw new Error('WorkerBootstrap: inlinePatch already set');
        }}
        if (!BR.inlineReflect) {{
            BR.inlineReflect = set_reflect;
        }} else if (BR.inlineReflect !== set_reflect) {{
            throw new Error('WorkerBootstrap: inlineReflect already set');
        }}
    }})();
    //# sourceURL=worker_bootstrap_env.js
    """
    # # --- prepare worker_bootstrap_js (reads __ENV_BRIDGE__.inlinePatch) ---
    worker_bootstrap_js = Path(SCRIPTS_WORKERSCOPE / "worker_bootstrap.js").read_text("utf-8")

    # Publish worker patch core first:
    # - worker_bootstrap_env_js sets __ENV_BRIDGE__.inlinePatch (source text)
    # This order avoids a transient state where Worker overrides exist but bridge URLs aren't ready yet.
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": worker_bootstrap_env_js})
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": worker_bootstrap_js})

    # Connect page_js (core + targets + wrk.js and so on)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": page_js})

    # =========================
    # [CH] Setting up Client hints (CDP-only) + __HEADERS__ (JS, NEW DOCUMENT)
    #  No Runtime.evaluate here. Everything below applies on the next document created by driver.get().
    # =========================

    # # --- [CH/01] detect UA family for safelisted headers ---
    is_safari = "Safari" in user_agent and ("Chrome" not in user_agent and "Edg/" not in user_agent)
    is_firefox = "Firefox" in user_agent and ("Chrome" not in user_agent and "Edg/" not in user_agent)

    # --- [CH/02] build safelisted_headers (minimal set) ---
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
            "Sec-CH-Device-Memory": str(expected_client_hints.get("deviceMemory", profile["deviceMemory"])),
            "Device-Memory": str(expected_client_hints.get("deviceMemory", profile["deviceMemory"])),
            # "Sec-CH-UA": expected_client_hints["sec_ch_ua"],
            # "Sec-CH-UA-Mobile": "?0" if not expected_client_hints.get("mobile") else "?1",
            # "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
        }

    # --- [CH/03] CDP: apply HTTP headers for requests (affects navigation after this call) ---
    driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", {"headers": safelisted_headers})

    # =========================
    # [HDR] window.__HEADERS__ + bridge (NEW DOCUMENT)
    # IMPORTANT: register __HEADERS__ BEFORE anything that may rely on it (e.g. HeadersInterceptor(window) call elsewhere).
    # =========================

    # --- [HDR/01] prepare JS for NEW DOCUMENT: window.__HEADERS__ ---
    # window.__HEADERS__ — Basic set for JS-paatch. На cross-origin  safelisted (accept-language).
    # Keys like sec-ch-* will be ignored by JS (CDP-only).
        
    # headers_window_js = f"""
    # window.__HEADERS__ = {json.dumps(safelisted_headers, ensure_ascii=False)};
    # console.log("[headers_stage] window.__HEADERS__ injected (safelisted only)");

    # {Path(SCRIPTS_PATCHES_STEALTH / "headers_interceptor.js").read_text("utf-8")}
    # HeadersInterceptor(window);

    # //# sourceURL=headers_stage.js
    # """
    # # --- [HDR/02] CDP: register __HEADERS__ for every NEW DOCUMENT ---
    # # window.__HEADERS__ injected (safelisted only)
    # driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": headers_window_js})
    
 
    # --- [HDR/03] load bridge JS (text) ---
    # Headers interceptor bridge to sync allow/ignore CDP with Fetch interceptor
    # headers_bridge_path = (SCRIPTS_PATCHES_STEALTH / "headers_bridge.js")
    # headers_bridge_js = headers_bridge_path.read_text("utf-8")

    # # --- [HDR/04] CDP: register bridge for every NEW DOCUMENT ---
    # driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": headers_bridge_js})

    # # modification via Fetch.enable/Fetch.requestPaused  prepared, but in this build rules=[], so interception is disabled (no-op)
    # fetch_rules = []

    # _install_fetch_interceptor(
    #     driver,
    #     fetch_rules,
    #     extra_headers_fn=lambda url, method, rtype: safelisted_headers,
    #     blocked_headers=[]
    # )

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

        # # Timezone override
        driver.execute_cdp_cmd("Emulation.setTimezoneOverride", {"timezoneId": timezone})
        logger.info(f"[profile] Setting timezone: {timezone}, {offset_minutes}")


        # Geolocation override
        logger.info("[profile] Setting geolocation: %.4f,%.4f", latitude, longitude)
        driver.execute_cdp_cmd(
            "Emulation.setGeolocationOverride",
            {"latitude": latitude, "longitude": longitude, "accuracy": 100}
        )

        def _inject_time_machine(driver):
            tz_src = Path(SCRIPTS_PATCHES_STEALTH / "TimezoneOverride_source.js").read_text("utf-8")
            geo_src = Path(SCRIPTS_PATCHES_STEALTH / "GeoOverride_source.js").read_text("utf-8")
            init_tz = "TimezonePatchModule(window);"
            call_tz = r'''
            
        Promise.resolve().then(() => {
        if (typeof patchTimeZone === "function") patchTimeZone();
        });
        '''.strip()
            timegeo_js = "\n;\n".join([
                tz_src,
                init_tz,
                call_tz,
                geo_src,
            ]) + "\n//# sourceURL=timegeo_bundle.js"

            driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": timegeo_js})
        _inject_time_machine(driver)

        
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
    try:
        seed_fp = hashlib.sha256(global_seed.encode("utf-8")).hexdigest()[:12]
        logger.info("Seed fingerprint rule: sha256_12 = sha256(seed)[:12]")
        logger.info("Seed fingerprint: len=%s sha256_12=%s", len(global_seed), seed_fp)
    except Exception:
        logger.info("Seed fingerprint: unavailable")
    client = VPNClient(config_dir=CONFIG_DIR, openvpn_path=OPENVPN_PATH)
    try:
        json_path = str(PROFILE_DATA_SRC/ "profile.json")
        if os.path.exists(json_path):
            os.remove(json_path)
            logger.info("Previous profile.json had been deleted")

        # client.verify()
        # client.prepare()
        # logger.info("preparation completed")
        # client.connect()
        client._kill_old_processes()
        client._clean_directories()
       
       
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
            "platform_weights": [1, 0],
            # Probabilities of browser selection for each platform:
            "browser_weights": {
                "Win32": (["chrome", "firefox", "edge"], [0.8, 0.01, 0.19]),
                "MacIntel": (["chrome", "firefox", "safari"], [0.8, 0.01, 0.19]),
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
                if "Windows 11" in os_name:
                    platform_version = "19.0.0" if "19" in os_name else "15.0.0"
            elif platform == "MacIntel":
                m = re.search(r"Mac OS X\s+([\d_\.]+)", os_info)
                if not m:
                    raise RuntimeError(
                        f"THW: failed to extract Mac OS X version from os_info={os_info!r} "
                        f"(platform={platform!r}, os_name={os_name!r})"
                    )
                platform_version = _norm_ver(m.group(1))

        logger.debug(
            f"OS: {os_name}, platform={platform}, platform_version={platform_version!r}"
        )

        # --------BROWSER selection -------------------
        browser_choice = random.choices(
            *config["browser_weights"][platform], k=1
        )[0]
        # as Windows version branches are hard-pinned to kernel browser versions
        CHROMIUM_PREFIX_MAP = {
            "15.0.0": ("142.",),
            "19.0.0": ("143.", "144.", "145."),
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
        audioinput = random.choice(data["audioinput"])['name']
        videoinput = random.choice(data["videoinput"])['name']
        audiooutput = random.choice(data["headphone"])['name']
        devices_conf = {"audioinput": audioinput, "videoinput": videoinput, "audiooutput": audiooutput}


        # # ----------------------------Setting up GPU and Screen -----------------------
        gpu = random.choice(data["GPU"])
        gpu_architecture = str(gpu.get("architecture", "")).strip()
        gpu_type = str(gpu.get("type", ""))
        gpu_name = gpu["name"]
        gpu_code = gpu["prod_code"]

        screen_res = random.choice(gpu["resolution"])
        if not isinstance(screen_res, str) or not re.fullmatch(r"[1-9]\d{2,4}x[1-9]\d{2,4}", screen_res):
            raise ValueError(f"invalid screen resolution from GPU dictionary: {screen_res!r}")
        screen_width, screen_height = map(int, screen_res.split("x", 1))

        # ----------------------- devicespixelratio AKA deviceScaleFactor(CDP)  -----------------------
        dpr_map = {
            "1920x1080": 1.0,
            "2560x1440": 1.25,
            "3840x2160": 2.0,
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
        browser_brand, major_version, browser_version = determine_browser_brand_and_versions(user_agent, profile)
        profile["browser_brand"] = browser_brand
        profile["browser_major_version"] = major_version
        expected_client_hints = build_expected_client_hints(
            profile, generated_platform, browser_brand, major_version, browser_version
        )
        # ----------------------- Python final logging  -----------------------
        logger.info(f"profile['user_agent'] = {profile.get('user_agent')}")
        logger.info(f"profile: {profile}")
        logger.info("user_agent: %s", profile["user_agent"])
        logger.info("full profile: %s", json.dumps(profile, indent=4))

        # ----------------------- Own data collection  -----------------------
        save_dir = str(PROJECT_ROOT / "profiles")
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

        # # --- mitmproxy start ---
        # mitmproxy_proc = subprocess.Popen(
        #     ["mitmproxy", "-s", str(CORS_ADDON)],
        #     cwd=str(PROJECT_ROOT)
        # )

        # def wait_for_port(host, port, timeout=10):
        #     start = time.time()
        #     while time.time() - start < timeout:
        #         try:
        #             with socket.create_connection((host, port), timeout=1):
        #                 return True
        #         except OSError:
        #             time.sleep(0.5)
        #     return False

        # if not wait_for_port("127.0.0.1", 8080):
        #     raise RuntimeError("mitmproxy not launched")

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
            override_js = Path(SCRIPTS_PATCHES_NAV / "override_ua_data.js").read_text(encoding="utf-8")
            if not override_js or not isinstance(override_js, str):
                raise TypeError("override_user_agent_data: override_ua_data.js is empty/invalid")
            driver.execute_cdp_cmd(
                "Page.addScriptToEvaluateOnNewDocument",
                {"source": override_js}
            )
        
        elif browser_brand == "Firefox":
            logger.info("UA data submitted via CDP for Firefox/Safari")
        else:
            needs_reapply = False
            try:
                current_ua = driver.execute_script("return navigator.userAgent")
                if current_ua != profile["user_agent"]:
                    needs_reapply = True
                else:
                    current_uad = driver.execute_script(
                        "const uad = navigator.userAgentData;"
                        "if (!uad) return null;"
                        "const brands = Array.isArray(uad.brands) ? "
                        "uad.brands.map(b => ({brand: b.brand, version: String(b.version)})) : null;"
                        "return { brands, platform: uad.platform, mobile: uad.mobile };"
                    )
                    if current_uad:
                        exp_brands = expected_client_hints.get("brands") or []
                        exp_norm = sorted(
                            [(str(b.get("brand")), str(b.get("version"))) for b in exp_brands if isinstance(b, dict)]
                        )
                        cur_brands = current_uad.get("brands") or []
                        cur_norm = sorted(
                            [(str(b.get("brand")), str(b.get("version"))) for b in cur_brands if isinstance(b, dict)]
                        )
                        if (
                            exp_norm != cur_norm
                            or current_uad.get("platform") != expected_client_hints.get("platform")
                            or current_uad.get("mobile") != expected_client_hints.get("mobile")
                        ):
                            needs_reapply = True
            except Exception as e:
                logger.warning("UA override reapply check failed: %s", e)
                needs_reapply = True
            if needs_reapply:
                apply_ua_overrides(driver, profile, expected_client_hints, browser_brand)
                inject_uach_strip_window(driver, user_agent)
                logger.info("UA data re-applied via CDP (mismatch detected)")
        # ----------------------- Call local setting def  -----------------------
        configure_profile(driver, profile["language"], profile["languages"], country_data)
        
        # ----------------------- YOUR DESTINATION POINT, PLEASE MIND THE GAP -----------------------
        driver.get("https://abrahamjuliot.github.io/creepjs/")

        # Keep main thread alive; otherwise daemon CDP threads die on process exit.
        # In some launch modes stdin is non-interactive/EOF, so plain input() is not stable.
        def _hold_until_driver_end():
            logger.warning("stdin is unavailable; keepalive mode is active (Ctrl+C to exit)")
            while True:
                try:
                    driver.execute_script("return 1")
                except Exception:
                    logger.info("Driver session ended; keepalive loop finished")
                    break
                time.sleep(1.0)

        time.sleep(0.5)
        try:
            if sys.stdin is not None and sys.stdin.isatty():
                input("press Enter for exit...")
            else:
                _hold_until_driver_end()
        except EOFError:
            _hold_until_driver_end()
        except KeyboardInterrupt:
            logger.info("Interrupted by user (Ctrl+C)")

    except Exception as e:
        logger.error(f"Error in main block: {e}", exc_info=True)
        logger.info(f"Error: {e}")
        # ----------------------- THAT'S ALL, FOLKS!  -----------------------
    # finally:
    #     # Wait for mitmproxy to complete, then close the file
    #     mitmproxy_proc.terminate()
    #     mitmproxy_proc.wait()
if __name__ == "__main__":
    main()
