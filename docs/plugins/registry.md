---
summary: "Extension Marketplace: a free, generated browsing site for bundled + community plugins"
read_when:
  - You want to browse available OpenClaw plugins in one place
  - You want to know how a plugin gets listed or how to regenerate the site
title: "Extension Marketplace"
---

# Extension Marketplace

The Extension Marketplace is a free, static registry site listing every
plugin available for OpenClaw — channels, providers, and other bundled
extensions, plus community plugins from [Community plugins](/plugins/community).
There is no selling here, just discovery: search and filter what's
available, then wire it up via the [plugin manifest](/plugins/manifest) and
your `plugins.*` config.

For **skills** (versioned, publishable capability bundles), use
[ClawHub](/tools/clawhub) instead — that's OpenClaw's existing hosted skill
registry.

## Where it lives

- `marketplace/scripts/build-registry.ts` — scans the repo for every
  `openclaw.plugin.json`, dedupes root-level vs. `extensions/<id>` copies,
  and parses `docs/plugins/community.md` for community entries.
- `marketplace/data/registry.json` — the generated data (bundled + community
  plugins, with counts).
- `marketplace/site/index.template.html` — the page template. Do not edit
  `marketplace/site/index.html` directly — it is generated.
- `marketplace/site/index.html` — the generated, self-contained page. Open it
  directly in a browser (no server needed) or host it as a static file.

## Regenerating the site

Bundled plugin data comes from `openclaw.plugin.json` manifests already
required by the plugin system (see [Plugin manifest](/plugins/manifest)), so
the registry stays accurate without executing any plugin code. Whenever a
plugin manifest changes, or a new community plugin is added to
`docs/plugins/community.md`, rebuild the site:

```bash
pnpm marketplace:build
```

## Adding a plugin to the marketplace

- **Bundled plugin**: ship a valid `openclaw.plugin.json` under
  `extensions/<id>/` (see [Plugin manifest](/plugins/manifest)). It is picked
  up automatically on the next `pnpm marketplace:build`.
- **Community plugin**: follow the submission path in
  [Community plugins](/plugins/community) — once your PR lands there, it
  shows up in the marketplace on the next rebuild.
