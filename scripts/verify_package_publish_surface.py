#!/usr/bin/env python3
from __future__ import annotations

import sys
import tomllib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PYPROJECT = ROOT / "pyproject.toml"
README = ROOT / "README.md"
SERVER_JSON = ROOT / "server.json"
EXPECTED_MCP_NAME = "io.github.xiaojiou176-open/dealwatch"

REQUIRED_URLS = {
    "Homepage",
    "Repository",
    "Documentation",
    "Issues",
    "Discussions",
    "Changelog",
}

REQUIRED_SCRIPTS = {
    "dealwatch": "dealwatch.cli:main",
    "dealwatch-mcp": "dealwatch.mcp.server:main",
}

REQUIRED_SERVER_FIELDS = {
    "name": EXPECTED_MCP_NAME,
    "title": "DealWatch",
}


def main() -> int:
    try:
        data = tomllib.loads(PYPROJECT.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, tomllib.TOMLDecodeError) as exc:
        print(
            f"Package publish surface verification failed: could not read {PYPROJECT.name} ({exc}).",
            file=sys.stderr,
        )
        return 1

    project = data.get("project")
    if not isinstance(project, dict):
        print("Package publish surface verification failed: missing [project] table.", file=sys.stderr)
        return 1

    findings: list[str] = []

    if project.get("readme") != "README.md":
        findings.append("project.readme must point at README.md")
    if project.get("license") != "MIT":
        findings.append("project.license must use the SPDX string MIT")
    project_version = project.get("version")
    if not isinstance(project_version, str) or not project_version.strip():
        findings.append("project.version must exist and be a non-empty string")
        project_version = None

    urls = project.get("urls")
    if not isinstance(urls, dict):
        findings.append("project.urls must exist")
    else:
        missing_urls = sorted(REQUIRED_URLS - set(urls))
        if missing_urls:
            findings.append(f"project.urls missing keys: {', '.join(missing_urls)}")

    scripts = project.get("scripts")
    if not isinstance(scripts, dict):
        findings.append("project.scripts must exist")
    else:
        for key, expected in REQUIRED_SCRIPTS.items():
            actual = scripts.get(key)
            if actual != expected:
                findings.append(
                    f"project.scripts.{key} must equal {expected!r}; found {actual!r}"
                )

    classifiers = project.get("classifiers")
    if not isinstance(classifiers, list) or not classifiers:
        findings.append("project.classifiers must contain publish-oriented metadata")

    keywords = project.get("keywords")
    if not isinstance(keywords, list) or not keywords:
        findings.append("project.keywords must exist")

    try:
        readme_text = README.read_text(encoding="utf-8")
    except OSError as exc:
        findings.append(f"README.md must be readable ({exc})")
        readme_text = ""

    mcp_name_marker = f"mcp-name: {EXPECTED_MCP_NAME}"
    if mcp_name_marker not in readme_text:
        findings.append(f"README.md must include `{mcp_name_marker}` for PyPI MCP Registry ownership verification")

    try:
        server_data = json.loads(SERVER_JSON.read_text(encoding="utf-8"))
    except OSError as exc:
        findings.append(f"server.json must be readable ({exc})")
        server_data = None
    except json.JSONDecodeError as exc:
        findings.append(f"server.json must contain valid JSON ({exc})")
        server_data = None

    if isinstance(server_data, dict):
        for key, expected in REQUIRED_SERVER_FIELDS.items():
            actual = server_data.get(key)
            if actual != expected:
                findings.append(f"server.json field `{key}` must equal {expected!r}; found {actual!r}")

        actual_version = server_data.get("version")
        if actual_version != project_version:
            findings.append(
                f"server.json field `version` must equal project.version {project_version!r}; found {actual_version!r}"
            )

        packages = server_data.get("packages")
        if not isinstance(packages, list) or not packages:
            findings.append("server.json must include at least one package entry")
        else:
            first_package = packages[0]
            if not isinstance(first_package, dict):
                findings.append("server.json packages[0] must be an object")
            else:
                if first_package.get("registryType") != "pypi":
                    findings.append("server.json packages[0].registryType must equal 'pypi'")
                if first_package.get("identifier") != project.get("name"):
                    findings.append(
                        "server.json packages[0].identifier must match project.name"
                    )
                transport = first_package.get("transport")
                if not isinstance(transport, dict) or transport.get("type") != "stdio":
                    findings.append("server.json packages[0].transport.type must equal 'stdio'")

    if findings:
        print("Package publish surface verification failed.", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        return 1

    print("Package publish surface verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
