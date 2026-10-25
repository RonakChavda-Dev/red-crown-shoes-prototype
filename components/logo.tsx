import { cn } from "@/lib/format";

/** The Red Tape X: two strips of tape, one laid over the other. */
export function XMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M6 6 26 26" stroke="var(--color-signal)" strokeWidth="5.5" strokeLinecap="square" />
      <path d="M26 6 6 26" stroke="var(--color-ink)" strokeWidth="9" strokeLinecap="butt" />
      <path d="M26 6 6 26" stroke="var(--color-signal)" strokeWidth="5.5" strokeLinecap="square" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <XMark className="size-6 shrink-0" />
      <span className="font-display text-[1.32rem] uppercase leading-none tracking-[0.06em]">Red Tape</span>
    </span>
  );
}
