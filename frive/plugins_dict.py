
# plugins_dict.py  (data + selection + validation)

from __future__ import annotations
from typing import List, Dict, Tuple, Iterable, Optional
import random
from overseer import logger
logger = logger.getChild("plugins_dict")

# --- initial options for plugins ---
# Structures:
#  - chromium/edge/webkit: list[variant], где variant ∈ ([], list[dict])
#  - gecko: list[dict]
# This setting allows you to keep an “empty” option as well as 1 plugin

PLUGIN_DICT: Dict[str, List]  = {
    "chromium-viewer": [
        [],  # V1 — empty
        [    # V2 — Classic Chrome: only one PDF Viewer
            {
                "name": "Chrome PDF Viewer",
                "filename": "internal-pdf-viewer",
                "description": "",
                "mimeTypes": [
                    {"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}
                ],
            }
        ],
        [   # V3 — The same essence, another description
            {
                "name": "Chrome PDF Viewer",
                "filename": "internal-pdf-viewer",
                "description": "Portable Document Format",
                "mimeTypes": [
                    {"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}
                ],
            }
        ],
    ],

    "edge-viewer": [
        [],  # V1 — empty
        [    # V2 — Classic Edge: only one PDF Viewer
            {
                "name": "Microsoft Edge PDF Viewer",
                "filename": "internal-pdf-viewer",
                "description": "Portable Document Format",
                "mimeTypes": [
                    {"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}
                ],
            }
        ],
        [   # V3 — description variation
            {
                "name": "Microsoft Edge PDF Viewer",
                "filename": "internal-pdf-viewer",
                "description": "",
                "mimeTypes": [
                    {"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}
                ],
            }
        ],
    ],

    "webkit-viewer": [
        [],  # W1 — empty (in fact Safari has a native viewer, but as a plugin it is not exist)
        [   # W2 — Minimum stub profile
            {
                "name": "Default PDF Viewer",
                "filename": "internal-pdf-viewer",
                "description": "",
                "mimeTypes": [
                    {"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}
                ],
            }
        ],
    ],

    "gecko-standard": [  # Firefox expects 2 system extensions
        {
            "name": "OpenH264 Video Codec",
            "filename": "openh264.xpi",
            "description": "OpenH264 Video Codec provided by Cisco Systems, Inc.",
            "mimeTypes": [
                {"type": "video/h264", "suffixes": "h264", "description": "H.264 video"}
            ],
        },
        {
            "name": "Widevine Content Decryption Module",
            "filename": "widevinecdm.xpi",
            "description": "Widevine Content Decryption Module provided by Google Inc.",
            "mimeTypes": [
                {"type": "application/x-widevine-cdm", "suffixes": "cdm", "description": "Widevine CDM"}
            ],
        },
    ],

    # Optional: a universal profile (not in use, but remains as a spare)
    "universal-safe": [
        {
            "name": "PDF Viewer",
            "filename": "internal-pdf-viewer",
            "description": "Portable Document Format",
            "mimeTypes": [
                {"type": "application/pdf", "suffixes": "pdf", "description": "PDF document"}
            ],
        }
    ],
}

# Engine restrictions (lo, hi)
ENGINE_LIMITS: dict[str, Tuple[int, int]] = {
    "chromium-viewer": (0, 1),
    "edge-viewer":     (0, 1),
    "webkit-viewer":   (0, 1),
    "gecko-standard":  (2, 2),
}

# --- helpers ---

def plugin_key_for(browser_choice: str) -> str:
    """Map human/browser choice → PLUGIN_DICT key. Single mapping source.
    """
    b = (browser_choice or "").casefold()
    if "edge" in b:
        return "edge-viewer"
    if "safari" in b or "webkit" in b:
        return "webkit-viewer"
    if "firefox" in b or "gecko" in b:
        return "gecko-standard"
    return "chromium-viewer"


def _allowed_names(variants: Iterable) -> set[str]:
    names: set[str] = set()
    for var in (variants or []):
        if isinstance(var, dict):
            n = var.get("name");  n and names.add(str(n))
        elif isinstance(var, list):
            for p in var:
                if isinstance(p, dict):
                    n = p.get("name");  n and names.add(str(n))
    return names


def _choose_raw(variants: Iterable, *, rng: Optional[random.Random] = None) -> List[Dict]:
    rng = rng or random
    vs = list(variants or [])
    if not vs:
        return []
    if isinstance(vs[0], dict):
        return [dict(p) for p in vs if isinstance(p, dict)]
    pick = rng.choice(vs)
    if isinstance(pick, dict):
        return [dict(pick)]
    if isinstance(pick, list):
        return [dict(p) for p in pick if isinstance(p, dict)]
    return []


def _dedup_norm(pls: List[Dict]) -> List[Dict]:
    seen: set[Tuple[str, str]] = set()
    out: List[Dict] = []
    for p in pls or []:
        name = str(p.get("name", ""))
        filename = str(p.get("filename", ""))
        k = (name, filename)
        if k in seen:
            continue
        seen.add(k)
        out.append({
            "name": name,
            "filename": filename,
            "description": str(p.get("description", "")),
            "mimeTypes": [
                {
                    "type":        str(mt.get("type", "")),
                    "suffixes":    str(mt.get("suffixes", "")),
                    "description": str(mt.get("description", "")),
                }
                for mt in (p.get("mimeTypes") or [])
                if isinstance(mt, dict)
            ],
        })
    return out


def build_plugins_profile(browser_choice: str, *, rng: Optional[random.Random] = None, strict: bool = False) -> Tuple[List[Dict], List[Dict]]:
    """Return (plugins_final, mime_types_final) for given browser.
    - Whitelist filtering names (excludes cross-engine garbage)
    - Dedup and restriction to Engine_limits
    - strict=True → AssertionError In case of limits violaton
    """
    key = plugin_key_for(browser_choice)
    variants = PLUGIN_DICT.get(key, [])
    names_whitelist = _allowed_names(variants)

    raw = _choose_raw(variants, rng=rng)
    filtered = [p for p in raw if isinstance(p, dict) and p.get("name") in names_whitelist]
    cleaned = _dedup_norm(filtered)

    lo, hi = ENGINE_LIMITS.get(key, (0, 1))
    if len(cleaned) < lo:
        # "Pour" from the "canonical" version
        canon: List[Dict] = []
        if variants and isinstance(variants[0], dict):
            canon = [dict(p) for p in variants if isinstance(p, dict)]
        else:
            for v in variants or []:
                if isinstance(v, list) and v:
                    canon = [dict(p) for p in v if isinstance(p, dict)]
                    break
        cleaned = _dedup_norm(cleaned + canon)[:lo]
    if len(cleaned) > hi:
        cleaned = cleaned[:hi]

    if strict:
        assert lo <= len(cleaned) <= hi, f"plugins count {len(cleaned)} outside limits {lo}..{hi} for {key}"

    mime_final = [mt for p in cleaned for mt in (p.get("mimeTypes") or [])]
    logger.debug("[plugins.unify] browser=%s key=%s → %d: %s", browser_choice, key, len(cleaned), [p.get("name") for p in cleaned])
    return cleaned, mime_final

__all__ = ["PLUGIN_DICT", "plugin_key_for", "build_plugins_profile"]

