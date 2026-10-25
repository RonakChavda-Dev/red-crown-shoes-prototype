"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { Hand, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import type { Build, ShoeColors, Zone } from "@/data/products";
import { ShoeArt } from "@/components/shoe-art";
import { cn } from "@/lib/format";
import { Rig } from "./rig";

const ShoeCanvas = dynamic(() => import("./shoe-canvas"), { ssr: false });

/* ── WebGL capability (cached, client-only) ── */
let webglSupport: boolean | null = null;
function detectWebgl() {
  if (webglSupport !== null) return webglSupport;
  try {
    if (new URLSearchParams(window.location.search).get("webgl") === "off") return (webglSupport = false);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webglSupport = !!ctx;
    (ctx as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
const noop = () => () => {};
function useWebgl(): boolean | null {
  return useSyncExternalStore(noop, detectWebgl, () => null);
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface ShoeStageProps {
  colors: ShoeColors;
  build: Build;
  /** What the shoe is, for assistive tech, e.g. "Strand in Bone / Signal". */
  label: string;
  /** Request a camera angle; change `key` to re-apply the same view. */
  view?: { yaw: number; pitch: number; key: number } | null;
  pulse?: { zone: Zone; key: number } | null;
  fill?: number;
  controls?: boolean;
  className?: string;
  glow?: "strong" | "soft";
}

type Status = "loading" | "ready" | "failed";

export function ShoeStage({ colors, build, label, view, pulse, fill, controls = true, className, glow = "soft" }: ShoeStageProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const webgl = useWebgl();
  const [status, setStatus] = useState<Status>("loading");
  const [touched, setTouched] = useState(false);
  const [rig] = useState(() => new Rig());
  const wrapper = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; id: number; type: string } | null>(null);
  const introPlayed = useRef(false);
  const hintId = useId();

  const show3d = webgl === true && status !== "failed";
  const ready = show3d && status === "ready";

  // Intro spin only for people who are fine with motion.
  useEffect(() => {
    if (introPlayed.current || reducedMotion) return;
    introPlayed.current = true;
    rig.playIntro();
  }, [reducedMotion, rig]);

  // Pause rendering offscreen or in a background tab.
  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    let onScreen = true;
    const update = () => rig.setActive(onScreen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [rig]);

  useEffect(() => {
    if (view) rig.setView(view.yaw, view.pitch);
  }, [view, rig]);

  const nudge = useCallback(
    (yaw: number, pitch = 0) => {
      rig.nudge(yaw, pitch);
      setTouched(true);
    },
    [rig],
  );

  const reset = useCallback(() => rig.reset(), [rig]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!ready || event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId, type: event.pointerType };
    event.currentTarget.setPointerCapture(event.pointerId);
    rig.setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    d.x = event.clientX;
    d.y = event.clientY;
    // Touch only rotates horizontally so vertical swipes keep scrolling the page.
    rig.nudge(dx * 0.011, d.type === "touch" ? 0 : dy * 0.007);
    if (!touched && Math.abs(dx) > 1) setTouched(true);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    rig.setDragging(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!ready || event.target !== event.currentTarget) return;
    const step = event.shiftKey ? 0.8 : 0.35;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => nudge(-step),
      ArrowRight: () => nudge(step),
      ArrowUp: () => nudge(0, -0.2),
      ArrowDown: () => nudge(0, 0.2),
      Home: reset,
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <div
      ref={wrapper}
      role="group"
      aria-roledescription={ready ? "3D viewer" : undefined}
      aria-label={ready ? `${label}, interactive 3D view` : label}
      aria-describedby={ready ? hintId : undefined}
      tabIndex={ready ? 0 : undefined}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "group/stage relative isolate select-none outline-none",
        ready && "cursor-grab active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-0",
        className,
      )}
      style={{ touchAction: "pan-y" }}
    >
      {/* Controlled red light pooled under the shoe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] bottom-[4%] top-[38%] -z-10"
        style={{
          background:
            glow === "strong"
              ? "radial-gradient(50% 42% at 50% 62%, rgb(255 38 56 / .34), rgb(255 38 56 / .1) 55%, transparent 75%)"
              : "radial-gradient(48% 38% at 50% 64%, rgb(255 38 56 / .2), transparent 72%)",
        }}
      />

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center px-[4%] transition-[opacity,transform] ease-out",
          ready ? "scale-[0.97] opacity-0 duration-200" : "opacity-100 duration-500",
        )}
        aria-hidden={ready}
      >
        <ShoeArt colors={colors} build={build} title={ready ? undefined : label} className="h-auto max-h-full w-full max-w-full" />
      </div>

      {show3d && (
        <SceneBoundary onError={() => setStatus("failed")}>
          <div className={cn("absolute inset-0 transition-opacity delay-100 duration-700", ready ? "opacity-100" : "opacity-0")}>
            <ShoeCanvas
              colors={colors}
              build={build}
              rig={rig}
              reducedMotion={reducedMotion}
              pulse={pulse}
              fill={fill}
              onReady={() => setStatus((s) => (s === "loading" ? "ready" : s))}
              onError={() => setStatus("failed")}
            />
          </div>
        </SceneBoundary>
      )}

      <p id={hintId} className="sr-only">
        Drag to rotate, or use the arrow keys while this view is focused. Press Home to reset the angle.
      </p>

      {controls && ready && (
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <p
            aria-hidden
            className={cn(
              "eyebrow flex items-center gap-2 text-dim transition-opacity duration-500",
              touched ? "opacity-0" : "opacity-100",
            )}
          >
            <Hand className="size-3.5" strokeWidth={1.75} /> Drag to rotate
          </p>
          <div className="flex gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
            <StageButton label="Rotate left" onClick={() => nudge(-0.6)}>
              <RotateCcw className="size-4" strokeWidth={1.75} />
            </StageButton>
            <StageButton label="Rotate right" onClick={() => nudge(0.6)}>
              <RotateCw className="size-4" strokeWidth={1.75} />
            </StageButton>
            <StageButton label="Reset view" onClick={reset}>
              <Undo2 className="size-4" strokeWidth={1.75} />
            </StageButton>
          </div>
        </div>
      )}

      {status === "failed" || webgl === false ? (
        <p className="eyebrow absolute bottom-3 left-3 text-dim">Illustrated view · 3D unavailable on this device</p>
      ) : null}
    </div>
  );
}

function StageButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-11 place-items-center rounded-[var(--radius-xs)] border border-line bg-ink/70 text-mute backdrop-blur-sm transition-colors hover:border-line-strong hover:text-paper focus-visible:text-paper"
    >
      {children}
    </button>
  );
}
