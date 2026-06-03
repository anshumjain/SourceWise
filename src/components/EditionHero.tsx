import type { NewsLanguage } from "@/lib/language";

interface EditionHeroProps {
  formattedDate: string;
  articleCount: number;
  language?: NewsLanguage;
}

export function EditionHero({
  formattedDate,
  articleCount,
  language = "en",
}: EditionHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(5,150,105,0.08),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(28,25,23,0.04),_transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(250,250,249,0.05),_transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-400">
            Today&apos;s edition · refreshed 9:00 AM IST
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
            {formattedDate}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            {language === "hi"
              ? "केवल तथ्य — कौन, क्या, कब, कहाँ। हर खबर पर अपने वोट से आप अपनी राय दें।"
              : "Facts only — who, what, when, where. You judge what it means for India through your vote on every story."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
            <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-900/60">
              {articleCount}{" "}
              {language === "hi" ? "खबरें आज" : "stories today"}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-900/60">
              Prior editions are replaced each morning
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
