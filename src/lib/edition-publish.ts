import { prisma } from "./db";
import {
  CRON_PHASE_CONFIG,
  CRON_PHASE_ORDER,
  resolveCronPhase,
  type CronPhase,
  type LegacyCronPhase,
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

function articleCreateInput(item: RawNewsItem) {
  return {
    language: item.language,
    category: slugToPrismaCategory(item.category),
    headline: item.headline,
    summary: item.summary,
    sourceUrl: item.sourceUrl,
    sourceName: item.sourceName,
    publishedAt: item.publishedAt,
    videoUrl: item.videoUrl ?? null,
    imageUrl: item.imageUrl ?? null,
  };
}

async function getEditionForDate(date: string) {
  return prisma.edition.findUnique({
    where: { date },
    include: { articles: true },
  });
}

/** Wipe prior editions and create today's edition with articles in one step. */
async function replaceDailyEdition(date: string, items: RawNewsItem[]) {
  await prisma.vote.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.edition.deleteMany({});

  return prisma.edition.create({
    data: {
      date,
      articles: {
        create: items.map(articleCreateInput),
      },
    },
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

async function fetchAndSelectBatch(
  existing: RawNewsItem[],
  language: NewsLanguage,
  categories: CategorySlug[],
): Promise<RawNewsItem[]> {
  const fetched = await fetchNewsForCategories(language, categories);
  const novel = filterNewCandidates(fetched, existing);
  const selected = selectForRemainingQuota(
    novel,
    existing,
    language,
    categories,
  );

  if (selected.length === 0 && fetched.length > 0) {
    console.warn(
      `[${language}] ${categories.join(",")}: ${fetched.length} fetched, ${novel.length} after dedupe, 0 selected for quota`,
    );
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
    throw new Error(
      `Edition for ${date} not found — run en-politics-markets phase first`,
    );
  }

  const existing = edition.articles.map(articleToRawNewsItem);
  const toInsert = await fetchAndSelectBatch(existing, language, categories);

  if (toInsert.length === 0) {
    return { edition, added: 0, categories };
  }

  await prisma.article.createMany({
    data: toInsert.map((item) => ({
      editionId: edition.id,
      ...articleCreateInput(item),
    })),
  });

  const refreshed = await getEditionForDate(date);
  return {
    edition: refreshed!,
    added: toInsert.length,
    categories,
  };
}

/** First phase of the day: fetch content, then wipe and insert atomically. */
async function startDailyEdition(
  date: string,
  language: NewsLanguage,
  categories: CategorySlug[],
) {
  const toInsert = await fetchAndSelectBatch([], language, categories);

  if (toInsert.length === 0) {
    console.error(
      `[${date}] startDailyEdition: 0 articles selected for ${language} ${categories.join(",")}`,
    );
    const edition = await replaceDailyEdition(date, []);
    return { edition, added: 0, categories };
  }

  const edition = await replaceDailyEdition(date, toInsert);
  return { edition, added: toInsert.length, categories };
}

export async function runCronPhase(
  phase: CronPhase | LegacyCronPhase,
  dateString?: string,
) {
  const date = dateString ?? getIstDateString();
  const resolvedPhase = resolveCronPhase(phase);
  const config = CRON_PHASE_CONFIG[resolvedPhase];

  const existing = await getEditionForDate(date);

  const result =
    config.resetsEdition && !existing
      ? await startDailyEdition(date, config.language, config.categories)
      : await appendCategoryBatch(date, config.language, config.categories);

  return {
    phase: resolvedPhase,
    date,
    articleCount: result.edition.articles.length,
    added: result.added,
    categories: config.categories,
  };
}

/** Local / full publish: fetch all batches before any wipe so the DB is never left empty. */
export async function publishDailyEditionPhased(dateString?: string) {
  const date = dateString ?? getIstDateString();
  const cumulative: RawNewsItem[] = [];
  const allToInsert: RawNewsItem[] = [];

  for (const phase of CRON_PHASE_ORDER) {
    const config = CRON_PHASE_CONFIG[phase];
    const picked = await fetchAndSelectBatch(
      cumulative,
      config.language,
      config.categories,
    );
    cumulative.push(...picked);
    allToInsert.push(...picked);
  }

  if (allToInsert.length === 0) {
    throw new Error("No articles fetched for today's edition");
  }

  return replaceDailyEdition(date, allToInsert);
}
