import { XMark } from "@/components/logo";
import { cn } from "@/lib/format";

const WORDS = ["Red Tape", "Concept season 01", "Built to move", "Yours to finish"];

/** The signature strip of red tape, unrolling once and then drifting slowly. */
export function TapeBand({ className }: { className?: string }) {
  const run = (
    <span className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <span key={word} className="flex items-center">
          <span className="px-6 font-display text-[1.15rem] uppercase tracking-[0.08em] sm:text-[1.35rem]">{word}</span>
          <XMark className="size-4 [&_path:nth-child(2)]:stroke-signal [&_path]:stroke-ink" />
        </span>
      ))}
    </span>
  );
  return (
    <div aria-hidden className={cn("pointer-events-none select-none drop-shadow-[0_0_28px_rgb(255_38_56/.35)]", className)}>
      {/* Torn ends: the outer clip stays put while the inner strip unrolls. */}
      <div
        style={{
          clipPath:
            "polygon(0 10%, 1.2% 0, 2.4% 6%, 97.6% 2%, 98.8% 0, 100% 12%, 99% 50%, 100% 90%, 98.6% 100%, 97.4% 94%, 2% 98%, 0.8% 100%, 0 88%, 1% 50%)",
        }}
      >
        <div className="animate-tape-in overflow-hidden bg-signal py-2.5 text-ink">
          <div className="flex w-max animate-marquee">
            {run}
            {run}
            {run}
            {run}
          </div>
        </div>
      </div>
    </div>
  );
}
