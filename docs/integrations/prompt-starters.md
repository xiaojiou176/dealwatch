# DealWatch Prompt Starters

These prompts are for builders who have already pointed a local client at the current DealWatch API / MCP truth.

They are intentionally read-first and local-first.

Before you use any client-specific starter, do this first:

1. read `docs/roadmaps/dealwatch-api-mcp-substrate-phase1.md`
2. run `PYTHONPATH=src uv run python -m dealwatch --help`
3. run `PYTHONPATH=src uv run python -m dealwatch.mcp list-tools --json`
4. inspect the builder starter pack contract
5. skim `docs/integrations/config-recipes.md`
6. skim `docs/integrations/examples/README.md`

## Shared rule before any prompt

Do not ask the client to mutate DealWatch objects as the first move.

Start with:

1. tool or route discovery
2. runtime readiness
3. builder starter pack contract
4. compare preview
5. existing watch or group reads
6. recovery, notification, or store cockpit reads

Also keep this boundary map in mind:

- stable now: readiness, builder starter pack reads, compare preview, watch/group reads, recovery inbox, notification reads, store reads, CLI discovery, read-only MCP discovery
- deferred: write-side MCP, hosted auth, SDK packaging, multi-tenant control plane
- internal-only: maintenance, bootstrap-owner, webhook/provider-secret paths, legacy bridge commands

## Shared starter skeleton

Use this when you want one repo-owned prompt before choosing a client-specific variant:

```text
Treat DealWatch as a local-first, read-only-first product truth surface.
Start by inspecting the shipped tool or route inventory.
Then check runtime readiness.
Then inspect the builder starter pack contract.
Then run compare preview before assuming any URL deserves durable product state.
After that, stay on read paths: watch tasks, watch groups, recovery inbox, notification settings, and store onboarding cockpit.
Explain which surfaces are stable now, which are deferred, and which remain internal-only.
Do not invent write-side MCP, hosted auth, SDK packaging, generic operator control, or public recommendation support.
```

## Repo-owned client prompt files

- `docs/integrations/prompts/claude-code-starter.md`
- `docs/integrations/prompts/codex-starter.md`
- `docs/integrations/prompts/openclaw-starter.md`
- `docs/integrations/prompts/openhands-starter.md`
- `docs/integrations/prompts/opencode-starter.md`
- `docs/integrations/config-recipes.md`
- `docs/integrations/recipes/claude-code.md`
- `docs/integrations/recipes/codex.md`
- `docs/integrations/recipes/openhands.md`
- `docs/integrations/recipes/opencode.md`
- `docs/integrations/recipes/openclaw.md`
- `docs/integrations/skills/README.md`
- `docs/integrations/skills/dealwatch-readonly-builder-skill.md`
- `docs/integrations/skills/claude-code-readonly-builder-skill.md`
- `docs/integrations/skills/codex-readonly-builder-skill.md`
- `docs/integrations/skills/openhands-readonly-builder-skill.md`
- `docs/integrations/skills/opencode-readonly-builder-skill.md`
- `docs/integrations/skills/openclaw-readonly-builder-skill.md`

## Claude Code Starter

```text
You are connected to a local-first DealWatch runtime.

Stay inside the current read-only builder contract.

First:
1. inspect the shipped MCP tool list
2. inspect runtime readiness
3. inspect the builder starter pack contract
4. preview compare truth for the submitted URLs
5. inspect existing watch tasks or watch groups only if the preview looks usable
6. explain which surfaces are stable now, which are deferred, and which still require owner or operator action

Do not assume write-side MCP, hosted auth, SDK packaging, or remote-safe operator control.
```

## Codex Starter

```text
Treat DealWatch as a local product-truth backend, not as a hosted automation platform.

Start in observation mode:
1. inspect the shipped tool or route inventory
2. read runtime readiness
3. inspect the builder starter pack contract
4. call compare preview
5. if compare output is useful, inspect watch task or watch group reads
6. summarize the stable surface inventory before proposing any deeper integration

Do not invent write-side support or recommend owner or operator mutations as if they were safe builder defaults.
```

## OpenHands Starter

```text
You are integrating against a local-first DealWatch runtime.

Use the current read-first contract:
- inspect the shipped MCP tool list
- runtime readiness
- builder starter pack contract
- compare preview
- recovery inbox
- notification settings or events
- store onboarding cockpit

Explain the boundary between stable now, deferred, and internal-only surfaces before suggesting any automation plan.
```

## OpenClaw Starter

```text
Treat DealWatch as a local-first, read-only product truth source inside OpenClaw.
Start with get_runtime_readiness, then get_builder_starter_pack, then compare_preview, then inspect one watch or watch-group detail only if the compare output looks usable.
Keep the flow on read-only surfaces: watch tasks, watch groups, recovery inbox, notification settings, and store onboarding cockpit truth.
Do not assume an official plugin, write-side MCP, hosted auth, SDK packaging, or remote-safe operator control.
If a plan depends on durable writes or operator-owned actions, stop and mark those paths as outside the current DealWatch builder contract.
```

## OpenCode Starter

```text
Use DealWatch as a local product truth source for compare-first grocery monitoring.

First do:
1. inspect the shipped MCP tool list
2. read runtime readiness
3. inspect the builder starter pack contract
4. run compare preview
5. inspect one existing watch task or watch group detail
6. summarize which surfaces are stable now versus deferred

Keep the integration local-first and read-only-first.
Do not present DealWatch as a hosted builder platform, official plugin, or write-capable remote control plane.
```
