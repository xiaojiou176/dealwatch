# DealWatch Recipe For OpenHands

## Honest status

- DealWatch launch record: `repo-verified`
- OpenHands wrapper syntax: `official_wrapper_documented`
- Recipe kind: `official`
- Current posture: `observation-first`, `local-first`, `read-only-first`

## Repo-owned launch command

```bash
PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport stdio
```

## OpenHands wrapper example

OpenHands documents MCP server entries in `~/.openhands/config.toml`, including local `stdio_servers`.
The current local DealWatch translation looks like:

```toml
[mcp]
stdio_servers = [
  { name = "dealwatch", command = "uv", args = ["run", "python", "-m", "dealwatch.mcp", "serve", "--transport", "stdio"], env = { PYTHONPATH = "src" } }
]
```

The same example lives in repo-owned form at [`../examples/openhands-config.toml`](../examples/openhands-config.toml).

## What is actually stable here

The stable part is the DealWatch side:

- local stdio MCP launch
- read-only builder surface
- compare-first safe-first flow

OpenHands' own docs also document broader MCP server management.
DealWatch keeps the story smaller here:

- local-first
- direct read-first MCP entry
- no write-side expansion

## Evidence basis

- Official docs: <https://docs.openhands.dev/openhands/usage/cli/mcp-servers>
- Officially documented wrapper surface:
  - `~/.openhands/config.toml`
  - `[mcp]`
  - `stdio_servers`
  - `command`
  - `args`
  - `env`

## Safe-first flow

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. watch/group reads
5. `get_recovery_inbox`
6. `get_store_onboarding_cockpit`

## Stop line

Do not translate this recipe into:

- destructive automation by default
- hosted auth claims
- recommendation as a builder-facing feature
