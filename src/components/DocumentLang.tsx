"use client";

import { useEffect } from "react";
import { useNewsLanguage } from "@/hooks/use-news-language";

/** Syncs document lang with ?lang=hi for screen readers and accessibility. */
export function DocumentLang() {
  const language = useNewsLanguage();

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  return null;
}
