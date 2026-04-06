# DealWatch Recipe For OpenCode

## Honest status

- DealWatch launch record: `repo-verified`
- OpenCode wrapper syntax: `official_wrapper_documented`
- Recipe kind: `official`
- Current posture: `local-first`, `read-only-first`, `compare-first`

## Repo-owned launch command

```bash
PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport stdio
```

## OpenCode wrapper example

OpenCode documents local MCP entries inside `opencode.jsonc`.
The current DealWatch translation looks like:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "dealwatch": {
      "type": "local",
      "command": ["uv", "run", "python", "-m", "dealwatch.mcp", "serve", "--transport", "stdio"],
      "environment": {
        "PYTHONPATH": "src"
      },
      "enabled": true
    }
  }
}
```

The same example lives in repo-owned form at [`../examples/opencode.jsonc`](../examples/opencode.jsonc).

## What is actually stable here

The current repo verifies the DealWatch-side handoff:

- local stdio launch
- builder starter pack contract
- prompt starter and skill card
- safe-first flow

OpenCode's docs now publish the local `mcp` config shape directly, so this wrapper can be treated as official syntax.

## Evidence basis

- Official docs: <https://opencode.ai/docs/mcp-servers/>
- Current repo-owned contract:
  - local DealWatch launch command
  - builder starter pack contract
  - prompt starter and skill card

## Safe-first flow

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. watch/group/runtime/store truth reads

## Stop line

Do not translate this recipe into:

- official OpenCode plugin wording
- hosted control-plane wording
- write-side operator control
