This directory holds DealWatch public skill bundles for external skill registries.

Each bundle here must ship four things together:

- `SKILL.md`: the agent-facing instructions
- `README.md`: the human-facing install and usage guide
- `references/`: bundle-local install, tool-map, and example-task notes
- `manifest.yaml`: registry metadata for hosts such as ClawHub

The bundle is only valid if an agent can answer all four questions without
leaving this directory:

1. How do I install the published MCP package?
2. Which read-only tools does the MCP expose?
3. What is the safe first workflow?
4. Which claims or actions stay out of bounds?
