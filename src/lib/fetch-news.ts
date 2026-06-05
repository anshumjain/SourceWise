import Parser from "rss-parser";
import type { NewsLanguage } from "./language";
import { textMatchesLanguage } from "./language-detect";
import {
  getCategoryQuotas,
  type CategorySlug,
  type RawNewsItem,
} from "./types";
import { itemBelongsInCategory } from "./category-classifier";
import { dedupeNewsItems, trimSummary } from "./news-utils";
import { generateMockNews } from "./mock-news";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Sourcewise/1.0 (+https://sourcewise.in; news aggregator)",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

function extractImageUrl(item: Parser.Item): string | undefined {
  const extended = item as Parser.Item & {
    mediaContent?: { $?: { url?: string } };
    mediaThumbnail?: { $?: { url?: string } };
  };
  if (item.enclosure?.type?.startsWith("image/") && item.enclosure.url) {
    return item.enclosure.url;
  }

  const mediaContent = extended.mediaContent;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  const mediaThumbnail = extended.mediaThumbnail;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  const html = item.content || item.summary || "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return undefined;
}

interface FeedSource {
  name: string;
  url: string;
  category: CategorySlug;
}

export const RSS_SOURCES_EN: FeedSource[] = [
  {
    name: "The Hindu National",
    url: "https://www.thehindu.com/news/national/?service=rss",
    category: "politics",
  },
  {
    name: "Indian Express India",
    url: "https://indianexpress.com/section/india/feed/",
    category: "politics",
  },
  {
    name: "LiveMint News",
    url: "https://www.livemint.com/rss/news",
    category: "politics",
  },
  {
    name: "BBC India",
    url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    category: "politics",
  },
  {
    name: "NDTV Top Stories",
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    category: "politics",
  },
  {
    name: "The Hindu Sport",
    url: "https://www.thehindu.com/sport/?service=rss",
    category: "sports",
  },
  {
    name: "Indian Express Sports",
    url: "https://indianexpress.com/section/sports/feed/",
    category: "sports",
  },
  {
    name: "ESPN Cricinfo India",
    url: "https://www.espncricinfo.com/rss/content/story/feeds/6.xml",
    category: "sports",
  },
  {
    name: "The Hindu Sci-Tech",
    url: "https://www.thehindu.com/sci-tech/?service=rss",
    category: "science-tech",
  },
  {
    name: "Indian Express Technology",
    url: "https://indianexpress.com/section/technology/feed/",
    category: "science-tech",
  },
  {
    name: "LiveMint Technology",
    url: "https://www.livemint.com/rss/technology",
    category: "science-tech",
  },
  {
    name: "LiveMint Markets",
    url: "https://www.livemint.com/rss/markets",
    category: "markets",
  },
  {
    name: "LiveMint Companies",
    url: "https://www.livemint.com/rss/companies",
    category: "markets",
  },
  {
    name: "Indian Express Business",
    url: "https://indianexpress.com/section/business/feed/",
    category: "markets",
  },
  {
    name: "Economic Times Markets",
    url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    category: "markets",
  },
  {
    name: "Economic Times Stocks",
    url: "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
    category: "markets",
  },
  {
    name: "Moneycontrol Latest",
    url: "https://www.moneycontrol.com/rss/latestnews.xml",
    category: "markets",
  },
  {
    name: "Moneycontrol Business",
    url: "https://www.moneycontrol.com/rss/business.xml",
    category: "markets",
  },
  {
    name: "The Hindu Business",
    url: "https://www.thehindu.com/business/Economy/?service=rss",
    category: "markets",
  },
  {
    name: "Business Line Markets",
    url: "https://www.thehindubusinessline.com/markets/?service=rss",
    category: "markets",
  },
  {
    name: "NDTV Profit",
    url: "https://feeds.feedburner.com/ndtvprofit-latest",
    category: "markets",
  },
];

export const RSS_SOURCES_HI: FeedSource[] = [
  {
    name: "BBC Hindi",
    url: "https://feeds.bbci.co.uk/hindi/rss.xml",
    category: "politics",
  },
  {
    name: "Aaj Tak",
    url: "https://www.aajtak.in/rssfeeds/?id=home",
    category: "politics",
  },
  {
    name: "BBC Hindi India",
    url: "https://feeds.bbci.co.uk/hindi/india/rss.xml",
    category: "politics",
  },
  {
    name: "Amar Ujala National",
    url: "https://www.amarujala.com/rss/india-news.xml",
    category: "politics",
  },
  {
    name: "Amar Ujala India",
    url: "https://www.amarujala.com/rss/national.xml",
    category: "politics",
  },
  {
    name: "BBC Hindi Sport",
    url: "https://feeds.bbci.co.uk/hindi/sport/rss.xml",
    category: "sports",
  },
  {
    name: "Amar Ujala Sports",
    url: "https://www.amarujala.com/rss/sports.xml",
    category: "sports",
  },
  {
    name: "ABP Sports",
    url: "https://www.abplive.com/sports/feed",
    category: "sports",
  },
  {
    name: "Amar Ujala Tech",
    url: "https://www.amarujala.com/rss/technology.xml",
    category: "science-tech",
  },
  {
    name: "ABP Tech",
    url: "https://www.abplive.com/technology/feed",
    category: "science-tech",
  },
  {
    name: "Jagran Tech Hindi",
    url: "https://tools.jagran.com/rss/jagranhindi/jagrantechhindinews.xml",
    category: "science-tech",
  },
];

/** @deprecated Use RSS_SOURCES_EN */
export const RSS_SOURCES = RSS_SOURCES_EN;

function sourcesForLanguage(language: NewsLanguage): FeedSource[] {
  return language === "hi" ? RSS_SOURCES_HI : RSS_SOURCES_EN;
}

async function fetchFeed(
  source: FeedSource,
  language: NewsLanguage,
): Promise<RawNewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? [])
      .map((item) => {
        const content = item.contentSnippet || item.content || item.summary || "";
        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
        const enclosure = item.enclosure?.url;
        const videoUrl =
          enclosure && /\.(mp4|webm)|youtube|youtu\.be/i.test(enclosure)
            ? enclosure
            : undefined;

        const headline = (item.title ?? "Untitled").trim();
        const summary =
          trimSummary(content || headline) || trimSummary(headline);

        return {
          language,
          category: source.category,
          headline,
          summary,
          sourceUrl: item.link ?? source.url,
          sourceName: source.name,
          publishedAt,
          videoUrl,
          imageUrl: extractImageUrl(item),
        } satisfies RawNewsItem;
      })
      .filter((item) => itemBelongsInCategory(item, source.category))
      .filter((item) =>
        textMatchesLanguage(item.headline, item.summary, language),
      );
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error);
    return [];
  }
}

