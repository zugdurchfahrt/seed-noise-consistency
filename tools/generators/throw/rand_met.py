import os
import json
import hashlib
import random
import pathlib
import re
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
PROJECT_ROOT            = pathlib.Path(__file__).resolve().parents[2]
ASSETS                  = PROJECT_ROOT / 'assets'
PROFILE_DATA_SOURCE     = PROJECT_ROOT / 'profile_data_source'
DESIGNER_BY_FAMILY_PATH = PROFILE_DATA_SOURCE / 'FONTS_DESIGNER_BY_FAMILY_JSON.json'
LICENSE_BY_FAMILY_PATH  = PROFILE_DATA_SOURCE / 'FONTS_LICENSE_BY_FAMILY_JSON.json'
VERSION_BY_FAMILY_PATH  = PROFILE_DATA_SOURCE / 'FONTS_VERSION_BY_FAMILY_JSON.json'
TOOLS               = PROJECT_ROOT / 'tools'
GENERATORS          = TOOLS / 'generators'
TEMPLATES           = ASSETS / 'templates'
MANIFEST_PATH       = ASSETS/ 'Manifest' / 'fonts-manifest.json'
PATCH_OUT           = ASSETS/ 'JS_fonts_patch' / 'font_patch.generated.js'
FONTS_SOURCE_DIR    = ASSETS/ 'fonts_raw'

INDEX_NAME          = "fonts_index.json"
CSS_FAMILY = (os.environ.get("FONTS_CSS_FAMILY") or "FPFont").strip() or "FPFont"
# ----------------------- UTILS -----------------------
SYS_FONTS_WIN = [
    'Segoe UI', 'Segoe UI Variable', 'Segoe Fluent Icons',
    'Arial','Calibri','Verdana','Tahoma','Candara','Trebuchet MS',
    'Bahnschrift','Aptos','Times New Roman','Georgia','Cambria','Constantia',
    'Consolas','Courier New','Cascadia Code','Comic Sans MS','Impact',
    'Segoe Print','Segoe Script','Cascadia Mono','Corbel','DejaVu Sans',
    'DejaVu Sans Mono','DejaVu Serif','Gentium','Inter','Liberation Mono',
    'Liberation Sans','Liberation Serif','Montserrat','Roboto','Tinos']

    
    
SYS_FONTS_MAC = [
        'Helvetica','Geneva','Lucida Grande','Palatino','Menlo','Monaco',
        'Gill Sans','Avenir','Baskerville','Didot','Futura','Optima',
        'American Typewriter','Hoefler Text','Courier','Arial','Verdana',
        'Trebuchet MS','Comic Sans MS','Georgia']
SUBFAMILIES = [
        "Light", "Light Italic", "Regular", "Italic", "Semilight", "Semilight Italic",
        "SemiBold", "SemiBold Italic", "Bold", "Bold Italic", "Black", "Black Italic"]

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

def _seed_env() -> str:
    return os.environ.get("__GLOBAL_SEED", "0")

def _rng_for_manifest(platform: str, all_names: list) -> random.Random:
    seed_env = _seed_env()
    _seed_src = f"{seed_env}|{platform}|" + "|".join(sorted(all_names))
    _seed = int(hashlib.md5(_seed_src.encode("utf-8")).hexdigest()[:8], 16)
    return random.Random(_seed)



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
    return get_target_dir_for(platform) / "cache_data"

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
            except Exception:
                logger.debug(f"[fonts] cache_data cleanup: failed to remove {p}", exc_info=True)
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
    except Exception:
        logger.warning(f"[fonts] index load failed; fallback to empty index: path={path} platform={platform}", exc_info=True)
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
    for _, _rec in list(files_map.items()):
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


