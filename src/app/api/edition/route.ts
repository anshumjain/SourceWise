import { NextResponse } from "next/server";
import { getCurrentEdition } from "@/lib/edition";
import { formatEditionDate } from "@/lib/ist";
import {
  CATEGORY_LABELS,
  prismaCategoryToSlug,
  type EditionResponse,
} from "@/lib/types";

export const revalidate = 300;

export async function GET() {
  const edition = await getCurrentEdition();

  if (!edition) {
    return NextResponse.json({ error: "No edition published yet" }, { status: 404 });
  }

  const response: EditionResponse = {
    date: edition.date,
    formattedDate: formatEditionDate(edition.date),
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

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
