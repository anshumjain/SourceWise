import { prisma } from "./db";
import { fetchDailyNews } from "./fetch-news";
import { getIstDateString } from "./ist";
import { slugToPrismaCategory } from "./types";

/** Publishes today's edition at 9 AM IST. Wipes all prior editions, articles, and votes. */
export async function publishDailyEdition(dateString?: string) {
  const date = dateString ?? getIstDateString();
  const items = await fetchDailyNews();

  await prisma.vote.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.edition.deleteMany({});

  const edition = await prisma.edition.create({
    data: {
      date,
      articles: {
        create: items.map((item) => ({
          category: slugToPrismaCategory(item.category),
          headline: item.headline,
          summary: item.summary,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          publishedAt: item.publishedAt,
          videoUrl: item.videoUrl ?? null,
          imageUrl: item.imageUrl ?? null,
        })),
      },
    },
    include: { articles: true },
  });

  return edition;
}

export async function getCurrentEdition() {
  return prisma.edition.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      articles: {
        orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
      },
    },
  });
}

export async function getEditionByDate(dateString: string) {
  return prisma.edition.findUnique({
    where: { date: dateString },
    include: {
      articles: {
        orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
      },
    },
  });
}

export async function getTopStories(editionDate: string, limit = 3) {
  const articles = await prisma.article.findMany({
    where: { edition: { date: editionDate } },
  });

  return articles
    .map((article) => ({
      ...article,
      totalVotes: article.goodVotes + article.badVotes,
    }))
    .filter((article) => article.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, limit);
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: { edition: true },
  });
}
