import { ArticleFeed } from "@/components/ArticleFeed";
import { CategoryTabs } from "@/components/CategoryTabs";
import { EditionHero } from "@/components/EditionHero";
import { TopStories } from "@/components/TopStories";
import { getCurrentEdition, getTopStories } from "@/lib/edition";
import {
  buildEditionResponse,
  filterArticlesByCategory,
} from "@/lib/edition-response";
import { formatEditionDate } from "@/lib/ist";
import { parseLanguage } from "@/lib/language";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ category?: string; lang?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const language = parseLanguage(params.lang);
  const categoryParam = params.category;
  const activeCategory: CategorySlug | "all" =
    categoryParam === "politics" ||
    categoryParam === "sports" ||
    categoryParam === "science-tech"
      ? categoryParam
      : "all";

  let edition;
  try {
    edition = await getCurrentEdition(language);
  } catch (error) {
    console.error("Database connection failed:", error);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Database not connected</h1>
        <p className="mt-4 text-stone-600 dark:text-stone-300">
          Local dev needs a <strong>PostgreSQL</strong> URL in{" "}
          <code className="rounded bg-stone-200 px-1 dark:bg-stone-800">.env</code>.
          Your file still uses SQLite (<code>file:./dev.db</code>), but the app uses
          Neon/Postgres (same as Vercel).
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-stone-700 dark:text-stone-300">
          <li>
            Vercel → Project → Settings → Environment Variables → copy{" "}
            <code>DATABASE_URL</code> and <code>DATABASE_URL_UNPOOLED</code>
          </li>
          <li>Paste into <code>.env</code> (replace the old SQLite line)</li>
          <li>
            Run:{" "}
            <code className="rounded bg-stone-900 px-2 py-1 text-sm text-stone-100">
              npx prisma migrate deploy
            </code>{" "}
            then{" "}
            <code className="rounded bg-stone-900 px-2 py-1 text-sm text-stone-100">
              npm run fetch:daily-edition
            </code>
          </li>
          <li>Refresh this page — use <code>?lang=hi</code> for Hindi</li>
        </ol>
        <p className="mt-6 text-sm text-stone-500">
          Server is up:{" "}
          <a href="/api/health" className="text-emerald-700 underline dark:text-emerald-400">
            /api/health
          </a>
        </p>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!edition || edition.articles.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">
          {language === "hi" ? "अभी कोई संस्करण नहीं" : "No edition yet"}
        </h1>
        <p className="mt-4 text-stone-600 dark:text-stone-300">
          {language === "hi"
            ? "फ़ीड हर सुबह 9:00 बजे IST पर स्वचालित रूप से प्रकाशित होती है। पहला संस्करण क्रॉन जॉब के बाद दिखेगा।"
            : "The feed publishes automatically every morning at 9:00 AM IST via Vercel Cron. The first edition appears after that job runs."}
        </p>
      </div>
    );
  }

  const editionData = buildEditionResponse(edition, language);
  editionData.formattedDate = formatEditionDate(edition.date);
  const articles = filterArticlesByCategory(editionData.articles, activeCategory);

  const topRaw = await getTopStories(edition.date, language, 3);
  const topArticles = topRaw
    .map((row) => editionData.articles.find((article) => article.id === row.id))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  return (
    <>
      <EditionHero
        formattedDate={editionData.formattedDate}
        articleCount={editionData.articles.length}
        language={language}
      />

      <div className="sticky top-[65px] z-40 border-b border-stone-200 bg-stone-100/95 backdrop-blur-md sm:top-[73px] dark:border-stone-800 dark:bg-stone-950/70">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <CategoryTabs active={activeCategory} language={language} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {activeCategory === "all" && topArticles.length > 0 && (
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
            editionDate={edition.date}
            siteUrl={siteUrl}
            activeCategory={activeCategory}
            language={language}
          />
        )}
      </div>
    </>
  );
}
