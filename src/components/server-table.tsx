"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ONLINE: "default",
  OFFLINE: "secondary",
  ERROR: "destructive",
  UNKNOWN: "outline",
};

export type ServerRow = {
  id: string;
  name: string;
  description: string | null;
  transport: string;
  status: string;
  toolCount: number;
  createdByEmail: string;
};

export function ServerTable({ servers }: { servers: ServerRow[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-xl border bg-card dark:backdrop-blur-xl">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Transport</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Tools</th>
            <th className="px-4 py-3 font-medium">Added by</th>
          </tr>
        </thead>
        <motion.tbody
          className="divide-y divide-border"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: reduceMotion ? 0 : 0.045 } } }}
        >
          {servers.map((server) => (
            <motion.tr
              key={server.id}
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="transition-colors hover:bg-muted/40"
            >
              <td className="px-4 py-3">
                <Link href={`/servers/${server.id}`} className="font-medium hover:underline">
                  {server.name}
                </Link>
                {server.description && <p className="text-xs text-muted-foreground">{server.description}</p>}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{server.transport}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[server.status] ?? "outline"}>{server.status}</Badge>
              </td>
              <td className="px-4 py-3">{server.toolCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{server.createdByEmail}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
