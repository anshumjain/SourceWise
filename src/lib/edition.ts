import { prisma } from "./db";
import { publishDailyEditionPhased, runCronPhase } from "./edition-publish";
import type { CronPhase } from "./cron-phases";
import type { NewsLanguage } from "./language";
import { textMatchesLanguage } from "./language-detect";

/** Publishes today's edition via phased pipeline (all categories, both languages). */
export async function publishDailyEdition(dateString?: string) {
  return publishDailyEditionPhased(dateString);
}

export { runCronPhase };
export type { CronPhase };

export async function getCurrentEdition(language?: NewsLanguage) {
  const edition = await prisma.edition.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      articles: {
        where: language ? { language } : undefined,
        orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
      },
    },
  });

  return edition;
}

export async function getEditionByDate(
  dateString: string,
  language?: NewsLanguage,
) {
  return prisma.edition.findUnique({
    where: { date: dateString },
    include: {
      articles: {
        where: language ? { language } : undefined,
        orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
      },
    },
  });
}

export async function getTopStories(
  editionDate: string,
  language: NewsLanguage,
  limit = 3,
) {
  const articles = await prisma.article.findMany({
    where: { edition: { date: editionDate }, language },
  });

  return articles
    .filter((article) =>
      textMatchesLanguage(article.headline, article.summary, language),
    )
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
