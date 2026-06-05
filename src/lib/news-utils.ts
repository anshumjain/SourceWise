import {
  itemBelongsInCategory,
  pickBetterCategoryItem,
} from "./category-classifier";
import type { RawNewsItem } from "./types";
import { prismaCategoryToSlug } from "./types";
import type { Article } from "@prisma/client";

const OPINION_KEYWORDS = [
  "opinion",
  "editorial",
  "analysis",
  "column",
  "commentary",
  "viewpoint",
];

export function isLikelyOpinionPiece(item: RawNewsItem): boolean {
  const haystack = `${item.headline} ${item.summary} ${item.sourceUrl}`.toLowerCase();
  return OPINION_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase();
  }
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "says",
  "say",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
]);

function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }
  return intersection / (a.size + b.size - intersection);
}

function shingleSet(tokens: string[], size = 3): Set<string> {
  const shingles = new Set<string>();
  if (tokens.length === 0) return shingles;
  if (tokens.length <= size) {
    shingles.add(tokens.join(" "));
    return shingles;
  }
  for (let i = 0; i <= tokens.length - size; i += 1) {
    shingles.add(tokens.slice(i, i + size).join(" "));
  }
  return shingles;
}

export function titleSimilarity(a: string, b: string): number {
  const tokensA = normalizeTitle(a);
  const tokensB = normalizeTitle(b);

  const wordSim = jaccardSimilarity(new Set(tokensA), new Set(tokensB));
  const shingleSim = jaccardSimilarity(shingleSet(tokensA), shingleSet(tokensB));

  // Blend: shingles catch word-order similarity; words catch paraphrases.
  return 0.55 * shingleSim + 0.45 * wordSim;
}

export function dedupeNewsItems(items: RawNewsItem[]): RawNewsItem[] {
  const byUrl = new Map<string, RawNewsItem>();

  for (const item of items) {
    if (isLikelyOpinionPiece(item)) continue;
    if (!itemBelongsInCategory(item, item.category)) continue;

    const normalized = normalizeUrl(item.sourceUrl);
    const existing = byUrl.get(normalized);
    if (existing) {
      byUrl.set(normalized, pickBetterCategoryItem(existing, item));
      continue;
    }
    byUrl.set(normalized, item);
  }

  const result: RawNewsItem[] = [];

  for (const item of byUrl.values()) {
    const similar = result.find(
      (existing) => titleSimilarity(existing.headline, item.headline) > 0.72,
    );
    if (similar) {
      const index = result.indexOf(similar);
      result[index] = pickBetterCategoryItem(similar, item);
      continue;
    }
    result.push(item);
  }

  return result;
}

export function articleToRawNewsItem(article: Article): RawNewsItem {
  return {
    language: article.language as RawNewsItem["language"],
    category: prismaCategoryToSlug(article.category),
    headline: article.headline,
    summary: article.summary,
    sourceUrl: article.sourceUrl,
    sourceName: article.sourceName,
    publishedAt: article.publishedAt,
    videoUrl: article.videoUrl ?? undefined,
    imageUrl: article.imageUrl,
  };
}

export function isDuplicateOfExisting(
  item: RawNewsItem,
  existing: RawNewsItem[],
): boolean {
  const normalized = normalizeUrl(item.sourceUrl);
  for (const prior of existing) {
    if (normalizeUrl(prior.sourceUrl) === normalized) return true;
    if (
      prior.category === item.category &&
      titleSimilarity(prior.headline, item.headline) > 0.72
    ) {
      return true;
    }
  }
  return false;
}

/** Dedupe new candidates against the edition (feeds already category-filtered). */
export function filterNewCandidates(
  candidates: RawNewsItem[],
  existing: RawNewsItem[],
): RawNewsItem[] {
  const deduped = dedupeNewsItems(candidates);
  return deduped.filter(
    (item) =>
      itemBelongsInCategory(item, item.category) &&
      !isDuplicateOfExisting(item, existing),
  );
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

/** Strip RSS/HTML markup so summaries never show raw tags or hrefs. */
export function stripHtmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  return decodeHtmlEntities(withoutScripts.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

const JUNK_SUMMARY_PATTERNS = [
  /choose your reason below/i,
  /click on the report button/i,
  /alert our moderators/i,
  /your reason has been reported/i,
  /reported to the admin/i,
  /please refresh the page or try again/i,
  /sign in to read/i,
  /subscribe (?:now )?to read/i,
  /this (?:content|article) is (?:free|available) for premium/i,
  /add (?:as )?my\s*['']?s\s*['']?standard/i,
  /^\s*read more\s*$/i,
  /^\s*comments?\s*\(\d+\)\s*$/i,
  /^\s*share this (?:article|story)\s*$/i,
  /^\s*follow us on/i,
  /cookie(?:s)? (?:policy|settings)/i,
];

export function isJunkSummary(text: string, headline = ""): boolean {
  const cleaned = sanitizeSummary(text);
  if (!cleaned) return true;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 8) return true;

  if (JUNK_SUMMARY_PATTERNS.some((pattern) => pattern.test(cleaned))) {
    return true;
  }

  if (headline && titleSimilarity(cleaned, headline) > 0.88) {
    return true;
  }

  return false;
}

export function sanitizeSummary(text: string, fallback = ""): string {
  const cleaned = stripHtmlToText(text);
  return cleaned || stripHtmlToText(fallback);
}

export function trimSummary(text: string, maxWords = 100): string {
  const cleaned = sanitizeSummary(text);
  if (!cleaned) return "";

  const words = cleaned.split(" ");
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function extractParagraphCandidates(html: string): string[] {
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => sanitizeSummary(match[1]))
    .filter((text) => text.length > 40);

  return paragraphs;
}

/** Pick the best non-boilerplate summary from RSS fields and HTML content. */
export function buildArticleSummary(
  candidates: string[],
  headline: string,
  maxWords = 100,
): string {
  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    const trimmed = trimSummary(raw, maxWords);
    if (trimmed && !isJunkSummary(trimmed, headline)) {
      return trimmed;
    }
  }

  return "";
}

export function resolveDisplaySummary(
  summary: string,
  headline: string,
  fallback = "Open the source link below for the full report.",
): string {
  const cleaned = sanitizeSummary(summary, headline);
  if (cleaned && !isJunkSummary(cleaned, headline)) {
    return cleaned;
  }
  return fallback;
}

export function rssSummaryCandidates(item: {
  contentSnippet?: string;
  content?: string;
  summary?: string;
  description?: string;
}): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    ordered.push(trimmed);
  };

  if (item.content) {
    for (const paragraph of extractParagraphCandidates(item.content)) {
      push(paragraph);
    }
  }

  push(item.description);
  push(item.summary);
  push(item.contentSnippet);

  if (item.content) {
    push(sanitizeSummary(item.content));
  }

  return ordered;
}
