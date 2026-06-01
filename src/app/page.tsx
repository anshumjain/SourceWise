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
import type { CategorySlug } from "@/lib/types";

export const revalidate = 300;

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const categoryParam = params.category;
  const activeCategory: CategorySlug | "all" =
    categoryParam === "politics" ||
    categoryParam === "sports" ||
    categoryParam === "science-tech"
      ? categoryParam
      : "all";

  const edition = await getCurrentEdition();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!edition) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">No edition yet</h1>
        <p className="mt-4 text-stone-600">
          The feed publishes every morning at 9:00 AM IST. Run the fetch script
          locally to preview.
        </p>
        <pre className="mt-4 rounded-lg bg-stone-900 p-4 text-sm text-stone-100">
          npm run db:push{"\n"}npm run fetch:daily-edition
        </pre>
      </div>
    );
  }

  const editionData = buildEditionResponse(edition);
  editionData.formattedDate = formatEditionDate(edition.date);
  const articles = filterArticlesByCategory(editionData.articles, activeCategory);

  const topRaw = await getTopStories(edition.date, 3);
  const topArticles = topRaw
    .map((row) => editionData.articles.find((article) => article.id === row.id))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  return (
    <>
      <EditionHero
        formattedDate={editionData.formattedDate}
        articleCount={editionData.articles.length}
      />

      <div className="sticky top-[65px] z-40 border-b border-stone-200 bg-stone-100/95 backdrop-blur-md sm:top-[73px] dark:border-stone-800 dark:bg-stone-950/70">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <CategoryTabs active={activeCategory} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {activeCategory === "all" && topArticles.length > 0 && (
          <TopStories articles={topArticles} />
        )}

        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
            No articles in this category for today&apos;s edition.
          </p>
        ) : (
          <ArticleFeed
            articles={articles}
            editionDate={edition.date}
            siteUrl={siteUrl}
            activeCategory={activeCategory}
          />
        )}
      </div>
    </>
  );
}
