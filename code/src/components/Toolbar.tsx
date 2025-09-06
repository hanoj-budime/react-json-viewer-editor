import { CodeBracketIcon, Bars3BottomLeftIcon, ArrowDownTrayIcon, SlashIcon } from "@heroicons/react/24/solid";
import { pretty, minify, normalizeJSON, convertToValidJSON } from "../utils/jsonUtils";

export default function Toolbar({ raw, setRaw, setData, setError }: any) {
  function onPretty() {
    try {
      const parsed = normalizeJSON(raw);
      const stringified = pretty(parsed, 2);
      setRaw(stringified);
      setData(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function onMinify() {
    try {
      const parsed = normalizeJSON(raw);
      const stringified = minify(parsed);
      setRaw(stringified);
      setData(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function onDownload() {
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().getTime();
    a.href = url;
    a.download = `data-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onStringify() {
    try {
      const transform_raw = convertToValidJSON(raw);
      const parse_json = JSON.parse(transform_raw);
      // Convert JSON object into string literal with escaping
      const stringify_as_string = JSON.stringify(JSON.stringify(parse_json));
      setRaw(stringify_as_string);
      setData(parse_json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="sticky top-0 bg-transparent z-10">
      <div className="flex gap-2">
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onPretty}
          title="Pretty JSON"
        >
          <CodeBracketIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onMinify}
          title="Minify JSON"
        >
          <Bars3BottomLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onStringify}
          title="Stringify JSON"
        >
          <SlashIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onDownload}
          title="Download JSON"
        >
          <ArrowDownTrayIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
}
