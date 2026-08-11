# OpenClaw Extension Marketplace

A free, static registry of OpenClaw plugins — channels, providers, and other
bundled extensions, plus community plugins. No selling, just a searchable
list. For skills, see [ClawHub](https://clawhub.ai) instead.

## Layout

- `scripts/build-registry.ts` — scans the repo for every
  `openclaw.plugin.json`, dedupes root-level vs. canonical `extensions/<id>`
  copies, and parses `docs/plugins/community.md` for community entries.
  Reads manifests only; never executes plugin code.
- `data/registry.json` — generated output. Committed so the site works
  out of the box; regenerate after any plugin/manifest or community-list
  change.
- `site/index.template.html` — the page template. Edit this, not the
  generated file.
- `site/index.html` — generated, self-contained page (registry data is
  embedded inline). Open directly in a browser — no server or build step
  required to view it.

## Usage

```bash
pnpm marketplace:build
```

Then open `marketplace/site/index.html` in a browser.

See [docs/plugins/registry.md](../docs/plugins/registry.md) for the full
writeup, and [docs/plugins/community.md](../docs/plugins/community.md) for
how third-party plugins get listed.
