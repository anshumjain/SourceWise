"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getOrCreateVoterId,
  hasVotedLocally,
  markVotedLocally,
  subscribeToVoteChanges,
} from "@/lib/voter";
import type { CategorySlug } from "@/lib/types";
import type { NewsLanguage } from "@/lib/language";
import { getUiCopy, getVoteCopy } from "@/lib/ui-copy";

interface SentimentBarProps {
  articleId: string;
  editionDate: string;
  initialGoodVotes: number;
  initialBadVotes: number;
  category: CategorySlug;
  language?: NewsLanguage;
}

export function SentimentBar({
  articleId,
  editionDate,
  initialGoodVotes,
  initialBadVotes,
  category,
  language = "en",
}: SentimentBarProps) {
  const [goodVotes, setGoodVotes] = useState(initialGoodVotes);
  const [badVotes, setBadVotes] = useState(initialBadVotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVotedFromStorage = useSyncExternalStore(
    subscribeToVoteChanges,
    () => hasVotedLocally(articleId, editionDate),
    () => false
  );

  const goodPercent = useMemo(() => {
    const totalVotes = goodVotes + badVotes;
    if (totalVotes === 0) return 50;
    return Math.round((goodVotes / totalVotes) * 100);
  }, [goodVotes, badVotes]);
  const badPercent = 100 - goodPercent;
  const totalVotes = goodVotes + badVotes;
  const disableVoting = hasVotedFromStorage || isSubmitting;

  async function submitVote(voteType: "GOOD" | "BAD") {
    if (disableVoting) return;

    setIsSubmitting(true);
    setError(null);

    const voterId = getOrCreateVoterId();

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          voteType,
          voterId,
          editionDate,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        goodVotes?: number;
        badVotes?: number;
      };

      if (!response.ok) {
        if (response.status === 409) {
          markVotedLocally(articleId, editionDate, voteType);
          if (typeof data.goodVotes === "number") setGoodVotes(data.goodVotes);
          if (typeof data.badVotes === "number") setBadVotes(data.badVotes);
          return;
        }
        throw new Error(data.error ?? "Vote failed");
      }

      if (typeof data.goodVotes === "number") setGoodVotes(data.goodVotes);
      if (typeof data.badVotes === "number") setBadVotes(data.badVotes);
      markVotedLocally(articleId, editionDate, voteType);
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Vote failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const gradientStyle = {
    background: `linear-gradient(to right, #059669 0%, #059669 ${goodPercent}%, #ea580c ${goodPercent}%, #ea580c 100%)`,
  };

  const voteCopy = getVoteCopy(category, language);
  const ui = getUiCopy(language);

  return (
    <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-900/80">
      <p className="mb-3 text-sm font-medium text-stone-800 dark:text-stone-100">
        {voteCopy.question}
      </p>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          disabled={disableVoting}
          onClick={() => submitVote("GOOD")}
          aria-label={voteCopy.goodAriaLabel}
          className="flex-1 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200/80 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/70 dark:hover:bg-emerald-950/55"
        >
          {voteCopy.goodLabel}
        </button>
        <button
          type="button"
          disabled={disableVoting}
          onClick={() => submitVote("BAD")}
          aria-label={voteCopy.badAriaLabel}
          className="flex-1 rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-medium text-orange-800 ring-1 ring-orange-200/80 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-900/70 dark:hover:bg-orange-950/55"
        >
          {voteCopy.badLabel}
        </button>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-900/70"
        role="img"
        aria-label={ui.aria.sentimentBar(goodPercent, badPercent)}
      >
        <div className="h-full transition-all duration-500" style={gradientStyle} />
      </div>
      {totalVotes > 0 && (
        <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
          {ui.readerVotes(totalVotes)}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
