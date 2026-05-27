from functools import lru_cache
import random
from tools.tools_infra.overseer import logger as _ROOT_LOGGER

logger = _ROOT_LOGGER.getChild("headers_adapter")

# ======= ACCEPT HEADER GENERATOR =======
ACCEPT_TEMPLATES = {
    "google chrome": [
        ["text/html", "application/xhtml+xml", "application/xml;q=0.9", "image/avif", "image/webp", "image/apng", "*/*;q=0.8", "application/signed-exchange;v=b3;q=0.9"],
        ["text/html", "application/xhtml+xml", "application/xml;q=0.9", "image/webp", "image/apng", "*/*;q=0.8"],
    ],
    "microsoft edge": [
        ["text/html", "application/xhtml+xml", "application/xml;q=0.9", "image/avif", "image/webp", "image/apng", "*/*;q=0.8", "application/signed-exchange;v=b3;q=0.9"],
    ],
    "firefox": [
        ["text/html", "application/xhtml+xml", "application/xml;q=0.9", "image/webp", "*/*;q=0.8"]
    ],
    "safari": [
        ["text/html", "application/xhtml+xml", "application/xml;q=0.9", "*/*;q=0.8"]
    ],
}

HEADER_TWIN_PAIRS = (
    ("Sec-CH-Device-Memory", "Device-Memory"),
)


def _synchronize_header_twins(headers: dict, twin_pairs=HEADER_TWIN_PAIRS):
    if not isinstance(headers, dict):
        return headers
    for left_key, right_key in twin_pairs:
        has_left = left_key in headers and headers[left_key] is not None
        has_right = right_key in headers and headers[right_key] is not None
        if not has_left and not has_right:
            continue
        canonical_value = headers[left_key] if has_left else headers[right_key]
        headers[left_key] = canonical_value
        headers[right_key] = canonical_value
    return headers

# ===== Accept-Language HEADER =====
def _accept_language_family(browser_brand: str | None = None, user_agent: str | None = None) -> str:
    brand = (browser_brand or "").strip().lower()
    ua = (user_agent or "").strip().lower()
    if "edg" in brand or "edge" in brand or "edg/" in ua:
        return "chromium"
    if "chrome" in brand or "chromium" in brand:
        return "chromium"
    if "safari" in brand or ("safari" in ua and "chrome" not in ua and "chromium" not in ua and "edg/" not in ua):
        return "safari"
    if "firefox" in brand or "firefox" in ua:
        return "firefox"
    return "chromium"


def _language_only_fallback(tag: str) -> str | None:
    if not isinstance(tag, str):
        return None
    parts = [p for p in tag.strip().split("-") if p]
    if len(parts) < 2:
        return None
    base = parts[0].lower()
    return base or None


def _ordered_accept_language_entries(languages, browser_brand: str | None = None, user_agent: str | None = None):
    """
    Build Accept-Language from the canonical profile list.

    Chromium/Safari network behavior may add language-only fallback tags after
    specific locale entries. navigator.languages remains untouched and is
    normalized separately.
    """
    family = _accept_language_family(browser_brand=browser_brand, user_agent=user_agent)
    ordered = []
    seen = set()

    def _append(lang: str) -> None:
        if not lang or lang in seen:
            return
        ordered.append(lang)
        seen.add(lang)

    for raw in (languages or []):
        if not isinstance(raw, str):
            continue
        lang = raw.strip()
        if not lang:
            continue
        _append(lang)
        if family in ("chromium", "safari"):
            fallback = _language_only_fallback(lang)
            if fallback:
                _append(fallback)
    if ordered:
        return ordered
    raise ValueError("HeadersStage: Accept-Language source missing")


def build_accept_language(languages, browser_brand: str | None = None, user_agent: str | None = None):
    """
    Формирует строку Accept-Language с q-метками, как делает Chrome/Edge/Firefox.
    """
    parts = []
    for i, lang in enumerate(_ordered_accept_language_entries(languages, browser_brand=browser_brand, user_agent=user_agent)):
        if i == 0:
            parts.append(lang)
        else:
            q = 1.0 - 0.1 * i
            if q < 0.1:
                break
            parts.append(f"{lang};q={q:.1f}")
    return ",".join(parts)


def derive_accept_language(profile, expected_client_hints=None, user_agent: str | None = None, browser_brand: str | None = None):
    return build_accept_language(
        ((profile or {}).get("languages")
         or ((expected_client_hints or {}).get("languages") if isinstance(expected_client_hints, dict) else None)
         or [((expected_client_hints or {}).get("language") if isinstance(expected_client_hints, dict) else None)]),
        browser_brand=(browser_brand or ((profile or {}).get("browser_brand") if isinstance(profile, dict) else None)),
        user_agent=(user_agent or ((profile or {}).get("user_agent") if isinstance(profile, dict) else None)),
    )


