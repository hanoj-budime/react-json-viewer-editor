import React, { useEffect, useMemo, useState, useRef } from "react";
import { Combobox, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 shadow-sm">
        {/* Input */}
        <div className="flex items-center gap-2 flex-1">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search JSON..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Scope Selector */}
          <Combobox value={scope} onChange={(val: "key" | "value" | "type") => setScope(val)}>
            <div className="relative w-20 sm:w-24">
              <ComboboxButton className="relative w-full cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 pl-2 pr-6 text-left text-xs text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none">
                <span className="block truncate capitalize">{scope}</span>
                <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                  <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              </ComboboxButton>
              <ComboboxOptions className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 text-xs shadow-lg">
                {["key", "value", "type"].map((opt) => (
                  <ComboboxOption
                    key={opt}
                    value={opt}
                    className={({ active }) =>
                      `cursor-pointer select-none py-1 pl-7 pr-2 ${
                        active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-gray-100"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={selected ? "font-semibold" : "font-normal"}>{opt}</span>
                        {selected && (
                          <CheckIcon className="h-4 w-4 absolute left-2 top-1.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </>
                    )}
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </div>
          </Combobox>

          {/* Toggles */}
          <button
            onClick={() => setUseRegex((s) => !s)}
            className={`px-2 py-1 rounded ${useRegex ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
          >
            RE
          </button>
          <button
            onClick={() => setCaseSensitive((s) => !s)}
            className={`px-2 py-1 rounded ${
              caseSensitive ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            Aa
          </button>
          {/* Navigation */}
          <div className="flex items-center space-x-1">
            <button
              onClick={goPrev}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Previous match"
            >
              <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={goNext}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Next match"
            >
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Match Count */}
          <span className="px-1 text-gray-500">
            {matchCount} match{matchCount !== 1 && "es"}
          </span>
        </div>
      </div>
    </div>
  );
}
