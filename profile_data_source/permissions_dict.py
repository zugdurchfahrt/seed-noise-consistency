from __future__ import annotations

from typing import Dict, List, Optional
import random

from tools.tools_infra.overseer import logger

logger = logger.getChild("permissions_dict")

PERMISSIONS_DICT: Dict[str, List[Dict[str, str]]] = {
    "chromium-media": [
        {"name": "microphone", "cdp": "microphone", "states": ["prompt", "denied"]},
        {"name": "camera", "cdp": "camera", "states": ["prompt", "denied"]},
        {"name": "notifications", "cdp": "notifications", "states": ["prompt", "denied"]},
        {"name": "midi", "cdp": "midi", "states": ["prompt", "denied"]},
    ],
}


def permissions_key_for(browser_choice: str) -> str:
    b = (browser_choice or "").casefold()
    if "chrome" in b or "edge" in b or "chromium" in b:
        return "chromium-media"
    return "chromium-media"


def build_permissions_profile(browser_choice: str, *, rng: Optional[random.Random] = None, strict: bool = False) -> Dict:
    rng = rng or random
    key = permissions_key_for(browser_choice)
    candidates = [dict(p) for p in PERMISSIONS_DICT.get(key, []) if isinstance(p, dict)]
    selected: List[Dict] = []
    for candidate in candidates:
        states = candidate.get("states")
        state_choices = list(states) if isinstance(states, list) and states else ["prompt"]
        mode = rng.choice(["omit", *state_choices])
        if mode == "omit":
            continue
        item = dict(candidate)
        item["state"] = mode
        selected.append(item)
    profile = {
        "key": key,
        "selected": selected,
        "states": {p["name"]: p["state"] for p in selected},
        "cdp": [{"permission": p["cdp"], "setting": p["state"]} for p in selected],
    }
    if strict:
        assert all(p.get("state") in ("prompt", "denied") for p in selected), "permissions profile must not grant access"
    logger.info(
        "[permissions.unify] browser=%s key=%s -> %d: %s states=%s",
        browser_choice,
        key,
        len(selected),
        [p.get("name") for p in selected],
        profile["states"],
    )
    return profile


__all__ = ["PERMISSIONS_DICT", "permissions_key_for", "build_permissions_profile"]
