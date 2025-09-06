import React, { useState, useEffect, useCallback } from "react";
import Editor from "./components/Editor";
import TreeViewer from "./components/TreeViewer";
import Toolbar from "./components/Toolbar";
import SearchBar from "./components/SearchBar";
import { BugAntIcon } from "@heroicons/react/24/outline"; // GitHub Issues icon
import { FaLinkedin, FaGithub } from "react-icons/fa"; // For social icons
// import { HiOutlineCopyright } from "react-icons/hi"; // Copyright
import { CodeBracketIcon } from "@heroicons/react/24/outline"; // all heroicons

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
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-2">
          {/* Left: Brand */}
          <div className="flex items-center">
            <img
              src={`${(import.meta as any).env.BASE_URL}icon.png`}
              alt="JSON Viewer Logo"
              className="h-7 w-7 sm:h-8 sm:w-9 md:h-9 md:w-14 lg:h-10 lg:w-14 object-contain"
            />
          </div>
          {/* Center: Search */}
          <div className="w-full sm:flex-1">
            <SearchBar data={data} onSelectPath={handleSelectPath} />
          </div>

          {/* Right: Theme Toggle */}
          <button
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* Sticky Toolbar */}
      {/* <div className="sticky top-[56px] sm:top-[60px] z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <Toolbar raw={raw} setRaw={setRaw} setData={setData} setError={setError} />
        </div>
      </div> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1">
            <Editor raw={raw} setRaw={setRaw} setData={setData} onParse={onParse} setError={setError} onError={onError} />
          </section>
          <section className="lg:col-span-2">
            <TreeViewer data={data} error={error} highlightPath={highlightPath} />
          </section>
        </div>
      </main>

      {/* Sticky Bottom Footer */}
      <footer className="sticky bottom-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {/* Left: Developer Info */}
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <CodeBracketIcon className="h-4 w-4" />
            <span>
              Developed by <span className="font-medium text-gray-900 dark:text-gray-100">Hanoj Budime</span> · 2025-{new Date().getFullYear()}
            </span>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-3">
            {/* GitHub Issues */}
            <a
              href="https://github.com/hanoj-budime/react-json-viewer-editor/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Report Issue on GitHub"
            >
              <BugAntIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/hanoj-budime"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Connect on LinkedIn"
            >
              <FaLinkedin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>

            {/* GitHub Profile */}
            <a
              href="https://github.com/hanoj-budime"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="View GitHub Profile"
            >
              <FaGithub className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
