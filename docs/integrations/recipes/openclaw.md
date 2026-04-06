# DealWatch Recipe For OpenClaw

## Honest status

- DealWatch launch record: `repo-verified`
- OpenClaw wrapper syntax: `official_wrapper_documented`
- Recipe kind: `official`
- Current posture: `local-first`, `read-only-first`, `compare-first`

## Repo-owned launch command

```bash
PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport stdio
```

## OpenClaw wrapper example

OpenClaw's MCP docs currently document saved MCP server definitions under `mcp.servers`.
The current DealWatch translation looks like:

```json
{
  "mcp": {
    "servers": {
      "dealwatch": {
        "command": "uv",
        "args": ["run", "python", "-m", "dealwatch.mcp", "serve", "--transport", "stdio"],
        "env": {
          "PYTHONPATH": "src"
        }
      }
    }
  }
}
```

The same example lives in repo-owned form at [`../examples/openclaw-mcp-servers.json`](../examples/openclaw-mcp-servers.json).

## What is actually stable here

The stable part is the DealWatch side:

- local MCP launch
- builder starter pack contract
- repo-owned prompt starter
- repo-owned skill card
- safe-first flow

OpenClaw's own docs now publish both `openclaw mcp serve` and the saved `mcp.servers` registry shape, so this config wrapper can be treated as official syntax.
That still does **not** upgrade DealWatch into an OpenClaw runtime base or official plugin.

## Evidence basis

- Current repo-owned contract:
  - local DealWatch launch command
  - builder starter pack contract
  - repo-owned prompt starter and skill card

## Safe-first flow

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. watch/group reads
5. `get_recovery_inbox` or `get_store_onboarding_cockpit`

## Stop line

Do not translate this recipe into:

- official plugin wording
- runtime-base wording
- write-side operator control
- hosted control-plane guarantees
