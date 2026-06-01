import { CATEGORY_LABELS, CATEGORY_SLUGS, type CategorySlug } from "@/lib/types";

interface CategoryTabsProps {
  active: CategorySlug | "all";
  onChange?: (category: CategorySlug | "all") => void;
  basePath?: string;
}

export function CategoryTabs({
  active,
  onChange,
  basePath = "/",
}: CategoryTabsProps) {
  const tabs: Array<{ id: CategorySlug | "all"; label: string }> = [
    { id: "all", label: "All" },
    ...CATEGORY_SLUGS.map((slug) => ({
      id: slug,
      label: CATEGORY_LABELS[slug],
    })),
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="News categories"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const href =
          tab.id === "all" ? basePath : `${basePath}?category=${tab.id}`;

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
