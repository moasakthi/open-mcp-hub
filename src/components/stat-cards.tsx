"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Server, Blocks, CircleCheck, TriangleAlert } from "lucide-react";
import CountUp from "@/components/CountUp";
import { Card } from "@/components/ui/card";

export type DashboardStats = {
  servers: number;
  tools: number;
  online: number;
  needsAttention: number;
};

const ACCENT_CLASS = {
  primary: "bg-primary/15 text-primary ring-primary/30",
  destructive: "bg-destructive/15 text-destructive ring-destructive/30",
  muted: "bg-muted text-muted-foreground ring-border",
} as const;

export function StatCards({ stats }: { stats: DashboardStats }) {
  const reduceMotion = useReducedMotion();

  const cards = [
    { label: "Servers", value: stats.servers, icon: Server, accent: "muted" as const },
    { label: "Tools", value: stats.tools, icon: Blocks, accent: "primary" as const },
    { label: "Online", value: stats.online, icon: CircleCheck, accent: "primary" as const },
    {
      label: "Needs attention",
      value: stats.needsAttention,
      icon: TriangleAlert,
      accent: stats.needsAttention ? ("destructive" as const) : ("muted" as const),
    },
  ];

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } } }}
    >
      {cards.map((stat) => (
        <motion.div
          key={stat.label}
          variants={{
            hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className={`flex size-8 items-center justify-center rounded-lg ring-1 ${ACCENT_CLASS[stat.accent]}`}>
                <stat.icon className="size-4" />
              </div>
            </div>
            <div className="mt-3 font-heading text-3xl font-semibold tabular-nums">
              {reduceMotion ? stat.value : <CountUp to={stat.value} duration={1.1} />}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
