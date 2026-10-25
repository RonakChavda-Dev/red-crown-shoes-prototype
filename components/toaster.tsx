"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { dismissToast, useToasts } from "@/lib/toast";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[24rem]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-[var(--radius-sm)] border border-line-strong bg-surface-2/95 p-4 shadow-[var(--shadow-raise)] backdrop-blur"
          >
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-signal text-ink">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.92rem] font-semibold">{item.title}</p>
              {item.description && <p className="mt-0.5 truncate text-[0.84rem] text-mute">{item.description}</p>}
              {item.action && (
                <Link
                  href={item.action.href}
                  onClick={() => dismissToast(item.id)}
                  className="link-draw mt-2 inline-block text-[0.84rem] font-semibold text-signal"
                >
                  {item.action.label}
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
              className="-m-2 grid size-10 shrink-0 place-items-center text-dim hover:text-paper"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
