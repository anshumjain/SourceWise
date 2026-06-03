"use client";

import type { NewsLanguage } from "@/lib/language";
import { getUiCopy } from "@/lib/ui-copy";
import type { EditionResponse } from "@/lib/types";
import { useArticleReader } from "@/components/ArticleReaderProvider";

interface TopStoriesProps {
  articles: EditionResponse["articles"];
  language?: NewsLanguage;
}

export function TopStories({ articles, language = "en" }: TopStoriesProps) {
  const copy = getUiCopy(language);
  const { openArticle } = useArticleReader();

  if (articles.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          {copy.topStories.eyebrow}
        </p>
        <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          {copy.topStories.title}
        </h2>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {articles.map((article, index) => {
          const total = article.totalVotes;
          const goodPercent = article.goodPercent;

          return (
            <li
              key={article.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/60 dark:shadow-none"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white dark:bg-stone-50 dark:text-stone-900">
                  {index + 1}
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {copy.topStories.votes(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openArticle(article)}
                className="text-left font-serif text-base font-semibold leading-snug text-stone-900 hover:text-emerald-800 dark:text-stone-50 dark:hover:text-emerald-300"
              >
                {article.headline}
              </button>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-900/70">
                <div
                  className="h-full"
                  style={{
                    width: `${goodPercent}%`,
                    background: "#059669",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {copy.topStories.goodForCountry(goodPercent)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
