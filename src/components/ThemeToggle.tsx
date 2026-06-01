"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  persistTheme,
  readStoredTheme,
  subscribeToThemeChanges,
  THEME_MODES,
  type ThemeMode,
} from "@/lib/theme";

function getSystemPrefersDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = mode;
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(
    subscribeToThemeChanges,
    readStoredTheme,
    () => "system" as ThemeMode
  );

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;

    const handler = () => applyTheme("system");
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [mode]);

  const { label, Icon } = useMemo(() => {
    if (mode === "light") return { label: "Light", Icon: SunIcon };
    if (mode === "dark") return { label: "Dark", Icon: MoonIcon };
    return { label: "System", Icon: MonitorIcon };
  }, [mode]);

  function cycleMode() {
    const idx = THEME_MODES.indexOf(mode);
    const next = THEME_MODES[(idx + 1) % THEME_MODES.length] ?? "system";
    persistTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycleMode}
      className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm shadow-stone-200/30 backdrop-blur transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:border-stone-800/80 dark:bg-stone-950/70 dark:text-stone-200 dark:shadow-none dark:hover:border-stone-700 dark:hover:bg-stone-900/40 dark:focus-visible:ring-offset-stone-950"
      aria-label={`Theme: ${label}. Activate to switch.`}
    >
      <Icon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 13.4A7.7 7.7 0 0 1 10.6 3a7.2 7.2 0 1 0 10.4 10.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 5.5h15A2.5 2.5 0 0 1 22 8v8a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16V8a2.5 2.5 0 0 1 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 21h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
