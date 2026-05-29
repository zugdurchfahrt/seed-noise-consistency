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
from selenium.webdriver.chromium.service import ChromiumService
import selenium.webdriver.chromium.service as selenium_chromium_service
from selenium.common.exceptions import WebDriverException, NoSuchWindowException
import undetected_chromedriver as uc

# ----------------------- FOLDERS -----------------------
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

# ----------------------- MITMPROXY SWITCH -----------------------
# Active profile: with mitmproxy.
# MITMPROXY_ON = True

# Active profile: without mitmproxy.
MITMPROXY_OFF = True

_mitmproxy_on = globals().get("MITMPROXY_ON", False) is True
_mitmproxy_off = globals().get("MITMPROXY_OFF", False) is True
if _mitmproxy_on == _mitmproxy_off:
    raise RuntimeError("Exactly one mitmproxy switch must be active: MITMPROXY_ON or MITMPROXY_OFF")

MITMPROXY_ENABLED = _mitmproxy_on
MITMPROXY_HOST = "127.0.0.1"
MITMPROXY_PORT = 8082
MITMPROXY_ADDRESS = f"{MITMPROXY_HOST}:{MITMPROXY_PORT}"

# LOCAL PYTHON MODULES PATHS
PY_MODULE_DIRS = [
    PROJECT_ROOT / "tools" / "tools_infra",
    PROJECT_ROOT / "tools" / "tools_runtime",
    PROJECT_ROOT / "tools" / "generators",
    PROJECT_ROOT / "profile_data_source",
    PROJECT_ROOT
]
for d in PY_MODULE_DIRS:
    if not d.exists():
        raise FileNotFoundError(d)
    sys.path.insert(0, str(d))
    
# ----------------------- SOURCE -----------------------
from profile_data_source.depo_browser import chrome_versions, edge_versions, safari_versions, firefox_versions
from profile_data_source.datashell_win32 import data_4_win32
from profile_data_source.macintel import macintel_data
# ----------------------- MODULES-----------------------
import tools.generators.cdp_catapult as cdp
import tools.generators.cdp_worker_env as cdp_worker_env
import tools.tools_runtime.helpers as helpers_module
import tools.tools_runtime.headers_adapter as headers_adapter_module
import tools.tools_infra.vpn_utils as vpn_utils_module
import tools.generators.rand_met as rand_met_module
import profile_data_source.plugins_dict as plugins_dict_module
import profile_data_source.permissions_dict as permissions_dict_module
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

# ----------------------- LOGGING SETUP -----------------------
setup_logger(child_levels={
    "main": logging.INFO,
    "vpn_utils": logging.DEBUG,
    "rand_met": logging.INFO,
    "plugins_dict": logging.DEBUG,
    "permissions_dict": logging.INFO,
    "headers_adapter": logging.INFO,
    "helpers_runtime": logging.INFO,
    "cdp_worker_env": logging.INFO,
})

# ----------------------- RNG POOLS -----------------------
def _build_rng_pools(global_seed: str) -> dict[str, random.Random]:
    if not isinstance(global_seed, str) or not global_seed.strip():
        raise ValueError("global_seed must be a non-empty string")

    root = "__RAND_SEED_POOL__"

    def _rng_for(label: str) -> random.Random:
        if not isinstance(label, str) or not label.strip():
            raise ValueError("rng pool label must be a non-empty string")
        material = f"{root}|{label}|{global_seed}".encode("utf-8")
        numeric_seed = int.from_bytes(hashlib.sha256(material).digest()[:8], "big")
        return random.Random(numeric_seed)

    return {
        "profile": _rng_for("profile"),
        "plugins": _rng_for("plugins"),
        "permissions": _rng_for("permissions"),
        "headers": _rng_for("headers"),
        "vpn": _rng_for("vpn"),
    }
# ----------------------- RNG POOLS FOR FONT GENERATION -----------------------
# main injects one rand_met-specific derivative, and rand_met derives
# its internal manifest/meta/cache branches from that single seam.

def _derive_rand_met_seed_material(global_seed: str, label: str) -> str:
    if not isinstance(global_seed, str) or not global_seed.strip():
        raise ValueError("global_seed must be a non-empty string")
    if not isinstance(label, str) or not label.strip():
        raise ValueError("seed material label must be a non-empty string")
    material = f"__RAND_SEED_POOL__|{label}|{global_seed}".encode("utf-8")
    return hashlib.sha256(material).hexdigest()

# ----------------------- PIPELINE INIT STABILISATION -----------------------                                                                                                                                                                                                                                                                                            # ----------------------- GLOBAL VARIABLES -----------------------
country_data = None
# ----------------------- PROFILE FUNCTION -----------------------
def get_random_profile(country_data, platform):
    return {}

# ---Fetch interception via CDP ---
def _install_fetch_interceptor(driver, rules, extra_headers_fn=None, blocked_headers=None):
    """
    Fetch.enable + Fetch.requestPaused: modify only requests that match the patterns.
    Domain lists are taken dynamically from the page hidden state
    (FernwehContext.state.__HEADERS__.__STATE__.allowSuffixes / ignoreSuffixes),
    which are synchronized with window.HeadersInterceptor.addAllow/addIgnore.
    If rules is empty (as in the current build), Fetch interception is not installed.
    Non-language header injection is performed at Network.setExtraHTTPHeaders (CDP)
    and JS patch. Accept-Language is owned by Chrome language preferences.
    """
    if not rules:
        logger.info(
            "headers_stage: Fetch interceptor not installed: empty Fetch patterns; "
            "non-language headers are handled by Network.setExtraHTTPHeaders and JS stage"
        )
        return

    driver.execute_cdp_cmd("Fetch.enable", {"patterns": rules})
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
                "expression": """(function(){
                    const C = (window.FernwehContext && typeof window.FernwehContext === 'object') ? window.FernwehContext : null;
                    const stateRoot = (C && C.state && typeof C.state === 'object') ? C.state : null;
                    const headersRoot = (stateRoot && stateRoot.__HEADERS__ && typeof stateRoot.__HEADERS__ === 'object') ? stateRoot.__HEADERS__ : null;
                    const headersState = (headersRoot && headersRoot.__STATE__ && typeof headersRoot.__STATE__ === 'object') ? headersRoot.__STATE__ : null;
                    return {
                        allow: (headersState && Array.isArray(headersState.allowSuffixes)) ? headersState.allowSuffixes : [],
                        ignore: (headersState && Array.isArray(headersState.ignoreSuffixes)) ? headersState.ignoreSuffixes : []
                    };
                })()""",
                "returnByValue": True
            })
            val = (res.get("result") or {}).get("value") or {}
            allow = [str(x).lower() for x in val.get("allow", [])]
            ignore = [str(x).lower() for x in val.get("ignore", [])]
            return allow, ignore
        except Exception as exc:
            logger.warning(
                "headers_stage: Fetch allow/ignore Runtime.evaluate failed; "
                "using empty suffix lists",
                exc_info=True,
            )
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
            logger.exception(
                "headers_stage: Fetch.requestPaused handler failed; "
                "continuing request without header mutation"
            )
            if rid:
                try:
                    driver.execute_cdp_cmd("Fetch.continueRequest", {"requestId": rid})
                except Exception:
                    logger.exception(
                        "headers_stage: Fetch.continueRequest failed after handler error"
                    )
    driver.add_cdp_listener("Fetch.requestPaused", _on_paused)


def apply_hardware_override(driver, hardware_concurrency_value):
    try:
        driver.execute_cdp_cmd(
            "Emulation.setHardwareConcurrencyOverride",
            {"hardwareConcurrency": int(hardware_concurrency_value)},
        )
        logger.info("Direct page-side hardwareConcurrency override applied: %s", hardware_concurrency_value)
    except Exception as e:
        logger.error("Direct page-side hardwareConcurrency override failed: %s", e, exc_info=True)
        raise


