import Image from "next/image";
import Link from "next/link";
import type { EditionResponse } from "@/lib/types";
import type { NewsLanguage } from "@/lib/language";
import { getUiCopy } from "@/lib/ui-copy";
import type { FeedView } from "./ViewToggle";
import { ShareButton } from "./ShareButton";
import { SentimentBar } from "./SentimentBar";

type Article = EditionResponse["articles"][number];

interface ArticleCardProps {
  article: Article;
  editionDate: string;
  siteUrl: string;
  expanded?: boolean;
  layout?: FeedView;
  language?: NewsLanguage;
}

function ArticleImage({
  imageUrl,
  layout,
}: {
  imageUrl: string | null;
  layout: FeedView;
}) {
  const listClasses =
    layout === "list"
      ? "aspect-[16/10] w-full sm:w-40 sm:shrink-0"
      : "aspect-[16/10] w-full";

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-stone-100 dark:bg-stone-900/70 ${listClasses}`}>
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes={layout === "list" ? "160px" : "(max-width: 768px) 100vw, 400px"}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900/70 dark:to-stone-800/70 ${listClasses}`}
      aria-hidden="true"
    >
      <span className="font-serif text-2xl text-stone-400/70 dark:text-stone-500/80">
        S
      </span>
    </div>
  );
}

export function ArticleCard({
  article,
  editionDate,
  siteUrl,
  expanded = false,
  layout = "grid",
  language = "en",
}: ArticleCardProps) {
  const ui = getUiCopy(language);
  const shareUrl = `${siteUrl}/article/${article.id}`;
  const summaryPreview =
    article.summary.length > 180 && !expanded
      ? `${article.summary.slice(0, 180).trim()}…`
      : article.summary;

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-200/50 transition hover:border-stone-300 hover:shadow-md hover:shadow-stone-200/60 dark:border-stone-800 dark:bg-stone-950/60 dark:shadow-none dark:hover:border-stone-700">
      <div className={layout === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"}>
        <Link href={`/article/${article.id}`} className="block">
          <ArticleImage imageUrl={article.imageUrl} layout={layout} />
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white dark:bg-stone-50 dark:text-stone-900">
              {article.categoryLabel}
            </span>
            <div className="flex items-center gap-2">
              <time className="text-xs text-stone-400 dark:text-stone-500">
                {new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(article.publishedAt))}
              </time>
              <span
                className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600 dark:bg-stone-900/70 dark:text-stone-300"
                aria-label={ui.aria.totalVotes(article.totalVotes)}
              >
                {ui.votesCount(article.totalVotes)}
              </span>
              {!expanded && (
                <ShareButton
                  title={article.headline}
                  url={shareUrl}
                  compact
                  language={language}
                />
              )}
            </div>
          </div>

          <h2 className="font-serif text-lg font-semibold leading-snug text-stone-900 dark:text-stone-50">
            {expanded ? (
              article.headline
            ) : (
              <Link
                href={`/article/${article.id}`}
                className="transition hover:text-emerald-800 dark:hover:text-emerald-300"
              >
                {article.headline}
              </Link>
            )}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {summaryPreview}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {ui.readAtSource(article.sourceName)}
              <span aria-hidden="true">→</span>
            </a>
            {article.videoUrl && (
              <a
                href={article.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              >
                {ui.relatedVideo}
              </a>
            )}
          </div>

          {expanded && (
            <div className="mt-4">
              <ShareButton
                title={article.headline}
                url={shareUrl}
                language={language}
              />
            </div>
          )}

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
    </article>
  );
}
