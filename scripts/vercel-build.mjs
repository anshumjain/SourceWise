import { execSync } from "node:child_process";

if (process.env.DATABASE_URL) {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.warn(
    "\n⚠️  DATABASE_URL is not set — skipping prisma migrate deploy.\n" +
      "   Add a Postgres DATABASE_URL in Vercel → Settings → Environment Variables,\n" +
      "   apply it to Production (and Preview if needed), then redeploy.\n",
  );
}
