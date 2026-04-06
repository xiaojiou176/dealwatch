# DealWatch Starter Prompt For OpenClaw

Use this when OpenClaw is consuming DealWatch through local MCP or local HTTP read paths.
The current saved-registry translation lives in [`../recipes/openclaw.md`](../recipes/openclaw.md).

## Safe integration posture

- treat DealWatch as a local-first, read-only-first product truth backend
- start with runtime readiness and builder contract discovery before compare preview
- keep OpenClaw on observation and synthesis paths unless a human explicitly authorizes operator-owned write flows outside the current builder contract

## Repo-verified local handoff

```bash
PYTHONPATH=src uv run python -m dealwatch.mcp list-tools --json
PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport stdio
```

The commands above are repo-verified.
The current OpenClaw-side wrapper is also documented in the recipe file linked above.

## Starter prompt

```text
Use DealWatch as a local-first, read-only builder surface.
Start by inspecting the shipped MCP tool list and the builder starter pack contract.
Then read runtime readiness.
Then run compare_preview before assuming any URL deserves durable state.
After that, stay on read-only surfaces: watch tasks, watch groups, recovery inbox, notification settings, and the store onboarding cockpit.
Keep the integration local-first and read-only-first.
Do not present DealWatch as a hosted platform, official OpenClaw plugin, packaged SDK, or write-capable remote control plane.
If a plan requires maintenance, bootstrap-owner, provider webhook flows, or maintainer-only browser debug commands, stop and mark those as outside the current repo-supported builder surface.
```
