"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NewsLanguage } from "@/lib/language";
import type { EditionResponse } from "@/lib/types";
import {
  restoreFeedScrollPosition,
  saveFeedScrollPosition,
} from "@/lib/article-cache";
import { ArticleReaderSheet } from "@/components/ArticleReaderSheet";

type FeedArticle = EditionResponse["articles"][number];

interface ArticleReaderContextValue {
  openArticle: (article: FeedArticle) => void;
}

const ArticleReaderContext = createContext<ArticleReaderContextValue | null>(
  null,
);

export function useArticleReader(): ArticleReaderContextValue {
  const context = useContext(ArticleReaderContext);
  if (!context) {
    throw new Error("useArticleReader must be used within ArticleReaderProvider");
  }
  return context;
}

interface ArticleReaderProviderProps {
  children: ReactNode;
  editionDate: string;
  siteUrl: string;
  language: NewsLanguage;
}

export function ArticleReaderProvider({
  children,
  editionDate,
  siteUrl,
  language,
}: ArticleReaderProviderProps) {
  const [activeArticle, setActiveArticle] = useState<FeedArticle | null>(null);

  const openArticle = useCallback((article: FeedArticle) => {
    saveFeedScrollPosition(window.scrollY);
    setActiveArticle(article);
    document.body.style.overflow = "hidden";
  }, []);

  const closeArticle = useCallback(() => {
    setActiveArticle(null);
    document.body.style.overflow = "";
    restoreFeedScrollPosition();
  }, []);

  const value = useMemo(
    () => ({
      openArticle,
    }),
    [openArticle],
  );

  return (
    <ArticleReaderContext.Provider value={value}>
      {children}
      {activeArticle && (
        <ArticleReaderSheet
          key={activeArticle.id}
          article={activeArticle}
          editionDate={editionDate}
          siteUrl={siteUrl}
          language={language}
          onClose={closeArticle}
        />
      )}
    </ArticleReaderContext.Provider>
  );
}
