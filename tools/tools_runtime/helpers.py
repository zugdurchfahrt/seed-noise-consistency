from __future__ import annotations
from typing import Iterable, Tuple, List
import random

from headers_adapter import generate_accept_header
from tools.tools_infra.overseer import logger
logger = logger.getChild("helpers_runtime")

def build_device_metrics(profile: dict) -> dict:
    """
    Preparing metrics for Emulation.setDeviceMetricsOverride.
    """
    w   = int(profile["screen_width"])
    h   = int(profile["screen_height"])
    dpr = float(profile.get("device_dpr_value", 1))

    # OS/CDP (camelCase)
    otype = "portraitPrimary" if h >= w else "landscapePrimary"

    return {
        "width": w,
        "height": h,
        "windowBoundsWidth": w,
        "windowBoundsHeight": h,
        "deviceScaleFactor": dpr,
        "mobile": False,
        "screenWidth": w,
        "screenHeight": h,
        "screenOrientation": {"type": otype, "angle": 0},
    }


def _canonical_bcp47(tag: str) -> str:
    """Leads a linguistic tag to the canonical appearance BCP47 by register.
    As browsers return `es-ES`, not `es-es`.
    """
    if not tag:
        return ""
    parts = tag.replace("_", "-").split("-")
    if not parts or not parts[0]:
        return ""
    lang = parts[0].lower()
    rest: List[str] = []
    i = 1
    # script
    if i < len(parts) and len(parts[i]) == 4 and parts[i].isalpha():
        rest.append(parts[i].title())
        i += 1
    # region
    if i < len(parts):
        p = parts[i]
        if (len(p) == 2 and p.isalpha()) or (len(p) == 3 and p.isdigit()):
            rest.append(p.upper())
            i += 1
    # variants/extensions (in the lower register)
    while i < len(parts):
        rest.append(parts[i].lower())
        i += 1
    return "-".join([lang, *rest])


def normalize_languages(base_languages: Iterable[str]) -> Tuple[str, List[str]]:
    """Normalizes primary language and list `navigator.languages`.

    Rules:
    - The first entry element is the primary language (we leave it as is in terms of meaning).
    - We add the rest of the entries in the order they appear, canonizing the register.
    - For a regional primary language, add its language-only fallback after it
      (`de-DE -> ["de-DE", "de"]`) so Chromium can build native HTTP weights
      from a q-free preference list.
    - Accept-Language is derived separately from the canonical profile list and may
      be tuned independently for browser-specific network behavior.
    Returns: `(language, languages)`.
    """
    items = [t for t in (base_languages or []) if t]
    if not items:
        logger.warning("[LANG] Empty or invalid base_languages: %r", base_languages)
        return "en-GB", ["en-GB", "en"] # en-GB set here on a purpuse to check the language distinction success, you can change it to "en-US" or whatever

    # We canonize all input
    canon = [_canonical_bcp47(x) for x in items]
    canon = [x for x in canon if x]  # We discard empty after canonization
    if not canon:
        logger.warning("[LANG] Canonicalized base_languages are empty: %r", base_languages)
        return "en-GB", ["en-GB", "en"]

    language = canon[0]
    result: List[str] = []
    seen = set()

    def _add(x: str) -> None:
        if x and x not in seen:
            result.append(x)
            seen.add(x)

    # 1) primary
    _add(language)
    primary_base = language.split("-", 1)[0].lower() if "-" in language else None
    if primary_base:
        _add(primary_base)

    # 2) rest
    for tag in canon[1:]:
        if not tag:
            continue
        _add(tag)
        base = tag.split("-", 1)[0].lower() if "-" in tag else None
        if base:
            _add(base)
    
    logger.info("[LANG] Languages after normalisation: %s", result)
    return language, result
    

