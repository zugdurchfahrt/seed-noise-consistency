import os
import json
import hashlib
import random
import re
import string
import pathlib
from typing import Dict, Set, Tuple
from collections import defaultdict
from typing import Set as _Set
from fontTools.ttLib import TTFont
from shutil import copyfile
from jinja2 import Environment, FileSystemLoader
import tempfile
import base64
from tools.tools_infra.overseer import logger
logger = logger.getChild("rand_met")

# ----------------------- CONST -----------------------
PROJECT_ROOT        = pathlib.Path(__file__).resolve().parents[2]
ASSETS              = PROJECT_ROOT / 'assets'
PROFILE_DATA_SOURCE     = PROJECT_ROOT / 'profile_data_source'
TOOLS               = PROJECT_ROOT / 'tools'
GENERATORS          = TOOLS / 'generators'
TEMPLATES           = ASSETS / 'templates'
MANIFEST_PATH       = ASSETS/ 'Manifest' / 'fonts-manifest.json'
PATCH_OUT           = ASSETS/ 'JS_fonts_patch' / 'font_patch.generated.js'
FONTS_SOURCE_DIR    = ASSETS/ 'fonts_raw'
INDEX_NAME          = "fonts_index.json"
# ----------------------- UTILS -----------------------
SYS_FONTS_WIN = [
        'Arial','Verdana','Tahoma','Times New Roman','Courier New','Georgia',
        'Palatino','Garamond','Comic Sans MS','Trebuchet MS','Impact',
        'Lucida Sans','Segoe UI','Calibri','Consolas','Candara',
        'Franklin Gothic Medium','Constantia','Corbel','Century Gothic']
    
SYS_FONTS_MAC = [
        'Helvetica','Geneva','Lucida Grande','Palatino','Menlo','Monaco',
        'Gill Sans','Avenir','Baskerville','Didot','Futura','Optima',
        'American Typewriter','Hoefler Text','Courier','Arial','Verdana',
        'Trebuchet MS','Comic Sans MS','Georgia']
SUBFAMILIES = [
        "Thin", "Extra Light", "Light", "Regular", "Medium", "SemiBold", "Bold", "Extra Bold",
        "Black", "Italic", "Oblique", "Extended", "Narrow", "Expanded", "Ultra Light",
        "Ultra Bold", "Heavy", "Mono", "Display", "Hairline", "Book", "DemiBold", "Extra Black", "Ultra Black",
        "Condensed", "Extra Condensed", "Ultra Condensed", "Compressed", "Extra Compressed",
        "Wide", "Extra Wide", "Ultra Wide", "Slanted", "Backslant", "Caption", "Text", "Subhead", "Headline", "Poster", "Small Caps", "Titling",
        "Inline", "Shadow", "Variable", "Stencil", "Outline", "Engraved", "Script", "Rounded",
        "UI", "Micro", "Footnote", "Compact"]

PLATFORM_ID_MAP = {
    "Win32": (3, 1, 1033),
    "MacIntel": (1, 0, 0)
}

ACCEPT_EXTS = {".woff2", ".woff", ".ttf", ".otf"}

# --- Keyword heuristics for icon/emoji fonts ---
ICON_KEYWORDS = {
    "icon", "icons", "emoji", "emojis", "awesome", "material", "fontello",
    "ionicons", "bootstrap-icons", "octicons", "simpleicons", "remixicon",
    "feather", "weather", "symbol", "symbols", "dingbat", "dingbats",
    "wingdings", "seguiemj", "seguiemoji", "segoe ui emoji"
}

PUA_RANGES = [
    (0xE000, 0xF8FF),       # BMP PUA
    (0xF0000, 0xFFFFD),     # Plane 15 PUA
    (0x100000, 0x10FFFD),   # Plane 16 PUA
]


_MANIFEST_SEED = None
_META_RNG = None


def _seed_env() -> str:
    v = os.environ.get("__GLOBAL_SEED")
    if v is None:
        raise RuntimeError("[fonts] __GLOBAL_SEED env is required (missing)")
    v = str(v).strip()
    if not v:
        raise RuntimeError("[fonts] __GLOBAL_SEED env is required (empty)")
    return v


def _seed_namespace() -> str:
    raw = _seed_env()
    safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", raw).strip("._-")
    if not safe:
        raise RuntimeError("[fonts] __GLOBAL_SEED env is not usable for namespace (sanitized to empty)")
    return safe


