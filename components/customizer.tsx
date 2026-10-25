"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ClipboardCopy, RotateCcw, Shuffle } from "lucide-react";
import {
  CUSTOM_BUILD,
  DEFAULT_CUSTOM,
  FINISHES,
  PALETTE,
  PRESETS,
  ZONES,
  ZONE_INFO,
  colorName,
  parseColors,
  type Finish,
  type ShoeColors,
  type Zone,
} from "@/data/products";
import { ShoeStage } from "@/components/shoe/shoe-stage";
import { ZONE_VIEWS } from "@/components/shoe/rig";
import { isLightColor } from "@/components/shoe-art";
import { ColorPicker } from "@/components/color-picker";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { normalizeHex } from "@/lib/color";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/format";
import { presetImageFor } from "@/lib/shoe-images";

interface Draft {
  colors: ShoeColors;
  finish: Finish;
  name: string;
  recent: string[];
}

const FALLBACK: Draft = { colors: DEFAULT_CUSTOM, finish: "knit", name: "", recent: [] };
const isFinish = (value: unknown): value is Finish => FINISHES.some((f) => f.id === value);

const draftStore = createLocalStore<Draft>("redtape:custom-draft:v2", FALLBACK, (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const draft = raw as Partial<Draft>;
  const colors = parseColors(draft.colors);
  if (!colors) return null;
  return {
    colors,
    finish: isFinish(draft.finish) ? draft.finish : "knit",
    name: typeof draft.name === "string" ? draft.name.slice(0, 24) : "",
    recent: Array.isArray(draft.recent)
      ? draft.recent.map((hex) => (typeof hex === "string" ? normalizeHex(hex) : null)).filter((hex): hex is string => !!hex).slice(0, 8)
      : [],
  };
});

const sameColors = (a: ShoeColors, b: ShoeColors) => ZONES.every((zone) => a[zone].toLowerCase() === b[zone].toLowerCase());
const finishLabel = (finish: Finish) => FINISHES.find((f) => f.id === finish)!.label;

