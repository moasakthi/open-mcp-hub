"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SyncServerButton({ serverId }: { serverId: string }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setError(null);

    const response = await fetch(`/api/servers/${serverId}/sync`, { method: "POST" });
    const data = await response.json().catch(() => null);

    setSyncing(false);
    if (!response.ok) {
      setError(data?.error ?? "Sync failed");
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={handleSync} disabled={syncing}>
        {syncing ? "Syncing..." : "Sync now"}
      </Button>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
