"use client";

const VOTER_STORAGE_KEY = "sourcewise-voter-id";

export function getOrCreateVoterId(): string {
  if (typeof window === "undefined") return "";

  let voterId = localStorage.getItem(VOTER_STORAGE_KEY);
  if (!voterId) {
    voterId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `voter-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VOTER_STORAGE_KEY, voterId);
  }
  return voterId;
}

export function getVoteStorageKey(articleId: string, editionDate: string) {
  return `sourcewise-vote:${editionDate}:${articleId}`;
}

export function hasVotedLocally(articleId: string, editionDate: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getVoteStorageKey(articleId, editionDate)) !== null;
}

const VOTE_CHANGE_EVENT = "sourcewise-vote-change";

export function subscribeToVoteChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(VOTE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(VOTE_CHANGE_EVENT, onStoreChange);
  };
}

export function markVotedLocally(
  articleId: string,
  editionDate: string,
  voteType: "GOOD" | "BAD"
) {
  localStorage.setItem(getVoteStorageKey(articleId, editionDate), voteType);
  window.dispatchEvent(new Event(VOTE_CHANGE_EVENT));
}
