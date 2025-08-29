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
  const inputRef = useRef<HTMLInputElement | null>(null);

  // walker (same as before)
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
        else if (scope === "value") matched = (caseSensitive ? valueStr.includes(q) : valueStr.toLowerCase().includes(q));
        else matched = (caseSensitive ? t === q : t.toLowerCase() === q.toLowerCase());
      }

      if (matched) {
        collect.push({ path: p, key: k, valuePreview: valueStr, type: t });
      }
    } catch (e) {
      // invalid regex — ignore
    }
  }

  // debounced search
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
        const collected = walk(data, "$", []).slice(0, 2000);
        if (alive) {
          setMatches(collected);
          setSelectedIndex(collected.length ? 0 : -1);
          if (collected.length && onSelectPath) onSelectPath(collected[0].path);
        }
      } catch (e) {
        if (alive) {
          setMatches([]);
          setSelectedIndex(-1);
        }
      }
    }, debounceMs);
    return () => { alive = false; clearTimeout(id); };
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

  function clear() {
    setQuery("");
    setMatches([]);
    setSelectedIndex(-1);
    onSelectPath?.("");
    inputRef.current?.focus();
  }

  const previewItems = useMemo(() => matches.slice(0, 6), [matches]);

  return (
    <div className="w-full">
      {/* Single-line modern search bar */}
      <div className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 border rounded-lg px-3 py-2 shadow-sm">
        {/* Search icon */}
        <div className="flex-shrink-0 text-gray-400">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search JSON (key / value / type)..."
          className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-gray-100"
          aria-label="Search JSON"
        />

        {/* Inline controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded border px-2 py-1 text-xs">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="bg-transparent outline-none text-xs"
              aria-label="Search scope"
            >
              <option value="key">Key</option>
              <option value="value">Value</option>
              <option value="type">Type</option>
            </select>
          </div>

          <button
            title="Regex"
            onClick={() => setUseRegex((s) => !s)}
            className={`px-2 py-1 rounded ${useRegex ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700 text-sm"}`}
          >
            RE
          </button>

          <button
            title="Case Sensitive"
            onClick={() => setCaseSensitive((s) => !s)}
            className={`px-2 py-1 rounded ${caseSensitive ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700 text-sm"}`}
          >
            Aa
          </button>

          <div className="text-xs text-gray-500 px-2">{matchCount} {matchCount === 1 ? "match" : "matches"}</div>

          <div className="flex items-center border-l pl-2">
            <button onClick={goPrev} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">◀</button>
            <button onClick={goNext} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">▶</button>
          </div>

          {query ? (
            <button onClick={clear} className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Small preview panel (optional) */}
      {previewItems.length > 0 && (
        <div className="mt-2 rounded bg-white dark:bg-gray-800 border p-2 text-sm shadow-sm">
          {previewItems.map((m, i) => (
            <div key={m.path} onClick={() => onSelectPath?.(m.path)} className="py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
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