import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticleById } from "@/lib/edition";
import { buildEditionResponse } from "@/lib/edition-response";
import { formatEditionDate } from "@/lib/ist";
import { CATEGORY_LABELS, prismaCategoryToSlug } from "@/lib/types";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!article) {
    return { title: "Article not found" };
  }

  return {
    title: article.headline,
    description: article.summary,
    openGraph: {
      title: article.headline,
      description: article.summary,
      url: `${siteUrl}/article/${article.id}`,
      type: "article",
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
    twitter: {
      card: article.imageUrl ? "summary_large_image" : "summary",
      title: article.headline,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const articleRecord = await getArticleById(id);

  if (!articleRecord) {
    notFound();
  }

  const editionData = buildEditionResponse({
    ...articleRecord.edition,
    articles: [articleRecord],
  });
  const article = editionData.articles[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const category = prismaCategoryToSlug(articleRecord.category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
      >
        ← Back to edition
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
        {CATEGORY_LABELS[category]} · {formatEditionDate(articleRecord.edition.date)}, IST
      </p>
      <div className="mt-4">
        <ArticleCard
          article={article}
          editionDate={articleRecord.edition.date}
          siteUrl={siteUrl}
          expanded
        />
      </div>
    </div>
  );
}