def read_page_device_memory(driver, device_memory_value):
    try:
        device_memory_value = driver.execute_script("return navigator.deviceMemory")
        if not isinstance(device_memory_value, (int, float)) or device_memory_value <= 0:
            raise RuntimeError(f"invalid page-side navigator.deviceMemory: {device_memory_value!r}")
        logger.info("Direct page-side deviceMemory read: %s", device_memory_value)
        return device_memory_value
    except Exception as e:
        logger.warning("Direct page-side deviceMemory read failed: %s", e)
        raise


def apply_page_locale_override(driver, language):
    try:
        driver.execute_cdp_cmd("Emulation.setLocaleOverride", {"locale": str(language).replace("-", "_")})
        logger.info("Direct page-side locale override applied: %s", language)
    except WebDriverException as e:
        msg = str(e)
        if "Another locale override is already in effect" in msg:
            logger.warning("Locale override already in effect; preserving existing override")
            return
        logger.error("Direct page-side locale override failed: %s", e, exc_info=True)
        raise
    except Exception as e:
        logger.error("Direct page-side locale override failed: %s", e, exc_info=True)
        raise


def apply_window_bounds_override(driver, device_metrics, stage):
    try:
        if not isinstance(device_metrics, dict):
            raise TypeError(f"[windowBounds.{stage}] invalid device_metrics: {device_metrics!r}")

        width = device_metrics.get("windowBoundsWidth")
        height = device_metrics.get("windowBoundsHeight")
        if width is None or height is None:
            raise ValueError(f"[windowBounds.{stage}] missing bounds in device_metrics={device_metrics!r}")

        win = driver.execute_cdp_cmd("Browser.getWindowForTarget", {})
        payload = {
            "windowId": win["windowId"],
            "bounds": {
                "windowState": "normal",
                "width": int(width),
                "height": int(height),
            },
        }

        logger.info("[windowBounds.%s] Browser.setWindowBounds payload=%r", stage, payload)
        driver.execute_cdp_cmd("Browser.setWindowBounds", payload)

        actual = driver.execute_cdp_cmd("Browser.getWindowBounds", {"windowId": win["windowId"]})
        logger.info("[windowBounds.%s] Browser.getWindowBounds actual=%r", stage, actual)

    except Exception as e:
        logger.error("[windowBounds.%s] Browser.setWindowBounds failed: %s", stage, e, exc_info=True)
        raise


def build_timegeo_bundle():
    tz_src = Path(SCRIPTS_PATCHES_STEALTH / "TimezoneOverride_source.js").read_text("utf-8")
    geo_src = Path(SCRIPTS_PATCHES_STEALTH / "GeoOverride_source.js").read_text("utf-8")
    call_tz = "Promise.resolve().then(() => { if (typeof __patchTimeZone === \"function\") __patchTimeZone(); });"
    return "\n;\n".join([tz_src, "const __patchTimeZone = TimezonePatchModule(window);", call_tz, geo_src]) + "\n//# sourceURL=timegeo_bundle.js"


def apply_profile_target_overrides(driver, language, country_data, profile, stage):
    timezone = country_data["timezone"]
    latitude = country_data["latitude"]
    longitude = country_data["longitude"]
    driver.execute_cdp_cmd("Emulation.setTimezoneOverride", {"timezoneId": timezone})
    logger.info("[profile.%s] Setting timezone: %s, %s", stage, timezone, country_data["offset_minutes"])
    driver.execute_cdp_cmd("Emulation.setGeolocationOverride", {"latitude": latitude, "longitude": longitude, "accuracy": 100})
    logger.info("[profile.%s] Setting geolocation: %.4f,%.4f", stage, latitude, longitude)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": build_timegeo_bundle()})
    device_metrics = build_device_metrics(profile)
    emulation_metrics = {key: device_metrics[key] for key in (
        "width", "height", "deviceScaleFactor", "mobile", "screenWidth", "screenHeight", "screenOrientation"
    ) if key in device_metrics}
    driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", emulation_metrics)
    if stage == "window_enrollment":
        logger.info("[windowBounds.%s] Browser window bounds preserved during target enrollment", stage)
    else:
        apply_window_bounds_override(driver, device_metrics, stage)
    apply_page_locale_override(driver, language=language)


def build_bootstrap_device_metrics():
    width = 1920
    height = 1080
    dpr = 1
    return {
        "width": width,
        "height": height,
        "windowBoundsWidth": width,
        "windowBoundsHeight": height,
        "deviceScaleFactor": dpr,
        "mobile": False,
        "screenWidth": width,
        "screenHeight": height,
        "screenOrientation": {"type": "landscapePrimary", "angle": 0},
    }


def _target_setup_steps(driver):
    steps = getattr(driver, "_sunami_target_setup_steps", None)
    if steps is None:
        setattr(driver, "_sunami_target_setup_steps", [])
        steps = driver._sunami_target_setup_steps
    if not isinstance(steps, list):
        raise RuntimeError("target setup registry is invalid")
    return steps


def _register_target_setup_step(driver, name, apply_fn):
    if not isinstance(name, str) or not name.strip():
        raise ValueError("target setup step name must be a non-empty string")
    if not callable(apply_fn):
        raise TypeError(f"target setup step {name!r} must be callable")
    _target_setup_steps(driver).append((name, apply_fn))


def _policy_event(driver, level, code, stage, message, type_value, data=None, key=None, err=None):
    ctx = {
        "module": "BrowserSessionPolicy",
        "surface": "webdriver_session",
        "key": key,
        "stage": stage,
        "message": message,
        "type": type_value,
        "data": data if isinstance(data, dict) else {},
    }
    log_fn = logger.error if level in {"error", "fatal"} else logger.warning if level == "warn" else logger.info
    log_fn("[sessionPolicy] %s ctx=%s", code, ctx, exc_info=bool(err) if level != "info" else False)


def _is_window_gone_exception(exc):
    if isinstance(exc, NoSuchWindowException):
        return True
    message = str(exc).lower()
    return (
        "no such window" in message
        or "target window already closed" in message
        or "web view not found" in message
    )


def _is_devtools_url(url):
    if not isinstance(url, str):
        return False
    value = url.strip().lower()
    return value.startswith((
        "devtools://",
        "about:devtools",
    ))


def _is_deferred_start_url(url):
    if not isinstance(url, str):
        return False
    value = url.strip().lower()
    return (
        value == ""
        or value == "about:blank"
        or value.startswith("chrome://new-tab-page")
        or value.startswith("chrome://newtab")
        or value.startswith("edge://newtab")
    )


def _is_browser_internal_url(url):
    if not isinstance(url, str):
        return False
    value = url.strip().lower()
    return value.startswith((
        "chrome://",
        "chrome-untrusted://",
        "edge://",
    ))


def _apply_registered_target_setup(driver, reason, handle):
    steps = list(_target_setup_steps(driver))
    if not steps:
        raise RuntimeError("target setup registry is empty")

    for name, apply_fn in steps:
        try:
            if handle not in set(driver.window_handles):
                raise NoSuchWindowException(f"target window disappeared before setup step {name!r}: {handle!r}")
            apply_fn(driver)
        except Exception as exc:
            window_gone = _is_window_gone_exception(exc)
            _policy_event(
                driver,
                "warn" if window_gone else "error",
                "session_policy_target_setup_window_gone" if window_gone else "session_policy_target_setup_apply_failed",
                "apply",
                "target window disappeared during target-scoped setup" if window_gone else "target-scoped setup step failed",
                "pipeline telemetry" if window_gone else "pipeline missing data",
                {
                    "outcome": "throw",
                    "reason": "target_closed_before_enrollment" if window_gone else "apply_failed",
                    "setupStep": name,
                    "handle": handle,
                    "policyReason": reason,
                },
                key=handle,
                err=exc,
            )
            raise


