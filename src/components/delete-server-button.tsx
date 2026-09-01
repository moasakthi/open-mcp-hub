"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteServerButton({ serverId, serverName }: { serverId: string; serverName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${serverName}" from the hub? This cannot be undone.`)) return;

    setDeleting(true);
    const response = await fetch(`/api/servers/${serverId}`, { method: "DELETE" });
    setDeleting(false);

    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
      {deleting ? "Removing..." : "Remove server"}
    </Button>
  );
}