async function fetchNewsApi(
  category: CategorySlug,
  language: NewsLanguage,
): Promise<RawNewsItem[]> {
  if (language === "hi") return [];

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const categoryMap: Record<CategorySlug, string> = {
    politics: "general",
    sports: "sports",
    "science-tech": "technology",
    markets: "business",
  };

  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("country", "in");
  url.searchParams.set("category", categoryMap[category]);
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return [];
    const data = (await response.json()) as {
      articles?: Array<{
        title?: string;
        description?: string;
        url?: string;
        source?: { name?: string };
        publishedAt?: string;
        urlToImage?: string;
      }>;
    };

    return (data.articles ?? [])
      .map((article) => ({
        language: "en" as const,
        category,
        headline: (article.title ?? "Untitled").trim(),
        summary: trimSummary(article.description || article.title || ""),
        sourceUrl: article.url ?? "https://newsapi.org",
        sourceName: article.source?.name ?? "NewsAPI",
        publishedAt: article.publishedAt
          ? new Date(article.publishedAt)
          : new Date(),
        imageUrl: article.urlToImage,
      }))
      .filter((item) => itemBelongsInCategory(item, category))
      .filter((item) =>
        textMatchesLanguage(item.headline, item.summary, language),
      );
  } catch (error) {
    console.error("NewsAPI fetch failed:", error);
    return [];
  }
}

function selectByQuota(
  items: RawNewsItem[],
  language: NewsLanguage,
): RawNewsItem[] {
  const deduped = dedupeNewsItems(items);
  const selected: RawNewsItem[] = [];

  for (const [category, quota] of Object.entries(getCategoryQuotas(language)) as Array<
    [CategorySlug, number]
  >) {
    if (quota === 0) continue;
    const categoryItems = deduped
      .filter((item) => item.category === category)
      .filter((item) =>
        textMatchesLanguage(item.headline, item.summary, language),
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, quota);

    if (categoryItems.length < quota) {
      if (process.env.USE_MOCK_NEWS === "true") {
        const mockFill = generateMockNews(language)
          .filter((item) => item.category === category)
          .slice(0, quota - categoryItems.length)
          .map((item, index) => ({
            ...item,
            sourceName: `${item.sourceName} (fill)`,
            sourceUrl: `${item.sourceUrl}?fill=${index}`,
          }));
        selected.push(...categoryItems, ...mockFill);
      } else {
        selected.push(...categoryItems);
        console.warn(
          `[${language}] ${category}: only ${categoryItems.length}/${quota} articles from live sources`,
        );
      }
    } else {
      selected.push(...categoryItems);
    }
  }

  return selected;
}

/** Fetches daily articles for one language (90 for Hindi, 120 for English). */
export async function fetchDailyNews(
  language: NewsLanguage,
): Promise<RawNewsItem[]> {
  if (process.env.USE_MOCK_NEWS === "true") {
    return generateMockNews(language);
  }

  const sources = sourcesForLanguage(language);
  const feedResults = await Promise.all(
    sources.map((source) => fetchFeed(source, language)),
  );
  const apiCategories = Object.keys(getCategoryQuotas(language)).filter(
    (category) => getCategoryQuotas(language)[category as CategorySlug] > 0,
  ) as CategorySlug[];
  const apiResults = await Promise.all(
    apiCategories.map((category) => fetchNewsApi(category, language)),
  );

  const combined = [...feedResults.flat(), ...apiResults.flat()];
  return selectByQuota(combined, language);
}

/** English + Hindi editions combined (120 + 90 articles). */
export async function fetchAllDailyNews(): Promise<RawNewsItem[]> {
  const [en, hi] = await Promise.all([
    fetchDailyNews("en"),
    fetchDailyNews("hi"),
  ]);
  return [...en, ...hi];
}
