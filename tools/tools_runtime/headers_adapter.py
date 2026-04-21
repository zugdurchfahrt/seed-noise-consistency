from functools import lru_cache
import random

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

MINIMAL_HEADERS = [
    "User-Agent",
    "Accept-Language"
]

DYNAMIC_OVERRIDES = [
    "User-Agent",
    "Accept",
    "Accept-Language",
    "Sec-CH-UA",
    "Sec-CH-UA-Platform",
    "Sec-CH-UA-Mobile",
    "Sec-CH-Device-Memory",
    "Device-Memory"
]
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
    return ["en-GB"]


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

# ===== OUTBOUND CLNIENT HINTS  HEADERS HANDLING=====
def outbound_headers_forge(profile, expected_client_hints, user_agent):
    # Build Accept-Language once from the canonical profile seed.
    al = profile.get("accept_language") or derive_accept_language(
        profile,
        expected_client_hints=expected_client_hints,
        user_agent=user_agent,
        browser_brand=profile.get("browser_brand"),
    )
    is_safari = "Safari" in user_agent and "Chrome" not in user_agent and "Edg/" not in user_agent
    is_firefox = "Firefox" in user_agent and "Chrome" not in user_agent and "Edg/" not in user_agent

    if is_safari or is_firefox:
        return {
            "Sec-CH-UA": "",
            "Sec-CH-UA-Mobile": "?0",
            "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
            "Accept-Language": al,
        }

    return {
    # Базовая ветка (Chromium-family): AL из profile.languages → совпадает с navigator.languages
        # Core client hints
        "Accept": str(expected_client_hints["accept"]),
        "Accept-Language": al,
        "User-Agent": str(profile["user_agent"]),
        "Sec-CH-UA": expected_client_hints["sec_ch_ua"],
        "Sec-CH-UA-Mobile": "?0" if not expected_client_hints.get("mobile") else "?1",
        "Sec-CH-UA-Platform": f'"{expected_client_hints["platform"]}"',
        "Sec-CH-Save-Data": "?0",
        # Optional non-standard compatibility knob:
        # "Sec-CH-Lang": ", ".join(expected_client_hints.get("languages", [expected_client_hints.get("language")])),
        # Extended client hints
        "Sec-CH-UA-Platform-Version": f'"{expected_client_hints["platformVersion"]}"',
        "Sec-CH-UA-Full-Version-List": expected_client_hints["sec_ch_ua_full_version_list"],
        "Sec-CH-UA-Arch": expected_client_hints.get("architecture"),
        "Sec-CH-UA-Bitness": expected_client_hints.get("bitness"),
        "Sec-CH-UA-WoW64": "?0",
        "Sec-CH-UA-Model": expected_client_hints.get("sec_ch_ua_model"),
        "Sec-CH-UA-Form-Factors": expected_client_hints.get("sec_ch_ua_form_factors", '["Desktop"]'),
        # memory/screen block
        "Sec-CH-Device-Memory": str(expected_client_hints.get("deviceMemory", profile["deviceMemory"])),
        "Device-Memory": str(expected_client_hints.get("deviceMemory", profile["deviceMemory"])),
        "Sec-CH-Viewport-Width": str(profile["screen_width"]),
        "Sec-CH-Viewport-Height": str(profile["screen_height"]),
        "Sec-CH-Width": str(profile["screen_width"]),
        "Viewport-Width": str(profile["screen_width"]),
        # devicepixelratio
        "Sec-CH-DPR": str(profile["device_dpr_value"]),
        "DPR": str(profile["device_dpr_value"]),
    }

def import_headers(headers, keys, flow):
    for k in keys:
        v = headers.get(k)
        if v:
            flow.request.headers[k] = v
