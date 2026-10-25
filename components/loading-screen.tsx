"use client";

import { useEffect, useState } from "react";

type Phase = "loading" | "leaving" | "done";

const LETTERS = "RED CROWN".split("");

/*
 * Self-contained styles: the loader paints before anything else, so it must
 * not depend on utility classes or the global stylesheet. React hoists this
 * <style> into <head> during SSR.
 */
const CSS = `
.rt-loader {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  background: var(--color-ink, #080808);
  color: var(--color-paper, #f4f2f0);
  clip-path: inset(0 0 0 0);
  transition: clip-path 0.95s cubic-bezier(0.76, 0, 0.24, 1);
  /* Failsafe: never trap the page if scripts stall. */
  animation: rt-loader-failsafe 0s 7s forwards;
}
.rt-loader[data-phase="leaving"] { clip-path: inset(0 0 100% 0); }
@media (scripting: none) { .rt-loader { display: none; } }
@keyframes rt-loader-failsafe { to { visibility: hidden; } }

.rt-loader__brand { display: flex; flex-direction: column; align-items: center; transition: transform 0.9s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.6s ease; }
.rt-loader[data-phase="leaving"] .rt-loader__brand { transform: translate3d(0, -40px, 0); opacity: 0; }

.rt-loader__mark { width: clamp(4.5rem, 9vw, 6rem); height: auto; display: block; }
.rt-loader__mark path { fill: none; stroke: var(--color-signal, #ff2638); stroke-width: 5.5; stroke-linecap: square; stroke-dasharray: 30; stroke-dashoffset: 30; animation: rt-loader-draw 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.rt-loader__mark path:nth-child(n + 2) { animation-delay: 0.22s; }
.rt-loader__mark .rt-loader__gap { stroke: var(--color-ink, #080808); stroke-width: 9; stroke-linecap: butt; }
@keyframes rt-loader-draw { to { stroke-dashoffset: 0; } }

.rt-loader__word { margin: 1.5rem 0 0; display: flex; overflow: hidden; font-family: var(--font-anton), Impact, "Arial Narrow Bold", sans-serif; font-size: clamp(2.4rem, 7vw, 4rem); line-height: 1; letter-spacing: 0.06em; text-transform: uppercase; }
.rt-loader__letter { display: inline-block; animation: rt-loader-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(0.35s + var(--i) * 45ms); }
@keyframes rt-loader-rise { from { transform: translate3d(0, 105%, 0); } }

.rt-loader__foot { position: absolute; left: 0; right: 0; bottom: 0; }
.rt-loader__meta { display: flex; justify-content: space-between; align-items: flex-end; max-width: 90rem; margin: 0 auto; padding: 0 clamp(1rem, 4vw, 3rem) 1.5rem; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-dim, #8a8681); }
.rt-loader__count { color: var(--color-paper, #f4f2f0); font-variant-numeric: tabular-nums; }
.rt-loader__track { height: 2px; background: var(--color-line, #27272b); }
.rt-loader__bar { height: 100%; background: var(--color-signal, #ff2638); transform-origin: left; transition: transform 0.3s ease-out; }

/* Hold the page's entrance animations and scrolling until the loader lifts. */
html:has(.rt-loader[data-phase="loading"]) { overflow: hidden; }
body:has(.rt-loader[data-phase="loading"]) .rise-line > span,
body:has(.rt-loader[data-phase="loading"]) .fade-up { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .rt-loader, .rt-loader * { animation-duration: 0.001ms !important; animation-delay: 0ms !important; transition-duration: 0.001ms !important; }
  .rt-loader { animation-delay: 7s !important; }
}
`;

/**
 * Branded intro shown while fonts and page images load. It is rendered on the
 * server so it covers the first paint, tracks real loading, never waits more
 * than a few seconds, and is skipped entirely without JavaScript.
 */
export function LoadingScreen() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const bump = (value: number) => {
      if (!cancelled) setProgress((current) => Math.max(current, value));
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let returning = false;
    try {
      returning = window.sessionStorage.getItem("redtape:intro") === "1";
      window.sessionStorage.setItem("redtape:intro", "1");
    } catch {
      // Storage blocked: treat as a first visit.
    }
    const minimum = reduced ? 0 : returning ? 350 : 1200;
    const started = performance.now();

    // Ease towards 90% while waiting; real milestones push it further.
    const creep = window.setInterval(() => {
      if (!cancelled) setProgress((current) => (current < 90 ? current + (90 - current) * 0.07 : current));
    }, 60);

    const fonts = document.fonts?.ready.then(() => bump(55)) ?? Promise.resolve();
    const page =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
    const ceiling = new Promise<void>((resolve) => later(resolve, 4000));

    Promise.race([Promise.all([fonts, page]), ceiling]).then(() => {
      later(() => {
        window.clearInterval(creep);
        bump(100);
        later(() => !cancelled && setPhase("leaving"), reduced ? 0 : 280);
        later(() => !cancelled && setPhase("done"), reduced ? 250 : 1250);
      }, Math.max(0, minimum - (performance.now() - started)));
    });

    return () => {
      cancelled = true;
      window.clearInterval(creep);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const percent = Math.round(progress);

  return (
    <>
      <style href="red-crown-loader" precedence="high">
        {CSS}
      </style>
      {phase !== "done" && (
        <div className="rt-loader" data-phase={phase} role="status" aria-live="polite" aria-label={`Loading Red Crown, ${percent}%`}>
          <div className="rt-loader__brand">
            <svg viewBox="0 0 32 32" className="rt-loader__mark" aria-hidden>
              <path d="M6 6 26 26" />
              <path d="M26 6 6 26" className="rt-loader__gap" />
              <path d="M26 6 6 26" />
            </svg>
            <p className="rt-loader__word" aria-hidden>
              {LETTERS.map((letter, i) => (
                <span key={i} className="rt-loader__letter" style={{ "--i": i } as React.CSSProperties}>
                  {letter === " " ? " " : letter}
                </span>
              ))}
            </p>
          </div>

          <div className="rt-loader__foot" aria-hidden>
            <div className="rt-loader__meta">
              <span>Concept season 01</span>
              <span className="rt-loader__count">{String(percent).padStart(3, "0")}%</span>
            </div>
            <div className="rt-loader__track">
              <div className="rt-loader__bar" style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
