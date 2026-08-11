# Term agent foundation

This branch adds a safe behavior profile for building a personal autonomous agent on top of the OpenClaw gateway.

## What is already provided by OpenClaw

The repository already has the core interaction surface needed for the project:

- Gateway WebSocket transport
- WebChat/Control UI chat
- streaming responses and bounded history
- chat send, history, inject, and abort behavior
- model switching and session controls
- an agent workspace with `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`, and optional `MEMORY.md`
- per-agent workspaces and sessions
- tools catalog and effective runtime tool visibility
- per-agent and sub-agent tool policy
- multi-agent routing

That means Term does not need a second chat application for the first milestone. The Gateway remains the control plane and the existing WebChat/Control UI remains the user interface.

## Safe boundary

The original Zero Token fork adds browser-based provider clients that capture web-session credentials and make requests through consumer web UIs. This profile intentionally does not extend that mechanism.

Use one of these provider paths instead:

- an official provider integration
- a self-hosted OpenAI-compatible model server such as LocalAI
- an authorized model gateway
- a local model runtime

The model connection is kept separate from Term's behavior files so the agent can change providers without changing its identity or safety contract.

## First-run setup

From the repository root:

```bash
mkdir -p ~/.openclaw/workspace-term
cp -R profiles/term/. ~/.openclaw/workspace-term/
openclaw setup --workspace ~/.openclaw/workspace-term
openclaw config set agents.defaults.workspace "~/.openclaw/workspace-term"
openclaw config set agents.defaults.heartbeat.every "0m"
openclaw gateway --port 18789
```

Use the Control UI's configuration and agent panels to select the model and inspect currently available tools. Start with read-only or sandboxed capabilities.

## Autonomy contract

Term has four user-visible operating modes:

- **Chat**: conversation and drafts only.
- **Inspect**: reads permitted material and reports findings.
- **Plan**: produces a workflow without executing it.
- **Supervised/Autonomous**: executes bounded, approved workspace work.

The agent must pause for approval before external communication, deployment, purchases, deletion, credential use, or any irreversible action. Autonomous mode is limited to the exact approved scope, tool set, and stop condition.

## Acceptance test

A first successful test is:

1. Open WebChat/Control UI.
2. Ask Term to inspect a harmless local project.
3. Have it produce a short plan.
4. Approve one reversible workspace edit.
5. Have it run a non-destructive test or syntax check.
6. Inspect the result and change the mode back to Chat.

If the test fails, report whether the failure is in Gateway connection, authentication, model provider, tool policy, workspace access, or the agent's plan.

## Planned next milestones

1. Add an explicit model-routing configuration for the user's chosen authorized providers.
2. Add a small approval-aware orchestration extension with typed handoffs.
3. Connect a private knowledge base through an explicit MCP server, with read-only defaults.
4. Add Android-first setup and troubleshooting instructions.
5. Add tests for tool policy, approval boundaries, stop behavior, and bounded retries.

Do not mark the agent fully autonomous until those controls are tested end to end.
