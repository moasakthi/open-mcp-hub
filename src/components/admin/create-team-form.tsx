"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateTeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong.");
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <Input
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create team"}
      </Button>
    </form>
  );
}