def _normalize_postscript_name(value: str) -> str:
    s = str(value or "")
    if not s:
        return ""
    s = re.sub(r"\bBold[\s_]+Italic\b", "BoldItalic", s, flags=re.IGNORECASE)
    s = re.sub(r"[\s_]+", "", s)
    s = re.sub(r"[^A-Za-z0-9-]", "", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s


def _get_nameid_any(tt: TTFont, name_id: int) -> str:
    """
    Return the first decodable nameID string from the name table, or ''.
    This is a minimal, platform-agnostic reader for consistency mapping.
    """
    try:
        name_table = tt["name"]
    except Exception:
        logger.debug(f"[fonts] name table missing/unreadable (nameID={name_id})", exc_info=True)
        return ""
    for rec in getattr(name_table, "names", []) or []:
        if getattr(rec, "nameID", None) != name_id:
            continue
        try:
            s = rec.toUnicode()
        except Exception:
            try:
                s = str(rec.string, errors="ignore")
            except Exception:
                continue
        s = (s or "").strip()
        if s:
            return s
    return ""


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def _normalize_subfamily_value(value: str) -> str:
    """
    Canonicalize any incoming subfamily string to the project's known set.
    Unknown/empty values degrade to Regular (if available).
    """
    default_sub = "Regular" if "Regular" in SUBFAMILIES else (SUBFAMILIES[0] if SUBFAMILIES else "")
    s0 = _normalize_whitespace(value)
    if not s0:
        return default_sub
    key = s0.lower().replace("-", " ").replace("_", " ")
    key = _normalize_whitespace(key)

    # Exact / alias mapping
    if "bold" in key and (("italic" in key) or ("oblique" in key)):
        return "Bold Italic" if "Bold Italic" in SUBFAMILIES else default_sub
    if "bold" in key:
        return "Bold" if "Bold" in SUBFAMILIES else default_sub
    if ("italic" in key) or ("oblique" in key):
        return "Italic" if "Italic" in SUBFAMILIES else default_sub
    if "black" in key:
        return "Black" if "Black" in SUBFAMILIES else default_sub
    if "semibold" in key or "demibold" in key:
        return "SemiBold" if "SemiBold" in SUBFAMILIES else default_sub
    if "semilight" in key:
        return "Semilight" if "Semilight" in SUBFAMILIES else default_sub
    if "light" in key:
        return "Light" if "Light" in SUBFAMILIES else default_sub
    return default_sub


def _derive_full_name(family: str, subfamily: str) -> str:
    family = _normalize_whitespace(family)
    subfamily = _normalize_whitespace(subfamily)
    if not family:
        return subfamily or ""
    if not subfamily or subfamily == "Regular":
        return family
    return f"{family} {subfamily}"

def json_dict(path: pathlib.Path) -> dict:
    """
    Read a JSON file as dict.
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

       
    
def _empty_if_unknown(value: str) -> str:
    s = _normalize_whitespace(value)
    if not s:
        return ""
    if s.lower() in ("unknown", "n/a", "na", "none", "null"):
        return ""
    return s


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
    except Exception:
        logger.warning("[fonts] subfamilies normalization failed; using default SUBFAMILIES", exc_info=True)
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
    except Exception:
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
    logged = False
    for n in tt["name"].names:
        try:
            vals.append(str(n.toUnicode()).lower())
        except Exception:
            if not logged:
                logger.debug("[fonts] name table decode failed; continuing with partial names", exc_info=True)
                logged = True
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
    except Exception:
        return False


def preparation_stage_(platform: str):
    """
    Stage 1 (preparation):
    - file phase: copy from FONTS_SOURCE_DIR (fonts_raw) to target_dir with filters
    - ensure_platform_index(): update fonts_index.json
    - collect all_names/files_map for the next stage
    """

    # NOTE: platform must be normalized to DOM form ('Win32'|'MacIntel') by the caller.
    if platform not in ("Win32", "MacIntel"):
        raise ValueError(f"[fonts] Unknown platform: {platform}")

    # === Step 1: Copy new files from fonts_raw → target_dir ===
    target_dir = get_target_dir_for(platform)
    
    if not FONTS_SOURCE_DIR.exists():
        logger.info(f"Folder {FONTS_SOURCE_DIR} not found. Font copying will be skipped")
    elif not any(f.suffix.lower() == '.woff2' for f in FONTS_SOURCE_DIR.iterdir() if f.is_file()):
        logger.info(f"There are no .woff2 files in {FONTS_SOURCE_DIR}")
    else:
        raw_files = [f for f in FONTS_SOURCE_DIR.iterdir() if f.is_file() and f.suffix.lower() == '.woff2']
        os.makedirs(target_dir, exist_ok=True)
        copy_skip_stats = defaultdict(int)
  
        moved_count = 0
        for src_path in raw_files:
            with open(src_path, 'rb') as f:
                data = f.read()
            if len(data) == 0 or data[:4] != b'wOF2':
                logger.error(f"[Skipped] {src_path.name} reason=bad_woff2_header detail=wrong_or_empty_file")
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
                copy_skip_stats["fsType_restricted"] += 1
                logger.warning(f"[Skipped] {src_path.name} reason=fsType_restricted")
                continue

            # sanity check: Extreme metrics can break the layout
            try:
                upm = tt["head"].unitsPerEm
                ascent = tt["OS/2"].usWinAscent if "OS/2" in tt else None
                descent = tt["OS/2"].usWinDescent if "OS/2" in tt else None
                if upm and ascent and descent and (ascent + descent) > 4 * upm:
                    logger.warning(f"[Skipped] {src_path.name} — anomal metrics (ascent+descent >> UPM).")
                    continue
            except Exception:
                logger.debug(f"[fonts] sanity metrics check failed for {src_path}", exc_info=True)

            md5hex = hashlib.md5(data).hexdigest()
            platform_tag = "W32" if platform == "Win32" else "mac"
            base_name = f"{platform_tag}_{md5hex[:8]}"
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
    idx_doc = ensure_platform_index(platform)
    files_map = idx_doc.get("files", {}) if isinstance(idx_doc, dict) else {}
    all_names = list(files_map.keys())
    return target_dir, files_map, all_names


def generate_font_metadata(platform: str, subfamilies_src=None, files_map=None, all_names=None):
    """
    Stage 2 (data only):
    - choose N/candidates
    - read TTFont + build cfg + uniq_triple + collect temp_configs
    - no writing MANIFEST_PATH/PATCH_OUT here
    Core randomness is limited to (family, subfamily); derived fields are computed deterministically.
    """

    # Normalize platform to DOM form ('Win32'|'MacIntel')
    if platform in ("Windows", "Win32"):
        platform = "Win32"
    elif platform in ("macOS", "Macintosh", "MacIntel"):
        platform = "MacIntel"
    else:
        raise ValueError(f"[fonts] Unknown platform: {platform}")

    target_dir = get_target_dir_for(platform)
    os.makedirs(target_dir, exist_ok=True)

    if files_map is None:
        idx_path = _index_path_for(platform)
        idx_doc = _load_index(idx_path, platform)
        files_map = idx_doc.get("files", {}) if isinstance(idx_doc, dict) else {}

    if all_names is None:
        all_names = list(files_map.keys())
    if not all_names:
        logger.warning(f'[WARNING] for {platform} is no .woff2 in {target_dir}')
        return []

    # Stabilized seed for manifest(platform + file composition)
    _rng = _rng_for_manifest(platform, all_names)

    # === Step 3: Select a random amount N of fonts (seeded) ===
    MIN_N = int(os.environ.get("FONTS_MIN_N", "18"))
    MAX_N = int(os.environ.get("FONTS_MAX_N", "21"))
    max_n = len(all_names)

    if max_n == 0:
        logger.warning(f"[Fonts] No files passed filters ({max_n}) for MIN_N={MIN_N} — manifest will be empty")
        N = 0
        candidate_names = []
    else:
        hi = min(MAX_N, max_n)
        lo = 1 if max_n < MIN_N else MIN_N
        N = _rng.randint(lo, hi)
        if N < MIN_N:
            logger.warning(f"[Fonts] Only {max_n} files available < MIN_N={MIN_N} — using N={N}")
        candidate_names = sorted(all_names)
        _rng.shuffle(candidate_names)
        # NOTE: Backfill is applied in Step4: we iterate through remaining candidates
        # if some of the first N are skipped due to uniq_triple/family limits/parse errors.
         
         
    max_family_repeats = 6
    family_counter = defaultdict(int)
    used_families = set()
    temp_configs = []
    skip_stats = defaultdict(int)
    
    logger.info(f"[fonts] cssFamily fixed: {CSS_FAMILY}")
     
    designer_by_family = json_dict(DESIGNER_BY_FAMILY_PATH)
    # NOTE: no LICENSE_BY_DESIGNER registry file in profile_data_source (keep empty mapping)
    license_by_designer = {}
    license_by_family = json_dict(LICENSE_BY_FAMILY_PATH)
    version_by_family = json_dict(VERSION_BY_FAMILY_PATH)

    # Optional: normalize an external subfamilies source into the canonical SUBFAMILIES allow-list,
    # so _normalize_subfamily_value() keeps working without changing its signature.
    if subfamilies_src is not None:
        global SUBFAMILIES
        SUBFAMILIES = _normalize_subfamilies(subfamilies_src)



    # Backfill loop: walk all candidates until we have N accepted configs (or run out).
    for fname in candidate_names:
        if len(temp_configs) >= N:
            break
        rec = files_map.get(fname)
        if not rec:
            skip_stats["missing_index_entry"] += 1
            logger.warning(f"[fonts]There is no entry in the index for {fname}, пропуск")
            continue

        data_url = _get_data_url(platform, target_dir, fname, rec)  # Lazy side-cache .b64
        # If _get_data_url returned empty (no-woff2/error) - skip the font
        if not data_url:
            skip_stats["empty_data_url"] += 1
            logger.warning(f"[fonts] Пропуск {fname}: пустой data URL")
            continue

        file_path = target_dir / fname
        name_no_ext = pathlib.Path(fname).stem

        # Registry-like nameID model: take (1,2,5,9,13) from file and derive (4,6) from (1,2).
        # This keeps fields mutually consistent and avoids independent randomization.
        try:
            tt = TTFont(str(file_path))
        except Exception as e:
            skip_stats["ttfont_open_failed"] += 1
            logger.warning(f"[fonts] Step4 skip {fname}: can not read TTFont ({e})")
            tt = None

        if tt is not None:
            base_family_raw = _get_nameid_any(tt, 1)
            base_sub_raw = _get_nameid_any(tt, 2)
            base_family = _normalize_whitespace(base_family_raw) or name_no_ext
            subfamily = _normalize_subfamily_value(base_sub_raw)
            # Showcase metadata: take from file first, then apply registry overrides (do not randomize).
            version = _empty_if_unknown(_get_nameid_any(tt, 5))
            designer = _empty_if_unknown(_get_nameid_any(tt, 9))
            license_desc = _empty_if_unknown(_get_nameid_any(tt, 13))
        else:
            base_family = name_no_ext
            subfamily = _normalize_subfamily_value("")
            version = ""
            designer = ""
            license_desc = ""

        family = base_family
        # Step B (derived): these fields are strictly derived from (family, subfamily).
        full_name = _derive_full_name(family, subfamily)
        postscript = _normalize_postscript_name(f"{family}-{subfamily}")
        _sf = (subfamily or "").lower()
        weight = "bold" if any(k in _sf for k in ("bold","black","heavy","semibold","demibold","extrabold","ultrabold")) else "normal"
        style  = "italic" if ("italic" in _sf or "oblique" in _sf) else "normal"

        # Step C (registry): optional metadata must come from family/designer registry mapping.
        fam_key = _normalize_whitespace(base_family)
        if fam_key and isinstance(designer_by_family, dict) and fam_key in designer_by_family:
            designer = _empty_if_unknown(designer_by_family.get(fam_key, ""))
        if fam_key and isinstance(version_by_family, dict) and fam_key in version_by_family:
            version = _empty_if_unknown(version_by_family.get(fam_key, ""))
        if fam_key and isinstance(license_by_family, dict) and fam_key in license_by_family:
            license_desc = _empty_if_unknown(license_by_family.get(fam_key, ""))
        if not license_desc and designer and isinstance(license_by_designer, dict):
            license_desc = _empty_if_unknown(license_by_designer.get(designer, ""))

        # stable, non-random unique_id derived from existing variables (no external assumptions)
        uniq_tag = re.sub(r"[^A-Za-z0-9]+", "", name_no_ext)[:8]
        prefix = (family[:2] or "")
        unique_id = f"{prefix}-{uniq_tag}" if (prefix and uniq_tag) else ""

        meta_values = {
            1: family,
            2: subfamily,
            3: unique_id,
            4: full_name,
            5: version,
            6: postscript,
            9: designer,
            13: license_desc,
        }

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

        cfg = {
            "name": name_no_ext,
            "url": data_url,
            "cssFamily": CSS_FAMILY,
            "family": meta_values.get(1, family),
            "subfamily": subfamily,
            "weight": weight,
            "style": style,
            "unique_id": meta_values.get(3, ""),
            "full_name": meta_values.get(4, ""),
            "version": meta_values.get(5, ""),
            "postscript_name": meta_values.get(6, postscript),
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
    if N and len(temp_configs) < N:
        logger.warning(f"[fonts] Backfill exhausted: selected={len(temp_configs)} < N={N} (candidates={len(candidate_names)})")
    if skip_stats:
        logger.debug(f"[fonts] Step4 skip stats: {dict(skip_stats)}")
    return temp_configs


def generate_font_manifest(manifest_path: pathlib.Path, platform: str, subfamilies_src=None):
    """
    Stage 3 (emit artifacts):
    - writes fonts-manifest.json to MANIFEST_PATH
    - renders Jinja and writes PATCH_OUT
    Orchestration order: preparation_stage_() → generate_font_metadata() → emit.
    """

    # Normalize to DOM form ('Win32'|'MacIntel') and crash if something is wrong
    if platform in ("Windows", "Win32"):
        platform = "Win32"
    elif platform in ("macOS", "Macintosh", "MacIntel"):
        platform = "MacIntel"
    else:
        raise ValueError(f"[fonts] Unknown platform: {platform}")

    target_dir, files_map, all_names = preparation_stage_(platform)
    if not all_names:
        logger.warning(f'[WARNING] for {platform} is no .woff2 in {target_dir}')
        return []

    temp_configs = generate_font_metadata(
        platform,
        subfamilies_src=subfamilies_src,
        files_map=files_map,
        all_names=all_names,
    )
    # === Emit: create fonts-manifest.json for fingerprint_files =====
    os.makedirs(manifest_path.parent, exist_ok=True)
    os.makedirs(PATCH_OUT.parent, exist_ok=True)
    
    # === Emit: render Jinja-template font_patch.generated.js =====
    env = Environment(loader=FileSystemLoader(TEMPLATES), trim_blocks=True)
    template = env.get_template("font_patch.template.j2")
    configs_for_js = [
        {
            "name": c["name"],
            "cssFamily": c.get("cssFamily"),
            "family": c["family"],
            "url": c["url"],
            "fallback": c["fallback"],
            "platform_id": c["platform_id"],
            "platform_dom": c.get("platform_dom"),
            "weight": c.get("weight", "normal"),
            "style": c.get("style", "normal"),
            "designer": c.get("designer", ""),
            "license": c.get("license", ""),
            "version": c.get("version", ""),
        }
        for c in temp_configs
    ]
    configs_json = json.dumps(configs_for_js, ensure_ascii=False)
    
    output = template.render(
        configs_json=configs_json,
        PLATFORM=platform,
    )
    
    # Atomic emit (per-file): temp -> replace.
    # Avoids partially-written files; does not attempt cross-file rollback.
    
    # 1) fonts-manifest.json
    manifest_tmp_fd, manifest_tmp = tempfile.mkstemp(prefix=MANIFEST_PATH.name + '.', suffix='.tmp', dir=str(MANIFEST_PATH.parent))
    try:
        with os.fdopen(manifest_tmp_fd, 'w', encoding='utf-8') as mf:
            json.dump(temp_configs, mf, ensure_ascii=False, indent=2)
            mf.flush()
            os.fsync(mf.fileno())
        os.replace(manifest_tmp, MANIFEST_PATH)
        manifest_tmp = None
    except Exception:
        logger.error('[fonts] manifest emit failed', exc_info=True)
        raise
    finally:
        if manifest_tmp:
            try:
                if os.path.exists(manifest_tmp):
                    os.remove(manifest_tmp)
            except Exception:
                logger.debug(f'[fonts] cleanup failed for temp file: {manifest_tmp}', exc_info=True)
    
    logger.info(f"fonts-manifest.json generated: ({len(temp_configs)} fonts)")
    
    # 2) font_patch.generated.js
    patch_tmp_fd, patch_tmp = tempfile.mkstemp(prefix=PATCH_OUT.name + '.', suffix='.tmp', dir=str(PATCH_OUT.parent))
    try:
        with os.fdopen(patch_tmp_fd, 'w', encoding='utf-8') as outf:
            outf.write(output)
            outf.flush()
            os.fsync(outf.fileno())
        os.replace(patch_tmp, PATCH_OUT)
        patch_tmp = None
    except Exception:
        logger.error('[fonts] patch emit failed', exc_info=True)
        raise
    finally:
        if patch_tmp:
            try:
                if os.path.exists(patch_tmp):
                    os.remove(patch_tmp)
            except Exception:
                logger.debug(f'[fonts] cleanup failed for temp file: {patch_tmp}', exc_info=True)
    
    logger.info(f" File is generated {PATCH_OUT.name}")
    return temp_configs

