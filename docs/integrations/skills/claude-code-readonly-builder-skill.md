# DealWatch Builder Skill For Claude Code

Use this skill when Claude Code is connected to DealWatch through the local MCP server or local HTTP runtime.

## Goal

Treat DealWatch as a local-first, compare-first, read-only product truth surface.

## Do first

1. inspect the shipped MCP tool inventory
2. inspect runtime readiness
3. inspect the builder starter pack contract
4. run compare preview before assuming any URL deserves durable state
5. stay on read-only product truth unless a human explicitly opens a separate operator lane

## Hard boundaries

- Do not present DealWatch as a hosted SaaS.
- Do not present DealWatch as an official Claude Code plugin.
- Do not invent write-side MCP.
- Do not treat browser debug lane commands as public builder APIs.
- Do not bypass compare preview and jump straight to durable state assumptions.
