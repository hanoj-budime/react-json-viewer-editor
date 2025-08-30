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

  // apply theme to <html> and persist
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
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight flex-shrink-0">JSON Viewer</h1>

          <div className="flex-1">
            {/* single-line modern SearchBar */}
            <SearchBar data={data} onSelectPath={handleSelectPath} />
          </div>

          <div className="ml-4 flex items-center gap-2">
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

      {/* Toolbar (sticky under header) */}
      <div className="sticky top-[72px] z-30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-2">
          <Toolbar raw={raw} setRaw={setRaw} setData={setData} setError={setError} />
        </div>
      </div>

      <main className="container mx-auto p-4 pt-6 pb-36 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="md:col-span-1">
            <Editor raw={raw} setRaw={setRaw} onParse={onParse} onError={onError} />
          </section>
          <section className="md:col-span-2">
            <TreeViewer data={data} error={error} highlightPath={highlightPath} />
          </section>
        </div>
      </main>

      {/* Fixed footer at bottom */}
      {/* Fixed professional footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* About Me */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              HB
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">Hanoj Budime</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                Software Engineer · Open-Source Enthusiast
              </p>
            </div>
          </div>

          {/* Center message (optional tagline) */}
          <div className="hidden md:flex justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Developer-friendly JSON tools</p>
          </div>

          {/* Links */}
          <div className="flex justify-center md:justify-end gap-3">
            <a
              href="https://github.com/hanoj-budime"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/hanoj-budime" // update if needed
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
