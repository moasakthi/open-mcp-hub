"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminDeleteButton({
  endpoint,
  confirmMessage,
  label = "Remove",
}: {
  endpoint: string;
  confirmMessage: string;
  label?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    setDeleting(false);

    if (response.ok) router.refresh();
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
      {deleting ? "Removing..." : label}
    </Button>
  );
}
