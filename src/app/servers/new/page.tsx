import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerForm } from "@/components/server-form";

export default function NewServerPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Add an MCP server</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
