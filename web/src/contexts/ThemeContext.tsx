"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "night" | "morning";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
} | null>(null);

const STORAGE_KEY = "studemy_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "night" || stored === "morning") setThemeState(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove("night-vision", "morning-vision", "dark");
    if (theme === "night") {
      document.documentElement.classList.add("night-vision", "dark");
    } else {
      document.documentElement.classList.add("morning-vision");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "night" ? "morning" : "night")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
