import { prisma } from "./db";
import {
  CRON_PHASE_CONFIG,
  CRON_PHASE_ORDER,
  type CronPhase,
} from "./cron-phases";
import { fetchNewsForCategories } from "./fetch-news";
import type { NewsLanguage } from "./language";
import { getIstDateString } from "./ist";
import {
  articleToRawNewsItem,
  filterNewCandidates,
} from "./news-utils";
import {
  publisherCountsForCategory,
  selectDiverseArticles,
} from "./source-mix";
import {
  getCategoryQuotas,
  slugToPrismaCategory,
  type CategorySlug,
  type RawNewsItem,
} from "./types";

export async function initializeDailyEdition(dateString?: string) {
  const date = dateString ?? getIstDateString();

  await prisma.vote.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.edition.deleteMany({});

  return prisma.edition.create({
    data: { date },
    include: { articles: true },
  });
}

async function getEditionForDate(date: string) {
  return prisma.edition.findUnique({
    where: { date },
    include: { articles: true },
  });
}

function countByCategory(
  items: RawNewsItem[],
  language: NewsLanguage,
  category: CategorySlug,
): number {
  return items.filter(
    (item) => item.language === language && item.category === category,
  ).length;
}

function selectForRemainingQuota(
  candidates: RawNewsItem[],
  existing: RawNewsItem[],
  language: NewsLanguage,
  categories: CategorySlug[],
): RawNewsItem[] {
  const quotas = getCategoryQuotas(language);
  const selected: RawNewsItem[] = [];

  for (const category of categories) {
    const quota = quotas[category];
    if (quota === 0) continue;

    const already = countByCategory(existing, language, category);
    const remaining = quota - already;
    if (remaining <= 0) continue;

    const publisherCounts = publisherCountsForCategory(existing, category);
    const categoryCandidates = candidates.filter(
      (item) => item.language === language && item.category === category,
    );

    const picked = selectDiverseArticles(
      categoryCandidates,
      remaining,
      category,
      publisherCounts,
    );

    if (picked.length < remaining) {
      console.warn(
        `[${language}] ${category}: added ${picked.length}/${remaining} in phase (${already + picked.length}/${quota} total)`,
      );
    }

    selected.push(...picked);
  }

  return selected;
}

export async function appendCategoryBatch(
  date: string,
  language: NewsLanguage,
  categories: CategorySlug[],
) {
  const edition = await getEditionForDate(date);
  if (!edition) {
    throw new Error(`Edition for ${date} not found — run init phase first`);
  }

  const existing = edition.articles.map(articleToRawNewsItem);
  const fetched = await fetchNewsForCategories(language, categories);
  const novel = filterNewCandidates(fetched, existing);
  const toInsert = selectForRemainingQuota(
    novel,
    existing,
    language,
    categories,
  );

  if (toInsert.length === 0) {
    return { edition, added: 0, categories };
  }

  await prisma.article.createMany({
    data: toInsert.map((item) => ({
      editionId: edition.id,
      language: item.language,
      category: slugToPrismaCategory(item.category),
      headline: item.headline,
      summary: item.summary,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
      publishedAt: item.publishedAt,
      videoUrl: item.videoUrl ?? null,
      imageUrl: item.imageUrl ?? null,
    })),
  });

  const refreshed = await getEditionForDate(date);
  return {
    edition: refreshed!,
    added: toInsert.length,
    categories,
  };
}

export async function runCronPhase(phase: CronPhase, dateString?: string) {
  const date = dateString ?? getIstDateString();
  const config = CRON_PHASE_CONFIG[phase];

  if (phase === "init") {
    const edition = await initializeDailyEdition(date);
    return { phase, date, articleCount: edition.articles.length, added: 0 };
  }

  if (!config.language) {
    throw new Error(`Phase ${phase} is missing language configuration`);
  }

  const result = await appendCategoryBatch(
    date,
    config.language,
    config.categories,
  );

  return {
    phase,
    date,
    articleCount: result.edition.articles.length,
    added: result.added,
    categories: config.categories,
  };
}

/** Runs every phase sequentially — useful for local scripts and manual full publish. */
export async function publishDailyEditionPhased(dateString?: string) {
  const date = dateString ?? getIstDateString();

  for (const phase of CRON_PHASE_ORDER) {
    await runCronPhase(phase, date);
  }

  const edition = await getEditionForDate(date);
  if (!edition) {
    throw new Error("Phased publish failed to create edition");
  }

  return edition;
}
