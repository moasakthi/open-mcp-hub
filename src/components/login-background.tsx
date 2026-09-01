"use client";

import { useReducedMotion } from "framer-motion";
import Aurora from "@/components/Aurora";

// Decorative only — skipped entirely under prefers-reduced-motion (the page
// still reads fine against the plain gradient already set on <body>).
export function LoginBackground() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <Aurora colorStops={["#16a34a", "#38bdf8", "#22c55e"]} amplitude={0.9} blend={0.6} speed={0.6} />
    </div>
  );
}
