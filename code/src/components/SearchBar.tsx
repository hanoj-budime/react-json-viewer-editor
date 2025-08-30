import React, { useEffect, useMemo, useState, useRef } from "react";
import { Combobox, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

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
        else if (scope === "value") matched = caseSensitive ? valueStr.includes(q) : valueStr.toLowerCase().includes(q);
        else matched = caseSensitive ? t === q : t.toLowerCase() === q.toLowerCase();
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

  function clear() {
    setQuery("");
    setMatches([]);
    setSelectedIndex(-1);
    onSelectPath?.("");
    inputRef.current?.focus();
  }

  const previewItems = useMemo(() => matches.slice(0, 6), [matches]);

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full bg-white dark:bg-gray-800 border rounded-lg px-3 py-2 shadow-sm">
        {/* Search input row (always full width on mobile) */}
        <div className="flex items-center gap-2 flex-1">
          {/* Search icon */}
          <div className="flex-shrink-0 text-gray-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search JSON..."
            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-gray-100"
            aria-label="Search JSON"
          />
        </div>

        {/* Controls — wrap on small screens */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Combobox */}
          <Combobox value={scope} onChange={(val: "key" | "value" | "type") => setScope(val)}>
            <div className="relative w-24 sm:w-28">
              <ComboboxButton className="relative w-full cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1.5 pl-2 pr-8 text-left text-sm font-medium text-gray-900 dark:text-gray-100 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400">
                <span className="block truncate capitalize">{scope}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              </ComboboxButton>

              <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                {["key", "value", "type"].map((opt) => (
                  <ComboboxOption
                    key={opt}
                    value={opt}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-1.5 pl-7 pr-3 ${
                        active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-gray-100"
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>{opt}</span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                              active ? "text-white" : "text-indigo-600"
                            }`}
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </div>
          </Combobox>

          {/* Toggle buttons */}
          <button
            title="Regex"
            onClick={() => setUseRegex((s) => !s)}
            className={`px-2 py-1 rounded text-sm ${
              useRegex ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700"
            }`}
          >
            RE
          </button>

          <button
            title="Case Sensitive"
            onClick={() => setCaseSensitive((s) => !s)}
            className={`px-2 py-1 rounded text-sm ${
              caseSensitive ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700"
            }`}
          >
            Aa
          </button>

          {/* Match count */}
          <div className="text-xs text-gray-500 px-1 sm:px-2 whitespace-nowrap">
            {matchCount} {matchCount === 1 ? "match" : "matches"}
          </div>

          {/* Navigation */}
          <div className="flex items-center border-l pl-2">
            <button onClick={goPrev} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              ◀
            </button>
            <button onClick={goNext} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              ▶
            </button>
          </div>

          {/* Clear */}
          {query ? (
            <button onClick={clear} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
