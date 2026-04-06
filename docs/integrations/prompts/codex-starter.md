# DealWatch Starter Prompt For Codex

Use this after connecting Codex to the local DealWatch MCP server or the local HTTP runtime.
The current repo-owned Codex wrapper translation lives in [`docs/integrations/recipes/codex.md`](../recipes/codex.md).

## Safe first order

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. `list_watch_tasks` or `list_watch_groups`
5. one detail read
6. `get_recovery_inbox`
7. `get_store_onboarding_cockpit`

## Boundary reminder

Codex should treat DealWatch as:

- local-first
- read-only-first
- compare-first
- owner-scoped runtime truth

Codex should **not** treat DealWatch as:

- a hosted platform
- a write-capable MCP control plane
- a packaged SDK

## Starter prompt

```text
Connect to DealWatch as a local read-only truth surface.
Start with get_runtime_readiness, then get_builder_starter_pack, then compare_preview.
Use the compare result to decide what to inspect next, but do not create or mutate product state through MCP.
If you need durable writes, maintenance, owner bootstrap, or webhook behavior, stop and surface that those paths are outside the current builder contract.
```
