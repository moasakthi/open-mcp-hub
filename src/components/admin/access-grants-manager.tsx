"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AccessLevel, ResourceType, SubjectType } from "@/lib/types";

type Option = { id: string; label: string };

export type AccessGrantDto = {
  id: string;
  subjectType: string;
  subjectId: string;
  resourceType: string;
  resourceId: string;
  level: string;
};

export function AccessGrantsManager({
  grants,
  users,
  teams,
  servers,
  tools,
}: {
  grants: AccessGrantDto[];
  users: Option[];
  teams: Option[];
  servers: Option[];
  tools: Option[];
}) {
  const router = useRouter();

  const [subjectType, setSubjectType] = useState<SubjectType>("USER");
  const [subjectId, setSubjectId] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("SERVER");
  const [resourceId, setResourceId] = useState("");
  const [level, setLevel] = useState<AccessLevel>("VIEW");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subjectOptions = subjectType === "USER" ? users : teams;
  const resourceOptions = resourceType === "SERVER" ? servers : tools;

  const lookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of [...users, ...teams, ...servers, ...tools]) map.set(o.id, o.label);
    return map;
  }, [users, teams, servers, tools]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!subjectId || !resourceId) {
      setError("Choose a subject and a resource.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/access-grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectType, subjectId, resourceType, resourceId, level }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong.");
      return;
    }

    setSubjectId("");
    setResourceId("");
    router.refresh();
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this access grant?")) return;
    const response = await fetch(`/api/access-grants/${id}`, { method: "DELETE" });
    if (response.ok) router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-2">
        <Field label="Subject type">
          <Select
            value={subjectType}
            onValueChange={(value) => {
              setSubjectType(value as SubjectType);
              setSubjectId("");
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="TEAM">Team</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Subject">
          <Select value={subjectId} onValueChange={(value) => setSubjectId(value ?? "")}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Resource type">
          <Select
            value={resourceType}
            onValueChange={(value) => {
              setResourceType(value as ResourceType);
              setResourceId("");
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SERVER">Server</SelectItem>
              <SelectItem value="TOOL">Tool</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Resource">
          <Select value={resourceId} onValueChange={(value) => setResourceId(value ?? "")}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {resourceOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Level">
          <Select value={level} onValueChange={(value) => setLevel(value as AccessLevel)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEW">View</SelectItem>
              <SelectItem value="USE">Use</SelectItem>
              <SelectItem value="MANAGE">Manage</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Granting..." : "Grant access"}
        </Button>
      </form>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {grants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No access grants yet — admins can see everything regardless.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card dark:backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grants.map((grant) => (
                <tr key={grant.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    {lookup.get(grant.subjectId) ?? grant.subjectId}
                    <Badge variant="outline" className="ml-2">
                      {grant.subjectType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {lookup.get(grant.resourceId) ?? grant.resourceId}
                    <Badge variant="outline" className="ml-2">
                      {grant.resourceType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{grant.level}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleRevoke(grant.id)}>
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
