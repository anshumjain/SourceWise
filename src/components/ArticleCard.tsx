import Image from "next/image";
import Link from "next/link";
import type { EditionResponse } from "@/lib/types";
import type { NewsLanguage } from "@/lib/language";
import { getUiCopy } from "@/lib/ui-copy";
import { ShareButton } from "./ShareButton";
import { SentimentBar } from "./SentimentBar";

type Article = EditionResponse["articles"][number];

interface ArticleCardProps {
  article: Article;
  editionDate: string;
  siteUrl: string;
  expanded?: boolean;
  language?: NewsLanguage;
  onOpenArticle?: (article: Article) => void;
}

function ArticleImage({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900/70">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900/70 dark:to-stone-800/70"
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
  language = "en",
  onOpenArticle,
}: ArticleCardProps) {
  const ui = getUiCopy(language);
  const shareUrl = `${siteUrl}/article/${article.id}`;
  const summaryPreview =
    article.summary.length > 180 && !expanded
      ? `${article.summary.slice(0, 180).trim()}…`
      : article.summary;

  const openReader = () => onOpenArticle?.(article);

  const headlineContent = expanded ? (
    article.headline
  ) : onOpenArticle ? (
    <button
      type="button"
      onClick={openReader}
      className="text-left transition hover:text-emerald-800 dark:hover:text-emerald-300"
    >
      {article.headline}
    </button>
  ) : (
    <Link
      href={`/article/${article.id}`}
      className="transition hover:text-emerald-800 dark:hover:text-emerald-300"
    >
      {article.headline}
    </Link>
  );

  const imageTrigger = onOpenArticle ? (
    <button
      type="button"
      onClick={openReader}
      className="block w-full text-left"
    >
      <ArticleImage imageUrl={article.imageUrl} />
    </button>
  ) : (
    <Link href={`/article/${article.id}`} className="block">
      <ArticleImage imageUrl={article.imageUrl} />
    </Link>
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-200/50 transition hover:border-stone-300 hover:shadow-md hover:shadow-stone-200/60 dark:border-stone-800 dark:bg-stone-950/60 dark:shadow-none dark:hover:border-stone-700">
      <div className="flex h-full flex-col">
        {imageTrigger}

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

          <h2
            className={`font-serif text-lg font-semibold leading-snug text-stone-900 dark:text-stone-50 ${expanded ? "" : "line-clamp-3"}`}
          >
            {headlineContent}
          </h2>

          <p
            className={`mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300 ${expanded ? "" : "line-clamp-4 flex-1"}`}
          >
            {summaryPreview}
          </p>

          <div className={`mt-4 ${expanded ? "" : "shrink-0"}`}>
            <div className="flex flex-wrap items-center gap-3">
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
      </div>
    </article>
  );
}