def _validate_managed_window_runtime(driver, handle, reason):
    result = driver.execute_script(
        """
        return (function() {
          const C = (window.FernwehContext && typeof window.FernwehContext === 'object')
            ? window.FernwehContext
            : null;
          const Core = (window.Core && typeof window.Core === 'object') ? window.Core : null;
          const internal = Core && typeof Core.__internal === 'object' ? Core.__internal : null;
          const checks = [
            ['FernwehContext', C],
            ['FernwehContext.state', C && C.state && typeof C.state === 'object'],
            ['FernwehContext.__logger', C && C.__logger && typeof C.__logger === 'object'],
            ['Core', Core],
            ['Core.__internal', internal],
            ['Core.__internal.prng', internal && internal.prng && typeof internal.prng === 'object'],
            ['FernwehContext.__patchState', C && C.__patchState && typeof C.__patchState === 'object']
          ];
          const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
          return { ok: missing.length === 0, missing };
        })();
        """
    )
    if not isinstance(result, dict) or not result.get("ok"):
        missing = result.get("missing") if isinstance(result, dict) else result
        raise RuntimeError(
            f"managed window runtime validation failed handle={handle!r} "
            f"reason={reason!r} missing={missing!r}"
        )


class BrowserSessionPolicy:
    def __init__(self, driver):
        self.driver = driver
        self.primary = driver.current_window_handle
        handles = list(driver.window_handles)
        if not _target_setup_steps(driver):
            raise RuntimeError("session policy preflight failed: target setup registry is empty")
        if self.primary not in handles:
            raise RuntimeError(f"session policy preflight failed: primary handle missing {self.primary!r}")
        if set(handles) != {self.primary}:
            raise RuntimeError(f"session policy preflight failed: unmanaged startup handles {handles!r}")
        self.known = set(handles)
        self.managed = {self.primary}
        self.ignored = set()
        self.pending = set()
        self.active_managed = self.primary

    def navigate(self, url):
        if not isinstance(url, str) or not url.strip():
            raise ValueError("session policy navigation url must be a non-empty string")
        self._restore_active_managed()
        self.driver.get(url)
        _validate_managed_window_runtime(self.driver, self.active_managed, "policy_navigation")
        self.tick()

    def tick(self):
        handles = list(self.driver.window_handles)
        current = set(handles)
        self._promote_primary_if_needed(current)
        self.ignored.intersection_update(current)
        self.pending.intersection_update(current)
        for handle in list(self.managed - current):
            self.managed.discard(handle)
            self.known.discard(handle)
            if self.active_managed == handle:
                self.active_managed = self.primary
        for handle in list(self.known - current):
            self.known.discard(handle)
        for handle in [h for h in handles if h not in self.known]:
            self._enroll(handle)
        for handle in [h for h in handles if h in self.pending]:
            self._try_enroll_pending(handle)

        current = set(self.driver.window_handles)
        unmanaged = current - self.managed - self.ignored - self.pending
        if unmanaged:
            raise RuntimeError(f"session policy violation: unmanaged handles remain {sorted(unmanaged)!r}")
        self.known = current
        try:
            current_handle = self._current_handle()
        except Exception as exc:
            if not _is_window_gone_exception(exc):
                raise
            _policy_event(
                self.driver,
                "warn",
                "session_policy_current_window_closed",
                "runtime",
                "current window handle disappeared; restoring managed window",
                "pipeline telemetry",
                {"outcome": "return", "reason": "current_window_closed"},
                err=exc,
            )
            self._restore_active_managed()
            return
        if current_handle in self.managed:
            self.active_managed = current_handle

    def _promote_primary_if_needed(self, current):
        if self.primary in current:
            return
        for handle in [self.active_managed, *self.managed, *self.known]:
            if handle in current and handle not in self.ignored:
                previous_primary = self.primary
                self.primary = handle
                self.managed.add(handle)
                self.known.add(handle)
                self.active_managed = handle
                _policy_event(
                    self.driver,
                    "warn",
                    "session_policy_primary_handle_promoted",
                    "runtime",
                    "primary handle lost; promoted an existing managed handle",
                    "pipeline telemetry",
                    {"outcome": "return", "reason": "primary_lost", "previousPrimary": previous_primary, "primary": handle},
                    key=handle,
                )
                return
        raise RuntimeError(f"session policy violation: primary handle lost {self.primary!r}")

    def _current_handle(self):
        try:
            return self.driver.current_window_handle
        except Exception as exc:
            _policy_event(
                self.driver,
                "warn",
                "session_policy_current_handle_failed",
                "runtime",
                "failed to read current window handle",
                "pipeline missing data",
                {"outcome": "throw", "reason": "preflight_failed"},
                err=exc,
            )
            raise

    def _restore_active_managed(self):
        handles = set(self.driver.window_handles)
        candidates = [self.active_managed, self.primary]
        for handle in candidates:
            if handle in handles and handle in self.managed:
                self.driver.switch_to.window(handle)
                self.active_managed = handle
                return
        raise RuntimeError("session policy violation: no active managed window can be restored")

    def _enroll(self, handle):
        previous = self._current_handle()
        _policy_event(
            self.driver,
            "info",
            "session_policy_new_window_detected",
            "runtime",
            "new window handle detected",
            "pipeline telemetry",
            {"outcome": "return", "handle": handle, "previousHandle": previous},
            key=handle,
        )
        try:
            self.driver.switch_to.window(handle)
            enrollment_url = self.driver.current_url
            if _is_devtools_url(enrollment_url):
                self.ignored.add(handle)
                self.known.add(handle)
                _policy_event(
                    self.driver,
                    "info",
                    "session_policy_internal_window_ignored",
                    "runtime",
                    "browser-internal window ignored by managed pipeline",
                    "pipeline telemetry",
                    {"outcome": "return", "reason": "browser_internal_target", "handle": handle, "url": enrollment_url},
                    key=handle,
                )
                return
            if _is_deferred_start_url(enrollment_url):
                _apply_registered_target_setup(self.driver, "startup_window_enrollment", handle)
                self.pending.add(handle)
                self.known.add(handle)
                self.active_managed = handle
                _policy_event(
                    self.driver,
                    "info",
                    "session_policy_startup_window_armed",
                    "runtime",
                    "startup window armed with target setup before first navigation",
                    "pipeline telemetry",
                    {"outcome": "return", "reason": "startup_url_armed", "handle": handle, "url": enrollment_url},
                    key=handle,
                )
                return
            if _is_browser_internal_url(enrollment_url):
                self.ignored.add(handle)
                self.known.add(handle)
                _policy_event(
                    self.driver,
                    "info",
                    "session_policy_internal_window_ignored",
                    "runtime",
                    "browser-internal window ignored by managed pipeline",
                    "pipeline telemetry",
                    {"outcome": "return", "reason": "browser_internal_target", "handle": handle, "url": enrollment_url},
                    key=handle,
                )
                return
            _apply_registered_target_setup(self.driver, "window_enrollment", handle)
            if not isinstance(enrollment_url, str) or not enrollment_url.strip():
                raise RuntimeError(f"new window has invalid current_url: {enrollment_url!r}")
            self.driver.get(enrollment_url)
            _validate_managed_window_runtime(self.driver, handle, "window_enrollment")
            self.managed.add(handle)
            self.known.add(handle)
            self.active_managed = handle
            _policy_event(
                self.driver,
                "info",
                "session_policy_window_enrolled",
                "runtime",
                "new window enrolled into managed pipeline",
                "ok",
                {"outcome": "return", "handle": handle, "enrollmentUrl": enrollment_url},
                key=handle,
            )
        except Exception as exc:
            if _is_window_gone_exception(exc):
                try:
                    handle_present = handle in set(self.driver.window_handles)
                except Exception as handles_exc:
                    _policy_event(
                        self.driver,
                        "error",
                        "session_policy_window_handles_read_failed",
                        "rollback",
                        "failed to inspect window handles after enrollment target disappeared",
                        "pipeline missing data",
                        {"outcome": "throw", "reason": "rollback_preflight_failed", "handle": handle},
                        key=handle,
                        err=handles_exc,
                    )
                else:
                    if not handle_present:
                        self.managed.discard(handle)
                        self.known.discard(handle)
                        try:
                            self._restore_after_enrollment(previous)
                        except Exception as restore_exc:
                            _policy_event(
                                self.driver,
                                "fatal",
                                "session_policy_window_disappeared_restore_failed",
                                "rollback",
                                "failed to restore managed window after enrollment target disappeared",
                                "pipeline missing data",
                                {"outcome": "throw", "reason": "rollback_failed", "handle": handle, "previousHandle": previous},
                                key=handle,
                                err=restore_exc,
                            )
                            raise
                        _policy_event(
                            self.driver,
                            "warn",
                            "session_policy_window_disappeared_during_enrollment",
                            "rollback",
                            "new window target disappeared before enrollment completed",
                            "pipeline telemetry",
                            {"outcome": "return", "reason": "target_closed_before_enrollment", "handle": handle, "previousHandle": previous},
                            key=handle,
                            err=exc,
                        )
                        return
            _policy_event(
                self.driver,
                "error",
                "session_policy_window_enrollment_failed",
                "apply",
                "new window enrollment failed",
                "pipeline missing data",
                {"outcome": "throw", "reason": "apply_failed", "handle": handle},
                key=handle,
                err=exc,
            )
            self._rollback_failed_enrollment(handle, previous, exc)
            raise RuntimeError(f"window enrollment failed for handle={handle!r}") from exc

    def _try_enroll_pending(self, handle):
        previous = self._current_handle()
        try:
            self.driver.switch_to.window(handle)
            enrollment_url = self.driver.current_url
            if _is_deferred_start_url(enrollment_url):
                return
            if _is_devtools_url(enrollment_url) or _is_browser_internal_url(enrollment_url):
                self.pending.discard(handle)
                self.ignored.add(handle)
                self.known.add(handle)
                _policy_event(
                    self.driver,
                    "info",
                    "session_policy_pending_internal_window_ignored",
                    "runtime",
                    "pending window became browser-internal and was ignored",
                    "pipeline telemetry",
                    {"outcome": "return", "reason": "browser_internal_target", "handle": handle, "url": enrollment_url},
                    key=handle,
                )
                return
            if not isinstance(enrollment_url, str) or not enrollment_url.strip():
                raise RuntimeError(f"pending window has invalid current_url: {enrollment_url!r}")
            _validate_managed_window_runtime(self.driver, handle, "pending_window_enrollment")
            self.pending.discard(handle)
            self.managed.add(handle)
            self.known.add(handle)
            self.active_managed = handle
            _policy_event(
                self.driver,
                "info",
                "session_policy_pending_window_enrolled",
                "runtime",
                "pending window enrolled into managed pipeline",
                "ok",
                {"outcome": "return", "handle": handle, "enrollmentUrl": enrollment_url},
                key=handle,
            )
        except Exception as exc:
            if _is_window_gone_exception(exc):
                self.pending.discard(handle)
                self.known.discard(handle)
                self._restore_after_enrollment(previous)
                _policy_event(
                    self.driver,
                    "warn",
                    "session_policy_pending_window_disappeared",
                    "rollback",
                    "pending window disappeared before enrollment completed",
                    "pipeline telemetry",
                    {"outcome": "return", "reason": "target_closed_before_enrollment", "handle": handle},
                    key=handle,
                    err=exc,
                )
                return
            _policy_event(
                self.driver,
                "error",
                "session_policy_pending_window_enrollment_failed",
                "apply",
                "pending window enrollment failed",
                "pipeline missing data",
                {"outcome": "throw", "reason": "apply_failed", "handle": handle},
                key=handle,
                err=exc,
            )
            self._rollback_failed_enrollment(handle, previous, exc)
            raise RuntimeError(f"pending window enrollment failed for handle={handle!r}") from exc

    def _rollback_failed_enrollment(self, handle, previous, original_exc):
        rollback_error = None
        try:
            if handle in set(self.driver.window_handles):
                if handle == self.primary:
                    raise RuntimeError("refusing to close primary handle during enrollment rollback")
                self.driver.switch_to.window(handle)
                self.driver.close()
        except Exception as exc:
            rollback_error = exc
            _policy_event(
                self.driver,
                "fatal",
                "session_policy_window_enrollment_rollback_failed",
                "rollback",
                "failed to close rejected window after enrollment failure",
                "pipeline missing data",
                {"outcome": "throw", "reason": "rollback_failed", "handle": handle, "originalError": repr(original_exc)},
                key=handle,
                err=exc,
            )
        finally:
            self.managed.discard(handle)
            self.known.discard(handle)
            self.pending.discard(handle)
            self.ignored.discard(handle)
        self._restore_after_enrollment(previous)
        if rollback_error is not None:
            raise RuntimeError(f"window enrollment rollback failed for handle={handle!r}") from rollback_error

    def _restore_after_enrollment(self, previous):
        handles = set(self.driver.window_handles)
        if previous in handles and previous in self.managed:
            self.driver.switch_to.window(previous)
            self.active_managed = previous
            return
        if self.primary in handles and self.primary in self.managed:
            self.driver.switch_to.window(self.primary)
            self.active_managed = self.primary
            return
        raise RuntimeError("session policy violation: failed to restore active managed window")

