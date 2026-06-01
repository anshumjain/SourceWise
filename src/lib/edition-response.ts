import {
  CATEGORY_LABELS,
  prismaCategoryToSlug,
  type CategorySlug,
  type EditionResponse,
} from "./types";
import type { Article, Edition } from "@prisma/client";

export function buildEditionResponse(
  edition: Edition & { articles: Article[] }
): EditionResponse {
  return {
    date: edition.date,
    formattedDate: "",
    articles: edition.articles.map((article) => {
      const totalVotes = article.goodVotes + article.badVotes;
      const goodPercent =
        totalVotes === 0
          ? 50
          : Math.round((article.goodVotes / totalVotes) * 100);
      const badPercent = 100 - goodPercent;
      const category = prismaCategoryToSlug(article.category);

      return {
        id: article.id,
        headline: article.headline,
        summary: article.summary,
        category,
        categoryLabel: CATEGORY_LABELS[category],
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt.toISOString(),
        videoUrl: article.videoUrl,
        imageUrl: article.imageUrl,
        goodVotes: article.goodVotes,
        badVotes: article.badVotes,
        totalVotes,
        goodPercent,
        badPercent,
      };
    }),
  };
}

export function filterArticlesByCategory(
  articles: EditionResponse["articles"],
  category: CategorySlug | "all"
) {
  if (category === "all") return articles;
  return articles.filter((article) => article.category === category);
}
