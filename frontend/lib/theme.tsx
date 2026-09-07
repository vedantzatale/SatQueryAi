"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeOption = "default" | "light" | "dark";

interface ThemeContextValue {
  /** The user-selected option (default | light | dark) */
  theme: ThemeOption;
  /** Change and persist the theme selection */
  setTheme: (t: ThemeOption) => void;
  /** The resolved theme actually applied to <html> (light | dark) */
  resolvedTheme: "light" | "dark";
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "satquery-theme";

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: "default",
  setTheme: () => {},
  resolvedTheme: "dark",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function readStoredTheme(): ThemeOption {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeOption | null;
  if (stored === "light" || stored === "dark" || stored === "default") {
    return stored;
  }
  return "default";
}

function applyTheme(resolved: "light" | "dark") {
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  html.classList.add(resolved);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("default");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // On mount: read persisted preference
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);

    const resolved = stored === "default" ? getSystemPreference() : stored;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for OS preference changes when user has "default" selected
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");

    const handler = () => {
      if (readStoredTheme() === "default") {
        const resolved = getSystemPreference();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((t: ThemeOption) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    const resolved = t === "default" ? getSystemPreference() : t;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
