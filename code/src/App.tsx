import React, { useState, useEffect, useCallback } from "react";
import Editor from "./components/Editor";
import TreeViewer from "./components/TreeViewer";
import Toolbar from "./components/Toolbar";
import SearchBar from "./components/SearchBar";

export default function App() {
  const getInitialTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  const [raw, setRaw] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [highlightPath, setHighlightPath] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const onParse = useCallback((parsed: any) => {
    setData(parsed);
    setError(null);
  }, []);

  const onError = useCallback((err: string) => {
    setData(null);
    setError(err);
  }, []);

  function handleSelectPath(path: string) {
    setHighlightPath(path || null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">JSON Viewer</h1>

          {/* Search scales full width on mobile */}
          <div className="w-full sm:flex-1">
            <SearchBar data={data} onSelectPath={handleSelectPath} />
          </div>

          {/* Theme toggle */}
          <div className="flex-shrink-0">
            <button
              className="p-2 rounded-full border bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[64px] sm:top-[72px] z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <Toolbar raw={raw} setRaw={setRaw} setData={setData} setError={setError} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor on top for mobile */}
          <section className="lg:col-span-1">
            <Editor raw={raw} setRaw={setRaw} onParse={onParse} onError={onError} />
          </section>

          {/* TreeViewer expands on desktop */}
          <section className="lg:col-span-2">
            <TreeViewer data={data} error={error} highlightPath={highlightPath} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto sticky bottom-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              HB
            </div>
            <span className="font-medium text-gray-800 dark:text-gray-200">Hanoj Budime</span>
          </div>

          {/* Center: Tagline (hidden on mobile) */}
          <p className="hidden md:block italic text-gray-500 dark:text-gray-400">Developer-friendly JSON tool</p>

          {/* Right: Links */}
          <div className="flex gap-2">
            <a
              href="https://github.com/hanoj-budime"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm shadow-sm"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/hanoj-budime"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm shadow-sm"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
