"use client";

import { useSyncExternalStore } from "react";

export type FeedView = "grid" | "list";

const STORAGE_KEY = "sourcewise-feed-view";
const VIEW_CHANGE_EVENT = "sourcewise-view-change";

function readStoredView(): FeedView {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "grid" || stored === "list" ? stored : "grid";
}

function subscribeToViewChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(VIEW_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(VIEW_CHANGE_EVENT, onStoreChange);
  };
}

interface ViewToggleProps {
  value: FeedView;
  onChange: (view: FeedView) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-full border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-950/60"
      role="group"
      aria-label="Feed layout"
    >
      <button
        type="button"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          value === "grid"
            ? "bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900"
            : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
        }`}
      >
        Grid
      </button>
      <button
        type="button"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          value === "list"
            ? "bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900"
            : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
        }`}
      >
        List
      </button>
    </div>
  );
}

export function useFeedView(): [FeedView, (view: FeedView) => void] {
  const view = useSyncExternalStore(
    subscribeToViewChanges,
    readStoredView,
    () => "grid" as FeedView
  );

  function updateView(next: FeedView) {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(VIEW_CHANGE_EVENT));
  }

  return [view, updateView];
}
