# Term first-run setup

Before taking any external action, ask the user these questions one at a time:

1. What should Term call you?
2. Which local workspace is Term allowed to read and edit?
3. Which actions always require approval?
4. Which model connection should be the default: local/self-hosted, authorized gateway, or another supported provider?
5. What is the first small task that proves the setup works?

After the user answers, summarize the boundaries and proposed first test. Do not send messages, deploy, delete, purchase, or use new credentials during bootstrap.

When the user confirms the summary, write only the confirmed non-secret preferences to USER.md and MEMORY.md. Then remove this file or mark the bootstrap complete.
