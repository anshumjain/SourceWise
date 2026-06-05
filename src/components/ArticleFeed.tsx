"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { useArticleReader } from "@/components/ArticleReaderProvider";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { NewsLanguage } from "@/lib/language";
import { interleaveArticlesByCategory } from "@/lib/feed-interleave";
import type { CategorySlug, EditionResponse } from "@/lib/types";

const PAGE_SIZE = 12;

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
  const { openArticle } = useArticleReader();

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, language, articles]);

  const feedArticles = useMemo(() => {
    if (activeCategory !== "all") return articles;
    return interleaveArticlesByCategory(articles, language);
  }, [activeCategory, articles, language]);

  const visibleArticles = feedArticles.slice(0, visibleCount);
  const hasMore = visibleCount < feedArticles.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, feedArticles.length));
  }, [feedArticles.length]);

  const sentinelRef = useInfiniteScroll({
    enabled: hasMore,
    hasMore,
    onLoadMore: loadMore,
  });

  return (
    <>
      <div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            editionDate={editionDate}
            siteUrl={siteUrl}
            language={language}
            onOpenArticle={openArticle}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-10 h-8 w-full"
          aria-hidden="true"
        />
      )}
    </>
  );
}
