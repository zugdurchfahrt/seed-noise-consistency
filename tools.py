from __future__ import annotations
from typing import Iterable, Tuple, List
import random
import logging

from headers_adapter import generate_accept_header
from overseer import logger
logger = logging.getLogger(__name__)
FALLBACK_EN = "en-GB" 

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
        "deviceScaleFactor": dpr,
        "mobile": False,
        "screenWidth": w,
        "screenHeight": h,
        "screenOrientation": {"type": otype, "angle": 0},
    }

def _canonical_bcp47(tag: str) -> str:
    """Leads a linguistic tag to the canonical appearance BCP47 by register.
    As browsers return `es-ES`, `en-US`, not `es-es`.
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


def _base(lang_tag: str) -> str:
    return (lang_tag or "").split("-", 1)[0]


def normalize_languages(base_languages: Iterable[str]) -> Tuple[str, List[str]]:
    """Normalizes primary language and list `navigator.languages`.

    Rules:
    - The first entry element is the primary language (we leave it as is in terms of meaning).
    - If the primary has a region (for example, `es-ES`) - we add the base (`es`).
    - We add the rest of the entries in the order they appear, canonizing the register.
    - For tags with a region, we also add their base (if it is not the base of the primary).
    - At the end, we ensure the presence of English fallbacks: `en-GB`, then `en`.

    Returns: `(language, languages)`.
    """
    items = [t for t in (base_languages or []) if t]
    if not items:
        logger.warning("[LANG] Empty or invalid base_languages: %r", base_languages)
        return FALLBACK_EN, [FALLBACK_EN, "en"]

    # We canonize all input
    canon = [_canonical_bcp47(x) for x in items]
    canon = [x for x in canon if x]  # We discard empty after canonization

    language = canon[0]
    result: List[str] = []
    seen = set()

    def _add(x: str) -> None:
        if x and x not in seen:
            result.append(x)
            seen.add(x)

    # 1) primary
    _add(language)
    # 1.1) base in primary
    base_primary = _base(language)
    if "-" in language:
        _add(base_primary)

    # 2) rest
    for tag in canon[1:]:
        if not tag:
            continue
        _add(tag)
        b = _base(tag)
        # не дублируем базу первичного и саму базу tag
        if "-" in tag and b != base_primary:
            _add(b)

    # 3) Fallbacks on English
    if "en" not in seen:
        _add(FALLBACK_EN)
        _add("en")
    else:
        # If there is EN (without a region), but there is no regional English.By default - add it
        if FALLBACK_EN not in seen:
            _add(FALLBACK_EN)

    logger.info("[LANG] Languages after normalisation: %s", result)
    return language, result
    


def override_user_agent_data(driver, browser_brand: str) -> None:
    """Soft patch for Safari:
    - Soft patch via Getters:
    - We do not delete anything and do not create again.
    - If the prototype already has Getter for usoragent / usoragentdata -
    - Over detectorate only Getter (configurable: true) to return
    - agreed values ​​from Window .__ User_agent and Window .__ Expected_Client_Hints.
    - If there are no properties (Safari/Firefox for usoragentdata) - we do nothing at all.
    - Completely wrapped in Try/Catch, without syntactic traps for Safari.
    """
    script = (
        "(function(){\n"
        "  try {\n"
        "    const g = window;\n"
        "    const nav = navigator;\n"
        "    const proto = Object.getPrototypeOf(nav) || Navigator?.prototype;\n"
        "    const has = (obj, prop) => !!obj && (prop in obj || Object.getOwnPropertyDescriptor(obj, prop));\n"
        "    const safeRedef = (obj, prop, getter) => {\n"
        "      try {\n"
        "        const d = Object.getOwnPropertyDescriptor(obj, prop);\n"
        "        if (!d || d.configurable !== true || typeof d.get !== 'function') return false;\n"
        "        Object.defineProperty(obj, prop, { get: getter, configurable: true });\n"
        "        return true;\n"
        "      } catch(e) { return false; }\n"
        "    };\n"
        "    // 1) userAgent — синхронизация со значением из __USER_AGENT (если задано)\n"
        "    if (has(proto, 'userAgent') && typeof g.__USER_AGENT === 'string') {\n"
        "      safeRedef(proto, 'userAgent', () => g.__USER_AGENT);\n"
        "    }\n"
        "    // 2) userAgentData — ТОЛЬКО если свойство СУЩЕСТВУЕТ (Chromium). Ничего не создаём.\n"
        "    if (has(proto, 'userAgentData') && g.__EXPECTED_CLIENT_HINTS) {\n"
        "      const H = g.__EXPECTED_CLIENT_HINTS || {};\n"
        "      const fake = {\n"
        "        brands: (H.brands || []).map(x => ({ brand: x.brand, version: String(x.version) })),\n"
        "        mobile: !!H.mobile,\n"
        "        platform: String(H.platform || ''),\n"
        "        getHighEntropyValues: async (keys) => {\n"
        "          const src = {\n"
        "            architecture: H.architecture || '',\n"
        "            bitness: H.bitness || '',\n"
        "            model: H.model || '',\n"
        "            platformVersion: H.platformVersion || '',\n"
        "            uaFullVersion: H.uaFullVersion || '',\n"
        "            fullVersionList: (H.fullVersionList || []).map(x => ({ brand: x.brand, version: String(x.version) })),\n"
        "          };\n"
        "          const out = {};\n"
        "          (keys || []).forEach(k => { if (k in src) out[k] = src[k]; });\n"
        "          return out;\n"
        "        }\n"
        "      };\n"
        "      safeRedef(proto, 'userAgentData', () => fake);\n"
        "    }\n"
        "  } catch(e) {}\n"
        "})();"
    )
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": script})
    logger.info("[UA-soft] JS getter overrides applied for %s (no deletion)", browser_brand)

def choose_device_memory_and_cpu(platform, mem_win, cpu_win, mem_mac, cpu_mac):
    """
    Selects device memory and CPU concurrency values based on platform and weighted options.

    Args:
        platform (str): The platform identifier string (e.g., "Windows", "macOS").
        mem_win (list of tuple): List of (memory_value, weight) tuples for Windows memory options.
        cpu_win (list of tuple): List of (cpu_value, weight) tuples for Windows CPU options.
        mem_mac (list of tuple): List of (memory_value, weight) tuples for macOS memory options.
        cpu_mac (list of tuple): List of (cpu_value, weight) tuples for macOS CPU options.
    Returns:
        tuple: A tuple (device_memory, hardware_concurrency) where:
            - device_memory: Selected memory value based on weighted random choice.
            - hardware_concurrency: Selected CPU concurrency value based on weighted random choice.
    Notes:
        - The function uses weighted random selection to choose memory and CPU values.
        - If "mac" is found in the platform string (case-insensitive), macOS options are used; otherwise, Windows options are used.
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
    Determines the browser brand and extracts the major and full version numbers from the given user agent and profile.
    Args:
        user_agent (str): The user agent string to analyze.
        profile (dict): A dictionary containing browser information, must include the key 'browser_version'.
    Returns:
        tuple: A tuple containing:
            - browser_brand (str): The detected browser brand (e.g., 'Google Chrome', 'Microsoft Edge', 'Firefox', 'Safari', or 'Unknown').
            - major_version (str): The major version number of the browser.
            - browser_version (str): The full browser version string.
    Example:
        determine_browser_brand_and_versions(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        {"browser_version": "91.0.4472.124"}
        )
        ('Google Chrome', '91', '91.0.4472.124')
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
def build_expected_client_hints(profile, generated_platform, browser_brand, major_version, browser_version):
    """
    Builds a dictionary of expected client hints based on the provided profile and browser information.
    Args:
        profile (dict): A dictionary containing user profile information such as platform version, device memory, hardware concurrency, languages, and language.
        generated_platform (str): The name of the platform (e.g., "Windows", "Linux", "macOS").
        browser_brand (str): The browser brand (e.g., "Chrome", "Firefox").
        major_version (str): The major version of the browser.
        browser_version (str): The full browser version string.
    Returns:
        dict: A dictionary containing expected client hints, including platform details, browser brands, version information, device capabilities, language preferences, and HTTP accept header.
    """
    brands, full_version_list, sec_ch_ua, sec_ch_ua_full_version_list =  build_brands_and_related(
        browser_brand, major_version, browser_version
    )
    res = {
        "platform": generated_platform,
        "brands": brands,
        "mobile": False,
        "architecture": "x86",
        "bitness": "64", 
        "model": "",
        "platformVersion": profile["platform_version"],
        "fullVersionList": full_version_list,
        "uaFullVersion": browser_version,
        "sec_ch_ua": sec_ch_ua,
        "sec_ch_ua_full_version_list": sec_ch_ua_full_version_list,
        "sec_ch_ua_model": "",
        "sec_ch_ua_form_factors": ["Desktop"],
        "deviceMemory": profile["deviceMemory"],
        "hardwareConcurrency": profile["hardwareConcurrency"],
        "wow64": False,
        "languages": profile["languages"],
        "language": profile["language"],
        "formFactors": ["Desktop"],
        "accept": generate_accept_header(browser_brand, major_version),
    }
    return res