export function Customizer() {
  const draft = useLocalStore(draftStore);
  const { colors, finish, name, recent } = draft;
  const [zone, setZone] = useState<Zone>("upper");
  const [view, setView] = useState<{ yaw: number; pitch: number; key: number } | null>(null);
  const [pulse, setPulse] = useState<{ zone: Zone; key: number } | null>(null);
  const ticket = useRef(0);
  const recentTimer = useRef<number | undefined>(undefined);
  const ids = { palette: useId(), name: useId(), finish: useId() };

  useEffect(() => () => window.clearTimeout(recentTimer.current), []);

  const nextKey = () => ++ticket.current;
  const isDefault = sameColors(colors, DEFAULT_CUSTOM) && finish === "knit" && name === "";
  const activePreset = PRESETS.find((preset) => sameColors(preset.colors, colors));
  const current = colors[zone];

  const selectZone = (next: Zone) => {
    setZone(next);
    setView({ ...ZONE_VIEWS[next], key: nextKey() });
  };

  const paint = (hex: string) => {
    draftStore.set((d) => ({ ...d, colors: { ...d.colors, [zone]: hex.toUpperCase() } }));
    setPulse({ zone, key: nextKey() });
  };

  /** Custom colours land in "Recent" once the person settles on them. */
  const paintCustom = (hex: string) => {
    paint(hex);
    window.clearTimeout(recentTimer.current);
    recentTimer.current = window.setTimeout(() => {
      const value = hex.toUpperCase();
      if (PALETTE.some((swatch) => swatch.hex === value)) return;
      draftStore.set((d) => ({ ...d, recent: [value, ...d.recent.filter((c) => c !== value)].slice(0, 8) }));
    }, 700);
  };

  const applyColors = (next: ShoeColors) => {
    draftStore.set((d) => ({ ...d, colors: next }));
    setView({ ...ZONE_VIEWS.upper, key: nextKey() });
  };

  const randomize = () => {
    const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)].hex;
    applyColors(Object.fromEntries(ZONES.map((z) => [z, pick()])) as ShoeColors);
  };

  const reset = () => {
    draftStore.reset();
    setZone("upper");
    setView({ ...ZONE_VIEWS.upper, key: nextKey() });
    toast({ title: "Design reset", description: "Back to the Signal starting point. Your saved draft was cleared." });
  };

  const copySpec = async () => {
    const lines = [
      name.trim() || "Red Crown custom build",
      `Finish: ${finishLabel(finish)}`,
      ...ZONES.map((z) => `${ZONE_INFO[z].label}: ${colorName(colors[z])} (${colors[z].toUpperCase()})`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast({ title: "Colour spec copied", description: "Paste it anywhere to keep or share your build." });
    } catch {
      toast({ title: "Couldn't copy", description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(23rem,1fr)] lg:gap-12">
      {/* Preview */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--gutter)] border-b border-line bg-ink/95 backdrop-blur lg:top-[calc(var(--header-h)+1.5rem)] lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="relative lg:overflow-hidden lg:rounded-[var(--radius-md)] lg:border lg:border-line lg:bg-surface">
          <ShoeStage
            colors={colors}
            build={CUSTOM_BUILD}
            finish={finish}
            label={`Your custom pair in ${finishLabel(finish).toLowerCase()}: ${ZONES.map((z) => `${ZONE_INFO[z].label} ${colorName(colors[z])}`).join(", ")}`}
            view={view}
            pulse={pulse}
            fill={0.9}
            glow="strong"
            poster={presetImageFor(colors)}
            priority
            className="h-[36svh] min-h-60 w-full lg:aspect-[5/4] lg:h-auto"
          />
          <div className="pointer-events-none absolute left-4 right-4 top-4 hidden items-start justify-between lg:flex">
            <p className="eyebrow text-dim">
              Editing · <span className="text-paper">{ZONE_INFO[zone].label}</span>
            </p>
            <p className="eyebrow text-dim">{finishLabel(finish)}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-10">
        <header>
          <p className="eyebrow text-signal">Build your pair</p>
          <h1 className="display-lg mt-4">Make it yours</h1>
          <p className="mt-5 text-mute">
            Based on the Strand runner. Choose a zone, then a colour and a finish. The preview updates as you go, and
            your design is saved in this browser.
          </p>
        </header>

        <Step title="Start from a preset">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="chip"
                aria-pressed={activePreset?.name === preset.name}
                onClick={() => applyColors(preset.colors)}
              >
                <span
                  aria-hidden
                  className="size-3 rounded-full ring-1 ring-white/20"
                  style={{ background: `linear-gradient(135deg, ${preset.colors.upper} 50%, ${preset.colors.accent} 50%)` }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </Step>

        <Step index={1} title="Choose a zone">
          <div role="group" aria-label="Zone" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ZONES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={zone === item}
                onClick={() => selectZone(item)}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-[var(--radius-sm)] border px-3 text-left transition-colors",
                  zone === item ? "border-paper bg-surface-2" : "border-line hover:border-line-strong",
                )}
              >
                <span aria-hidden className="size-5 shrink-0 rounded-full ring-1 ring-white/20" style={{ background: colors[item] }} />
                <span className="min-w-0">
                  <span className="block text-[0.9rem] font-semibold leading-tight">{ZONE_INFO[item].label}</span>
                  <span className="mt-0.5 block truncate text-[0.75rem] text-dim">{colorName(colors[item])}</span>
                </span>
              </button>
            ))}
          </div>
        </Step>

        <Step index={2} title={`Colour for ${ZONE_INFO[zone].label.toLowerCase()}`} aside={ZONE_INFO[zone].hint} id={ids.palette}>
          <div role="group" aria-labelledby={ids.palette} className="grid grid-cols-7 gap-2">
            {PALETTE.map((swatch) => {
              const selected = swatch.hex.toLowerCase() === current.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  aria-pressed={selected}
                  aria-label={swatch.name}
                  title={swatch.name}
                  onClick={() => paint(swatch.hex)}
                  className={cn(
                    "grid aspect-square min-h-11 place-items-center rounded-full ring-1 ring-inset ring-white/15 transition-transform duration-200 hover:scale-[1.08]",
                    selected && "ring-2 ring-paper ring-offset-2 ring-offset-ink",
                  )}
                  style={{ background: swatch.hex }}
                >
                  {selected && <Check className={cn("size-4", isLightColor(swatch.hex) ? "text-ink" : "text-paper")} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <p className="mt-4 flex items-baseline justify-between gap-3 text-[0.9rem]" aria-live="polite">
            <span className="text-mute">{ZONE_INFO[zone].label}</span>
            <span>
              {colorName(current)} <span className="font-mono text-dim">{current.toUpperCase()}</span>
            </span>
          </p>
          <div className="mt-5">
            <ColorPicker value={current} onChange={paintCustom} recent={recent} label={ZONE_INFO[zone].label} />
          </div>
        </Step>

        <Step index={3} title="Upper finish" id={ids.finish}>
          <div role="group" aria-labelledby={ids.finish} className="grid gap-2 sm:grid-cols-3">
            {FINISHES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={finish === item.id}
                onClick={() => {
                  draftStore.set((d) => ({ ...d, finish: item.id }));
                  setView({ ...ZONE_VIEWS.upper, key: nextKey() });
                  setPulse({ zone: "upper", key: nextKey() });
                }}
                className={cn(
                  "rounded-[var(--radius-sm)] border p-3.5 text-left transition-colors",
                  finish === item.id ? "border-paper bg-surface-2" : "border-line hover:border-line-strong",
                )}
              >
                <span className={cn("finish-swatch block h-10 rounded-[var(--radius-xs)]", `finish-${item.id}`)} style={{ "--c": colors.upper } as React.CSSProperties} />
                <span className="mt-3 block text-[0.9rem] font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-[0.78rem] leading-snug text-dim">{item.note}</span>
              </button>
            ))}
          </div>
        </Step>

        <Step
          index={4}
          title="Your design"
          aside={
            <span className="flex gap-1.5">
              <button type="button" onClick={randomize} className="btn btn-quiet min-h-10 px-3 text-[0.8rem]">
                <Shuffle className="size-4" /> Randomize
              </button>
              <button type="button" onClick={reset} disabled={isDefault} className="btn btn-quiet min-h-10 px-3 text-[0.8rem] disabled:opacity-40">
                <RotateCcw className="size-4" /> Reset
              </button>
            </span>
          }
        >
          <div>
            <label htmlFor={ids.name} className="eyebrow text-dim">
              Name your build <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id={ids.name}
              type="text"
              maxLength={24}
              value={name}
              placeholder="e.g. Late Shift"
              onChange={(event) => draftStore.set((d) => ({ ...d, name: event.target.value }))}
              className="field mt-2 w-full placeholder:text-dim"
            />
          </div>
          <dl className="mt-4 divide-y divide-line rounded-[var(--radius-sm)] border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-[0.9rem] text-mute">Finish</dt>
              <dd className="text-[0.9rem]">{finishLabel(finish)}</dd>
            </div>
            {ZONES.map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 px-4 py-3">
                <dt className="text-[0.9rem] text-mute">{ZONE_INFO[item].label}</dt>
                <dd className="flex items-center gap-2.5 text-[0.9rem]">
                  {colorName(colors[item])}
                  <span aria-hidden className="size-4 rounded-full ring-1 ring-white/20" style={{ background: colors[item] }} />
                </dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={copySpec} className="btn btn-ghost mt-4 w-full">
            <ClipboardCopy className="size-4" /> Copy colour spec
          </button>
          <p className="mt-3 text-[0.82rem] text-dim">A concept showcase: designs stay in your browser and nothing is produced.</p>
        </Step>
      </div>
    </div>
  );
}

function Step({
  index,
  title,
  aside,
  id,
  children,
}: {
  index?: number;
  title: string;
  aside?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  const autoId = useId();
  const headingId = id ?? autoId;
  return (
    <section aria-labelledby={headingId} className="border-t border-line pt-6">
      <div className="mb-4 flex min-h-10 items-center justify-between gap-4">
        <h2 id={headingId} className="eyebrow text-dim">
          {index !== undefined && <span className="text-signal">0{index} · </span>}
          {title}
        </h2>
        {typeof aside === "string" ? <p className="text-right text-[0.82rem] text-mute">{aside}</p> : aside}
      </div>
      {children}
    </section>
  );
}
