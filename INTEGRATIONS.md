# Integrations

DealWatch keeps the builder and agent-client story in one canonical place:

- [`docs/integrations/README.md`](./docs/integrations/README.md)
- [`plugins/dealwatch-builder-pack/README.md`](./plugins/dealwatch-builder-pack/README.md)
- [`docs/roadmaps/dealwatch-api-mcp-substrate-phase1.md`](./docs/roadmaps/dealwatch-api-mcp-substrate-phase1.md)

Use this file when you want the shortest truthful answer to:

> "Where do I start if I want to wire Codex, Claude Code, OpenHands, OpenCode, OpenClaw, or another agent client to DealWatch?"

Current truth:

- DealWatch already exposes a local-first, read-only-first builder surface through HTTP, MCP, CLI exports, starter prompts, and skill cards.
- Claude Code and Codex already have repo-owned native bundle candidates under [`plugins/dealwatch-builder-pack/`](./plugins/dealwatch-builder-pack/).
- OpenHands, OpenCode, and OpenClaw currently ship repo-owned recipes / skill cards / listing-prep assets, not live official listings.
- No hosted auth, write-side MCP, SDK product, or official marketplace listing should be claimed from this file.

Think of this page as a thin front desk, not a second integration handbook.
