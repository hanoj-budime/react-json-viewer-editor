import { pretty, minify, convertToValidJSON } from "../utils/jsonUtils";

export default function Toolbar({ raw, setRaw, setData, setError }: any) {
  function onPretty() {
    try {
      const transform_raw = convertToValidJSON(raw);
      const parse_json = JSON.parse(transform_raw);
      const stringify_json = pretty(parse_json, 2);
      setRaw(stringify_json);
      setData(JSON.parse(stringify_json));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }
  function onMinify() {
    try {
      const transform_raw = convertToValidJSON(raw);
      const parse_json = JSON.parse(transform_raw);
      const stringify_json = minify(parse_json);
      setRaw(stringify_json);
      setData(JSON.parse(stringify_json));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }
  function onDownload() {
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="sticky top-0 bg-transparent z-10">
      <div className="flex gap-2">
        <button
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onPretty}
        >
          Pretty
        </button>
        <button
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onMinify}
        >
          Minify
        </button>
        <button
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
}
