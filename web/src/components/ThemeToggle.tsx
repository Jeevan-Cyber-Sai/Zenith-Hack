"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800/60 p-1">
      <button
        type="button"
        onClick={() => setTheme("night")}
        className={`rounded-md px-2 py-1 text-xs font-medium transition ${theme === "night" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}
        title="Night vision"
      >
        Night
      </button>
      <button
        type="button"
        onClick={() => setTheme("morning")}
        className={`rounded-md px-2 py-1 text-xs font-medium transition ${theme === "morning" ? "bg-amber-500/80 text-slate-900" : "text-slate-400 hover:text-white"}`}
        title="Morning vision"
      >
        Morning
      </button>
    </div>
  );
}
