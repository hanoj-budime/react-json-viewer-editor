export function safeParse(text: string) {
  try {
    if (text === null || text === undefined || text.trim() === "") {
      return { parsed: null, error: null };
    }

    const parsed = normalizeJSON(text);
    return { parsed, error: null };
  } catch (e: any) {
    const msg = e.message || "Invalid JSON";
    const m = /at position (\d+)/.exec(msg);
    let pos = null;
    if (m) pos = parseInt(m[1], 10);
    return { parsed: null, error: { message: msg, position: pos } };
  }
}

export function pretty(json: unknown, spaces = 2) {
  return JSON.stringify(json, null, spaces);
}

export function minify(json: unknown) {
  return JSON.stringify(json);
}

export function convertToValidJSON(text: string) {
  const regex = /({|,)\s*([a-zA-Z0-9_]+)\s*:/g;
  return text.replace(regex, '$1"$2":');
}

/**
 * 🔑 Normalize JSON string that may be stringified multiple times.
 * - Removes unnecessary escaping/backslashes
 * - Keeps parsing until we get an actual object/array
 */
export function normalizeJSON(text: string): any {
  let candidate = text;

  // Ensure valid JSON key quoting first
  candidate = convertToValidJSON(candidate);

  // Keep trying to parse until it's no longer a JSON string
  let parsed: any = candidate;
  while (typeof parsed === "string") {
    // remove accidental escaping like `"{\"foo\":\"bar\"}"`
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }

  return parsed;
}