def choose_device_memory_and_cpu(platform, mem_win, cpu_win, mem_mac, cpu_mac):
    """
    Pick profile deviceMemory and hardwareConcurrency from weighted pools.

    A platform string containing "mac" selects the macOS pools; every other
    platform selects the Windows pools. Each pool contains (value, weight)
    pairs and is consumed through the module RNG, which main.py replaces with
    the profile-specific deterministic RNG.

    Returns (device_memory, hardware_concurrency). If floating-point boundary
    behavior leaves no selected item, the first value from the corresponding
    pool is used as the local fallback.
    """
    mem_opts, cpu_opts = (mem_mac, cpu_mac) if "mac" in platform.lower() else (mem_win, cpu_win)
    total_mem = sum(weight for _, weight in mem_opts)
    r_mem = random.uniform(0, total_mem)
    upto = 0
    for value, weight in mem_opts:
        if upto + weight >= r_mem:
            device_memory = value
            break
        upto += weight
    else:
        device_memory = mem_opts[0][0]
    total_cpu = sum(weight for _, weight in cpu_opts)
    r_cpu = random.uniform(0, total_cpu)
    upto = 0
    for value, weight in cpu_opts:
        if upto + weight >= r_cpu:
            hardware_concurrency = value
            break
        upto += weight
    else:
        hardware_concurrency = cpu_opts[0][0]
    return device_memory, hardware_concurrency

# === browser_brand и brouser version definition ===
def determine_browser_brand_and_versions(user_agent, profile):
    """
    Resolve browser brand and version tuple from UA string plus profile.

    Brand is inferred from the UA tokens: Chrome, Edge, Firefox, Safari, or
    Unknown. The major and full versions are both taken from
    profile["browser_version"], not parsed out of the UA string, so UA and
    UA-CH version material stay tied to the profile source of truth.

    Returns (browser_brand, major_version, browser_version).
    """
    if "chrome" in user_agent.lower() and "edg/" not in user_agent.lower():
        browser_brand = "Google Chrome"
    elif "edg/" in user_agent.lower():
        browser_brand = "Microsoft Edge"
    elif "firefox" in user_agent.lower():
        browser_brand = "Firefox"
    elif "safari" in user_agent.lower() and "chrome" not in user_agent.lower() and "edg/" not in user_agent.lower():
        browser_brand = "Safari"
    else:
        browser_brand = "Unknown"
    major_version = profile["browser_version"].split(".")[0]
    browser_version = profile["browser_version"]
    return browser_brand, major_version, browser_version

# ===Forming expected_client_hints through a single brands-source ===
def build_expected_client_hints(profile, ua_platform, browser_brand, major_version, browser_version):
    """
    Build the internal expected UA-CH/profile dictionary.

    The result is the single structured source consumed by CDP UA override,
    headers generation and diagnostics. It combines brand lists, full-version
    lists, UA platform fields, device capabilities, language material and the
    browser-specific Accept header.
    """
    brands, full_version_list, sec_ch_ua, sec_ch_ua_full_version_list =  build_brands_and_related(
        browser_brand, major_version, browser_version
    )
    mobile = False
    wow64 = False
    sec_ch_ua_mobile = "?1" if mobile else "?0"
    sec_ch_ua_wow64 = "?1" if wow64 else "?0"
    model = ""
    sec_ch_ua_full_version = browser_version
    form_factors = ["Desktop"]
    sec_ch_ua_form_factors = "[" + ", ".join(f'"{item}"' for item in form_factors) + "]"
    res = {
        "platform": ua_platform,
        "brands": brands,
        "mobile": mobile,
        "architecture": "x86",
        "bitness": "64", 
        "model": model,
        "platformVersion": profile["platform_version"],
        "uaFullVersion": browser_version,
        "fullVersionList": full_version_list,
        "sec_ch_ua": sec_ch_ua,
        "sec_ch_ua_mobile": sec_ch_ua_mobile,
        "sec_ch_ua_full_version": sec_ch_ua_full_version,
        "sec_ch_ua_full_version_list": sec_ch_ua_full_version_list,
        "sec_ch_ua_model": model,
        "sec_ch_ua_form_factors": sec_ch_ua_form_factors,
        "deviceMemory": profile["deviceMemory"],
        "hardwareConcurrency": profile["hardwareConcurrency"],
        "wow64": wow64,
        "sec_ch_ua_wow64": sec_ch_ua_wow64,
        "languages": profile["languages"],
        "language": profile["language"],
        "formFactors": form_factors,
        "accept": generate_accept_header(browser_brand, major_version),
    }


    return res
