// Renders a JSON Schema (as stored in McpTool.inputSchema) into a compact
// "paramName*, other" summary — required params marked with *. Used by the
// server detail page and the tool catalog instead of showing raw JSON.

type JsonSchemaObject = {
  properties?: Record<string, unknown>;
  required?: string[];
};

export function summarizeInputSchema(inputSchemaJson: string): string {
  let schema: JsonSchemaObject;
  try {
    schema = JSON.parse(inputSchemaJson);
  } catch {
    return "—";
  }

  const properties = Object.keys(schema.properties ?? {});
  if (properties.length === 0) return "No parameters";

  const required = new Set(schema.required ?? []);
  return properties.map((name) => (required.has(name) ? `${name}*` : name)).join(", ");
}
