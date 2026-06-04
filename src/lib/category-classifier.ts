import type { CategorySlug, RawNewsItem } from "./types";

const SPORTS_URL_PATTERNS = [
  /\/sport(?:s)?(?:\/|$)/i,
  /\/cricket(?:\/|$)/i,
  /\/football(?:\/|$)/i,
  /\/hockey(?:\/|$)/i,
  /\/tennis(?:\/|$)/i,
  /\/khel(?:\/|$)/i,
  /\/sports-news(?:\/|$)/i,
  /\/sports-news-hindi(?:\/|$)/i,
  /espncricinfo\.com/i,
  /sportsjagran\.com/i,
  /\/ipl(?:\/|$)/i,
];

const TECH_URL_PATTERNS = [
  /\/sci-tech(?:\/|$)/i,
  /\/science(?:\/|$)/i,
  /\/technology(?:\/|$)/i,
  /\/tech(?:\/|$)/i,
  /\/gadgets(?:\/|$)/i,
  /\/technology-hindi(?:\/|$)/i,
  /\/vigyan(?:\/|$)/i,
  /\/auto(?:\/|$)/i,
];

const MARKETS_URL_PATTERNS = [
  /\/markets?(?:\/|$)/i,
  /\/business(?:\/|$)/i,
  /\/economy(?:\/|$)/i,
  /\/companies(?:\/|$)/i,
  /\/stocks?(?:\/|$)/i,
  /moneycontrol\.com/i,
  /economictimes\.indiatimes\.com\/markets/i,
  /livemint\.com\/market/i,
];

const MARKETS_KEYWORDS =
  /\b(nifty|sensex|bse|nse|rbi|sebi|stock|stocks|shares|share price|ipo|forex|rupee|bond|mutual fund|earnings|quarterly results|gdp|inflation|market cap|trading|investor|portfolio|dividend|fii|dii|market(?:s)?)\b/i;

const POLITICS_URL_PATTERNS = [
  /\/politics(?:\/|$)/i,
  /\/national(?:\/|$)/i,
  /\/india(?:\/|$)/i,
  /\/news\/national(?:\/|$)/i,
  /\/india-news(?:\/|$)/i,
  /\/world\/asia\/india(?:\/|$)/i,
  /\/section\/india(?:\/|$)/i,
  /\/election(?:s)?(?:\/|$)/i,
  /\/rajneeti(?:\/|$)/i,
  /\/desh(?:\/|$)/i,
];

const SPORTS_KEYWORDS =
  /\b(cricket|football|tennis|hockey|badminton|wrestling|kabaddi|ipl|t20|odi|test match|wicket|innings|stadium|tournament|league|coach|squad|batsman|bowler|goalkeeper|medal|olympic|paralympic|fifa|bcci|euro|premier league|match(?:es)?|fixture|scorecard|halftime|penalty shootout|क्रिकेट|फुटबॉल|खेल|मैच|विकेट|टी20|आईपीएल|टूर्नामेंट|स्टेडियम|कोच|स्कोर)\b/i;

const TECH_KEYWORDS =
  /\b(technology|smartphone|iphone|android|chipset|semiconductor|artificial intelligence|\bai\b|machine learning|software|hardware|startup|satellite|isro|nasa|spacex|cybersecurity|gadget|laptop|5g|6g|blockchain|cryptocurrency|robotics|app launch|cloud computing|data breach|तकनीक|टेक|गैजेट|स्मार्टफोन|ऐप|आर्टिफिशियल|उपग्रह|साइबर)\b/i;

const POLITICS_KEYWORDS =
  /\b(parliament|minister|ministry|election|cabinet|legislation|policy|government|assembly|bjp|congress|aap|supreme court|high court|lok sabha|rajya sabha|modi|rahul|vote bank|coalition|संसद|मंत्री|मंत्रालय|चुनाव|सरकार|नीति|विधानसभा|न्यायालय|राजनीति)\b/i;

function matchesAnyPattern(url: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(url));
}

export function classifyFromUrl(sourceUrl: string): CategorySlug | null {
  const url = sourceUrl.toLowerCase();

  if (matchesAnyPattern(url, SPORTS_URL_PATTERNS)) return "sports";
  if (matchesAnyPattern(url, TECH_URL_PATTERNS)) return "science-tech";
  if (matchesAnyPattern(url, MARKETS_URL_PATTERNS)) return "markets";
  if (matchesAnyPattern(url, POLITICS_URL_PATTERNS)) return "politics";

  return null;
}

function classifyFromText(headline: string, summary: string): CategorySlug | null {
  const text = `${headline} ${summary}`;

  const sports = SPORTS_KEYWORDS.test(text);
  const tech = TECH_KEYWORDS.test(text);
  const markets = MARKETS_KEYWORDS.test(text);
  const politics = POLITICS_KEYWORDS.test(text);

  if (sports && !tech && !markets) return "sports";
  if (tech && !sports && !markets) return "science-tech";
  if (markets && !sports && !tech) return "markets";
  if (politics && !sports && !tech && !markets) return "politics";

  return null;
}

/** Higher score = item more clearly belongs in that category. */
export function categoryFitScore(
  item: RawNewsItem,
  category: CategorySlug,
): number {
  const urlCategory = classifyFromUrl(item.sourceUrl);
  const textCategory = classifyFromText(item.headline, item.summary);

  if (urlCategory === category) return 3;
  if (textCategory === category) return 2;
  if (urlCategory && urlCategory !== category) return -3;
  if (textCategory && textCategory !== category) return -2;

  // Dedicated feeds can accept neutral items; general feeds should not.
  if (category === "politics" && !urlCategory && !textCategory) return 1;
  if (category !== "politics" && item.category === category) return 1;

  return 0;
}

export function itemBelongsInCategory(
  item: RawNewsItem,
  category: CategorySlug,
): boolean {
  return categoryFitScore(item, category) >= 1;
}

export function pickBetterCategoryItem(
  existing: RawNewsItem,
  candidate: RawNewsItem,
): RawNewsItem {
  const existingScore = categoryFitScore(existing, existing.category);
  const candidateScore = categoryFitScore(candidate, candidate.category);

  if (candidateScore > existingScore) return candidate;
  if (existingScore > candidateScore) return existing;

  return candidate.publishedAt > existing.publishedAt ? candidate : existing;
}
