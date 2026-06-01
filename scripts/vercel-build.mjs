import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn(
    "\n⚠️  DATABASE_URL is not set — skipping prisma migrate deploy.\n" +
      "   Add a Postgres DATABASE_URL in Vercel → Settings → Environment Variables,\n" +
      "   apply it to Production (and Preview if needed), then redeploy.\n",
  );
  process.exit(0);
}

// Neon: use unpooled URL for migrations (pooled URL can fail migrate deploy on Vercel).
const migrateUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL;

try {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: migrateUrl },
  });
} catch {
  console.error(
    "\n❌ prisma migrate deploy failed — continuing `next build` so Vercel can deploy.\n" +
      "   Ensure DATABASE_URL_UNPOOLED is set (Neon integration adds it).\n" +
      "   After deploy, run: npm run db:deploy (with production env) or fix migrations and redeploy.\n",
  );
}
