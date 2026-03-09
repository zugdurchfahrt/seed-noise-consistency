import re
import sys
import subprocess
import pathlib
from pathlib import Path
from tools.tools_infra.overseer import logger

brandmauer_logger = logger.getChild("brandmauer")

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[2]


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
    scanned_file_paths = []
    violations_by_file = {}
    violation_counts_by_rule = {}

    if not root.exists():
        return {
            "scanned_root": str(root),
            "scanned_files": 0,
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

    repo_root = Path(project_root).parent
    scanned_file_paths = [str(js_file) for js_file in sorted(root.rglob("*.js"))]
    scanned_files = len(scanned_file_paths)
    basename_to_path = {Path(file_path).name: file_path for file_path in scanned_file_paths}
    core_window_path = str(Path(project_root) / "assets" / "scripts" / "window" / "core" / "core_window.js")

    validator_path = Path(__file__).with_name("validate_proxy_mechanics_registry.ps1")
    completed = subprocess.run(
        ["pwsh", "-NoProfile", "-File", str(validator_path)],
        cwd=str(repo_root),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    if completed.returncode != 0:
        failure_text = "\n".join(part for part in (
            (completed.stdout or "").strip(),
            (completed.stderr or "").strip(),
        ) if part).strip() or "validate_proxy_mechanics_registry.ps1 failed without output"
        failure_text_clean = re.sub(r"\x1b\[[0-9;]*m", "", failure_text)
        assert_lines = []
        for line in failure_text_clean.splitlines():
            if "ASSERT FAILED:" not in line:
                continue
            cleaned_line = line.strip()
            if "|" in cleaned_line and cleaned_line.lstrip().startswith("|"):
                cleaned_line = cleaned_line.split("|", 1)[-1].strip()
            assert_lines.append(cleaned_line)

        failure_messages = assert_lines if assert_lines else [failure_text_clean.splitlines()[-1].strip()]

        for failure_message in failure_messages:
            if failure_message.startswith("ASSERT FAILED:"):
                failure_message = failure_message[len("ASSERT FAILED:"):].strip()
            if " (pattern:" in failure_message:
                failure_message = failure_message.split(" (pattern:", 1)[0].strip()

            failure_file = str(validator_path)
            js_match = re.search(r"([A-Za-z0-9_.-]+\.js)\b", failure_message)
            if js_match and js_match.group(1) in basename_to_path:
                failure_file = basename_to_path[js_match.group(1)]
            elif (
                "Core " in failure_message
                or "normalizeWrapLayer" in failure_message
                or "normalizePolicy" in failure_message
                or "__wrapNativeApply" in failure_message
                or "toString" in failure_message
                or "applyTargets" in failure_message
                or "patchMethod" in failure_message
            ):
                failure_file = core_window_path

            rule = "registry_validation_failed"
            if failure_message:
                rule = re.sub(r"[^a-z0-9]+", "_", failure_message.lower()).strip("_") or rule

            violation = {
                "rule": rule,
                "file": failure_file,
                "line": 0,
                "text": failure_message,
            }
            violations.append(violation)
            violations_by_file.setdefault(failure_file, []).append(violation)
            violation_counts_by_rule[rule] = violation_counts_by_rule.get(rule, 0) + 1

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
