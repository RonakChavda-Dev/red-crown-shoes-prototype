"use client";

import type { Colorway } from "@/data/products";
import { cn } from "@/lib/format";

/** A toggle-style colourway chip: upper colour with the accent as a wedge. */
export function ColorwayDot({
  colorway,
  checked,
  onSelect,
  size = "md",
}: {
  colorway: Colorway;
  checked: boolean;
  onSelect: () => void;
  size?: "md" | "lg";
}) {
  const { upper, accent, midsole } = colorway.colors;
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={colorway.name}
      title={colorway.name}
      onClick={onSelect}
      className={cn("group/dot grid place-items-center", size === "lg" ? "size-14" : "size-11")}
    >
      <span
        className={cn(
          "block rounded-full ring-1 ring-white/15 ring-offset-2 ring-offset-transparent transition-[box-shadow,transform] duration-200 group-hover/dot:scale-110",
          size === "lg" ? "size-9" : "size-6",
          checked && "ring-2 ring-paper ring-offset-surface",
        )}
        style={{ background: `conic-gradient(from 200deg, ${accent} 0 25%, ${upper} 25% 75%, ${midsole} 75% 100%)` }}
      />
    </button>
  );
}
