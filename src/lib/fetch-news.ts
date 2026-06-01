import Parser from "rss-parser";
import type { RawNewsItem, CategorySlug } from "./types";
import { dedupeNewsItems, trimSummary } from "./news-utils";
import { generateMockNews } from "./mock-news";
import { CATEGORY_QUOTAS } from "./types";

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

export const RSS_SOURCES: FeedSource[] = [
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
];

async function fetchFeed(source: FeedSource): Promise<RawNewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? []).map((item) => {
      const content = item.contentSnippet || item.content || item.summary || "";
      const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
      const enclosure = item.enclosure?.url;
      const videoUrl =
        enclosure && /\.(mp4|webm)|youtube|youtu\.be/i.test(enclosure)
          ? enclosure
          : undefined;

      return {
        category: source.category,
        headline: (item.title ?? "Untitled").trim(),
        summary: trimSummary(content || item.title || ""),
        sourceUrl: item.link ?? source.url,
        sourceName: source.name,
        publishedAt,
        videoUrl,
        imageUrl: extractImageUrl(item),
      } satisfies RawNewsItem;
    });
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error);
    return [];
  }
}

async function fetchNewsApi(category: CategorySlug): Promise<RawNewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const categoryMap: Record<CategorySlug, string> = {
    politics: "general",
    sports: "sports",
    "science-tech": "technology",
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

    return (data.articles ?? []).map((article) => ({
      category,
      headline: (article.title ?? "Untitled").trim(),
      summary: trimSummary(article.description || article.title || ""),
      sourceUrl: article.url ?? "https://newsapi.org",
      sourceName: article.source?.name ?? "NewsAPI",
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt)
        : new Date(),
      imageUrl: article.urlToImage,
    }));
  } catch (error) {
    console.error("NewsAPI fetch failed:", error);
    return [];
  }
}

function selectByQuota(items: RawNewsItem[]): RawNewsItem[] {
  const deduped = dedupeNewsItems(items);
  const selected: RawNewsItem[] = [];

  for (const [category, quota] of Object.entries(CATEGORY_QUOTAS) as Array<
    [CategorySlug, number]
  >) {
    const categoryItems = deduped
      .filter((item) => item.category === category)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, quota);

    if (categoryItems.length < quota) {
      if (process.env.USE_MOCK_NEWS === "true") {
        const mockFill = generateMockNews()
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
          `${category}: only ${categoryItems.length}/${quota} articles fetched from live sources`
        );
      }
    } else {
      selected.push(...categoryItems);
    }
  }

  return selected;
}

export async function fetchDailyNews(): Promise<RawNewsItem[]> {
  if (process.env.USE_MOCK_NEWS === "true") {
    return generateMockNews();
  }

  const feedResults = await Promise.all(RSS_SOURCES.map(fetchFeed));
  const apiResults = await Promise.all(
    (["politics", "sports", "science-tech"] as CategorySlug[]).map(fetchNewsApi)
  );

  const combined = [...feedResults.flat(), ...apiResults.flat()];
  return selectByQuota(combined);
}
