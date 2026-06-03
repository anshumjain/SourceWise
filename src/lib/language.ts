export type NewsLanguage = "en" | "hi";

export const DEFAULT_LANGUAGE: NewsLanguage = "en";

export const LANGUAGE_LABELS: Record<NewsLanguage, string> = {
  en: "English",
  hi: "हिंदी",
};

export function parseLanguage(value: string | undefined | null): NewsLanguage {
  if (value === "hi") return "hi";
  return "en";
}

/** Build home URL preserving lang + optional category. */
export function buildHomeHref(
  options: { lang?: NewsLanguage; category?: string } = {},
): string {
  const params = new URLSearchParams();
  const lang = options.lang ?? DEFAULT_LANGUAGE;
  if (lang !== "en") params.set("lang", lang);
  if (options.category && options.category !== "all") {
    params.set("category", options.category);
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
