import type { NewsLanguage } from "./language";
import type { CategorySlug } from "./types";

export type CronPhase =
  | "init"
  | "en-politics-markets"
  | "en-sports-tech"
  | "hi-politics"
  | "hi-sports-tech";

export const CRON_PHASE_ORDER: CronPhase[] = [
  "init",
  "en-politics-markets",
  "en-sports-tech",
  "hi-politics",
  "hi-sports-tech",
];

export interface CronPhaseConfig {
  language: NewsLanguage | null;
  categories: CategorySlug[];
  description: string;
}

export const CRON_PHASE_CONFIG: Record<CronPhase, CronPhaseConfig> = {
  init: {
    language: null,
    categories: [],
    description: "Reset edition and create empty daily edition",
  },
  "en-politics-markets": {
    language: "en",
    categories: ["politics", "markets"],
    description: "English politics and markets",
  },
  "en-sports-tech": {
    language: "en",
    categories: ["sports", "science-tech"],
    description: "English sports and science & technology",
  },
  "hi-politics": {
    language: "hi",
    categories: ["politics"],
    description: "Hindi politics",
  },
  "hi-sports-tech": {
    language: "hi",
    categories: ["sports", "science-tech"],
    description: "Hindi sports and science & technology",
  },
};

export function parseCronPhase(value: string | null): CronPhase | "full" | null {
  if (!value || value === "full") return value === "full" ? "full" : null;
  if (value in CRON_PHASE_CONFIG) return value as CronPhase;
  return null;
}
