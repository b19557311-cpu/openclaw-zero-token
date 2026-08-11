// Scans the repo for bundled plugin manifests and the community plugin list,
// and writes marketplace/data/registry.json plus an embedded copy in
// marketplace/site/index.html. Run with: pnpm marketplace:build
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const EXCLUDED_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".cache",
  "target",
  "vendor",
  "android",
  "ios",
  "fixtures",
  "test-fixtures",
  "__pycache__",
  ".venv",
  "venv",
  "marketplace",
]);

type PluginManifest = {
  id: string;
  name?: string;
  description?: string;
  version?: string;
  kind?: string;
  channels?: string[];
  providers?: string[];
  cliBackends?: string[];
  skills?: string[];
  enabledByDefault?: boolean;
};

type PackageJson = {
  name?: string;
  version?: string;
  description?: string;
  homepage?: string;
};

type BundledEntry = {
  id: string;
  name: string;
  description: string;
  version: string | null;
  category: "channel" | "provider" | "other";
  tags: string[];
  dir: string;
  packageName: string | null;
  enabledByDefault: boolean;
};

type CommunityEntry = {
  name: string;
  description: string;
  npm: string | null;
  repo: string | null;
  install: string | null;
};

function findManifestFiles(startDir: string): string[] {
  const results: string[] = [];
  const stack = [startDir];
  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) continue;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (EXCLUDED_DIR_NAMES.has(entry.name) || entry.name.startsWith(".")) continue;
        stack.push(path.join(currentDir, entry.name));
      } else if (entry.isFile() && entry.name === "openclaw.plugin.json") {
        results.push(path.join(currentDir, entry.name));
      }
    }
  }
  return results;
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function titleCase(id: string): string {
  return id
    .split(/[-_]/g)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function categorize(manifest: PluginManifest): { category: BundledEntry["category"]; tags: string[] } {
  const tags: string[] = [];
  if (manifest.channels && manifest.channels.length > 0) tags.push("channel");
  if (manifest.providers && manifest.providers.length > 0) tags.push("provider");
  if (manifest.cliBackends && manifest.cliBackends.length > 0) tags.push("cli-backend");
  if (manifest.kind) tags.push(manifest.kind);
  if (manifest.skills && manifest.skills.length > 0) tags.push("skills");
  const category: BundledEntry["category"] = tags.includes("channel")
    ? "channel"
    : tags.includes("provider")
      ? "provider"
      : "other";
  return { category, tags: tags.length > 0 ? tags : ["other"] };
}

function buildBundledEntries(): BundledEntry[] {
  const manifestPaths = findManifestFiles(REPO_ROOT).sort();
  const byId = new Map<string, BundledEntry>();

  for (const manifestPath of manifestPaths) {
    const manifest = readJson<PluginManifest>(manifestPath);
    if (!manifest || !manifest.id) continue;

    const pluginDir = path.dirname(manifestPath);
    const relDir = path.relative(REPO_ROOT, pluginDir).split(path.sep).join("/");
    const pkg = readJson<PackageJson>(path.join(pluginDir, "package.json"));
    const { category, tags } = categorize(manifest);

    const entry: BundledEntry = {
      id: manifest.id,
      name: manifest.name ?? titleCase(manifest.id),
      description: manifest.description ?? pkg?.description ?? "",
      version: manifest.version ?? pkg?.version ?? null,
      category,
      tags,
      dir: relDir,
      packageName: pkg?.name ?? null,
      enabledByDefault: manifest.enabledByDefault ?? false,
    };

    const existing = byId.get(entry.id);
    if (!existing) {
      byId.set(entry.id, entry);
      continue;
    }
    // Prefer the canonical extensions/<id> copy over legacy root-level duplicates.
    const existingIsCanonical = existing.dir.startsWith("extensions/");
    const candidateIsCanonical = entry.dir.startsWith("extensions/");
    if (candidateIsCanonical && !existingIsCanonical) {
      byId.set(entry.id, entry);
    }
  }

  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function parseCommunityPlugins(): CommunityEntry[] {
  const communityDocPath = path.join(REPO_ROOT, "docs", "plugins", "community.md");
  let text: string;
  try {
    text = fs.readFileSync(communityDocPath, "utf8");
  } catch {
    return [];
  }

  const listedSectionMatch = text.match(/## Listed plugins\s*\n([\s\S]*)$/);
  if (!listedSectionMatch) return [];
  const section = listedSectionMatch[1];

  const entries: CommunityEntry[] = [];
  const blockRegex = /-\s+\*\*(.+?)\*\*\s+—\s+(.+?)\n((?:\s+\S.*\n?)*)/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(section)) !== null) {
    const [, name, description, metaBlock] = match;
    const npmMatch = metaBlock.match(/npm:\s*`([^`]+)`/);
    const repoMatch = metaBlock.match(/repo:\s*`([^`]+)`/);
    const installMatch = metaBlock.match(/install:\s*`([^`]+)`/);
    entries.push({
      name: name.trim(),
      description: description.trim(),
      npm: npmMatch ? npmMatch[1].trim() : null,
      repo: repoMatch ? repoMatch[1].trim() : null,
      install: installMatch ? installMatch[1].trim() : null,
    });
  }
  return entries;
}

function main(): void {
  const bundled = buildBundledEntries();
  const community = parseCommunityPlugins();

  const registry = {
    generatedAt: new Date().toISOString(),
    counts: {
      bundled: bundled.length,
      channels: bundled.filter((entry) => entry.category === "channel").length,
      providers: bundled.filter((entry) => entry.category === "provider").length,
      other: bundled.filter((entry) => entry.category === "other").length,
      community: community.length,
    },
    bundled,
    community,
  };

  const dataDir = path.join(__dirname, "..", "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dataPath = path.join(dataDir, "registry.json");
  fs.writeFileSync(dataPath, JSON.stringify(registry, null, 2) + "\n", "utf8");

  const siteTemplatePath = path.join(__dirname, "..", "site", "index.template.html");
  const siteOutputPath = path.join(__dirname, "..", "site", "index.html");
  const template = fs.readFileSync(siteTemplatePath, "utf8");
  const embedded = template.replace(
    "/*__REGISTRY_DATA__*/ null",
    JSON.stringify(registry).replace(/</g, "\\u003c"),
  );
  fs.writeFileSync(siteOutputPath, embedded, "utf8");

  console.log(
    `[marketplace] wrote ${path.relative(REPO_ROOT, dataPath)} ` +
      `(${bundled.length} bundled, ${community.length} community) and ` +
      `${path.relative(REPO_ROOT, siteOutputPath)}`,
  );
}

main();
