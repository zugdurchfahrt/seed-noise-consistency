import re
import sys
import pathlib
from pathlib import Path
from tools.tools_infra.overseer import logger

bandmauer_logger = logger.getChild("bandmauer")

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[2]

_FORBIDDEN_PATTERNS = (
    ("local_base_mark_native", re.compile(r"\bfunction\s+baseMarkAsNative\b")),
    ("local_ensure_mark_native", re.compile(r"\bfunction\s+ensureMarkAsNative\b")),
    ("redefine_ensure_assign", re.compile(r"(?<![\w.])__ensureMarkAsNative\s*=\s*function\b")),
    ("redefine_ensure_define_property", re.compile(r"Object\.defineProperty\(\s*(?:window|globalThis|self)\s*,\s*['\"]__ensureMarkAsNative['\"]")),
    ("patch_function_toString_assign", re.compile(r"Function\.prototype\.toString\s*=")),
    ("patch_function_toString_define_property", re.compile(r"Object\.defineProperty\(\s*Function\.prototype\s*,\s*['\"]toString['\"]")),
)

_MARK_NATIVE_CALL = re.compile(r"\bmarkAsNative\s*\(")


def _line_no(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def _line_text(lines: list[str], line_no: int) -> str:
    idx = line_no - 1
    if idx < 0 or idx >= len(lines):
        return ""
    return lines[idx].strip()


def collect_core_bridge_violations(project_root: Path) -> dict:
    root = Path(project_root) / "assets" / "scripts"
    violations = []
    scanned_files = 0
    scanned_file_paths = []
    violations_by_file = {}
    violation_counts_by_rule = {}

    if not root.exists():
        return {
            "scanned_root": str(root),
            "scanned_files": scanned_files,
            "scanned_file_paths": scanned_file_paths,
            "clean_files": [],
            "violated_files": [],
            "violations_by_file": violations_by_file,
            "violation_counts_by_rule": violation_counts_by_rule,
            "violations": [{
                "rule": "patches_root_missing",
                "file": str(root),
                "line": 0,
                "text": "patches root is missing"
            }]
        }

    for js_file in sorted(root.rglob("*.js")):
        scanned_files += 1
        file_key = str(js_file)
        scanned_file_paths.append(file_key)
        try:
            text = js_file.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            violation = {
                "rule": "file_read_failed",
                "file": file_key,
                "line": 0,
                "text": str(e)
            }
            violations.append(violation)
            violations_by_file.setdefault(file_key, []).append(violation)
            violation_counts_by_rule["file_read_failed"] = violation_counts_by_rule.get("file_read_failed", 0) + 1
            continue

        lines = text.splitlines()

        for rule, pattern in _FORBIDDEN_PATTERNS:
            for match in pattern.finditer(text):
                ln = _line_no(text, match.start())
                violation = {
                    "rule": rule,
                    "file": file_key,
                    "line": ln,
                    "text": _line_text(lines, ln)
                }
                violations.append(violation)
                violations_by_file.setdefault(file_key, []).append(violation)
                violation_counts_by_rule[rule] = violation_counts_by_rule.get(rule, 0) + 1

        if _MARK_NATIVE_CALL.search(text) and "__ensureMarkAsNative" not in text:
            match = _MARK_NATIVE_CALL.search(text)
            ln = _line_no(text, match.start())
            violation = {
                "rule": "mark_native_without_core_bridge",
                "file": file_key,
                "line": ln,
                "text": _line_text(lines, ln)
            }
            violations.append(violation)
            violations_by_file.setdefault(file_key, []).append(violation)
            violation_counts_by_rule["mark_native_without_core_bridge"] = (
                violation_counts_by_rule.get("mark_native_without_core_bridge", 0) + 1
            )

    violated_files = sorted(violations_by_file)
    clean_files = [file_path for file_path in scanned_file_paths if file_path not in violations_by_file]

    return {
        "scanned_root": str(root),
        "scanned_files": scanned_files,
        "scanned_file_paths": scanned_file_paths,
        "clean_files": clean_files,
        "violated_files": violated_files,
        "violations_by_file": violations_by_file,
        "violation_counts_by_rule": violation_counts_by_rule,
        "violations": violations,
    }


def enforce_core_bridge_firewall(project_root: Path, logger=None) -> dict:
    result = collect_core_bridge_violations(project_root)
    scanned_root = result["scanned_root"]
    violations = result["violations"]
    scanned_files = result["scanned_files"]
    scanned_file_paths = result["scanned_file_paths"]
    clean_files = result["clean_files"]
    violated_files = result["violated_files"]
    violations_by_file = result["violations_by_file"]
    violation_counts_by_rule = result["violation_counts_by_rule"]

    if not violations:
        if logger:
            logger.info(
                "[brandmauer] passed, scanned_root=%s, scanned_files=%s, clean_files=%s, violated_files=%s",
                scanned_root,
                scanned_files,
                len(clean_files),
                len(violated_files),
            )
            for file_path in scanned_file_paths:
                logger.info("[brandmauer] file_status=ok file=%s", file_path)
        return result

    if logger:
        logger.error(
            "[brandmauer] failed, scanned_root=%s, scanned_files=%s, clean_files=%s, violated_files=%s, violations=%s",
            scanned_root,
            scanned_files,
            len(clean_files),
            len(violated_files),
            len(violations),
        )
        for file_path in clean_files:
            logger.info("[brandmauer] file_status=ok file=%s", file_path)
        for file_path in violated_files:
            logger.error(
                "[brandmauer] file_status=violation file=%s file_violations=%s",
                file_path,
                len(violations_by_file.get(file_path, [])),
            )
        for rule, count in sorted(violation_counts_by_rule.items()):
            logger.error("[brandmauer] rule_summary rule=%s count=%s", rule, count)
        for v in violations[:120]:
            logger.error(
                "[brandmauer] %s:%s rule=%s text=%s",
                v.get("file"),
                v.get("line"),
                v.get("rule"),
                v.get("text"),
            )

    preview = []
    for v in violations[:20]:
        preview.append(f"{v.get('file')}:{v.get('line')} [{v.get('rule')}] {v.get('text')}")
    result["summary"] = (
        "[brandmauer] core-bridge policy violation(s) detected: "
        f"{len(violations)} (scanned_files={scanned_files})\n" + "\n".join(preview)
    )
    return result


# def _main() -> int:
#     root = Path(__file__).resolve().parents[2]
#     try:
#         result = enforce_core_bridge_firewall(root, logger=None)
#     except RuntimeError as e:
#         print(str(e))
#         return 2
#     print(f"[brandmauer] passed (scanned_files={result['scanned_files']})")
#     return 0


# if __name__ == "__main__":
#     raise SystemExit(_main())