def _build_header_sets(profile, expected_client_hints=None, user_agent: str | None = None, browser_brand: str | None = None):
    profile = profile or {}
    expected_client_hints = expected_client_hints if isinstance(expected_client_hints, dict) else {}
    active_user_agent = user_agent or str(profile.get("user_agent") or "")
    active_brand = browser_brand or profile.get("browser_brand")
    http_accept_language_header = profile.get("http_accept_language") or derive_accept_language(
        profile,
        expected_client_hints=expected_client_hints,
        user_agent=active_user_agent,
        browser_brand=active_brand,
    )
    family = _accept_language_family(browser_brand=active_brand, user_agent=active_user_agent)
    # Use profile DeviceMemory for header emission because the pipeline relies on
    # the browser flag path to keep the outbound Device-Memory surface stable.
    device_memory = str(profile["deviceMemory"])
    if family in ("firefox", "safari"):
        cdp_outbound_headers = {
            "Sec-CH-UA": "",
            "Sec-CH-UA-Mobile": expected_client_hints.get("sec_ch_ua_mobile", ""),
            "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
            "Accept-Language": str(http_accept_language_header),
        }
        js_safelisted_headers = {
            "Accept-Language": str(http_accept_language_header),
        }
    else:
        cdp_outbound_headers = {
            "Accept": str(expected_client_hints["accept"]),
            "Accept-Language": str(http_accept_language_header),
            "User-Agent": str(profile["user_agent"]),
            "Sec-CH-UA": expected_client_hints["sec_ch_ua"],
            "Sec-CH-UA-Mobile": expected_client_hints.get("sec_ch_ua_mobile", ""),
            "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
            "Sec-CH-Save-Data": "?0",
            "Sec-CH-UA-Platform-Version": f'"{expected_client_hints["platformVersion"]}"',
            "Sec-CH-UA-Full-Version": expected_client_hints["sec_ch_ua_full_version"],
            "Sec-CH-UA-Full-Version-List": expected_client_hints["sec_ch_ua_full_version_list"],
            "Sec-CH-UA-Arch": expected_client_hints.get("architecture"),
            "Sec-CH-UA-Bitness": expected_client_hints.get("bitness"),
            "Sec-CH-UA-WoW64": expected_client_hints.get("sec_ch_ua_wow64", ""),
            "Sec-CH-UA-Model": expected_client_hints.get("sec_ch_ua_model", ""),
            "Sec-CH-UA-Form-Factors": expected_client_hints.get("sec_ch_ua_form_factors", ""),
            "Sec-CH-Device-Memory": device_memory,
            "Device-Memory": device_memory,
            "Sec-CH-Viewport-Width": str(profile["screen_width"]),
            "Sec-CH-Viewport-Height": str(profile["screen_height"]),
            "Sec-CH-Width": str(profile["screen_width"]),
            "Viewport-Width": str(profile["screen_width"]),
            "Sec-CH-DPR": str(profile["device_dpr_value"]),
            "DPR": str(profile["device_dpr_value"]),
        }
        js_safelisted_headers = {
            "Accept-Language": str(http_accept_language_header),
        }

    return {
        "family": family,
        "cdp_outbound_headers": _synchronize_header_twins(cdp_outbound_headers),
        "js_safelisted_headers": _synchronize_header_twins(js_safelisted_headers),
    }


# ===== Accept-HEADER FORGE=====
def _brand_key(browser_brand: str) -> str:
    b = (browser_brand or "").strip().lower()
    if "edg" in b or "edge" in b: return "microsoft edge"
    if "firefox" in b:            return "firefox"
    if "safari" in b and "chrome" not in b and "chromium" not in b: return "safari"
    return "google chrome"  # default для chrome/chromium/неопознанных

@lru_cache(maxsize=32)
def _pick_nav_template(key: str, major: int) -> tuple:
    tpl = list(random.choice(ACCEPT_TEMPLATES[key]))  # фиксируется кэшем на сессию
    if key in ("google chrome", "microsoft edge") and int(major) >= 135:
        if "image/avif" not in tpl: tpl.insert(3, "image/avif")
        if "application/signed-exchange;v=b3;q=0.9" not in tpl:
            tpl.append("application/signed-exchange;v=b3;q=0.9")
    # оставляем shuffle только внутри кэша (один раз на ключ), не на каждый вызов
    imgs = [i for i,v in enumerate(tpl) if v.startswith("image/")]
    if len(imgs) > 1:
        vals = [tpl[i] for i in imgs]
        random.shuffle(vals)
        for i,v in zip(imgs, vals): tpl[i] = v
    return tuple(tpl)

def generate_accept_header(browser_brand: str, major_version: int, kind: str = "navigate") -> str:
    key = _brand_key(browser_brand)
    if kind == "xhr":    return "application/json, text/plain, */*"
    if kind == "fetch":  return "*/*"
    # navigate (по умолчанию)
    return ",".join(_pick_nav_template(key, int(major_version)))


def build_runtime_header_sets(profile, expected_client_hints=None, user_agent: str | None = None, browser_brand: str | None = None):
    header_sets = _build_header_sets(
        profile,
        expected_client_hints=expected_client_hints,
        user_agent=user_agent,
        browser_brand=browser_brand,
    )
    if header_sets["family"] == "chromium":
        full_version_header = header_sets["cdp_outbound_headers"].get("Sec-CH-UA-Full-Version")
        if not isinstance(full_version_header, str) or not full_version_header:
            raise ValueError("HeadersStage: outbound Sec-CH-UA-Full-Version missing")
    return {
        "cdp_outbound_headers": header_sets["cdp_outbound_headers"],
        "js_safelisted_headers": header_sets["js_safelisted_headers"],
    }

def import_headers(headers, keys, flow):
    if not isinstance(headers, dict):
        logger.error("headers_stage: import_headers failed: headers must be dict")
        raise TypeError("HeadersStage: import_headers headers must be dict")
    for k in keys:
        if k not in headers:
            logger.error("headers_stage: import_headers missing header %s", k)
            raise KeyError(f"HeadersStage: import_headers missing header {k!r}")
        v = headers.get(k)
        if v is None:
            logger.error("headers_stage: import_headers header %s is None", k)
            raise ValueError(f"HeadersStage: import_headers header {k!r} is None")
        flow.request.headers[k] = str(v)
