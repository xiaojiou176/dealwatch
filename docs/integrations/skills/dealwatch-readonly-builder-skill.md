# DealWatch Read-Only Builder Skill

Use this skill when a coding agent is connected to DealWatch through the local HTTP runtime, the local MCP server, or both.

## Goal

Treat DealWatch as a local-first, compare-first, read-only-first product truth surface.

## Do first

1. inspect the shipped tool or route inventory
2. inspect runtime readiness
3. inspect the builder starter pack contract
4. run compare preview before assuming any URL deserves durable state
5. stay on read-only product truth unless a human explicitly authorizes a separate operator lane

## Stable now

- `PYTHONPATH=src uv run python -m dealwatch --help`
- `PYTHONPATH=src uv run python -m dealwatch builder-starter-pack --json`
- `PYTHONPATH=src uv run python -m dealwatch server`
- `PYTHONPATH=src uv run python -m dealwatch.mcp list-tools --json`
- `PYTHONPATH=src uv run python -m dealwatch.mcp client-starters --json`
- `PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport stdio`
- `GET /api/runtime/readiness`
- `GET /api/runtime/builder-starter-pack`
- `POST /api/compare/preview`
- read-only watch, recovery, notification, and store-onboarding reads

## Deferred

- write-side MCP
- hosted auth
- formal SDK packaging
- public recommendation support
- generic remote-safe operator automation

## Internal-only

- `maintenance`
- `bootstrap-owner`
- legacy bridge commands
- provider webhook or secret-bearing flows
- maintainer-only browser debug commands

## Hard boundaries

- Do not present DealWatch as a hosted SaaS.
- Do not present DealWatch as an official plugin for Codex, Claude Code, OpenHands, OpenCode, or OpenClaw.
- Do not invent write-side MCP.
- Do not treat browser debug lane commands as public builder APIs.
- Do not bypass compare preview and jump straight to durable state assumptions.

## Safe summary sentence

DealWatch is a local-first, read-only decision backend for compare-first grocery price intelligence.
