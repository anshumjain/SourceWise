import type { CategorySlug } from "./types";
import type { RawNewsItem } from "./types";

/** Normalize feed label to publisher for diversity caps. */
export function publisherKey(sourceName: string): string {
  return sourceName
    .replace(
      /\s+(Markets|Companies|Stocks|Sport|Sports|Technology|Sci-Tech|News|Business|India|National|Top Stories|Profit|Latest|Tech Hindi|Hindi Sport|Hindi India).*$/i,
      "",
    )
    .trim();
}

const MAX_PER_PUBLISHER: Record<CategorySlug, number> = {
  politics: 14,
  sports: 8,
  "science-tech": 8,
  markets: 6,
};

export function publisherCountsForCategory(
  items: RawNewsItem[],
  category: CategorySlug,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.category !== category) continue;
    const key = publisherKey(item.sourceName);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function selectDiverseArticles(
  items: RawNewsItem[],
  quota: number,
  category: CategorySlug,
  existingPublisherCounts?: Map<string, number>,
): RawNewsItem[] {
  const maxPerPublisher = MAX_PER_PUBLISHER[category];
  const byPublisher = new Map<string, RawNewsItem[]>();

  for (const item of items) {
    const key = publisherKey(item.sourceName);
    const list = byPublisher.get(key) ?? [];
    list.push(item);
    byPublisher.set(key, list);
  }

  for (const list of byPublisher.values()) {
    list.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  const selected: RawNewsItem[] = [];
  const batchCounts = new Map<string, number>();

  const totalForPublisher = (publisher: string) =>
    (batchCounts.get(publisher) ?? 0) +
    (existingPublisherCounts?.get(publisher) ?? 0);

  while (selected.length < quota) {
    let added = false;

    for (const [publisher, queue] of byPublisher) {
      if (selected.length >= quota) break;
      if (totalForPublisher(publisher) >= maxPerPublisher) continue;

      const next = queue.shift();
      if (!next) continue;

      selected.push(next);
      batchCounts.set(publisher, (batchCounts.get(publisher) ?? 0) + 1);
      added = true;
    }

    if (!added) break;
  }

  return selected;
}
