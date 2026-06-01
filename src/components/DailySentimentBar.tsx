"use client";

import { useEffect, useMemo, useState } from "react";
import type { SentimentSnapshot } from "@/lib/types";

interface DailySentimentBarProps {
  initial: SentimentSnapshot | null;
}

export function DailySentimentBar({ initial }: DailySentimentBarProps) {
  const [sentiment, setSentiment] = useState<SentimentSnapshot | null>(initial);

  useEffect(() => {
    function handleVoteUpdate(event: Event) {
      const detail = (event as CustomEvent<SentimentSnapshot>).detail;
      if (detail) setSentiment(detail);
    }

    window.addEventListener("sourcewise:sentiment", handleVoteUpdate);
    return () => window.removeEventListener("sourcewise:sentiment", handleVoteUpdate);
  }, []);

  const snapshot = sentiment ?? {
    editionDate: "",
    goodVotes: 0,
    badVotes: 0,
    totalVotes: 0,
    goodPercent: 50,
    badPercent: 50,
  };

  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(to right, #059669 0%, #059669 ${snapshot.goodPercent}%, #ea580c ${snapshot.goodPercent}%, #ea580c 100%)`,
    }),
    [snapshot.goodPercent]
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950/60 dark:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Today&apos;s reader pulse
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-stone-900 dark:text-stone-50">
            Overall sentiment across all stories
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Aggregated from reader votes — not editorial opinion.
          </p>
        </div>
        {snapshot.totalVotes > 0 && (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600 dark:bg-stone-900/60 dark:text-stone-200">
            {snapshot.totalVotes} votes today
          </span>
        )}
      </div>
      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-900/70"
        role="img"
        aria-label={`Overall sentiment: ${snapshot.goodPercent}% good, ${snapshot.badPercent}% bad`}
      >
        <div className="h-full transition-all duration-500" style={gradientStyle} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>{snapshot.goodPercent}% good for the country</span>
        <span>{snapshot.badPercent}% bad for the country</span>
      </div>
    </section>
  );
}

export function dispatchSentimentUpdate(snapshot: SentimentSnapshot) {
  window.dispatchEvent(
    new CustomEvent("sourcewise:sentiment", { detail: snapshot })
  );
}
