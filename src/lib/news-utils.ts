import type { RawNewsItem } from "./types";

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

function titleSimilarity(a: string, b: string): number {
  const tokensA = normalizeTitle(a);
  const tokensB = normalizeTitle(b);

  const wordSim = jaccardSimilarity(new Set(tokensA), new Set(tokensB));
  const shingleSim = jaccardSimilarity(shingleSet(tokensA), shingleSet(tokensB));

  // Blend: shingles catch word-order similarity; words catch paraphrases.
  return 0.55 * shingleSim + 0.45 * wordSim;
}

export function dedupeNewsItems(items: RawNewsItem[]): RawNewsItem[] {
  const seenUrls = new Set<string>();
  const seenTitleKeys = new Set<string>();
  const result: RawNewsItem[] = [];

  for (const item of items) {
    if (isLikelyOpinionPiece(item)) continue;

    const normalized = normalizeUrl(item.sourceUrl);
    if (seenUrls.has(normalized)) continue;

    const titleKey = normalizeTitle(item.headline).slice(0, 12).join("-");
    if (titleKey.length > 0 && seenTitleKeys.has(titleKey)) continue;

    const duplicate = result.find(
      (existing) => titleSimilarity(existing.headline, item.headline) > 0.72
    );
    if (duplicate) continue;

    seenUrls.add(normalized);
    if (titleKey.length > 0) seenTitleKeys.add(titleKey);
    result.push(item);
  }

  return result;
}

export function trimSummary(text: string, maxWords = 100): string {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}
