"use client";

import { useSearchParams } from "next/navigation";
import { DEFAULT_LANGUAGE, type NewsLanguage } from "@/lib/language";

export function useNewsLanguage(): NewsLanguage {
  const searchParams = useSearchParams();
  return searchParams.get("lang") === "hi" ? "hi" : DEFAULT_LANGUAGE;
}
