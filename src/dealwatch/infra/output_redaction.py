from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlsplit


REPO_ROOT = Path(__file__).resolve().parents[3]
_PATHISH_KEYS = {
    "browser_user_data_dir",
    "bundle_dir",
    "identity_page_path",
    "identity_page_url",
    "output_path",
    "requested_user_data_dir",
    "storage_state_dir",
    "user_data_dir",
}
_LOCAL_PATH_FRAGMENT_RE = re.compile(
    r"(?:~(?:[^/\s,'\"\])]+)?/[^\s,'\"\])]+|/(?:Users|private|tmp|var|opt|Applications|Volumes)[^\s,'\"\])]+)"
)


def _coerce_repo_root(repo_root: Path | str | None) -> Path | None:
    if repo_root is None:
        return None
    return Path(repo_root).expanduser()


def redact_local_path(value: str, *, repo_root: Path | str | None = None) -> str:
    text = str(value or "").strip()
    if not text:
        return text
    candidate = Path(text).expanduser()
    if not candidate.is_absolute():
        return text
    for root in (_coerce_repo_root(repo_root), REPO_ROOT):
        if root is None:
            continue
        try:
            return candidate.relative_to(root).as_posix() or "."
        except ValueError:
            continue
    return f"<local-path>/{candidate.name}" if candidate.name else "<local-path>"


def redact_local_url(value: str, *, repo_root: Path | str | None = None) -> str:
    text = str(value or "").strip()
    if not text.startswith("file://"):
        return text
    parsed = urlsplit(text)
    redacted_path = redact_local_path(parsed.path, repo_root=repo_root)
    normalized = redacted_path.lstrip("./")
    if not normalized.startswith("<local-path>/"):
        normalized = f"<local-path>/{normalized}"
    return f"file:///{normalized}"


def redact_local_paths_in_text(value: str, *, repo_root: Path | str | None = None) -> str:
    text = str(value or "")
    if not text:
        return text

    def _replace(match: re.Match[str]) -> str:
        return redact_local_path(match.group(0), repo_root=repo_root)

    return _LOCAL_PATH_FRAGMENT_RE.sub(_replace, text)


def sanitize_local_output(value: Any, *, repo_root: Path | str | None = None, key: str | None = None) -> Any:
    if isinstance(value, dict):
        return {
            item_key: sanitize_local_output(item_value, repo_root=repo_root, key=str(item_key))
            for item_key, item_value in value.items()
        }
    if isinstance(value, list):
        return [sanitize_local_output(item, repo_root=repo_root, key=key) for item in value]
    if isinstance(value, str):
        if value.startswith("file://") or (key and key in _PATHISH_KEYS and value.startswith("file://")):
            return redact_local_url(value, repo_root=repo_root)
        if key and key in _PATHISH_KEYS:
            return redact_local_path(value, repo_root=repo_root)
        return redact_local_paths_in_text(value, repo_root=repo_root)
    return value


def _strip_browser_debug_titles(payload: dict[str, Any]) -> dict[str, Any]:
    current_page = payload.get("current_page")
    if isinstance(current_page, dict):
        current_page = dict(current_page)
        current_page.pop("title", None)
        payload["current_page"] = current_page

    open_pages = payload.get("open_pages")
    if isinstance(open_pages, list):
        sanitized_pages: list[dict[str, Any] | Any] = []
        for page in open_pages:
            if isinstance(page, dict):
                page = dict(page)
                page.pop("title", None)
            sanitized_pages.append(page)
        payload["open_pages"] = sanitized_pages
    return payload


def sanitize_browser_debug_output(payload: dict[str, Any], *, repo_root: Path | str | None = None) -> dict[str, Any]:
    sanitized = sanitize_local_output(deepcopy(payload), repo_root=repo_root)
    if not isinstance(sanitized, dict):
        return {}
    if isinstance(sanitized.get("diagnosis"), dict):
        sanitized["diagnosis"] = _strip_browser_debug_titles(dict(sanitized["diagnosis"]))
    if isinstance(sanitized.get("bundle"), dict):
        sanitized["bundle"] = sanitize_browser_debug_output(
            dict(sanitized["bundle"]),
            repo_root=repo_root,
        )
    if "diagnosis" not in sanitized and "bundle" not in sanitized:
        sanitized = _strip_browser_debug_titles(sanitized)
    git_payload = sanitized.get("git")
    if isinstance(git_payload, dict):
        git_payload = dict(git_payload)
        git_payload.pop("status_short", None)
        sanitized["git"] = git_payload
    return sanitized
