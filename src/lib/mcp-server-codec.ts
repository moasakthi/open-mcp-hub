// Encode/decode helpers between the structured shapes used by the API and
// UI (string[] / Record<string,string>) and the JSON-encoded strings stored
// in the McpServer.args/env/headers columns (see prisma/schema.prisma).

export function encodeArgs(args: string[] | undefined): string | null {
  return args && args.length ? JSON.stringify(args) : null;
}

export function decodeArgs(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function encodeKv(record: Record<string, string> | undefined): string | null {
  return record && Object.keys(record).length ? JSON.stringify(record) : null;
}

export function decodeKv(json: string | null): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// Textarea <-> structured value helpers used by the client-side server form.

export function parseArgsText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function serializeArgs(args: string[]): string {
  return args.join("\n");
}

export function parseKvText(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

export function serializeKv(record: Record<string, string>): string {
  return Object.entries(record)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}
