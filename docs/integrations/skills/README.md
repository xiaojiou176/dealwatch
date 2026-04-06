# DealWatch Builder Skill Pack

This directory is for copyable skill cards that help coding agents stay inside the current DealWatch builder contract.

In plain English:

- prompt starters tell an agent what to do first in one session
- skill cards tell an agent what rules to keep following across the session
- neither one is a published marketplace listing, hosted integration, or SDK promise

Current skill cards:

- `claude-code-readonly-builder-skill.md`
- `codex-readonly-builder-skill.md`
- `dealwatch-readonly-builder-skill.md`
- `openhands-readonly-builder-skill.md`
- `opencode-readonly-builder-skill.md`
- `openclaw-readonly-builder-skill.md`

Use this directory when you want:

- one shared builder rule card that works across clients
- one client-specific wrapper when Claude Code, Codex, OpenHands, OpenCode, or OpenClaw needs a narrower rule set
- repo-owned skill cards without pretending there is already a published marketplace listing
- a companion to the recipe ledger in `../config-recipes.md` when you need client-specific wiring guidance plus session-long rules

The short version is: these skill cards are part of the repo-owned plugin-ready pack, not proof that a marketplace listing is already live.
