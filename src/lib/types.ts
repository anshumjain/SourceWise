import type { NewsLanguage } from "./language";

export type CategorySlug = "politics" | "sports" | "science-tech";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  politics: "Politics",
  sports: "Sports",
  "science-tech": "Science & Technology",
};

export const CATEGORY_LABELS_HI: Record<CategorySlug, string> = {
  politics: "राजनीति",
  sports: "खेल",
  "science-tech": "विज्ञान और तकनीक",
};

export function getCategoryLabel(
  category: CategorySlug,
  language: NewsLanguage,
): string {
  return language === "hi" ? CATEGORY_LABELS_HI[category] : CATEGORY_LABELS[category];
}

export const CATEGORY_QUOTAS: Record<CategorySlug, number> = {
  politics: 50,
  sports: 20,
  "science-tech": 20,
};

export const CATEGORY_SLUGS: CategorySlug[] = [
  "politics",
  "sports",
  "science-tech",
];

export type PrismaCategory = "POLITICS" | "SPORTS" | "SCIENCE_TECH";

export function slugToPrismaCategory(slug: CategorySlug): PrismaCategory {
  const map: Record<CategorySlug, PrismaCategory> = {
    politics: "POLITICS",
    sports: "SPORTS",
    "science-tech": "SCIENCE_TECH",
  };
  return map[slug];
}

export function prismaCategoryToSlug(category: string): CategorySlug {
  const map: Record<PrismaCategory, CategorySlug> = {
    POLITICS: "politics",
    SPORTS: "sports",
    SCIENCE_TECH: "science-tech",
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
