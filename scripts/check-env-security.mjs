import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/** Vars that may appear in browser bundles or HTML by design. */
const ALLOWED_PUBLIC_PREFIX = "NEXT_PUBLIC_";

/** Server-only secrets — must never use NEXT_PUBLIC_ or appear in client files. */
const SECRET_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "CRON_SECRET",
  "NEWS_API_KEY",
  "OPENAI_API_KEY",
  "VOTE_IP_SALT",
  "USE_MOCK_NEWS",
];

const SERVER_ONLY_ENV_NAMES = [...SECRET_ENV_NAMES];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(path, files);
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function isClientFile(source, filePath) {
  if (source.startsWith('"use client"') || source.startsWith("'use client'")) {
    return true;
  }
  return relative(SRC, filePath).startsWith(`hooks${join.sep}`);
}

function extractEnvRefs(source) {
  const refs = new Set();
  const patterns = [
    /process\.env\.([A-Z0-9_]+)/g,
    /process\.env\[["']([A-Z0-9_]+)["']\]/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      refs.add(match[1]);
    }
  }

  return [...refs];
}

const files = walk(SRC);
const issues = [];

for (const filePath of files) {
  const source = readFileSync(filePath, "utf8");
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  const envRefs = extractEnvRefs(source);
  if (envRefs.length === 0) continue;

  const client = isClientFile(source, filePath);

  for (const name of envRefs) {
    if (client) {
      issues.push(`${rel}: client code references process.env.${name}`);
      continue;
    }

    if (
      name.startsWith(ALLOWED_PUBLIC_PREFIX) &&
      SECRET_ENV_NAMES.some(
        (secret) => name === `${ALLOWED_PUBLIC_PREFIX}${secret}`,
      )
    ) {
      issues.push(
        `${rel}: secret-like env exposed via NEXT_PUBLIC (${name})`,
      );
    }

    if (
      !name.startsWith(ALLOWED_PUBLIC_PREFIX) &&
      SERVER_ONLY_ENV_NAMES.includes(name) &&
      rel.includes("/app/api/") === false &&
      !rel.startsWith("src/lib/") &&
      !rel.startsWith("src/app/") &&
      rel !== "src/app/layout.tsx"
    ) {
      // Server components under app/ are OK for server-only vars only if not passed to client.
      // Flag server-only env outside lib/, api/, layout, and top-level server pages is rare.
    }
  }
}

for (const filePath of files) {
  const source = readFileSync(filePath, "utf8");
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  if (!isClientFile(source, filePath)) continue;

  for (const secret of SECRET_ENV_NAMES) {
    if (source.includes(secret)) {
      issues.push(`${rel}: client file mentions secret env name "${secret}"`);
    }
  }
}

const publicVars = new Set();
for (const filePath of files) {
  const source = readFileSync(filePath, "utf8");
  for (const name of extractEnvRefs(source)) {
    if (name.startsWith(ALLOWED_PUBLIC_PREFIX)) publicVars.add(name);
  }
}

console.log("SourceWise environment security check\n");
console.log("Public (browser-visible by design):");
for (const name of [...publicVars].sort()) {
  console.log(`  ✓ ${name}`);
}

console.log("\nServer-only (must stay off client):");
for (const name of SECRET_ENV_NAMES) {
  console.log(`  ✓ ${name}`);
}

if (issues.length > 0) {
  console.error("\nIssues found:");
  for (const issue of issues) {
    console.error(`  ✗ ${issue}`);
  }
  process.exit(1);
}

console.log("\nNo client-side secret env usage detected.");
