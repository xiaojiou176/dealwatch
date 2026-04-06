# DealWatch Starter Prompt For OpenCode

This pack treats OpenCode as a generic local MCP/API client unless a stricter client contract is proven elsewhere.

## Safe integration posture

- use the shipped local MCP stdio command if OpenCode supports MCP registration
- otherwise consume the local HTTP read surfaces from the phase-1 substrate document
- keep the first loop read-only and compare-first

## Registration fact that is actually verified here

```bash
PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport stdio
```

The command above is repo-verified.
The current OpenCode wrapper shape is also documented in [`docs/integrations/recipes/opencode.md`](../recipes/opencode.md), so this repo now keeps both the launch record and one official local-config translation in view.

## Starter prompt

```text
Use DealWatch as a local compare-first truth backend.
Start with runtime readiness, then get_builder_starter_pack, then compare preview, then inspect watch/group/runtime/notification/store truth through read-only surfaces.
Do not assume OpenCode has any special DealWatch plugin or write-side control path.
If your plan requires durable writes, operator automation, hosted auth, or SDK semantics, stop and mark those as outside the current repo-supported builder surface.
```
