export const THEME_STORAGE_KEY = "sourcewise-theme";
export const THEME_CHANGE_EVENT = "sourcewise-theme-change";

export type ThemeMode = "system" | "light" | "dark";

export const THEME_MODES: ThemeMode[] = ["system", "light", "dark"];

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(stored)) return stored;
  } catch {
    // ignore
  }
  return "system";
}

export function persistTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  } catch {
    // ignore
  }
}

export function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}
