# DealWatch Recipe For Codex

## Honest status

- DealWatch launch record: `repo-verified`
- Codex wrapper syntax: `official_wrapper_documented`
- Recipe kind: `official`
- Current posture: `local-first`, `read-only-first`, `compare-first`
- Official docs: `https://developers.openai.com/codex/mcp/`

## Codex wrapper example

Codex now has an official MCP config surface in `~/.codex/config.toml`.
For DealWatch, the cleanest current translation is to pair that official wrapper with the repo-owned HTTP-facing transport:

```bash
PYTHONPATH=src uv run python -m dealwatch.mcp serve --transport streamable-http
```

The current Codex config then looks like:

```toml
[mcp_servers.dealwatch]
url = "http://127.0.0.1:8000/mcp"
```

You can also register the same endpoint from the CLI:

```bash
codex mcp add dealwatch --url http://127.0.0.1:8000/mcp
```

The same example lives in repo-owned form at [`../examples/codex-mcp-config.toml`](../examples/codex-mcp-config.toml).

## What is actually stable here

This repo verifies the DealWatch side of the handoff:

- the local streamable HTTP launch command above
- the read-only MCP inventory
- the builder starter pack contract
- the safe-first flow

Codex's own docs now document the MCP page, the config file location, and the `mcp_servers.<name>` / `codex mcp add ... --url ...` shape directly.
That makes the wrapper syntax itself official, while DealWatch still keeps the product promise read-only-first and local-first.

## Evidence basis

- Official docs: <https://developers.openai.com/codex/mcp>
- Officially documented wrapper surface:
  - `~/.codex/config.toml`
  - `[mcp_servers.<name>]`
- `url`
- `codex mcp add ... --url ...`

## Safe-first flow

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. one watch/group detail read
5. `get_recovery_inbox` or `get_store_onboarding_cockpit`

## Stop line

Do not translate this recipe into:

- "DealWatch runs on Codex"
- packaged SDK claims
- official plugin claims
- write-side MCP assumptions
