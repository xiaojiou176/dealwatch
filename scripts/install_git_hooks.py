#!/usr/bin/env python3
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOOK_SOURCE = ROOT / "scripts" / "git-hooks" / "pre-push"
HOOK_TARGET = ROOT / ".git" / "hooks" / "pre-push"
MANAGED_MARKER = "DealWatch managed hook"


def _ensure_pre_commit_installed() -> None:
    result = shutil.which("pre-commit")
    if result is None:
        print("Skipped pre-commit install: `pre-commit` is not available on PATH.")
        return
    subprocess.run(["pre-commit", "install"], cwd=ROOT, check=True)
    print("Installed pre-commit hook.")


def _existing_hook_is_managed(path: Path) -> bool:
    try:
        return MANAGED_MARKER in path.read_text(encoding="utf-8")
    except OSError:
        return False


def _install_pre_push() -> None:
    if not (ROOT / ".git").exists():
        raise RuntimeError("Git metadata directory `.git` is missing; refuse to install hooks.")
    if HOOK_TARGET.exists() and not _existing_hook_is_managed(HOOK_TARGET):
        raise RuntimeError(
            "Existing .git/hooks/pre-push is not DealWatch-managed. "
            "Refuse to overwrite unknown local hook."
        )
    HOOK_TARGET.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(HOOK_SOURCE, HOOK_TARGET)
    HOOK_TARGET.chmod(0o755)
    print(f"Installed managed pre-push hook at {HOOK_TARGET.relative_to(ROOT)}.")


def main() -> int:
    try:
        _ensure_pre_commit_installed()
        _install_pre_push()
    except (OSError, subprocess.CalledProcessError, RuntimeError) as exc:
        print(f"Git hook installation failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
