"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseArgsText, parseKvText, serializeArgs, serializeKv } from "@/lib/mcp-server-codec";
import type { ServerTransport } from "@/lib/types";
import type { ServerDto } from "@/lib/server-dto";

type ServerFormProps =
  | { mode: "create" }
  | { mode: "edit"; server: ServerDto };

export function ServerForm(props: ServerFormProps) {
  const router = useRouter();
  const initial = props.mode === "edit" ? props.server : undefined;

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [transport, setTransport] = useState<ServerTransport>(initial?.transport as ServerTransport ?? "STDIO");
  const [command, setCommand] = useState(initial?.command ?? "");
  const [argsText, setArgsText] = useState(serializeArgs(initial?.args ?? []));
  const [envText, setEnvText] = useState(serializeKv(initial?.env ?? {}));
  const [url, setUrl] = useState(initial?.url ?? "");
  const [headersText, setHeadersText] = useState(serializeKv(initial?.headers ?? {}));

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      name,
      description,
      transport,
      command,
      args: parseArgsText(argsText),
      env: parseKvText(envText),
      url,
      headers: parseKvText(headersText),
    };

    const endpoint = props.mode === "create" ? "/api/servers" : `/api/servers/${props.server.id}`;
    const method = props.mode === "create" ? "POST" : "PATCH";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.issues?.[0]?.message ?? data?.error ?? "Something went wrong.");
      return;
    }

    const saved = await response.json();
    router.push(`/servers/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="transport">Transport</Label>
        <Select value={transport} onValueChange={(value) => setTransport(value as ServerTransport)}>
          <SelectTrigger id="transport">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STDIO">Stdio (local command)</SelectItem>
            <SelectItem value="HTTP">HTTP (Streamable HTTP URL)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {transport === "STDIO" ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="command">Command</Label>
            <Input
              id="command"
              placeholder="npx"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="args">Arguments (one per line)</Label>
            <Textarea
              id="args"
              rows={3}
              placeholder={"-y\n@modelcontextprotocol/server-example"}
              value={argsText}
              onChange={(e) => setArgsText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="env">Environment variables (KEY=VALUE, one per line)</Label>
            <Textarea
              id="env"
              rows={3}
              placeholder={"API_KEY=..."}
              value={envText}
              onChange={(e) => setEnvText(e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/mcp"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="headers">Headers (KEY=VALUE, one per line)</Label>
            <Textarea
              id="headers"
              rows={3}
              placeholder={"Authorization=Bearer ..."}
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
            />
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : props.mode === "create" ? "Add server" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
