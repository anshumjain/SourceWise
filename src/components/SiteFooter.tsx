"use client";

import { useNewsLanguage } from "@/hooks/use-news-language";
import { getUiCopy } from "@/lib/ui-copy";

export function SiteFooter() {
  const language = useNewsLanguage();
  const copy = getUiCopy(language);

  return (
    <footer className="mt-auto border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-50">
              Sourcewise
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {copy.footer.tagline}
            </p>
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-400">
            <p>{copy.footer.schedule}</p>
            <p className="mt-1">© {new Date().getFullYear()} Sourcewise</p>
          </div>
        </div>
        <div
          className="hidden min-h-[90px]"
          aria-hidden="true"
          data-ad-slot="footer-banner"
        />
      </div>
    </footer>
  );
}
