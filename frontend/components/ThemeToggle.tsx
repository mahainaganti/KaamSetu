"use client";

import { useLayoutEffect, useState } from "react";

const STORAGE_KEY = "kaamsetu-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const current = stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", current);
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <span className="theme-toggle-thumb">{theme === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}
