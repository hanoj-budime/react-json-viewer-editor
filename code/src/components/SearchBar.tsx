import React, { useEffect, useMemo, useState, useRef } from "react";

type JsonValue = any;

interface MatchEntry {
  path: string;
  key?: string;
  valuePreview: string;
  type: string;
}

interface Props {
  data: JsonValue;
  onSelectPath?: (path: string) => void;
}

function defaultPreview(v: any) {
  if (v === null) return "null";
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") return `Object(${Object.keys(v).length})`;
  return String(v);
}

export default function SearchBar({ data, onSelectPath }: Props) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"key" | "value" | "type">("key");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [debounceMs] = useState(250);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // simple recursive walker
  function walk(obj: any, path = "$", collect: MatchEntry[] = []) {
    if (obj === undefined) return collect;

    if (Array.isArray(obj)) {
      obj.forEach((v, i) => {
        const p = `${path}[${i}]`;
        checkMatch(undefined, v, p, collect);
        walk(v, p, collect);
      });
    } else if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([k, v]) => {
        const p = path === "$" ? `$.${k}` : `${path}.${k}`;
        checkMatch(k, v, p, collect);
        walk(v, p, collect);
      });
    }
    return collect;
  }

  function checkMatch(k: string | undefined, v: any, p: string, collect: MatchEntry[]) {
    const t = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
    const valueStr = defaultPreview(v);

    if (!query) return;

    try {
      let matched = false;
      if (useRegex) {
        const flags = caseSensitive ? "" : "i";
        const re = new RegExp(query, flags);

        if (scope === "key") matched = k ? re.test(k) : false;
        else if (scope === "value") matched = re.test(valueStr);
        else matched = re.test(t);
      } else {
        const q = caseSensitive ? query : query.toLowerCase();
        if (scope === "key") matched = k ? (caseSensitive ? k.includes(q) : k.toLowerCase().includes(q)) : false;
        else if (scope === "value") matched = caseSensitive ? valueStr.includes(q) : valueStr.toLowerCase().includes(q);
        else matched = caseSensitive ? t === q : t.toLowerCase() === q.toLowerCase();
      }

      if (matched) {
        collect.push({
          path: p,
          key: k,
          valuePreview: valueStr,
          type: t,
        });
      }
    } catch (e) {
      // invalid regex — ignore matches
    }
  }

  // debounced search effect
  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => {
      if (!query) {
        if (alive) {
          setMatches([]);
          setSelectedIndex(-1);
        }
        return;
      }
      try {
        const collected = walk(data, "$", []).slice(0, 2000); // limit results
        if (alive) {
          setMatches(collected);
          setSelectedIndex(collected.length ? 0 : -1);
          if (collected.length && onSelectPath) {
            onSelectPath(collected[0].path);
          }
        }
      } catch (e) {
        console.error("Search failed", e);
        if (alive) {
          setMatches([]);
          setSelectedIndex(-1);
        }
      }
    }, debounceMs);
    return () => {
      alive = false;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, scope, useRegex, caseSensitive, data]);

  const matchCount = matches.length;

  function goNext() {
    if (!matchCount) return;
    const next = (selectedIndex + 1) % matchCount;
    setSelectedIndex(next);
    onSelectPath?.(matches[next].path);
  }
  function goPrev() {
    if (!matchCount) return;
    const prev = (selectedIndex - 1 + matchCount) % matchCount;
    setSelectedIndex(prev);
    onSelectPath?.(matches[prev].path);
  }

  // results preview (first 8)
  const previewItems = useMemo(() => matches.slice(0, 8), [matches]);

  function clear() {
    setQuery("");
    setMatches([]);
    setSelectedIndex(-1);
    onSelectPath?.("");
  }

  return (
    <div ref={containerRef} className="w-full md:w-96">
      <div className="relative flex items-center gap-2">
        {/* Search icon */}
        <div className="absolute left-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            />
          </svg>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search JSON (key / value / type)..."
          className="w-full pl-10 pr-32 py-3 rounded-lg border bg-white dark:bg-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 transition"
          aria-label="Search JSON"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={clear}
            className="absolute right-28 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Controls container */}
        <div className="absolute right-2 flex items-center gap-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className="px-2 py-1 rounded border bg-gray-50 dark:bg-gray-700 text-sm"
            aria-label="Search scope"
          >
            <option value="key">Key</option>
            <option value="value">Value</option>
            <option value="type">Type</option>
          </select>

          <button
            title="Regex"
            onClick={() => setUseRegex((s) => !s)}
            className={`px-2 py-1 rounded ${useRegex ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700"}`}
          >
            RE
          </button>
          <button
            title="Case Sensitive"
            onClick={() => setCaseSensitive((s) => !s)}
            className={`px-2 py-1 rounded ${
              caseSensitive ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700"
            }`}
          >
            Aa
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <div>
          {matchCount} match{matchCount !== 1 ? "es" : ""}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="px-2 py-1 rounded border bg-white dark:bg-gray-800">
            Prev
          </button>
          <button onClick={goNext} className="px-2 py-1 rounded border bg-white dark:bg-gray-800">
            Next
          </button>
        </div>
      </div>

      {previewItems.length > 0 && (
        <div className="mt-2 max-h-44 overflow-auto rounded border bg-white dark:bg-gray-800 p-2 text-sm">
          {previewItems.map((m, i) => (
            <div
              key={m.path}
              onClick={() => {
                setSelectedIndex(i);
                onSelectPath?.(m.path);
              }}
              className={`p-1 rounded cursor-pointer ${
                selectedIndex === i ? "bg-indigo-100 dark:bg-indigo-800" : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="font-mono text-xs text-gray-500">{m.path}</div>
              <div className="flex gap-2 items-center">
                <div className="text-blue-500 font-mono">{m.key ? `"${m.key}"` : "-"}</div>
                <div className="text-gray-500">:</div>
                <div className="font-mono text-sm">{m.valuePreview}</div>
                <div className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">{m.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
