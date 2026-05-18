export const THEME_STORAGE_KEY = "orbitnote-dark";

export function readStoredDarkMode(): boolean | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === null) return null;
  return stored === "true";
}

export function prefersDarkColorScheme(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveDarkMode(stored: boolean | null = readStoredDarkMode()): boolean {
  if (stored !== null) return stored;
  return prefersDarkColorScheme();
}

export function applyTheme(dark: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function persistTheme(dark: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, String(dark));
}

/** Run before React mounts to avoid a light flash on reload. */
export function initThemeFromStorage(): boolean {
  const dark = resolveDarkMode();
  applyTheme(dark);
  return dark;
}
