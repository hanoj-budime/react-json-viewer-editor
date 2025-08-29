export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
export interface JsonObject { [k: string]: JsonValue }