# ----------------------- function init_driver -----------------------
def init_driver(
    profile, country_data, dom_platform, user_agent, screen_width, screen_height,
    webgl_vendor, webgl_renderer, webgl_unmasked_vendor, webgl_unmasked_renderer,
    devices_conf, ua_platform, ua_platform_version, expected_client_hints,
    vendor_value, language, normalized_languages, device_memory_value, hardware_concurrency_value,
    device_dpr_value, plugins, gpu_vendor, gpu_architecture, gpu_type, global_seed,
):
    timezone = country_data["timezone"]
    offset_minutes = country_data["offset_minutes"]
    latitude = country_data["latitude"]
    longitude = country_data["longitude"]
    chrome_options = Options()
    if MITMPROXY_ENABLED:
        proxy = Proxy()
        proxy.proxy_type = ProxyType.MANUAL
        proxy.http_proxy = MITMPROXY_ADDRESS
        proxy.ssl_proxy = MITMPROXY_ADDRESS
        chrome_options.proxy = proxy
        chrome_options.add_argument(f"--proxy-server=http://{MITMPROXY_ADDRESS}")
        logger.info("MITMPROXY: ON, Chrome uses proxy %s", MITMPROXY_ADDRESS)
    else:
        logger.info("MITMPROXY: OFF, Chrome uses direct connection")
    if not isinstance(normalized_languages, list) or not normalized_languages:
        raise ValueError("init_driver: normalized_languages must be a non-empty list")
    chrome_accept_languages = ",".join(str(lang) for lang in normalized_languages if str(lang).strip())
    if not chrome_accept_languages:
        raise ValueError("init_driver: chrome_accept_languages is empty")
    chrome_options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
    chrome_options.add_argument(f"--user-agent={user_agent}")
    chrome_options.add_argument(f"--lang={language}")
    chrome_options.add_experimental_option("prefs", {
        "intl.accept_languages": chrome_accept_languages,
    })
    logger.info("Chrome language preferences submitted: %s", chrome_accept_languages)
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    # AudioServiceOutOfProcess keeps Chromium audio service inside the browser process
    # Chrome enables CanvasNoise by default in Incognito/testing flows.
    chrome_options.add_argument("--disable-features=CanvasNoise,AudioServiceOutOfProcess")
    # ReduceDeviceMemory makes Chrome return value for 8 gb RAM natively, without a JS accessor patch.
    chrome_options.add_argument("--enable-features=ReduceDeviceMemory")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--no-sandbox")
    chrome_debug_port_raw = os.getenv("CHROME_DEBUG_PORT", "9222").strip()
    if chrome_debug_port_raw.lower() in {"0", "auto"}:
        raise ValueError("CHROME_DEBUG_PORT must be fixed")
    try:
        chrome_debug_port = int(chrome_debug_port_raw)
    except ValueError as exc:
        raise ValueError("CHROME_DEBUG_PORT must be an integer") from exc

    chromedriver_port_raw = os.getenv("CHROMEDRIVER_PORT", "9515").strip()
    if chromedriver_port_raw.lower() in {"0", "auto"}:
        raise ValueError("CHROMEDRIVER_PORT must be fixed")
    try:
        chromedriver_port = int(chromedriver_port_raw)
    except ValueError as exc:
        raise ValueError("CHROMEDRIVER_PORT must be an integer") from exc

    if chrome_debug_port == chromedriver_port:
        raise ValueError(
            f"Port collision: CHROME_DEBUG_PORT={chrome_debug_port} "
            f"must differ from CHROMEDRIVER_PORT={chromedriver_port}"
        )

    vscode_cdp_debug = os.getenv("VSCODE_CDP_DEBUG", "").strip() == "1"
    if vscode_cdp_debug:
        logger.info(
            "Fixed ports enabled: chrome_devtools=%s chromedriver=%s",
            chrome_debug_port,
            chromedriver_port,
        )

    chrome_options.debugger_address = f"127.0.0.1:{chrome_debug_port}"
    chrome_options.add_argument(f"--remote-debugging-port={chrome_debug_port}")
    chrome_options.add_argument("--remote-debugging-address=127.0.0.1")
    chrome_options.add_argument("--remote-allow-origins=*")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # chrome_options.add_argument("--disable-features=AsyncDNS")
    chrome_options.binary_location = CHROME_BINARY
    original_chromium_service = selenium_chromium_service.ChromiumService

    class FixedPortChromiumService(ChromiumService):
        def __init__(self, executable_path=None, port=0, *args, **kwargs):
            effective_port = chromedriver_port if not port else port
            super().__init__(executable_path=executable_path, port=effective_port, *args, **kwargs)

    selenium_chromium_service.ChromiumService = FixedPortChromiumService
    try:
        driver = uc.Chrome(
            driver_executable_path=CHROMEDRIVER_PATH,
            options=chrome_options,
        )
    finally:
        selenium_chromium_service.ChromiumService = original_chromium_service
    logger.info("Initiating Webdriver...")


    def _get_cdp_port(driver, user_data_dir):
        # 1) debuggerAddress от chromedriver
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

        # 3) fallback: твой желаемый порт
        return chrome_debug_port
    
    cdp.PORT = _get_cdp_port(driver, USER_DATA_DIR)
    if vscode_cdp_debug and cdp.PORT != chrome_debug_port:
        raise RuntimeError(f"CDP port mismatch: requested {chrome_debug_port}, got {cdp.PORT}")
    if vscode_cdp_debug:
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
            emulation_metrics = {key: device_metrics[key] for key in (
                "width", "height", "deviceScaleFactor", "mobile", "screenWidth", "screenHeight", "screenOrientation"
            ) if key in device_metrics}
            driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", emulation_metrics)
            apply_window_bounds_override(driver, device_metrics, "bootstrap")
    
    def _apply_target_engine_setup(stage):
        logger.info("[windowPolicy.%s] applying target engine setup", stage)
        device_metrics = build_bootstrap_device_metrics()
        apply_hardware_override(
            driver,
            hardware_concurrency_value=hardware_concurrency_value,
        )
        setup_engine(
            driver,
            timezone="Arctic/Longyearbyen",
            latitude=90.0,
            longitude=135.0,
            accuracy=100,
            blocked_urls=["stun:*", "turn:*"] ,
            device_metrics=device_metrics if stage == "primary" else None,
        )
        if stage != "primary":
            emulation_metrics = {key: device_metrics[key] for key in (
                "width", "height", "deviceScaleFactor", "mobile", "screenWidth", "screenHeight", "screenOrientation"
            ) if key in device_metrics}
            driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", emulation_metrics)
            logger.info("[windowBounds.%s] Browser window bounds preserved during target enrollment", stage)

    _apply_target_engine_setup("primary")

    permissions_profile = devices_conf if isinstance(devices_conf, dict) else {}
    for item in permissions_profile.get("cdp", []):
        permission_name = item.get("permission") if isinstance(item, dict) else None
        setting = item.get("setting") if isinstance(item, dict) else None
        if setting == "granted":
            raise ValueError(f"unsafe permissions profile item: {item!r}")
        if not permission_name or setting not in {"prompt", "denied"}:
            raise ValueError(f"invalid permissions profile item: {item!r}")
        driver.execute_cdp_cmd("Browser.setPermission", {
            "permission": {"name": permission_name},
            "setting": setting,
        })
        logger.info("[permissions.profile] Browser.setPermission %s=%s", permission_name, setting)

    # --- Initial fonts patch ---
    rand_met_module.generate_font_manifest(MANIFEST_PATH, dom_platform)
    
    # --- SE CDP-injection ---
    # ServiceWorker uses its own early bootstrap snapshot, separate from later worker env sync.
    sw_bootstrap_webgl = {
        "vendor": profile["webgl_vendor"],
        "renderer": profile["webgl_renderer"],
        "unmaskedVendor": profile["webgl_unmasked_vendor"],
        "unmaskedRenderer": profile["webgl_unmasked_renderer"],
    }

    cdp.enable_sw_bootstrap_env(
        language=language,
        normalized_languages=normalized_languages,
        hardware_concurrency=hardware_concurrency_value,
        device_memory=device_memory_value,
        meta=expected_client_hints,
        webgl=sw_bootstrap_webgl,
        user_agent=user_agent,
        navigator_platform=dom_platform,
    )
    cdp.enable_seed_inject(global_seed)
    sw_thread = threading.Thread(target=cdp.run, daemon=True, name="cdp_sw_bootstrap")
    sw_thread.start()
    logger.info("Thread started name=%s ident=%s on port %s", sw_thread.name, sw_thread.ident, cdp.PORT)
    cdp.log_cdp_runtime_diag("main_after_sw_thread_start")

    cdp_worker_env.enable_worker_env_inject(
        language=language,
        normalized_languages=normalized_languages,
        hardware_concurrency=hardware_concurrency_value,
        user_agent=user_agent,
        navigator_platform=dom_platform,
    )
    worker_env_thread = threading.Thread(
        target=cdp_worker_env.run,
        daemon=True,
        name="cdp_worker_env_injector",
    )
    worker_env_thread.start()
    logger.info(
        "Worker env injector thread started name=%s ident=%s on port %s",
        worker_env_thread.name,
        worker_env_thread.ident,
        cdp.PORT,
    )


    # --- Assembling main bundle (DOM/Canvas/WebGL etc) ---
    def build_page_bundle(init_params: str) -> str:
        worker_patch_src = Path(SCRIPTS_WORKERSCOPE / "WORKER_PATCH_SRC.js").read_text("utf-8")
        worker_reflect_src = Path(SCRIPTS_WORKERSCOPE / "set_reflect.js").read_text("utf-8")
        worker_core_window_src = Path(SCRIPTS_CORE / "core_window.js").read_text("utf-8")
        worker_prng_src = "\n".join([
            cdp._build__seed_value(global_seed),
            Path(SCRIPTS_CORE / "prng_seed.js").read_text("utf-8"),
        ])
        worker_canvas_src = Path(SCRIPTS_PATCHES_GRAPHICS / "canvas.js").read_text("utf-8")
        worker_context_src = Path(SCRIPTS_CORE / "context.js").read_text("utf-8")
        parts = [
            init_params,
            # --- closure bootstrap ---
            Path(SCRIPTS_CORE / "bootstrap_hide.js").read_text("utf-8"),
            "BootstrapHideModule(window);",
            # --- logger after bootstrap owner-space ---
            Path(SCRIPTS_CORE / "set_log.js").read_text("utf-8"),
            "LOGGingModule(window);",
            # Path(SCRIPTS_CORE / "probe.js").read_text("utf-8"),// --- probe for debugging, not used in production ---
            Path(SCRIPTS_CORE / "core_window.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_STEALTH / "hide_webdriver.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_MEDIA / "RTCPeerConnection.js").read_text("utf-8"),
            Path(SCRIPTS_CORE / "prng_seed.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_NAV / "nav_total_set.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_GRAPHICS / "screen.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_MEDIA / "font_module.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_GRAPHICS / "canvas.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_GRAPHICS / "WEBGL_DICKts.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_GRAPHICS / "webgl.js").read_text("utf-8"),
            Path(SCRIPTS_WORKERSCOPE / "wrk.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_GRAPHICS / "WebgpuWL.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_GRAPHICS / "webgpu.js").read_text("utf-8"),
            Path(SCRIPTS_PATCHES_MEDIA / "audiocontext.js").read_text("utf-8"),
            Path(SCRIPTS_CORE / "context.js").read_text("utf-8"),
            # --- execute phase ---
            f"""
            CoreWindowModule(window);
            """,
            f"""
            (function initWorkerscopeRuntime(win) {{
                const C = (win && win.FernwehContext && typeof win.FernwehContext === 'object')
                    ? win.FernwehContext
                    : null;
                if (!C) throw new Error('WorkerscopeInit: FernwehContext missing');
                function defineHidden(obj, key, value) {{
                    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return value;
                    const desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc && desc.configurable === false) {{
                        return Object.prototype.hasOwnProperty.call(desc, 'value') ? desc.value : value;
                    }}
                    Object.defineProperty(obj, key, {{
                        value: value,
                        writable: true,
                        configurable: true,
                        enumerable: false
                    }});
                    return value;
                }}
                const wrkState = (C.state && typeof C.state === 'object' && C.state.__WRK__ && typeof C.state.__WRK__ === 'object')
                    ? C.state.__WRK__
                    : null;
                const wrkRuntime = (wrkState && wrkState.runtime && typeof wrkState.runtime === 'object')
                    ? wrkState.runtime
                    : null;
                if (!wrkRuntime) throw new Error('WorkerscopeInit: FernwehContext.state.__WRK__.runtime missing');
                defineHidden(wrkRuntime, 'inlinePatch', {json.dumps(worker_patch_src)});
                defineHidden(wrkRuntime, 'inlineReflect', {json.dumps(worker_reflect_src)});
                defineHidden(wrkRuntime, 'inlineCoreWindow', {json.dumps(worker_core_window_src)});
                defineHidden(wrkRuntime, 'inlinePrng', {json.dumps(worker_prng_src)});
                defineHidden(wrkRuntime, 'inlineCanvasPatch', {json.dumps(worker_canvas_src)});
                defineHidden(wrkRuntime, 'inlineFernwehContext', {json.dumps(worker_context_src)});
            }})(window);
            """,
            Path(PATCH_OUT).read_text("utf-8"),
            f"""
            HideWebdriverPatchModule(window);
            RtcpeerconnectionPatchModule(window);
            RNGsetModule(window);
            NavTotalSetPatchModule(window);
            ScreenPatchModule(window);
            FontPatchModule(window);
            CanvasPatchModule(window);
            WEBglDICKts(window);
            WebglPatchModule(window);
            WrkModule(window);
            WebgpuWLBootstrap(window);
            WebGPUPatchModule(window);
            AudioContextModule(window);
            ContextPatchModule(window);
            if (window.FernwehContext && typeof window.FernwehContext.registerAllHooks === 'function') {{
                window.FernwehContext.registerAllHooks();
            }}
            (function applyAllPatchesCustomOrder(win) {{
                const C = window.FernwehContext; if (!C) return;
                if (C.applyCanvasElementPatches) C.applyCanvasElementPatches();
                if (C.applyOffscreenPatches)     C.applyOffscreenPatches();
                if (C.applyWebGLContextPatches)  C.applyWebGLContextPatches();
            }})(window);
            (function runBootstrapEnvCleanup(win) {{
                const C = (win && win.FernwehContext && typeof win.FernwehContext === 'object')
                    ? win.FernwehContext
                    : null;
                if (!C || typeof C.__runBootstrapEnvCleanup__ !== 'function') return;
                C.__runBootstrapEnvCleanup__(win, 'bundle_finalize');
            }})(window);
            """,
            # --- self-executing sources after dependencies ---
            Path(SCRIPTS_WORKERSCOPE / "worker_bootstrap.js").read_text("utf-8"),
        ]
        return "\n;\n".join(parts)
    
    # --- creation of window.__ objects ---
    init_params = f"""
    // ——— Globals Bootstrap ———
    Object.defineProperties(window, {{
        __GLOBAL_SEED: {{
            value: {json.dumps(global_seed)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __EXPECTED_CLIENT_HINTS: {{
            value: {json.dumps(expected_client_hints, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __NAV_PLATFORM__: {{
            value: {json.dumps(dom_platform, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __UA_PLATFORM__: {{
            value: {json.dumps(ua_platform, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __UA_PLATFORM_VERSION: {{
            value: {json.dumps(ua_platform_version, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __USER_AGENT: {{
            value: {json.dumps(user_agent, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __VENDOR: {{
            value: {json.dumps(vendor_value, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __LATITUDE__: {{
            value: {json.dumps(latitude)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __LONGITUDE__: {{
            value: {json.dumps(longitude)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __TIMEZONE__: {{
            value: {json.dumps(timezone)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __OFFSET_MINUTES__: {{
            value: {json.dumps(offset_minutes)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __WIDTH: {{
            value: {json.dumps(screen_width)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __HEIGHT: {{
            value: {json.dumps(screen_height)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __COLOR_DEPTH: {{
            value: 24,
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __DPR: {{
            value: {json.dumps(device_dpr_value)},
            writable: true,
            configurable: true,
            enumerable: false
       }},
        __primaryLanguage: {{
            value: {json.dumps(profile['language'], ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __normalizedLanguages: {{
            value: {json.dumps(profile['languages'], ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __cpu: {{
            value: {json.dumps(hardware_concurrency_value)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __memory: {{
            value: {json.dumps(device_memory_value)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __WEBGL_RENDERER__: {{
            value: {json.dumps(webgl_renderer, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __WEBGL_VENDOR__: {{
            value: {json.dumps(webgl_vendor, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __WEBGL_UNMASKED_VENDOR__: {{
            value: {json.dumps(webgl_unmasked_vendor, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __WEBGL_UNMASKED_RENDERER__: {{
            value: {json.dumps(webgl_unmasked_renderer, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __GPU_TYPE__: {{
            value: {json.dumps(gpu_type, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __GPU_ARCHITECTURE__: {{
            value: {json.dumps(gpu_architecture, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __GPU_VENDOR__: {{
            value: {json.dumps(gpu_vendor, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __DEVICES_LABELS: {{
            value: {json.dumps(devices_conf, ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
        __PLUGIN_PROFILES__: {{
            value: {json.dumps(profile.get("plugins", []), ensure_ascii=False)},
            writable: true,
            configurable: true,
            enumerable: false
        }},
    }});
    """
    page_js = build_page_bundle(init_params) + "\n//# sourceURL=page_bundle.js"
    browser_brand, _, _ = determine_browser_brand_and_versions(user_agent, profile)
    apply_ua_overrides(driver, profile, expected_client_hints, browser_brand, dom_platform)
    device_memory_value = read_page_device_memory(driver, device_memory_value=device_memory_value)
    profile["deviceMemory"] = expected_client_hints["deviceMemory"] = device_memory_value

    runtime_header_sets = headers_adapter_module.build_runtime_header_sets(
        profile,
        expected_client_hints=expected_client_hints,
        user_agent=user_agent,
        browser_brand=browser_brand,
    )
    cdp_outbound_headers = runtime_header_sets["cdp_outbound_headers"]
    safelisted_headers = runtime_header_sets["js_safelisted_headers"]
    headers_window_js = f"""
    (function() {{
      const C = (window.FernwehContext && typeof window.FernwehContext === 'object') ? window.FernwehContext : null;
      if (!C) throw new Error('HeadersStage: FernwehContext missing');
      const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
      if (!stateRoot) throw new Error('HeadersStage: FernwehContext.state missing');
      const defHidden = function(owner, key, value) {{
        Object.defineProperty(owner, key, {{ value, writable: true, configurable: true, enumerable: false }});
        return owner[key];
      }};
      const headersRoot = (stateRoot.__HEADERS__ && typeof stateRoot.__HEADERS__ === 'object')
        ? stateRoot.__HEADERS__
        : defHidden(stateRoot, '__HEADERS__', Object.create(null));
      if (!headersRoot || typeof headersRoot !== 'object') throw new Error('HeadersStage: FernwehContext.state.__HEADERS__ missing');
      const headersState = (headersRoot.__STATE__ && typeof headersRoot.__STATE__ === 'object')
        ? headersRoot.__STATE__
        : defHidden(headersRoot, '__STATE__', Object.create(null));
      if (!headersState || typeof headersState !== 'object') throw new Error('HeadersStage: FernwehContext.state.__HEADERS__.__STATE__ missing');
      const headersDesc = Object.getOwnPropertyDescriptor(headersState, 'headers');
      if (headersDesc && headersDesc.configurable !== true) throw new Error('HeadersStage: FernwehContext.state.__HEADERS__.__STATE__.headers non-configurable');
      defHidden(headersState, 'headers', {json.dumps(safelisted_headers, ensure_ascii=False)});
      if (!Array.isArray(headersState.allowSuffixes)) defHidden(headersState, 'allowSuffixes', []);
      if (!Array.isArray(headersState.ignoreSuffixes)) defHidden(headersState, 'ignoreSuffixes', []);
      if (typeof headersState.bridgeReady !== 'boolean') defHidden(headersState, 'bridgeReady', false);
    }})();

    {Path(SCRIPTS_PATCHES_STEALTH / "headers_interceptor.js").read_text("utf-8")}
    HeadersInterceptor(window);

    //# sourceURL=headers_stage.js
    """
    headers_bridge_js = (SCRIPTS_PATCHES_STEALTH / "headers_bridge.js").read_text("utf-8")
    fetch_rules = []

    def _apply_target_new_document_setup(stage):
        if not isinstance(stage, str) or not stage.strip():
            raise ValueError("target new-document setup stage must be a non-empty string")
        stable_device_memory = profile.get("deviceMemory", device_memory_value)
        if not isinstance(stable_device_memory, (int, float)) or stable_device_memory <= 0:
            raise RuntimeError(f"target setup deviceMemory state invalid: {stable_device_memory!r}")
        expected_client_hints["deviceMemory"] = stable_device_memory
        logger.info("[windowPolicy.%s] applying target new-document setup", stage)
        if stage != "primary":
            apply_ua_overrides(driver, profile, expected_client_hints, browser_brand, dom_platform)
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": page_js})
        driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", {"headers": cdp_outbound_headers})
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": headers_window_js})
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": headers_bridge_js})
        _install_fetch_interceptor(
            driver,
            fetch_rules,
            extra_headers_fn=lambda url, method, rtype: safelisted_headers,
            blocked_headers=[],
        )
        logger.info("[windowPolicy.%s] target new-document setup applied", stage)

    def _apply_target_scoped_setup(stage):
        if not isinstance(stage, str) or not stage.strip():
            raise ValueError("target scoped setup stage must be a non-empty string")
        _apply_target_engine_setup(stage)
        _apply_target_new_document_setup(stage)

    _apply_target_new_document_setup("primary")

    def _registered_bootstrap_target_setup(target_driver):
        if target_driver is not driver:
            raise RuntimeError("registered target setup received unexpected driver")
        _apply_target_scoped_setup("window_enrollment")

    _register_target_setup_step(
        driver,
        "bootstrap_target_scoped_setup",
        _registered_bootstrap_target_setup,
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
        domain = country_data["domain"]
        language = primary_language
        normalized_languages = normalized_languages
        apply_profile_target_overrides(driver, language, country_data, profile, "final")
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
                logger.error(f"Error setting Google cookies {cookie['name']}: {e}", exc_info=True)
                raise
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
                logger.error(f"Error setting Youtube cookies {cookie['name']}: {e}", exc_info=True)
                raise
        logger.info(f"Regional alignment done: {country_data}")
    except Exception as e:
        logger.error(f"configure_profile error: {e}", exc_info=True)
        raise

# ----------------------- Thr main function -----------------------
def main():
    global global_seed, profile
    global_seed = uuid.uuid4().hex
    seed_int = _build_rng_pools(global_seed)
    logger.info(f"Seed for the current session has been generated: {global_seed}")

    vpn_rng = seed_int["vpn"]
    vpn_utils_module.random = vpn_rng
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
       
        # -------- Getting PRNG random for each module -------------------
        profile_rng = seed_int["profile"]
        plugins_rng = seed_int["plugins"]
        permissions_rng = seed_int["permissions"]
        headers_rng = seed_int["headers"]
        helpers_module.random = profile_rng
        plugins_dict_module.random = plugins_rng
        permissions_dict_module.random = permissions_rng
        rand_met_module.RAND_MET_DERIVATIVE = _derive_rand_met_seed_material(global_seed, "rand_met")
        
        if hasattr(headers_adapter_module, "_pick_nav_template"):
            headers_adapter_module._pick_nav_template.cache_clear()
        headers_adapter_module.random = headers_rng
        
        # -------- Your PLATFORM and BROWSER preferences for random selection -------------------
        profile = get_random_profile(country_data, None)
        
        config = {
            # Supported platforms List
            "enabled_platforms": ["Win32", "MacIntel"],
            # Setting probabilities (weight) of platform selection when generating a profile
            "platform_weights": [1, 0],
            # Probabilities of browser selection for each platform:
            "browser_weights": {
                "Win32": (["chrome", "firefox", "edge"], [0.8, 0, 0.2]),
                "MacIntel": (["chrome", "firefox", "safari"], [0.8, 0, 0.2]),
            },
        }
        # --------PLATFORM selection -------------------
        platform = profile_rng.choices(config["enabled_platforms"],
                                       weights=config["platform_weights"], k=1)[0]
        data = data_4_win32 if platform == "Win32" else macintel_data
        # -------- OS selection -------------------
        os_opt = profile_rng.choice(data["os_options"]) # dict: {os_info, os_name, os_version}
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
        browser_choice = profile_rng.choices(
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
                return profile_rng.choice([v.split(".")[0] for v in chrome_versions])
            return profile_rng.choice(prefixes).rstrip(".")  # "134" / "135" / "137"

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
            return profile_rng.choice(filt)

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
                    version = profile_rng.choice(chrome_versions)
                    version, version_ua = split_version(version)
                    os_info_chrome = os_info  # formatted for typing like "Macintosh; Intel Mac OS X 10_15_7"
                    user_agent = (
                        f"Mozilla/5.0 ({os_info_chrome}) AppleWebKit/537.36 "
                        f"(KHTML, like Gecko) Chrome/{version_ua} Safari/537.36"
                    )
        elif browser_choice == "firefox":
            version = profile_rng.choice(firefox_versions)
            user_agent = f"Mozilla/5.0 ({os_info}; rv:{version}) Gecko/20100101 Firefox/{version}"
        elif browser_choice == "safari":
            version = profile_rng.choice(safari_versions)
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
        # -----------------------  navigator.plugins source profile (mimeTypes are derived in JS) -----------------------
        plugins_final = build_plugins_profile(browser_choice, rng=plugins_rng, strict=False)

        # ----------------------- permissions.query / Browser.setPermission source profile -----------------------
        devices_conf = permissions_dict_module.build_permissions_profile(browser_choice, rng=permissions_rng, strict=True)

        # ----------------------------Setting up GPU and Screen -----------------------
        gpu = profile_rng.choice(data["GPU"])
        gpu_architecture = str(gpu.get("architecture", "")).strip()
        gpu_type = str(gpu.get("type", ""))
        gpu_name = gpu["name"]
        gpu_code = gpu["prod_code"]

        screen_res = profile_rng.choice(gpu["resolution"])
        if not isinstance(screen_res, str) or not re.fullmatch(r"[1-9]\d{2,4}x[1-9]\d{2,4}", screen_res):
            raise ValueError(f"invalid screen resolution from GPU dictionary: {screen_res!r}")
        screen_width, screen_height = map(int, screen_res.split("x", 1))

        # ----------------------- devicespixelratio AKA deviceScaleFactor(CDP)  -----------------------
        dpr_variants = {
            "1920x1080": (1.0, 1.25),
            "2560x1440": (1.0,),
        }
        dpr_choices = dpr_variants.get(screen_res)
        if not dpr_choices:
            raise ValueError(f"unknown screen resolution preset: {screen_res!r}")
        device_dpr_value = float(profile_rng.choice(dpr_choices))
        if not isinstance(device_dpr_value, float) or device_dpr_value <= 0:
            raise ValueError(f"invalid DPR in screen preset for resolution={screen_res!r}: {device_dpr_value!r}")
        if screen_width <= 0 or screen_height <= 0:
            raise ValueError(
                f"invalid CSS screen dimensions derived from resolution={screen_res!r}, "
                f"dpr={device_dpr_value!r}: {screen_width}x{screen_height}"
            )

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
        }

        dom_platform = profile.get("platform")
        if dom_platform == "Win32":
            ua_platform = "Windows"
        elif dom_platform == "MacIntel":
            ua_platform = "macOS"
        else:
            raise ValueError(f"unsupported DOM platform {dom_platform!r}")

        ua_platform_version = profile["platform_version"]
        browser_brand, major_version, browser_version = determine_browser_brand_and_versions(user_agent, profile)
        profile["browser_brand"] = browser_brand
        profile["browser_major_version"] = major_version
        expected_client_hints = build_expected_client_hints(
            profile, ua_platform, browser_brand, major_version, browser_version
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
        logger.info("new profile.json created for runtime")

        mitmproxy_proc = None

        # # --- mitmproxy start ---
        if MITMPROXY_ENABLED:
            mitmproxy_proc = subprocess.Popen(
                ["mitmdump", "--mode", f"regular@{MITMPROXY_PORT}", "-s", str(CORS_ADDON), "-v"],
                cwd=str(PROJECT_ROOT)
            )
            logger.info("MITMPROXY: mitmdump started")
        else:
            logger.info("MITMPROXY: mitmdump skipped")

        def wait_for_port(host, port, timeout=10):
            start = time.time()
            while time.time() - start < timeout:
                try:
                    with socket.create_connection((host, port), timeout=1):
                        return True
                except OSError:
                    time.sleep(0.5)
            return False

        if MITMPROXY_ENABLED and not wait_for_port(MITMPROXY_HOST, MITMPROXY_PORT):
            raise RuntimeError("mitmproxy not launched")
       
        driver = init_driver(
            profile, country_data, dom_platform, profile["user_agent"],
            profile["screen_width"], profile["screen_height"], profile["webgl_vendor"], profile["webgl_renderer"],
            profile["webgl_unmasked_vendor"], profile["webgl_unmasked_renderer"],
            profile["devices_conf"], ua_platform, ua_platform_version,
            expected_client_hints, profile["vendor_value"], profile["language"], profile["languages"],
            profile["deviceMemory"], profile["hardwareConcurrency"], profile["device_dpr_value"],
            profile["plugins"], profile["gpu_vendor"], profile["gpu_architecture"], profile["gpu_type"],
            global_seed,
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
            _register_target_setup_step(
                driver,
                "safari_override_ua_data",
                lambda target_driver, source=override_js: target_driver.execute_cdp_cmd(
                    "Page.addScriptToEvaluateOnNewDocument",
                    {"source": source},
                ),
            )
            if inject_uach_strip_window(driver, user_agent):
                _register_target_setup_step(
                    driver,
                    "uach_strip_window",
                    lambda target_driver, ua=user_agent: inject_uach_strip_window(target_driver, ua),
                )
        
        elif browser_brand == "Firefox":
            logger.info("UA data submitted via CDP for Firefox/Safari")
        else:

            pass
        # ----------------------- Call local setting def  -----------------------
        configure_profile(driver, profile["language"], profile["languages"], country_data)
        _register_target_setup_step(
            driver,
            "profile_target_scoped_setup",
            lambda target_driver: apply_profile_target_overrides(
                target_driver, profile["language"], country_data, profile, "window_enrollment"
            ),
        )

        # ----------------------- SESSION WINDOW POLICY -------------------------------------------
        session_window_policy = BrowserSessionPolicy(driver)

        # ----------------------- YOUR DESTINATION POINT, PLEASE MIND THE GAP -----------------------
        session_window_policy.navigate("https://browserleaks.com/ip")

        # Keep main thread alive; otherwise daemon CDP threads die on process exit.
        def _hold_until_driver_end():
            logger.warning("stdin is unavailable; keepalive mode is active (Ctrl+C to exit)")
            while True:
                try:
                    session_window_policy.tick()
                except WebDriverException:
                    logger.info("Driver session ended; keepalive loop finished")
                    break
                time.sleep(0.1)

        time.sleep(0.5)
        try:
            if sys.stdin is not None and sys.stdin.isatty():
                logger.warning("interactive stdin detected; session policy loop is active (Ctrl+C to exit)")
                _hold_until_driver_end()
            else:
                _hold_until_driver_end()
        except EOFError:
            _hold_until_driver_end()
        except KeyboardInterrupt:
            logger.info("Interrupted by user (Ctrl+C)")

    except Exception as e:
        logger.error(f"Error in main block: {e}", exc_info=True)
        logger.info(f"Error: {e}")
        raise

    # ----------------------- THAT'S ALL, FOLKS!  -----------------------
    finally:
        # Wait for mitmproxy to complete, then close the file
        if 'mitmproxy_proc' in locals() and mitmproxy_proc is not None:
            mitmproxy_proc.terminate()
            mitmproxy_proc.wait()
if __name__ == "__main__":
    main()
