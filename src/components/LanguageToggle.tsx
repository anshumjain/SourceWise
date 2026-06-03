"use client";

import { useSearchParams } from "next/navigation";
import {
  buildHomeHref,
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  type NewsLanguage,
} from "@/lib/language";

const LANGUAGES: NewsLanguage[] = ["en", "hi"];

export function LanguageToggle() {
  const searchParams = useSearchParams();
  const active = (searchParams.get("lang") === "hi" ? "hi" : "en") as NewsLanguage;
  const category = searchParams.get("category") ?? undefined;

  return (
    <div
      className="flex rounded-full border border-stone-200 bg-stone-100/80 p-0.5 dark:border-stone-700 dark:bg-stone-900/60"
      role="group"
      aria-label="News language"
    >
      {LANGUAGES.map((lang) => {
        const isActive = active === lang;
        const href = buildHomeHref({
          lang,
          category: category && category !== "all" ? category : undefined,
        });

        return (
          <a
            key={lang}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition sm:px-3 sm:text-sm ${
              isActive
                ? "bg-stone-900 text-white shadow-sm dark:bg-stone-50 dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            }`}
          >
            {LANGUAGE_LABELS[lang]}
          </a>
        );
      })}
    </div>
  );
}

export function useNewsLanguage(): NewsLanguage {
  const searchParams = useSearchParams();
  return searchParams.get("lang") === "hi" ? "hi" : DEFAULT_LANGUAGE;
}
