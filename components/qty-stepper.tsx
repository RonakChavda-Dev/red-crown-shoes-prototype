"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/lib/bag";

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-11 items-stretch rounded-[var(--radius-xs)] border border-line-strong">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className="grid w-11 place-items-center text-mute transition-colors hover:text-paper disabled:text-line-strong"
      >
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className="grid min-w-9 place-items-center border-x border-line font-mono text-[0.9rem]">
        <span className="sr-only">Quantity </span>
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label="Increase quantity"
        className="grid w-11 place-items-center text-mute transition-colors hover:text-paper disabled:text-line-strong"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
