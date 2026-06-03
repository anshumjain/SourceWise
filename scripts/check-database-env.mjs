import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const url = process.env.DATABASE_URL ?? "";
const unpooled = process.env.DATABASE_URL_UNPOOLED ?? "";

const isPostgres = (value) =>
  value.startsWith("postgresql://") || value.startsWith("postgres://");

if (!isPostgres(url)) {
  console.error(
    "\n❌ DATABASE_URL must be PostgreSQL (postgresql://…).\n" +
      "   Your .env is missing or still uses SQLite (file:./dev.db).\n" +
      "   Copy DATABASE_URL from Vercel → Settings → Environment Variables,\n" +
      "   paste into .env, then run: npx prisma migrate deploy\n",
  );
  process.exit(1);
}

if (!isPostgres(unpooled)) {
  console.error(
    "\n❌ DATABASE_URL_UNPOOLED must also be PostgreSQL.\n" +
      "   Use Neon’s direct (non-pooler) connection string for migrations.\n",
  );
  process.exit(1);
}

if (url.includes("USER:PASSWORD@HOST")) {
  console.error(
    "\n❌ Replace placeholder USER/PASSWORD/HOST in .env with your Neon URLs from Vercel.\n" +
      "   Pushing to git does not fix this — .env stays on your machine only.\n",
  );
  process.exit(1);
}
