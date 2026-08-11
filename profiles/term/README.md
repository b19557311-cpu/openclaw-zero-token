# Term agent profile

This directory contains the first safe behavior profile for a personal OpenClaw agent named Term.

It is designed to run through OpenClaw's existing Gateway and WebChat/Control UI:

- chat history and streaming
- model selection
- tool visibility and per-agent policy
- session reset, compaction, and abort controls
- optional multi-agent routing later

## Install into a local workspace

From the repository root:

```bash
mkdir -p ~/.openclaw/workspace-term
cp -R profiles/term/. ~/.openclaw/workspace-term/
openclaw config set agents.defaults.workspace "~/.openclaw/workspace-term"
openclaw config set agents.defaults.heartbeat.every "0m"
openclaw setup --workspace ~/.openclaw/workspace-term
openclaw gateway --port 18789
```

Then open the Control UI or WebChat shown by the Gateway.

## Provider rule

Use an officially supported provider, a self-hosted OpenAI-compatible endpoint such as LocalAI, or an authorized gateway. The profile does not capture browser cookies, bearer headers, refresh tokens, or private session data from third-party websites.

## Files

- `AGENTS.md`: operating rules and autonomy levels
- `SOUL.md`: tone and decision style
- `IDENTITY.md`: name and role
- `USER.md`: user preferences to fill in
- `BOOTSTRAP.md`: first-run questions
- `MEMORY.md`: memory boundary
