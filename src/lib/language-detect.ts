import type { NewsLanguage } from "./language";

const DEVANAGARI = /\p{Script=Devanagari}/u;

function countScriptChars(text: string): { devanagari: number; latin: number } {
  let devanagari = 0;
  let latin = 0;

  for (const char of text) {
    if (DEVANAGARI.test(char)) devanagari += 1;
    else if (/[A-Za-z]/.test(char)) latin += 1;
  }

  return { devanagari, latin };
}

/** Reject English headlines in Hindi edition (and vice versa). */
export function textMatchesLanguage(
  headline: string,
  summary: string,
  language: NewsLanguage,
): boolean {
  const { devanagari, latin } = countScriptChars(`${headline} ${summary}`);
  const total = devanagari + latin;

  if (total === 0) return language === "en";

  if (language === "hi") {
    if (devanagari === 0) return false;
    return devanagari / total >= 0.15;
  }

  return devanagari / total < 0.15;
}
