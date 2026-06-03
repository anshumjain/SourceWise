const CACHE_PREFIX = "sourcewise-read:";
const SCROLL_KEY = "sourcewise-feed-scroll";
const MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24;

export interface CachedArticleBody {
  content: string;
  fetchedAt: number;
}

export function saveFeedScrollPosition(scrollY: number): void {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(scrollY));
  } catch {
    // Ignore storage errors in private mode.
  }
}

export function restoreFeedScrollPosition(): void {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;
    const scrollY = Number(raw);
    if (!Number.isFinite(scrollY)) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
    });
  } catch {
    // Ignore storage errors.
  }
}

export function getCachedArticleBody(
  articleId: string,
): CachedArticleBody | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${articleId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedArticleBody;
    if (!parsed.content || !parsed.fetchedAt) return null;
    if (Date.now() - parsed.fetchedAt > MAX_CACHE_AGE_MS) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${articleId}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedArticleBody(
  articleId: string,
  content: string,
): void {
  try {
    const payload: CachedArticleBody = {
      content,
      fetchedAt: Date.now(),
    };
    sessionStorage.setItem(`${CACHE_PREFIX}${articleId}`, JSON.stringify(payload));
  } catch {
    // Ignore quota errors.
  }
}
