import { publishDailyEdition } from "../src/lib/edition";
import { getIstDateString, formatEditionDate } from "../src/lib/ist";

async function main() {
  const dateArg = process.argv[2];
  const date = dateArg ?? getIstDateString();

  console.log(`Publishing Sourcewise edition for ${formatEditionDate(date)} (${date})…`);
  console.log(`USE_MOCK_NEWS=${process.env.USE_MOCK_NEWS ?? "false"}`);

  const edition = await publishDailyEdition(date);

  console.log(`Published ${edition.articles.length} articles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db");
    await prisma.$disconnect();
  });