# =====  Building browser brand/version lists and corresponding header strings=====
def build_brands_and_related(browser_brand, major_version, browser_version):
    """
    Build brand lists and serialized Sec-CH-UA strings from profile versions.

    Firefox/Safari profiles produce a single-brand list. Chromium-family
    profiles produce Not)A;Brand, Chromium, and the concrete browser brand.
    Major versions are used for Sec-CH-UA; full product versions are used for
    Sec-CH-UA-Full-Version-List, except Not)A;Brand, which uses 8.0.0.0.

    Returns (brands, full_version_list, sec_ch_ua, sec_ch_ua_full_version_list).
    """
    # 1) List of brands by engine type
    if browser_brand == "Firefox":
        brands = [{"brand": "Firefox", "version": major_version}]
    elif browser_brand == "Safari":
        brands = [{"brand": "Safari", "version": major_version}]
    else:
        # Chromium-based (Chrome, Edge и пр.)
        third = browser_brand  # "Google Chrome" или "Microsoft Edge" и т.д.
        brands = [
            {"brand": "Not)A;Brand", "version": "8"},
            {"brand": "Chromium",    "version": major_version},
            {"brand": third,         "version": major_version},
        ]
    # 2) Full list of versions — the version is taken from browser_version, except for Not)A;Brand: always “8.0.0.0”
    full_version_list = [
        {
            "brand": b["brand"],
            "version": browser_version if b["brand"] != "Not)A;Brand" else "8.0.0.0"
        }
        for b in brands
    ]

    # 3) line client hints
    sec_ch_ua = format_full_version_list(brands)
    sec_ch_ua_full_version_list = format_full_version_list(full_version_list)
    return brands, full_version_list, sec_ch_ua, sec_ch_ua_full_version_list

# ===== Convert dict list=====
def format_full_version_list(full_version_list):
    """
    Converts a dict list of the form {"brand": ..., "version": ...}
    into a string '"Brand1";v="x.y.z", "Brand2";v="a.b.c", …'
    """
    return ", ".join(
        f'"{item["brand"]}";v="{item["version"]}"'
        for item in full_version_list
    )

# ===== Override the User-Agent and User-Agent Metadata=====
def apply_ua_overrides(driver, profile, expected_client_hints, browser_brand, navigator_platform):
    """
    Submit User-Agent and UA-CH metadata through CDP for Chromium brands.

    navigator_platform must be the DOM platform value used by the profile
    ("Win32" or "MacIntel"). expected_client_hints supplies the structured
    UserAgentMetadata payload. The CDP override is sent only for Google Chrome
    and Microsoft Edge brands; Firefox/Safari UA profiles are handled by the
    UA-CH strip path instead of advertising Chromium UA-CH JS surface.
    """
    if navigator_platform not in ("Win32", "MacIntel"):
        raise ValueError(f"apply_ua_overrides: invalid navigator_platform {navigator_platform!r}")
    # 1)Collecting a metadata dictionary for UserAgentMetadata from current client hints
    metadata = {
        "platform":            expected_client_hints["platform"],
        "brands":              expected_client_hints["brands"],
        "mobile":              expected_client_hints["mobile"],
        "architecture":        expected_client_hints["architecture"],
        "bitness":             expected_client_hints["bitness"],
        "model":               expected_client_hints["model"],
        "platformVersion":     expected_client_hints["platformVersion"],
        "uaFullVersion":       expected_client_hints["uaFullVersion"],
        "fullVersionList":     expected_client_hints["fullVersionList"],
        "deviceMemory":        expected_client_hints["deviceMemory"],
        "hardwareConcurrency": expected_client_hints["hardwareConcurrency"],
        "wow64":               expected_client_hints["wow64"],
        "formFactors":         expected_client_hints["formFactors"], 
    }
    language_tags = profile.get("languages")
    navigator_accept_language_cdp = ",".join(language_tags) if isinstance(language_tags, list) and language_tags else profile.get("language")
    if browser_brand.lower() in ("google chrome", "microsoft edge"):
        driver.execute_cdp_cmd(
            "Network.setUserAgentOverride",
            {
                "userAgent": profile["user_agent"],
                "acceptLanguage": navigator_accept_language_cdp,
                "platform": navigator_platform,
                "userAgentMetadata": metadata
            }
        )
    logger.info("userAgent and userAgentMetadata submitted via CDP")


