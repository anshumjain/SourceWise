import type { NewsLanguage } from "./language";
import type { CategorySlug } from "./types";

export type CronPhase = "en" | "hi-politics" | "hi-sports-tech";

/** @deprecated Use en — init-only runs left an empty edition. */
export type LegacyCronPhase =
  | CronPhase
  | "init"
  | "en-politics-markets"
  | "en-sports-tech";

export const CRON_PHASE_ORDER: CronPhase[] = [
  "en",
  "hi-politics",
  "hi-sports-tech",
];

const EN_CATEGORIES: CategorySlug[] = [
  "politics",
  "markets",
  "sports",
  "science-tech",
];

export interface CronPhaseConfig {
  language: NewsLanguage;
  categories: CategorySlug[];
  description: string;
  resetsEdition: boolean;
}

export const CRON_PHASE_CONFIG: Record<CronPhase, CronPhaseConfig> = {
  en: {
    language: "en",
    categories: EN_CATEGORIES,
    description: "All English categories (politics, markets, sports, science & tech)",
    resetsEdition: true,
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

const LEGACY_PHASE_MAP: Record<string, CronPhase> = {
  init: "en",
  "en-politics-markets": "en",
  "en-sports-tech": "en",
};

export function resolveCronPhase(
  phase: CronPhase | LegacyCronPhase,
): CronPhase {
  if (phase in CRON_PHASE_CONFIG) return phase as CronPhase;
  return LEGACY_PHASE_MAP[phase] ?? "en";
}

export function parseCronPhase(
  value: string | null,
): CronPhase | LegacyCronPhase | "full" | null {
  if (!value || value === "full") return value === "full" ? "full" : null;
  if (value in CRON_PHASE_CONFIG || value in LEGACY_PHASE_MAP || value === "init") {
    return value as CronPhase | LegacyCronPhase;
  }
  return null;
}
