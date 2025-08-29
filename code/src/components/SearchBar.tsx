// src/components/SearchBar.tsx
import React, { useEffect, useMemo, useState } from "react";

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

  // simple recursive walker
  function walk(obj: any, path = "$", collect: MatchEntry[] = []) {
    if (obj === undefined) return collect;

    if (Array.isArray(obj)) {
      obj.forEach((v, i) => {
        const p = `${path}[${i}]`;
        // check entry itself (as index key)
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

  return (
    <div className="w-full md:w-96">
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search JSON (key / value / type)..."
          className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500"
          aria-label="Search JSON"
        />
        <div className="flex items-center space-x-2">
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
            className={`px-2 py-1 rounded ${caseSensitive ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700"}`}
          >
            Aa
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <div>{matchCount} match{matchCount !== 1 ? "es" : ""}</div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="px-2 py-1 rounded border bg-white dark:bg-gray-800">Prev</button>
          <button onClick={goNext} className="px-2 py-1 rounded border bg-white dark:bg-gray-800">Next</button>
        </div>
      </div>

      {previewItems.length > 0 && (
        <div className="mt-2 max-h-44 overflow-auto rounded border bg-white dark:bg-gray-800 p-2 text-sm">
          {previewItems.map((m, i) => (
            <div
              key={m.path}
              onClick={() => { setSelectedIndex(i); onSelectPath?.(m.path); }}
              className={`p-1 rounded cursor-pointer ${selectedIndex === i ? "bg-indigo-100 dark:bg-indigo-800" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
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
