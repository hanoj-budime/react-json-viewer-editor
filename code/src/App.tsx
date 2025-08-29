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
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  const [raw, setRaw] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Modern JSON Viewer</h1>
          <div className="flex gap-2 items-center">
            <SearchBar data={data} />
            <button
              className="px-3 py-1 rounded border bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </header>

        <Toolbar raw={raw} setRaw={setRaw} setData={setData} setError={setError} />

        <main className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <section className="md:col-span-1">
            <Editor raw={raw} setRaw={setRaw} onParse={onParse} onError={onError} />
          </section>
          <section className="md:col-span-2">
            <TreeViewer data={data} error={error} />
          </section>
        </main>
      </div>
    </div>
  );
}
