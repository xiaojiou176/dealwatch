# Builder Examples

These examples are intentionally small and boring.

That is a feature, not a bug.

They are meant to answer:

- what to inspect first
- what a minimal request looks like
- what a minimal read-side response shape looks like
- what a minimal MCP tool call shape looks like
- what a root-CLI builder contract response looks like when you want the same map without booting the API first

They are **not**:

- frozen SDK schemas
- hosted API guarantees
- write-side automation examples
- proof that every route or command visible in the repo is part of the builder front door

When you need client-specific wrapper honesty, pair these examples with:

- [`../config-recipes.md`](../config-recipes.md)
- the matching client recipe under [`../recipes/`](../recipes/)
- [`claude-code.mcp.json`](./claude-code.mcp.json)
- [`codex-mcp-config.toml`](./codex-mcp-config.toml)
- [`openhands-config.toml`](./openhands-config.toml)
- [`opencode.jsonc`](./opencode.jsonc)
- [`openclaw-mcp-servers.json`](./openclaw-mcp-servers.json)

Think of them like laminated sample forms at a front desk:

- they should be safe to copy
- they should reflect today's real field names
- they should not promise that every optional field or future auth story is already frozen forever

## Recommended order

### MCP-first builders

1. `mcp-list-tools.response.json`
2. `mcp-client-starters.response.json`
3. `mcp-runtime-readiness.call.json`
4. `mcp-builder-starter-pack.call.json`
5. `mcp-compare-preview.call.json`
6. `mcp-watch-task-detail.call.json`
7. `mcp-stdio.launch.json`
8. `claude-code.mcp.json`
9. `codex-mcp-config.toml`
10. `mcp-builder-client-config.call.json`
11. `mcp-builder-client-configs.call.json`

### HTTP-first builders

1. `runtime-readiness.response.json`
2. `http-builder-starter-pack.response.json`
3. `cli-builder-starter-pack.response.json`
4. `compare-preview.request.json`
5. `compare-preview.response.json`
6. `http-watch-task-detail.response.json`
7. `http-builder-client-config.response.json`
8. `cli-builder-client-config.response.json`
9. `http-builder-client-configs.response.json`
10. `cli-builder-client-configs.response.json`

## Files

| File | Why it exists |
| --- | --- |
| `mcp-list-tools.response.json` | repo-owned snapshot of the current read-only MCP inventory |
| `mcp-client-starters.response.json` | repo-owned starter metadata for Claude Code, Codex, OpenHands, OpenCode, and OpenClaw |
| `mcp-runtime-readiness.call.json` | safest first MCP call |
| `mcp-builder-starter-pack.call.json` | no-argument MCP call that returns the current builder contract and starter-doc map |
| `mcp-compare-preview.call.json` | compare-first MCP example |
| `mcp-watch-task-detail.call.json` | one stable detail-read MCP example |
| `mcp-stdio.launch.json` | client-agnostic stdio launch record |
| `mcp-builder-client-config.call.json` | direct MCP call shape for exporting one repo-owned client config example |
| `mcp-builder-client-configs.call.json` | direct MCP call shape for exporting the full all-clients config bundle |
| `claude-code.mcp.json` | repo-owned `.mcp.json` example for Claude Code's official project-scoped MCP wrapper |
| `codex-mcp-config.toml` | repo-owned `config.toml` example for Codex's official MCP wrapper |
| `openhands-config.toml` | repo-owned `config.toml` example for OpenHands' local MCP wrapper |
| `opencode.jsonc` | repo-owned `opencode.jsonc` example for OpenCode's local MCP wrapper |
| `openclaw-mcp-servers.json` | repo-owned `mcp.servers` example for OpenClaw's saved MCP registry |
| `cli-builder-client-config.response.json` | illustrative root-CLI export for a single builder client config |
| `http-builder-client-config.response.json` | illustrative HTTP export for a single builder client config |
| `cli-builder-client-configs.response.json` | illustrative root-CLI export for the all-clients config bundle |
| `http-builder-client-configs.response.json` | illustrative HTTP export for the all-clients config bundle |
| `runtime-readiness.response.json` | minimal readiness response shape for the first HTTP safety check, using the current top-level readiness ledger keys |
| `http-builder-starter-pack.response.json` | illustrative builder-contract response shape for the safest HTTP discovery path |
| `cli-builder-starter-pack.response.json` | illustrative root-CLI builder contract output for coding agents that want the same contract without starting the API first |
| `compare-preview.request.json` | minimal compare-first HTTP request body |
| `compare-preview.response.json` | illustrative compare preview response shape anchored to current schema and tests, including the current `risk_note_items` field |
| `http-watch-task-detail.response.json` | illustrative task detail shape for a stable HTTP read path |

## Recipe companion

These JSON examples deliberately stop short of freezing every client wrapper.
Use the recipe ledger in [`../config-recipes.md`](../config-recipes.md) when you need to know whether a wrapper is officially documented here or whether only the DealWatch launch record is repo-verified.

## Boundary reminder

If you are looking for:

- task creation payloads
- group creation payloads
- run-now automation
- maintenance flows
- owner bootstrap
- webhook or provider-secret examples

you are already outside the current phase-1 builder entrance layer.
