# Anthropic setup for Term

This guide connects Term to Anthropic's official API integration. It does not use browser automation, captured cookies, consumer-session tokens, or the zero-token provider layer.

## What you need

- The Term branch installed on the machine that will run the OpenClaw Gateway.
- An Anthropic API key from the Anthropic Console.
- A little Anthropic API credit or billing enabled. API usage is not included automatically with a Claude app subscription.

The key must be entered on the **Gateway host**. Do not put it in GitHub, `USER.md`, `MEMORY.md`, a screenshot, or a chat message.

## Android/Termux first run

Run these commands in Termux on the Android device that will host the Gateway:

```bash
# From the OpenClaw repository root
cp -R profiles/term/. ~/.openclaw/workspace-term/
openclaw setup --workspace ~/.openclaw/workspace-term

# The wizard prompts for the key without putting it in a command or Git file.
openclaw onboard
```

In the onboarding wizard:

1. Choose **Anthropic API key**.
2. Paste the key only into the private prompt.
3. Choose the model shown by the wizard, or set the model explicitly after onboarding.
4. Keep the Term workspace at `~/.openclaw/workspace-term`.

Then select the default model and verify authentication:

```bash
openclaw config set agents.defaults.model.primary "anthropic/claude-opus-4-6"
openclaw models status
openclaw doctor
```

Start the Gateway:

```bash
openclaw gateway --port 18789
```

Open the Control UI/WebChat on the Gateway host. It uses the Gateway WebSocket and the Term workspace; no separate chat server is required.

## Non-interactive setup

If the key is already present as a server environment variable, the documented setup command is:

```bash
openclaw onboard --anthropic-api-key "$ANTHROPIC_API_KEY"
```

For a long-running service, store the key in the Gateway host's protected environment configuration, such as `~/.openclaw/.env`, or use the onboarding wizard. Never commit that file.

## First safe test

In WebChat, ask:

> Inspect the Term workspace and tell me what you are allowed to do. Do not edit anything.

Then test one harmless request:

> Create a short plan for organizing a project folder. Do not run commands or change files.

Keep Term in **Chat**, **Inspect**, or **Plan** mode until the provider and tool policies are confirmed.

## Troubleshooting

- **No API key found:** the key was added on a different machine or to a different agent. Run `openclaw models status` on the Gateway host and repeat onboarding for that agent.
- **401 or billing error:** verify the key is active in the Anthropic Console and that API billing/credit is available.
- **Gateway works but chat fails:** run `openclaw doctor`, then check `openclaw models status --probe`.
- **Android process stops:** keep Termux open while testing. A remote always-on host can be added later; do not expose the Gateway publicly without authentication.

## Security boundary

The Anthropic key authorizes model calls only. It does not grant Term permission to send messages, deploy, delete, purchase, or use unrelated private data. Those actions remain subject to the Term behavior profile and Gateway tool policy.