# =====  Building browser brand/version lists and corresponding header strings=====
def build_brands_and_related(browser_brand, major_version, browser_version):
    """
    Builds browser brand/version lists and corresponding Sec-CH-UA header strings.
    Args:
        browser_brand (str): The name of the browser (e.g., "Firefox", "Safari", "Google Chrome", "Microsoft Edge").
        major_version (str): The major version of the browser (e.g., "123").
        browser_version (str): The full browser version (e.g., "123.0.6312.86").
        tuple:
            brands (list of dict): List of dictionaries with "brand" and "version" for Sec-CH-UA.
            full_version_list (list of dict): List of dictionaries with "brand" and "version" for Sec-CH-UA-Full-Version-List.
            sec_ch_ua (str): Formatted Sec-CH-UA header string.
            sec_ch_ua_full_version_list (str): Formatted Sec-CH-UA-Full-Version-List header string.
    Notes:
        - For Chromium-based browsers, includes "Not)A;Brand" (with version "8.0.0.0"), "Chromium", and the actual browser brand.
        - For Firefox and Safari, only the respective brand is included.
        - The version for "Not)A;Brand" is always "8.0.0.0" in full_version_list.
    Returns:
    - brands: list {"brand":…, "version": major_version} для Sec-CH-UA
    - full_version_list: list {"brand":…, "version": browser_version}
        (for Not)A;Brand is always "8.0.0.0")
    - sec_ch_ua: format-string for  Sec-CH-UA
    - sec_ch_ua_full_version_list: format-string for Sec-CH-UA-Full-Version-List
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
def apply_ua_overrides(driver, profile, expected_client_hints, browser_brand):
    """
    Overrides the User-Agent and User-Agent Metadata for the Chromium browsers driver using Chrome DevTools Protocol (CDP).
    Args:
        driver: The browser driver instance (e.g., Selenium WebDriver) to apply the overrides to.
        profile (dict): A dictionary containing the 'user_agent' string to be set.
        expected_client_hints (dict): A dictionary of client hints to construct the UserAgentMetadata, including keys such as
            'platform', 'brands', 'mobile', 'architecture', 'bitness', 'model', 'platformVersion', 'uaFullVersion',
            'fullVersionList', 'deviceMemory', 'hardwareConcurrency', 'wow64', and 'formFactors'.
    browser_brand (str): The browser brand name (e.g., "chrome", "edge") to determine if the override should be applied.
    Side Effects:
        Modifies the browser's user agent and user agent metadata via CDP if the browser brand is supported.
    It may be utilised as a backup option in the event that the driver is set to 'None', or to guarantee additional parameter alterations. This is not obligatory. Logs an informational message upon successful override.
    """
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
    if browser_brand.lower() in ("google chrome", "microsoft edge"):
        driver.execute_cdp_cmd(
            "Network.setUserAgentOverride",
            {
                "userAgent": profile["user_agent"],
                "userAgentMetadata": metadata
            }
        )
    logger.info("userAgent and userAgentMetadata submitted via CDP")


