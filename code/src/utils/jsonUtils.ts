// Helpful helpers: safeParse with position, pretty/minify
export function safeParse(text: string) {
  try {
    // Handle empty, null, or undefined input gracefully.
    // We trim the string to account for whitespace-only inputs.
    if (text === null || text === undefined || text.trim() === "") {
      return { parsed: null, error: null };
    }
    // Use a deterministic parse - JSON.parse doesn't give line/col; we give an approximation
    const parsed = JSON.parse(text);
    return { parsed, error: null };
  } catch (e: any) {
    // naive line/col detection
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