def _rng_for_manifest(platform: str, all_names: list) -> random.Random:
    global _MANIFEST_SEED
    seed_env = _seed_env()
    _seed_src = f"{seed_env}|{platform}|" + "|".join(sorted(all_names))
    _MANIFEST_SEED = int(hashlib.md5(_seed_src.encode("utf-8")).hexdigest()[:8], 16)
    return random.Random(_MANIFEST_SEED)


def _meta_rng() -> random.Random:
    if _META_RNG is None:
        raise RuntimeError("[fonts] META_RNG is required (not initialized)")
    return _META_RNG



def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())



def _derive_css_family(family: str, fallback: str) -> str:
    family_norm = _normalize_whitespace(family)
    if family_norm:
        return family_norm
    # cssFamily is runtime-family (fam = cssFamily || family). Do not synthesize it.
    # If family is absent, keep cssFamily empty.
    return ""



def get_target_dir_for(p: str) -> pathlib.Path:
    """determines the catalog according the selected platform"""
    return ASSETS/ 'generated_fonts' / ('Win32' if p == 'Win32' else 'MacIntel')

def _index_path_for(platform: str) -> pathlib.Path:
    """The path to the font index for the platform (use only get_target_dir_for)"""
    return get_target_dir_for(platform) / INDEX_NAME

