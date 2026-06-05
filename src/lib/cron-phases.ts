import type { NewsLanguage } from "./language";
import type { CategorySlug } from "./types";

export type CronPhase =
  | "en-politics-markets"
  | "en-sports-tech"
  | "hi-politics"
  | "hi-sports-tech";

/** @deprecated Use en-politics-markets — init-only runs left an empty edition. */
export type LegacyCronPhase = CronPhase | "init";

export const CRON_PHASE_ORDER: CronPhase[] = [
  "en-politics-markets",
  "en-sports-tech",
  "hi-politics",
  "hi-sports-tech",
];

export interface CronPhaseConfig {
  language: NewsLanguage;
  categories: CategorySlug[];
  description: string;
  resetsEdition: boolean;
}

export const CRON_PHASE_CONFIG: Record<CronPhase, CronPhaseConfig> = {
  "en-politics-markets": {
    language: "en",
    categories: ["politics", "markets"],
    description: "English politics and markets (fetches before wipe on new day)",
    resetsEdition: true,
  },
  "en-sports-tech": {
    language: "en",
    categories: ["sports", "science-tech"],
    description: "English sports and science & technology",
    resetsEdition: false,
  },
  "hi-politics": {
    language: "hi",
    categories: ["politics"],
    description: "Hindi politics",
    resetsEdition: false,
  },
  "hi-sports-tech": {
    language: "hi",
    categories: ["sports", "science-tech"],
    description: "Hindi sports and science & technology",
    resetsEdition: false,
  },
};

export function parseCronPhase(
  value: string | null,
): CronPhase | "full" | "init" | null {
  if (!value || value === "full") return value === "full" ? "full" : null;
  if (value === "init") return "init";
  if (value in CRON_PHASE_CONFIG) return value as CronPhase;
  return null;
}
