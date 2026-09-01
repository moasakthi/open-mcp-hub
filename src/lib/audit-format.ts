export function formatAuditMetadata(metadata: string | null): string {
  if (!metadata) return "—";
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    return Object.entries(parsed)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
  } catch {
    return "—";
  }
}