def _atomic_write_json(path: pathlib.Path, obj: dict) -> None:
    """Atomic Json (without semi -files)"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False, dir=str(path.parent)) as tmp:
        json.dump(obj, tmp, ensure_ascii=False, separators=(",", ":"))
        tmp.flush()
        os.fsync(tmp.fileno())
        tmp_name = tmp.name
    os.replace(tmp_name, path)

def _cache_dir_for(platform: str) -> pathlib.Path:
    """Catalog for per-file base64-cache"""
    return get_target_dir_for(platform) / "cache_data" / _seed_namespace()

def _b64_path_for(platform: str, md5: str) -> pathlib.Path:
    return _cache_dir_for(platform) / f"{md5}.b64"

def _atomic_write_text(path: pathlib.Path, data: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # base64 ⊂ ASCII → write/read as ascii for consistency
    with tempfile.NamedTemporaryFile("w", encoding="ascii", delete=False, dir=str(path.parent)) as tmp:
        tmp.write(data)
        tmp.flush()
        os.fsync(tmp.fileno())
        tmp_name = tmp.name
    os.replace(tmp_name, path)

def _get_data_url(platform: str, target_dir: pathlib.Path, fname: str, rec: dict) -> str:
    """Return data:font/woff2;base64,... through side cache with md5; In the absence - encode and cache"""
    md5 = rec.get("md5")
    if not md5:
        with open(target_dir / fname, "rb") as rf:
            data = rf.read()
        md5 = _md5_bytes(data)
    b64_path = _b64_path_for(platform, md5)
    try:
        with open(b64_path, "r", encoding="ascii") as f:
            b64 = f.read().strip()
    except FileNotFoundError:
        with open(target_dir / fname, "rb") as rf:
            data = rf.read()
        if not _is_woff2_header(data):
            logger.warning(f"[fonts] skipping no-woff2 while building data URL: {fname}")
            return ""
        b64 = base64.b64encode(data).decode("ascii")
        _atomic_write_text(b64_path, b64)
    return "data:font/woff2;base64," + b64

def _cleanup_cache(platform: str, valid_md5s: _Set[str]) -> int:
    """
    Removes .b64, whose MD5 is not found in the index (orphaned files).
    It is called once for starting after updating the index.
    """
    cdir = _cache_dir_for(platform)
    if not cdir.exists():
        return 0
    removed = 0
    for p in cdir.glob("*.b64"):
        if p.stem not in valid_md5s:
            try:
                p.unlink()
                removed += 1
            except Exception as e:
                logger.warning(f"[fonts] cache_data cleanup: can not remove orphan {p.name} ({e})")
    if removed: logger.info(f"[fonts] cache_data cleanup: removed {removed} orphan .b64")
    return removed


def _load_index(path: pathlib.Path, platform: str) -> dict:
    """Download/initialize the file, indexing fonts for the platform"""
    if not path.exists():
        return {"version": 1, "platform": platform, "files": {}}
    try:
        with open(path, "r", encoding="utf-8") as f:
            idx = json.load(f) or {}
        if not isinstance(idx, dict) or "files" not in idx or idx.get("platform") != platform:
            return {"version": 1, "platform": platform, "files": {}}
        if "version" not in idx:
            idx["version"] = 1
        if "files" not in idx:
            idx["files"] = {}
        return idx
    except Exception as e:
        logger.warning(f"[fonts] index load failed for {platform} at {path} ({e})")
        return {"version": 1, "platform": platform, "files": {}}

def _md5_bytes(b: bytes) -> str:
    h = hashlib.md5(); h.update(b); return h.hexdigest()

def _is_woff2_header(b: bytes) -> bool:
    return len(b) >= 4 and b[:4] == b"wOF2"

def ensure_platform_index(platform: str) -> dict:
    """
    Updates the platform index.
    Important: we take the catalog only through get_target_dir_for(platform) — A single point of definition
    """
    plat_dir = get_target_dir_for(platform) 
    plat_dir.mkdir(parents=True, exist_ok=True)

    idx_path = _index_path_for(platform)
    idx = _load_index(idx_path, platform)
    files_map: dict = idx["files"]
    changed: list = []

    # removes the obsolete field 'data' (reduce file size and RAM used)
    removed_inline = False
    for _n, _rec in list(files_map.items()):
        if isinstance(_rec, dict) and "data" in _rec:
            _rec.pop("data", None)
            removed_inline = True
    if removed_inline:
        _atomic_write_json(idx_path, idx)
    fs_files = {p.name: p for p in plat_dir.glob("*.woff2") if p.is_file()}
    # removes from the index
    for name in list(files_map.keys()):
        if name not in fs_files:
            files_map.pop(name, None)


    for name, path in fs_files.items():
        st = path.stat()
        rec = files_map.get(name)
        need_update = (
            rec is None or
            rec.get("size") != st.st_size or
            float(rec.get("mtime", 0)) != st.st_mtime
        )
        if need_update:
            with open(path, "rb") as rf:
                data = rf.read()
            if not _is_woff2_header(data):
                logger.warning(f"[fonts] skipping not-woff2: {path}")
                continue
            files_map[name] = {
                "size": st.st_size,
                "mtime": st.st_mtime,
                "md5": _md5_bytes(data),
            }
            changed.append(name)
        else:
            # Backfill MD5 for old records where it is absent
            if rec is not None and not rec.get("md5"):
                with open(path, "rb") as rf:
                    data = rf.read()
                if not _is_woff2_header(data):
                    logger.warning(f"[fonts] skipping not-woff2 (md5 backfill): {path}")
                    files_map.pop(name, None)
                    changed.append(name)
                    continue
                rec["md5"] = _md5_bytes(data)
                changed.append(name)
    # Save the index for changes
    if changed:
        _atomic_write_json(idx_path, idx)
        logger.info(f"[fonts] index {platform}: +{len(changed)} / total={len(files_map)}")
        
    # claning orphaned .b64 after the index is actualized
    valid_md5s = {rec.get("md5") for rec in files_map.values() if isinstance(rec, dict) and rec.get("md5")}
    try:
        _cleanup_cache(platform, valid_md5s)
    except Exception as e:
        logger.warning(f"[fonts] cache cleanup failed: {e}")
    return idx

def random_string(length=12):
    alphabet = string.ascii_letters + string.digits
    rng = _meta_rng()
    return ''.join(rng.choice(alphabet) for _ in range(length))


def _normalize_subfamilies(src):
    """
    forms a sourcesubfamilies as the list of strings.
    Supports: list/tuple/set[str], dict[str, str|list[str]].
    Empty/incorrect source -> Return of globalSUBFAMILIES.
    """
    try:
        if isinstance(src, (list, tuple, set)):
            out = [s.strip() for s in src if isinstance(s, str) and s.strip()]
            return sorted(set(out)) or SUBFAMILIES
        if isinstance(src, dict):
            out = []
            for k, v in src.items():
                if isinstance(k, str) and k.strip():
                    out.append(k.strip())
                if isinstance(v, str) and v.strip():
                    out.append(v.strip())
                elif isinstance(v, (list, tuple, set)):
                    out.extend([s.strip() for s in v if isinstance(s, str) and s.strip()])
            return sorted(set(out)) or SUBFAMILIES
    except Exception as e:
        logger.warning(f"[fonts] subfamilies normalization failed (type={type(src).__name__}) ({e})")
    return SUBFAMILIES

def get_font_compare(woff2_path):
    try:
        font = TTFont(woff2_path)
        family = font['name'].getName(1, 3, 1)
        subfamily = font['name'].getName(2, 3, 1)
        family = family.toUnicode() if family else ''
        subfamily = subfamily.toUnicode() if subfamily else ''
        return (family, subfamily)
    except Exception as e:
        logger.warning(f"Ошибка чтения метаданных {woff2_path}: {e}")
        return (None, None)


def path_iter_fonts(root: pathlib.Path):
    for p in sorted(root.rglob("*")):
        if p.suffix.lower() in ACCEPT_EXTS and p.is_file():
            yield p

def get_best_cmap(tt: TTFont) -> Dict[int, str]:
    try:
        return tt.getBestCmap() or {}
    except Exception as e:
        logger.warning(f"[fonts] getBestCmap failed ({e})")
        # fallback to cmap table directly
        if "cmap" in tt:
            for sub in tt["cmap"].tables:
                if sub.isUnicode():
                    return getattr(sub, "cmap", {}) or {}
        return {}

def has_ascii_letters_and_digits(cmap: Dict[int, str]) -> Tuple[bool, Set[int]]:
    missing = set()
    for cp in range(0x41, 0x5B):  # A-Z
        if cp not in cmap:
            missing.add(cp)
    for cp in range(0x61, 0x7B):  # a-z
        if cp not in cmap:
            missing.add(cp)
    for cp in range(0x30, 0x3A):  # 0-9
        if cp not in cmap:
            missing.add(cp)
    return (len(missing) == 0, missing)

def has_cyrillic_letters(cmap: Dict[int, str]) -> Tuple[bool, Set[int]]:
    needed = list(range(0x410, 0x430)) + list(range(0x430, 0x450)) + [0x401, 0x451]  # А-Я, а-я, Ё/ё
    missing = {cp for cp in needed if cp not in cmap}
    return (len(missing) == 0, missing)

def name_strings(tt: TTFont) -> str:
    vals = []
    if "name" not in tt: 
        return ""
    warned = False
    for n in tt["name"].names:
        try:
            vals.append(str(n.toUnicode()).lower())
        except Exception as e:
            if not warned:
                warned = True
                logger.warning(f"[fonts] name_strings: can not decode a name record ({e})")
    return " ".join(vals)

def has_symbol_emoji_traits(tt: TTFont, cmap: Dict[int, str]) -> bool:
    # keyword hit
    names = name_strings(tt)
    if any(k in names for k in ICON_KEYWORDS):
        return True
    # color/emoji tables presence
    for tab in ("COLR", "CPAL", "CBDT", "CBLC", "sbix", "SVG "):
        if tab in tt:
            return True
    # PUA dominance
    total = max(1, len(cmap))
    pua = 0
    for cp in cmap.keys():
        for a,b in PUA_RANGES:
            if a <= cp <= b:
                pua += 1
                break
    if pua / total >= 0.5:
        return True
    return False

def fsType_restricts(tt: TTFont) -> bool:
    try:
        if "OS/2" not in tt:
            return False
        fsType = tt["OS/2"].fsType
        # 0 means installable embedding (good). Non-zero may restrict.
        # We consider "restricted license embedding" (bit 1) as reject.
        return (fsType & 0x0002) != 0
    except Exception as e:
        logger.warning(f"[fonts] fsType check failed ({e})")
        return False


def generate_font_metadata(platform: str, subfamilies_src=None):
    """
    Generates font metadata: family, subfamily, unique_id и т.д.
    Returns the dictionary like {1: family, 2: subfamily, 3: unique_id, 4: full_name, 5: version, 6: ps_name, 9: designer, 13: license_desc}
    """
    common_families = [
        "NeoMono", "PrimeSans", "LunaText", "OmniMono", "GravitaPro", "NimbusPro", "CodaSans", "ClarityMono", "Interstate", "Vectora",
        "Codex", "OrbitaSans", "Viretta", "Axionis", "Lumora", "Equinox", "VisioraX", "Condensed", "AtlasType", "NorthAtlas", "LumenSans",
        "Qorin", "Torus", "ZenithMono", "QuantumSans", "Auralis", "StellarText", "AxiomSans", "Solvex", "Visage", "Nexora",]

    if platform == "MacIntel":
        family_names = SYS_FONTS_MAC + common_families
        designers = ["Apple Inc.", "5th Dimension", "Futura Design", "Omni Group", "Generation Frontline Foundry", "Bright Kernel Foundry", "FontAddicts Group"]
    else:
        family_names = SYS_FONTS_WIN + common_families
        designers = ["Microsoft Corp.", "Dynamix Typefaces", "New Vision Fonts", "Monolith Design", "Pure bury design", "Granite & Grid",
                    "PrototypeFont Factory", "Sharp Sable Graphics", "Friendly Typefaces", "Cobalt Letterworks"]
    
    subfamilies = _normalize_subfamilies(subfamilies_src) if subfamilies_src is not None else SUBFAMILIES
    
    licenses = [
        "Public Domain", "Gift for community", "Free for personal use",
        "GNU General Public License (GPL)", "MIT License",
        "SIL Open Font License (OFL)", "Apache License 2.0", "Creative Commons license",
    ]

    rng = _meta_rng()
    family = rng.choice(family_names)
    subfamily = rng.choice(subfamilies)
    unique_id = f"{family[:2]}-{random_string(12)}"
    full_name = f"{family} {subfamily}".strip()
    version = f"Version {rng.randint(1,5)}.{rng.randint(0,9999)}"
    ps_name = f"{family}-{subfamily}".replace(" ", "")
    designer = rng.choice(designers)
    license_desc = rng.choice(licenses)

    return {
        1: family,
        2: subfamily,
        3: unique_id,
        4: full_name,
        5: version,
        6: ps_name,
        9: designer,
        13: license_desc
    }

def generate_font_manifest(manifest_path: pathlib.Path, platform: str, subfamilies_src=None):
    """
    1) Copies new .woff2 from FONTS_SOURCE_DIR to target_dir
    2) Updates fonts_index.json (list of names of all files in target_dir)
    3) Takes list of all .woff2 from target_dir → all_files
    4) Randomly selects N fonts (from MIN_N to MAX_N) from all_files → fingerprint_names
    5) For each file in fingerprint_names:
    a) Encodes to Base64 (data:URI)
    b) Generates metadata via generate_font_metadata(platform)
    c) Collects temp_configs (for Jinja)
    6) Writes fonts-manifest.json, but only for fingerprint_names (can leave if needed)
    7) Renders font_patch.generated.js
    8) Returns temp_configs (or manifest if needed)
    """

    # Step 0: Normalize to the DOM form ('Win32'|'MacIntel') and crash if something is wrong
    if platform in ("Windows", "Win32"):
        platform = "Win32"
    elif platform in ("macOS", "Macintosh", "MacIntel"):
        platform = "MacIntel"
    else:
        raise ValueError(f"[fonts] Unknown platform: {platform}")

    # Fail-fast: seed is a required session parameter (before any filesystem mutations).
    _seed_env()

    # === Step 1: Copy new files from fonts_raw → target_dir ===
    target_dir = get_target_dir_for(platform)
    
    if not FONTS_SOURCE_DIR.exists():
        logger.info(f"Folder {FONTS_SOURCE_DIR} not found. Font copying will be skipped")
    elif not any(f.suffix.lower() == '.woff2' for f in FONTS_SOURCE_DIR.iterdir() if f.is_file()):
        logger.info(f"There are no .woff2 files in {FONTS_SOURCE_DIR}")
    else:
        raw_files = [f for f in FONTS_SOURCE_DIR.iterdir() if f.is_file() and f.suffix.lower() == '.woff2']
        os.makedirs(target_dir, exist_ok=True)
  
        moved_count = 0
        for idx, src_path in enumerate(raw_files): 
            with open(src_path, 'rb') as f:
                data = f.read()
            if len(data) == 0 or data[:4] != b'wOF2':
                logger.error(f"[Error] Wrong file format: {src_path}")
                raise RuntimeError(f"Wrong/empty file found: {src_path}")
            
            # === Extended woff2 files check ===
            try:
                tt = TTFont(str(src_path))
            except Exception as e:
                logger.warning(f"[Skipped] {src_path.name} — can not read file ({e}).")
                continue

            cmap = get_best_cmap(tt)
            if not cmap:
                logger.warning(f"[Skipped] {src_path.name} — has no union map (cmap).")
                continue

            ok_ascii, missing_ascii = has_ascii_letters_and_digits(cmap)
            if not ok_ascii:
                logger.warning(f"[Skipped] {src_path.name} — no basic ASCII (skipped: {len(missing_ascii)}).")
                continue

            # optional: demands cyrillic letters (by default - is off not to dirupt script behavior)
            require_cyrillic = False
            if require_cyrillic:
                ok_cy, missing_cy = has_cyrillic_letters(cmap)
                if not ok_cy:
                    logger.warning(f"[Skipped] {src_path.name} — no cyrillic letters (skipped: {len(missing_cy)}).")
                    continue

            if has_symbol_emoji_traits(tt, cmap):
                logger.warning(f"[Skipped] {src_path.name} — seems to be icon/emoji (PUA/colored/kyy words/no latin letters)")
                continue

            if fsType_restricts(tt):
                logger.warning(f"[Skipped] {src_path.name} — licence constraints (OS/2 fsType).")
                continue

            # sanity check: Extreme metrics can break the layout
            try:
                upm = tt["head"].unitsPerEm
                ascent = tt["OS/2"].usWinAscent if "OS/2" in tt else None
                descent = tt["OS/2"].usWinDescent if "OS/2" in tt else None
                if upm and ascent and descent and (ascent + descent) > 4 * upm:
                    logger.warning(f"[Skipped] {src_path.name} — anomal metrics (ascent+descent >> UPM).")
                    continue
            except Exception as e:
                logger.warning(f"[Skipped] {src_path.name} — sanity metrics check failed ({e})")

            salt = hashlib.md5(data).hexdigest()[:6]
            platform_tag = "W32" if platform == "Win32" else "mac"
            base_name = f"{platform_tag}_{idx}_{salt}"
            dst_path = target_dir / f"{base_name}.woff2"
            i = 1
            while dst_path.exists():
                dst_path = target_dir / f"{base_name}_{i}.woff2"
                i += 1

            copyfile(src_path, dst_path)
            moved_count += 1
            logger.info(f"[ADD Font] {src_path.name} → {dst_path.name}")
            os.remove(src_path)
        logger.info(f"[ADD Fonts] Files transferred: {moved_count}")

    # === Step 2: Ensure that target_dir exists and get all_files ===
    os.makedirs(target_dir, exist_ok=True)
    idx = ensure_platform_index(platform)
    files_map = idx.get("files", {})
    all_names = list(files_map.keys())
    if not all_names:
        logger.warning(f'[WARNING] for {platform} is no .woff2 in {target_dir}')
        return []

    # Stabilized seed for manifest(env + platform + file composition)
    _rng = _rng_for_manifest(platform, all_names)
    _seed = _MANIFEST_SEED
    if _seed is None:
        raise RuntimeError("[fonts] _MANIFEST_SEED missing after _rng_for_manifest()")


    # === Step 3: Select a random amount n fonts for fingerprint_names (seeded) check README if have issues ===
    MIN_N = int(os.environ.get("FONTS_MIN_N", "17"))
    MAX_N = int(os.environ.get("FONTS_MAX_N", "19"))
    max_n = len(all_names)

    if max_n == 0:
        logger.warning(f"[Fonts] No files passed filters ({max_n}) for MIN_N={MIN_N} — manifest will be empty")
        fingerprint_names = []
    else:
        hi = min(MAX_N, max_n)
        lo = 1 if max_n < MIN_N else MIN_N
        N = _rng.randint(lo, hi)
        if N < MIN_N:
            logger.warning(f"[Fonts] Only {max_n} files available < MIN_N={MIN_N} — using N={N}")
        fingerprint_names = _rng.sample(sorted(all_names), k=N)
        fingerprint_names.sort()  # fix the order in the manifest
        
    # === Step 4: collect temp_configs for Jinja ===
    max_family_repeats = 6
    family_counter = defaultdict(int)
    used_families = set()
    temp_configs = []
    skip_stats = defaultdict(int)
    
  
    
    try:
        global _META_RNG
        _prev_meta_rng = _META_RNG
        _META_RNG = random.Random(_seed)
        for fname in fingerprint_names:
            rec = files_map.get(fname)
            if not rec:
                logger.warning(f"[fonts]There is no entry in the index for {fname}, пропуск")
                continue

            data_url = _get_data_url(platform, target_dir, fname, rec)  # Lazy side-cache .b64
            # If _get_data_url returned empty (no-woff2/error) - skip the font
            if not data_url:
                logger.warning(f"[fonts] Пропуск {fname}: пустой data URL")
                continue

            file_path = target_dir / fname
            name_no_ext = pathlib.Path(fname).stem

            # deterministic generation of metadata (seed is already fixed above)
            meta_values = generate_font_metadata(platform, subfamilies_src)
            family     = meta_values.get(1, fname)
            subfamily  = meta_values.get(2, "")
            full_name  = meta_values.get(4, "")
            postscript = meta_values.get(6, "")
            
            #limits families dups and removes duplicates
        # Dedup: drop duplicates; do not mutate/tag font fields.
            uniq_triple = (family, full_name, postscript)
            if uniq_triple in used_families:
                skip_stats["duplicate_uniq_triple"] += 1
                logger.debug(f"[fonts] Step4 skip {fname}: duplicate uniq_triple={uniq_triple}")
                continue
            if family_counter[family] >= max_family_repeats:
                skip_stats["family_repeat_limit"] += 1
                logger.debug(f"[fonts] Step4 skip {fname}: family_repeat_limit family={family} limit={max_family_repeats}")
                continue

            _sf = (subfamily or "").lower()
            weight = "bold" if any(k in _sf for k in ("bold","black","heavy","semibold","demibold","extrabold","ultrabold")) else "normal"
            style  = "italic" if ("italic" in _sf or "oblique" in _sf) else "normal"

            cfg = {
                "name": name_no_ext,
                "url": data_url,
                "fontFamily": meta_values.get(6, name_no_ext),
                "family": family,
                "cssFamily": _derive_css_family(meta_values.get(1, family), name_no_ext),
                "subfamily": subfamily,
                "weight": weight,
                "style": style,
                "unique_id": meta_values.get(3, ""),
                "full_name": meta_values.get(4, ""),
                "version": meta_values.get(5, ""),
                "postscript_name": meta_values.get(6, ""),
                "designer": meta_values.get(9, ""),
                "license": meta_values.get(13, ""),
                "fallback": name_no_ext,
                "platform_id": PLATFORM_ID_MAP[platform][0],
                "platform_dom": platform  # 'Win32' | 'MacIntel'
            }
            temp_configs.append(cfg)
            used_families.add(uniq_triple)
            family_counter[family] += 1

            orig_family, orig_subfamily = get_font_compare(file_path)
            logger.debug(
                f"[CFG Font] {fname}: src=({orig_family or '-'}/{orig_subfamily or '-'}) → "
                f"dst=({family}/{subfamily})"
            )
    finally:
        _META_RNG = _prev_meta_rng

    # === Step 5: create fonts-manifest.json for fingerprint_files =====
    os.makedirs(manifest_path.parent, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as mf:
        json.dump(temp_configs, mf, ensure_ascii=False, indent=2)
    logger.info(f"fonts-manifest.json generated: ({len(temp_configs)} fonts)")

    # === Step 5: render Jinja-template font_patch.generated.js =====
    env = Environment(loader=FileSystemLoader(TEMPLATES), trim_blocks=True)
    template = env.get_template('font_patch.template.j2')
    # Data preparation for JS (with the right fields) from configs_json
    configs_for_js = [
        {
            "name": c["name"],
            "family": c["family"],
            "cssFamily": c["family"],  # ключ синхронизации = family
            "url": c["url"],
            "platform_id": c["platform_id"],
            "platform_dom": c.get("platform_dom"),
            "weight": c.get("weight", "normal"),
            "style": c.get("style", "normal"),
        }
        for c in temp_configs
    ]
    configs_json = json.dumps(configs_for_js, ensure_ascii=False)

    output = template.render(
        configs_json=configs_json,
        PLATFORM=platform
    )

    os.makedirs(PATCH_OUT.parent, exist_ok=True)
    with open(PATCH_OUT, "w", encoding="utf-8") as outf:
        outf.write(output)
    logger.info(f" File is generated {PATCH_OUT.name}")

    return temp_configs
