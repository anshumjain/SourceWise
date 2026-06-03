"use client";

import { ArticleFeed } from "@/components/ArticleFeed";
import { ArticleReaderProvider } from "@/components/ArticleReaderProvider";
import { TopStories } from "@/components/TopStories";
import type { NewsLanguage } from "@/lib/language";
import type { CategorySlug, EditionResponse } from "@/lib/types";

interface EditionFeedProps {
  articles: EditionResponse["articles"];
  topArticles: EditionResponse["articles"];
  editionDate: string;
  siteUrl: string;
  activeCategory: CategorySlug | "all";
  language: NewsLanguage;
  showTopStories: boolean;
}

export function EditionFeed({
  articles,
  topArticles,
  editionDate,
  siteUrl,
  activeCategory,
  language,
  showTopStories,
}: EditionFeedProps) {
  return (
    <ArticleReaderProvider
      editionDate={editionDate}
      siteUrl={siteUrl}
      language={language}
    >
      {showTopStories && topArticles.length > 0 && (
        <TopStories articles={topArticles} language={language} />
      )}

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
          {language === "hi"
            ? "आज के संस्करण में इस श्रेणी में कोई लेख नहीं है।"
            : "No articles in this category for today's edition."}
        </p>
      ) : (
        <ArticleFeed
          articles={articles}
          editionDate={editionDate}
          siteUrl={siteUrl}
          activeCategory={activeCategory}
          language={language}
        />
      )}
    </ArticleReaderProvider>
  );
}