def _ua_looks_like_firefox(user_agent: str) -> bool:
    ua = str(user_agent or "")
    ual = ua.lower()
    return ("firefox" in ual) and ("chrome" not in ual) and ("edg/" not in ual)


def _ua_looks_like_safari(user_agent: str) -> bool:
    ua = str(user_agent or "")
    ual = ua.lower()
    # Chrome UA contains "safari/..." as a token, so require "chrome" absent.
    return ("safari" in ual) and ("chrome" not in ual) and ("edg/" not in ual)


def should_strip_uach_window(user_agent: str) -> bool:
    # When running Chromium but forcing a Firefox/Safari UA string, UA-CH JS surface becomes a hard mismatch.
    return _ua_looks_like_firefox(user_agent) or _ua_looks_like_safari(user_agent)


def inject_uach_strip_window(driver, user_agent: str) -> bool:
    """
    Install the window UA-CH strip for Firefox/Safari UA profiles on Chromium.

    When the UA string is Firefox-like or Safari-like, the helper registers a
    new-document script and immediately evaluates the same script in the
    current document. The script deletes Navigator.prototype.userAgentData and
    globalThis.NavigatorUAData. Existing non-configurable properties are a hard
    failure because they would leave an inconsistent public JS surface.

    Returns True when the strip was installed/evaluated, False when the UA does
    not need stripping. Workers are intentionally out of scope here.
    """
    if not should_strip_uach_window(user_agent):
        return False

    js = """
    (() => {
        'use strict';
        const proto = (typeof Navigator !== 'undefined' && Navigator && Navigator.prototype) ? Navigator.prototype : null;
        if (!proto) throw new Error('THW: Navigator.prototype missing');

        const d = Object.getOwnPropertyDescriptor(proto, 'userAgentData');
        if (d) {
            if (d.configurable === false) throw new Error('THW: Navigator.prototype.userAgentData non-configurable');
            const ok = delete proto.userAgentData;
            if (!ok) throw new Error('THW: failed to delete Navigator.prototype.userAgentData');
        }

        if ('NavigatorUAData' in globalThis) {
            const d2 = Object.getOwnPropertyDescriptor(globalThis, 'NavigatorUAData');
            if (d2 && d2.configurable === false) throw new Error('THW: globalThis.NavigatorUAData non-configurable');
            const ok2 = delete globalThis.NavigatorUAData;
            if (!ok2) throw new Error('THW: failed to delete globalThis.NavigatorUAData');
        }
    })();
    """

    # Ensure this runs before any page script on every new document.
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": js})

    # Also apply immediately to the current document to catch non-configurable cases (fail-fast).
    res = driver.execute_cdp_cmd("Runtime.evaluate", {"expression": js, "awaitPromise": True, "returnByValue": True})
    if isinstance(res, dict) and res.get("exceptionDetails"):
        raise RuntimeError(f"UACH strip failed: {res.get('exceptionDetails')}")
    return True
