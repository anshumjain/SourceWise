"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { useArticleReader } from "@/components/ArticleReaderProvider";
import { useFeedView, ViewToggle } from "@/components/ViewToggle";
import type { NewsLanguage } from "@/lib/language";
import { getUiCopy } from "@/lib/ui-copy";
import {
  getCategoryLabel,
  CATEGORY_SLUGS,
  type CategorySlug,
  type EditionResponse,
} from "@/lib/types";

const PAGE_SIZE = 12;

type FeedItem =
  | { type: "header"; slug: CategorySlug; count: number }
  | { type: "article"; article: EditionResponse["articles"][number] };

interface ArticleFeedProps {
  articles: EditionResponse["articles"];
  editionDate: string;
  siteUrl: string;
  activeCategory: CategorySlug | "all";
  language?: NewsLanguage;
}

export function ArticleFeed({
  articles,
  editionDate,
  siteUrl,
  activeCategory,
  language = "en",
}: ArticleFeedProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [view, setView] = useFeedView();
  const copy = getUiCopy(language);
  const { openArticle } = useArticleReader();

  const feedItems = useMemo(() => {
    if (activeCategory !== "all") {
      return articles.map(
        (article): FeedItem => ({ type: "article", article })
      );
    }

    const items: FeedItem[] = [];
    for (const slug of CATEGORY_SLUGS) {
      const group = articles.filter((article) => article.category === slug);
      if (group.length === 0) continue;
      items.push({ type: "header", slug, count: group.length });
      for (const article of group) {
        items.push({ type: "article", article });
      }
    }
    return items;
  }, [activeCategory, articles]);

  const visibleItems = feedItems.slice(0, visibleCount);
  const containerClass =
    view === "grid"
      ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      : "flex flex-col gap-4";

  return (
    <>
      <div className="mb-5 flex items-center justify-end">
        <ViewToggle value={view} onChange={setView} />
      </div>

      <div className={containerClass}>
        {visibleItems.map((item) => {
          if (item.type === "header") {
            return (
              <div
                key={`header-${item.slug}`}
                className={`border-t border-stone-200 pt-8 dark:border-stone-800 ${
                  view === "grid" ? "md:col-span-2 xl:col-span-3" : ""
                }`}
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                      {copy.section}
                    </p>
                    <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
                      {getCategoryLabel(item.slug, language)}
                    </h2>
                  </div>
                  <span className="text-sm text-stone-400 dark:text-stone-500">
                    {copy.storiesCount(item.count)}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <ArticleCard
              key={item.article.id}
              article={item.article}
              editionDate={editionDate}
              siteUrl={siteUrl}
              layout={view}
              language={language}
              onOpenArticle={openArticle}
            />
          );
        })}
      </div>

      {visibleCount < feedItems.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-100 dark:shadow-none dark:hover:border-stone-700 dark:hover:bg-stone-900/40 dark:focus-visible:ring-offset-stone-950"
            aria-label={copy.aria.loadMoreStories}
          >
            {copy.aria.loadMoreStories}
          </button>
        </div>
      )}
    </>
  );
}
