import { buildHomeHref, type NewsLanguage } from "@/lib/language";
import { getUiCopy } from "@/lib/ui-copy";
import { getCategoryLabel, CATEGORY_SLUGS, type CategorySlug } from "@/lib/types";

interface CategoryTabsProps {
  active: CategorySlug | "all";
  language?: NewsLanguage;
  onChange?: (category: CategorySlug | "all") => void;
}

export function CategoryTabs({
  active,
  language = "en",
  onChange,
}: CategoryTabsProps) {
  const allLabel = language === "hi" ? "सभी" : "All";
  const copy = getUiCopy(language);
  const tabs: Array<{ id: CategorySlug | "all"; label: string }> = [
    { id: "all", label: allLabel },
    ...CATEGORY_SLUGS.map((slug) => ({
      id: slug,
      label: getCategoryLabel(slug, language),
    })),
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label={copy.aria.newsCategories}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const href = buildHomeHref({
          lang: language,
          category: tab.id === "all" ? undefined : tab.id,
        });

        if (onChange) {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-900"
              }`}
            >
              {tab.label}
            </button>
          );
        }

        return (
          <a
            key={tab.id}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-900"
            }`}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
