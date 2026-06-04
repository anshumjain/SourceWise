import type { NewsLanguage } from "./language";

export type CategorySlug =
  | "politics"
  | "sports"
  | "science-tech"
  | "markets";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  politics: "Politics",
  sports: "Sports",
  "science-tech": "Science & Technology",
  markets: "Markets",
};

export const CATEGORY_LABELS_HI: Record<CategorySlug, string> = {
  politics: "राजनीति",
  sports: "खेल",
  "science-tech": "विज्ञान और तकनीक",
  markets: "Markets",
};

export function getCategoryLabel(
  category: CategorySlug,
  language: NewsLanguage,
): string {
  return language === "hi" ? CATEGORY_LABELS_HI[category] : CATEGORY_LABELS[category];
}

const CATEGORY_QUOTAS_BASE: Record<
  Exclude<CategorySlug, "markets">,
  number
> = {
  politics: 50,
  sports: 20,
  "science-tech": 20,
};

const MARKETS_QUOTA_EN = 20;

/** @deprecated Use getCategoryQuotas(language) */
export const CATEGORY_QUOTAS: Record<CategorySlug, number> = {
  ...CATEGORY_QUOTAS_BASE,
  markets: MARKETS_QUOTA_EN,
};

export function getCategoryQuotas(
  language: NewsLanguage,
): Record<CategorySlug, number> {
  if (language === "en") {
    return { ...CATEGORY_QUOTAS_BASE, markets: MARKETS_QUOTA_EN };
  }
  return { ...CATEGORY_QUOTAS_BASE, markets: 0 };
}

export const CATEGORY_SLUGS: CategorySlug[] = [
  "politics",
  "sports",
  "science-tech",
  "markets",
];

export function getCategorySlugs(language: NewsLanguage): CategorySlug[] {
  if (language === "en") return CATEGORY_SLUGS;
  return CATEGORY_SLUGS.filter((slug) => slug !== "markets");
}

export type PrismaCategory =
  | "POLITICS"
  | "SPORTS"
  | "SCIENCE_TECH"
  | "MARKETS";

export function slugToPrismaCategory(slug: CategorySlug): PrismaCategory {
  const map: Record<CategorySlug, PrismaCategory> = {
    politics: "POLITICS",
    sports: "SPORTS",
    "science-tech": "SCIENCE_TECH",
    markets: "MARKETS",
  };
  return map[slug];
}

export function prismaCategoryToSlug(category: string): CategorySlug {
  const map: Record<PrismaCategory, CategorySlug> = {
    POLITICS: "politics",
    SPORTS: "sports",
    SCIENCE_TECH: "science-tech",
    MARKETS: "markets",
  };
  return map[category as PrismaCategory] ?? "politics";
}

export interface SentimentSnapshot {
  editionDate: string;
  goodVotes: number;
  badVotes: number;
  totalVotes: number;
  goodPercent: number;
  badPercent: number;
}

export interface EditionResponse {
  date: string;
  formattedDate: string;
  articles: Array<{
    id: string;
    headline: string;
    summary: string;
    category: CategorySlug;
    categoryLabel: string;
    sourceUrl: string;
    sourceName: string;
    publishedAt: string;
    videoUrl: string | null;
    imageUrl: string | null;
    goodVotes: number;
    badVotes: number;
    totalVotes: number;
    goodPercent: number;
    badPercent: number;
  }>;
}

export interface RawNewsItem {
  language: NewsLanguage;
  category: CategorySlug;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  videoUrl?: string;
  imageUrl?: string | null;
}
