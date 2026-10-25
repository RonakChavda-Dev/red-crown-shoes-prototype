"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { Check, Pipette } from "lucide-react";
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from "@/lib/color";
import { isLightColor } from "@/components/shoe-art";
import { cn } from "@/lib/format";

interface EyeDropperResult {
  sRGBHex: string;
}
type EyeDropperCtor = new () => { open: () => Promise<EyeDropperResult> };

const noop = () => () => {};
function useEyeDropper(): EyeDropperCtor | null {
  return useSyncExternalStore(
    noop,
    () => ((window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper ?? null),
    () => null,
  );
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * A full colour picker: saturation/brightness pad, hue slider, hex entry,
 * the native eyedropper where available, and recently used colours.
 */
export function ColorPicker({
  value,
  onChange,
  recent,
  label,
}: {
  value: string;
  onChange: (hex: string) => void;
  recent: string[];
  label: string;
}) {
  // Keep hue/saturation stable while dragging through greys and black.
  const [state, setState] = useState(() => ({ hsv: hexToHsv(value), hex: value.toUpperCase() }));
  const [draft, setDraft] = useState<string | null>(null);
  const pad = useRef<HTMLDivElement>(null);
  const EyeDropper = useEyeDropper();
  const ids = { hex: useId(), hue: useId(), hint: useId() };

  let hsv = state.hsv;
  if (state.hex !== value.toUpperCase()) {
    hsv = hexToHsv(value);
    setState({ hsv, hex: value.toUpperCase() });
  }

  const commit = (next: Hsv) => {
    const hex = hsvToHex(next);
    setState({ hsv: next, hex });
    onChange(hex);
  };

  const fromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = pad.current!.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    commit({ ...hsv, s, v });
  };

  const onPadKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: Math.max(0, hsv.s - step) },
      ArrowRight: { s: Math.min(1, hsv.s + step) },
      ArrowUp: { v: Math.min(1, hsv.v + step) },
      ArrowDown: { v: Math.max(0, hsv.v - step) },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    commit({ ...hsv, ...move });
  };

  const hexText = draft ?? value.toUpperCase();
  const draftValid = draft === null || normalizeHex(draft) !== null;

  const applyDraft = () => {
    if (draft === null) return;
    const hex = normalizeHex(draft);
    if (hex) onChange(hex);
    setDraft(null);
  };

  const pickFromScreen = async () => {
    if (!EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      const hex = normalizeHex(result.sRGBHex);
      if (hex) onChange(hex);
    } catch {
      // The person cancelled the eyedropper.
    }
  };

  const hueColor = `hsl(${hsv.h} 100% 50%)`;

  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.92rem] font-semibold">Mix your own</p>
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-dim">{label}</p>
      </div>

      {/* Saturation / brightness */}
      <div
        ref={pad}
        role="slider"
        tabIndex={0}
        aria-label={`Saturation and brightness for ${label.toLowerCase()}`}
        aria-describedby={ids.hint}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s * 100)}
        aria-valuetext={`Saturation ${pct(hsv.s)}, brightness ${pct(hsv.v)}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          fromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
        }}
        onKeyDown={onPadKey}
        className="relative mt-4 aspect-[16/9] w-full cursor-crosshair touch-none rounded-[var(--radius-sm)] ring-1 ring-inset ring-white/10"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgb(0_0_0/.4),0_4px_14px_rgb(0_0_0/.5)]"
          style={{ left: pct(hsv.s), top: pct(1 - hsv.v), background: value }}
        />
      </div>
      <p id={ids.hint} className="sr-only">
        Use left and right arrows for saturation, up and down for brightness. Hold Shift for bigger steps.
      </p>

      {/* Hue */}
      <label htmlFor={ids.hue} className="sr-only">
        Hue
      </label>
      <input
        id={ids.hue}
        type="range"
        min={0}
        max={359}
        value={Math.round(hsv.h)}
        aria-valuetext={`Hue ${Math.round(hsv.h)} degrees`}
        onChange={(event) => commit({ ...hsv, h: Number(event.target.value) })}
        className="hue-range mt-4 w-full"
        style={{ "--thumb": hueColor } as React.CSSProperties}
      />

      {/* Hex + eyedropper */}
      <div className="mt-4 flex items-center gap-2">
        <span
          aria-hidden
          className="size-11 shrink-0 rounded-[var(--radius-xs)] ring-1 ring-inset ring-white/15 transition-colors"
          style={{ background: value }}
        />
        <label htmlFor={ids.hex} className="sr-only">
          Hex colour
        </label>
        <div className="relative flex-1">
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-dim">
            #
          </span>
          <input
            id={ids.hex}
            value={hexText.replace(/^#/, "")}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={applyDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyDraft();
              if (event.key === "Escape") setDraft(null);
            }}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={!draftValid}
            className={cn("field w-full pl-7 font-mono uppercase", !draftValid && "border-signal")}
          />
        </div>
        {EyeDropper && (
          <button
            type="button"
            onClick={pickFromScreen}
            aria-label="Pick a colour from the screen"
            title="Pick from screen"
            className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-xs)] border border-line-strong text-mute transition-colors hover:border-paper hover:text-paper"
          >
            <Pipette className="size-4" />
          </button>
        )}
      </div>
      {!draftValid && <p className="mt-2 text-[0.82rem] text-signal-hot">Enter 3 or 6 hex digits, e.g. FF2638.</p>}

      {recent.length > 0 && (
        <div className="mt-4">
          <p className="eyebrow text-dim">Recent</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recent.map((hex) => {
              const selected = hex === value.toUpperCase();
              return (
                <button
                  key={hex}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Recent colour ${hex}`}
                  title={hex}
                  onClick={() => onChange(hex)}
                  className="grid size-9 place-items-center rounded-full ring-1 ring-inset ring-white/15 transition-transform hover:scale-110"
                  style={{ background: hex }}
                >
                  {selected && (
                    <Check className={cn("size-3.5", isLightColor(hex) ? "text-ink" : "text-paper")} strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
