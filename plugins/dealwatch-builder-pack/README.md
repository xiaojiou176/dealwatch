# DealWatch Builder Pack

This bundle turns the current DealWatch builder frontdoor into concrete platform-native package
artifacts for the platforms that already expose official plugin systems today.

It currently ships:

- `.claude-plugin/plugin.json` for Claude Code plugin packaging
- `.codex-plugin/plugin.json` for Codex plugin packaging
- `.mcp.json` for the shared local DealWatch MCP wiring
- `skills/dealwatch-readonly-builder/SKILL.md` for the safe-first route and boundary reminders

Use this pack when you want a repo-owned distribution candidate that still points back to the
same local-first DealWatch runtime.

## Safe First Flow

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. one read-only detail route

## Boundaries

- Not officially listed in any marketplace or registry yet.
- Not a hosted control plane.
- Not a write-side MCP surface.
- Not proof that every supported client has a native package today.
