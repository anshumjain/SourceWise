import { PrismaClient } from "@prisma/client";
import { publishDailyEdition } from "../src/lib/edition";
import { getIstDateString } from "../src/lib/ist";

const prisma = new PrismaClient();

async function main() {
  const date = getIstDateString();
  const existing = await prisma.edition.findUnique({ where: { date } });

  if (existing) {
    console.log(`Edition for ${date} already exists. Skipping seed.`);
    return;
  }

  const edition = await publishDailyEdition(date);
  console.log(`Seeded edition ${edition.date} with ${edition.articles.length} articles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
