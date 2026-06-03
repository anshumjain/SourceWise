import { PrismaClient } from "@prisma/client";

function assertPostgresDatabaseUrl(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    return;
  }

  throw new Error(
    "DATABASE_URL must be PostgreSQL (postgresql://…). " +
      "Update .env — copy DATABASE_URL and DATABASE_URL_UNPOOLED from " +
      "Vercel → Project → Settings → Environment Variables (Neon). " +
      "Then run: npx prisma migrate deploy && npm run fetch:daily-edition",
  );
}

assertPostgresDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
