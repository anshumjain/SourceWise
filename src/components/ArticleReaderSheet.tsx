"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { NewsLanguage } from "@/lib/language";
import type { EditionResponse } from "@/lib/types";
import {
  getCachedArticleBody,
  setCachedArticleBody,
} from "@/lib/article-cache";
import { getUiCopy } from "@/lib/ui-copy";
import { SentimentBar } from "@/components/SentimentBar";
import { ShareButton } from "@/components/ShareButton";

type FeedArticle = EditionResponse["articles"][number];

interface ArticleReaderSheetProps {
  article: FeedArticle;
  editionDate: string;
  siteUrl: string;
  language: NewsLanguage;
  onClose: () => void;
}

function readInitialReaderState(articleId: string) {
  if (typeof window === "undefined") {
    return { body: null as string | null, isLoading: true, fromCache: false };
  }

  const cached = getCachedArticleBody(articleId);
  if (cached) {
    return { body: cached.content, isLoading: false, fromCache: true };
  }

  return { body: null, isLoading: true, fromCache: false };
}

export function ArticleReaderSheet({
  article,
  editionDate,
  siteUrl,
  language,
  onClose,
}: ArticleReaderSheetProps) {
  const copy = getUiCopy(language);
  const [body, setBody] = useState(
    () => readInitialReaderState(article.id).body,
  );
  const [isLoading, setIsLoading] = useState(
    () => readInitialReaderState(article.id).isLoading,
  );
  const [loadFailed, setLoadFailed] = useState(false);
  const [fromCache, setFromCache] = useState(
    () => readInitialReaderState(article.id).fromCache,
  );

  useEffect(() => {
    if (fromCache) return;

    let cancelled = false;

    async function loadArticleBody() {
      setIsLoading(true);
      setLoadFailed(false);
      setFromCache(false);

      try {
        const response = await fetch(
          `/api/read?url=${encodeURIComponent(article.sourceUrl)}`,
        );
        if (!response.ok) {
          throw new Error("read failed");
        }
        const data = (await response.json()) as { content?: string };
        if (!data.content) {
          throw new Error("empty content");
        }
        if (cancelled) return;
        setBody(data.content);
        setCachedArticleBody(article.id, data.content);
      } catch {
        if (cancelled) return;
        setLoadFailed(true);
        setBody(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadArticleBody();

    return () => {
      cancelled = true;
    };
  }, [article.id, article.sourceUrl, fromCache]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const shareUrl = `${siteUrl}/article/${article.id}`;
  const displayBody = body ?? article.summary;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={copy.aria.articleReader}
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/55 backdrop-blur-[2px]"
        aria-label={copy.aria.closeArticle}
        onClick={onClose}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-3xl dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-6 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {copy.reader.closeHint}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
            aria-label={copy.aria.closeArticle}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white dark:bg-stone-50 dark:text-stone-900">
              {article.categoryLabel}
            </span>
            <time className="text-xs text-stone-400 dark:text-stone-500">
              {new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(article.publishedAt))}
            </time>
          </div>

          <h2 className="font-serif text-2xl font-semibold leading-snug text-stone-900 sm:text-3xl dark:text-stone-50">
            {article.headline}
          </h2>

          {article.imageUrl && (
            <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900/70">
              <Image
                src={article.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                unoptimized
              />
            </div>
          )}

          <div className="mt-5 space-y-4 text-base leading-relaxed text-stone-700 dark:text-stone-300">
            {displayBody.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {isLoading && (
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
              {copy.reader.loading}
            </p>
          )}

          {loadFailed && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
              {copy.reader.loadFailed}
            </p>
          )}

          {fromCache && body && (
            <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
              {copy.reader.cachedNote}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {copy.readAtSource(article.sourceName)}
              <span aria-hidden="true">→</span>
            </a>
            <ShareButton
              title={article.headline}
              url={shareUrl}
              language={language}
            />
          </div>

          <div className="mt-6 border-t border-stone-200 pt-5 dark:border-stone-800">
            <SentimentBar
              articleId={article.id}
              editionDate={editionDate}
              initialGoodVotes={article.goodVotes}
              initialBadVotes={article.badVotes}
              category={article.category}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
