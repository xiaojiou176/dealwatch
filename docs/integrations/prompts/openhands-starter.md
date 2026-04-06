# DealWatch Starter Prompt For OpenHands

Use this when OpenHands is consuming DealWatch through local MCP or local HTTP read paths.
The current wrapper translation lives in [`../recipes/openhands.md`](../recipes/openhands.md).

## What OpenHands should optimize for

- prove runtime readiness first
- preview compare truth before durable state assumptions
- read product truth without operator-side mutation

## Safe tool / route flow

1. `get_runtime_readiness`
2. `get_builder_starter_pack`
3. `compare_preview`
4. inspect watch/group reads only if the compare result is useful
5. inspect `get_recovery_inbox` and `get_store_onboarding_cockpit` when you need runtime or operator truth

## Unsafe assumptions

- write-side MCP is available
- hosted multi-tenant auth exists
- recommendation is already a builder-facing feature

## Starter prompt

```text
Treat DealWatch as a local-first backend that exposes read-only compare, watch, runtime, notification, and store-onboarding truth.
Always check runtime readiness first.
Inspect the builder starter pack contract before you widen the plan.
Use compare_preview as the safe first product action.
Keep all automation on the read path unless a human explicitly authorizes operator-owned write flows outside the current builder contract.
```
