import { getCategorySlugs } from "./types";
import type { CategorySlug, EditionResponse } from "./types";
import type { NewsLanguage } from "./language";

type Article = EditionResponse["articles"][number];

/** Round-robin mix for the All tab so the first page is not politics-only. */
export function interleaveArticlesByCategory(
  articles: Article[],
  language: NewsLanguage,
): Article[] {
  const slugs = getCategorySlugs(language);
  const buckets = slugs.map((slug) =>
    articles.filter((article) => article.category === slug),
  );

  const mixed: Article[] = [];
  const maxLen = Math.max(0, ...buckets.map((bucket) => bucket.length));

  for (let index = 0; index < maxLen; index += 1) {
    for (const bucket of buckets) {
      const article = bucket[index];
      if (article) mixed.push(article);
    }
  }

  return mixed;
}

export function groupArticlesByCategory(
  articles: Article[],
  language: NewsLanguage,
): Array<{ slug: CategorySlug; articles: Article[] }> {
  return getCategorySlugs(language)
    .map((slug) => ({
      slug,
      articles: articles.filter((article) => article.category === slug),
    }))
    .filter((group) => group.articles.length > 0);
}
