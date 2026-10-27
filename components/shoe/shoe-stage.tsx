"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { Hand, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import type { Build, Finish, ShoeColors, Zone } from "@/data/products";
import { ShoeArt } from "@/components/shoe-art";
import { cn } from "@/lib/format";
import { SHOE_IMAGE } from "@/lib/shoe-images";
import { Rig } from "./rig";

const ShoeCanvas = dynamic(() => import("./shoe-canvas"), { ssr: false });

/* ── WebGL capability (cached, client-only) ── */
let webglSupport: boolean | null = null;
function detectWebgl() {
  if (webglSupport !== null) return webglSupport;
  try {
    if (new URLSearchParams(window.location.search).get("webgl") === "off") return (webglSupport = false);
    const canvas = document.createElement("canvas");
    // The probe canvas is simply dropped: forcing a context loss here makes
    // Firefox log a "WebGL context was lost" warning on every page load.
    webglSupport = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
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
  finish?: Finish;
  controls?: boolean;
  className?: string;
  glow?: "strong" | "soft";
  /** Pre-rendered still of these colours: shown while loading and without WebGL. */
  poster?: string | null;
  /** Load the poster eagerly (above-the-fold stages). */
  priority?: boolean;
}

type Status = "loading" | "ready" | "failed";

/** Fresh canvases to try after a lost context or load error before settling on the still. */
const MAX_RETRIES = 3;

/** Height of the control row (44px buttons + 12px offset), kept clear of the shoe. */
const CONTROLS_INSET = 56;

export function ShoeStage({
  colors,
  build,
  label,
  view,
  pulse,
  fill,
  finish,
  controls = true,
  className,
  glow = "soft",
  poster,
  priority,
}: ShoeStageProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const webgl = useWebgl();
  const [status, setStatus] = useState<Status>("loading");
  const [touched, setTouched] = useState(false);
  // Bumping this remounts the canvas with a brand-new WebGL context.
  const [attempt, setAttempt] = useState(0);
  const failures = useRef(0);
  const [rig] = useState(() => new Rig());
  const wrapper = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
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

  /*
   * Contexts get lost for ordinary reasons: the renderer is torn down when a
   * page is kept alive in the background, Strict Mode remounts in development,
   * or the browser reclaims GPU memory. Recover with a new canvas and only
   * fall back to the still after repeated failures.
   */
  const onSceneError = useCallback(() => {
    failures.current += 1;
    if (failures.current > MAX_RETRIES) {
      setStatus("failed");
      return;
    }
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  // Effects re-run when a kept-alive page is shown again. Its renderer was torn
  // down while hidden, so start a fresh one.
  const shownBefore = useRef(false);
  useEffect(() => {
    if (!shownBefore.current) {
      shownBefore.current = true;
      return;
    }
    failures.current = 0;
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  const onSceneReady = useCallback(() => {
    failures.current = 0;
    setStatus((s) => (s === "loading" ? "ready" : s));
  }, []);

  /*
   * Touch gets its own direction-locked gesture. A swipe that starts sideways
   * grabs the shoe (and may then tilt it too); one that starts vertically is
   * left alone so the page scrolls as normal. Two fingers are left to the
   * browser for pinch-zoom. Native listeners are needed because React's
   * touchmove handlers are passive and can't stop the page from scrolling.
   */
  useEffect(() => {
    const element = wrapper.current;
    if (!element || !ready) return;
    let gesture: { x: number; y: number; startX: number; startY: number; mode: "pending" | "rotate" | "scroll" } | null = null;

    const end = () => {
      if (gesture?.mode === "rotate") rig.setDragging(false);
      gesture = null;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (event.target as Element).closest("button")) return end();
      const t = event.touches[0];
      gesture = { x: t.clientX, y: t.clientY, startX: t.clientX, startY: t.clientY, mode: "pending" };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!gesture || gesture.mode === "scroll") return;
      if (event.touches.length !== 1) return end();
      const t = event.touches[0];
      if (gesture.mode === "pending") {
        const ox = Math.abs(t.clientX - gesture.startX);
        const oy = Math.abs(t.clientY - gesture.startY);
        if (Math.max(ox, oy) < 6) return;
        // Sideways wins ties; once the page has started scrolling we can't take over.
        if (ox * 1.2 < oy || !event.cancelable) {
          gesture.mode = "scroll";
          return;
        }
        gesture.mode = "rotate";
        rig.setDragging(true);
        setTouched(true);
      }
      if (event.cancelable) event.preventDefault();
      const dx = t.clientX - gesture.x;
      const dy = t.clientY - gesture.y;
      gesture.x = t.clientX;
      gesture.y = t.clientY;
      rig.nudge(dx * 0.014, dy * 0.008);
    };

    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", end);
    element.addEventListener("touchcancel", end);
    return () => {
      end();
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", end);
      element.removeEventListener("touchcancel", end);
    };
  }, [ready, rig]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Touch is handled by the gesture above.
    if (!ready || event.button !== 0 || event.pointerType === "touch") return;
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
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
    rig.nudge(dx * 0.011, dy * 0.007);
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
      style={{ touchAction: "pan-y pinch-zoom" }}
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
          controls && "pb-14",
          ready ? "scale-[0.97] opacity-0 duration-200" : "opacity-100 duration-500",
        )}
        aria-hidden={ready}
      >
        {poster ? (
          <Image
            src={poster}
            alt={ready ? "" : label}
            width={SHOE_IMAGE.width}
            height={SHOE_IMAGE.height}
            sizes="(min-width: 1024px) 60vw, 100vw"
            preload={priority}
            loading={priority ? "eager" : undefined}
            className="h-auto max-h-full w-full object-contain"
          />
        ) : (
          <ShoeArt colors={colors} build={build} title={ready ? undefined : label} className="h-auto max-h-full w-full max-w-full" />
        )}
      </div>

      {show3d && (
        <SceneBoundary key={attempt} onError={onSceneError}>
          <div className={cn("absolute inset-0 transition-opacity delay-100 duration-700", ready ? "opacity-100" : "opacity-0")}>
            <ShoeCanvas
              colors={colors}
              rig={rig}
              reducedMotion={reducedMotion}
              pulse={pulse}
              fill={fill}
              finish={finish}
              bottomInset={controls ? CONTROLS_INSET : 0}
              onReady={onSceneReady}
              onError={onSceneError}
            />
          </div>
        </SceneBoundary>
      )}

      <p id={hintId} className="sr-only">
        Drag or swipe sideways to rotate, or use the arrow keys while this view is focused. Press Home to reset the angle.
      </p>

      {controls && ready && (
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <p
            aria-hidden
            className={cn(
              "eyebrow flex min-w-0 items-center gap-2 text-dim transition-opacity duration-500",
              touched ? "opacity-0" : "opacity-100",
            )}
          >
            <Hand className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="pointer-coarse:hidden">Drag to rotate</span>
            <span className="hidden pointer-coarse:inline">Swipe to rotate</span>
          </p>
          <div className="flex shrink-0 gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
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
        <p className="eyebrow absolute bottom-3 left-3 text-dim">{poster ? "Still view" : "Illustrated view"} · 3D unavailable on this device</p>
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
