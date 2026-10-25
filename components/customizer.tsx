"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, Check, RotateCcw, Shuffle, ShoppingBag } from "lucide-react";
import {
  CUSTOM_BUILD,
  CUSTOM_PRICE,
  DEFAULT_CUSTOM,
  PALETTE,
  PRESETS,
  SIZES,
  ZONES,
  ZONE_INFO,
  colorName,
  parseColors,
  type ShoeColors,
  type Zone,
} from "@/data/products";
import { ShoeStage } from "@/components/shoe/shoe-stage";
import { ZONE_VIEWS } from "@/components/shoe/rig";
import { isLightColor } from "@/components/shoe-art";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { addToBag } from "@/lib/bag";
import { toast } from "@/lib/toast";
import { cn, formatPrice } from "@/lib/format";

interface Draft {
  colors: ShoeColors;
  name: string;
}

const draftStore = createLocalStore<Draft>("redtape:custom-draft:v1", { colors: DEFAULT_CUSTOM, name: "" }, (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const draft = raw as Partial<Draft>;
  const colors = parseColors(draft.colors);
  if (!colors) return null;
  return { colors, name: typeof draft.name === "string" ? draft.name.slice(0, 24) : "" };
});

const sameColors = (a: ShoeColors, b: ShoeColors) => ZONES.every((zone) => a[zone].toLowerCase() === b[zone].toLowerCase());

export function Customizer() {
  const draft = useLocalStore(draftStore);
  const { colors, name } = draft;
  const [zone, setZone] = useState<Zone>("upper");
  const [view, setView] = useState<{ yaw: number; pitch: number; key: number } | null>(null);
  const [pulse, setPulse] = useState<{ zone: Zone; key: number } | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const sizeGroup = useRef<HTMLDivElement>(null);
  // Monotonic keys so repeated requests (same zone twice) still re-apply.
  const ticket = useRef(0);
  const nextKey = () => ++ticket.current;
  const ids = { palette: useId(), custom: useId(), name: useId(), size: useId(), sizeError: useId() };

  const isDefault = sameColors(colors, DEFAULT_CUSTOM) && name === "";
  const activePreset = PRESETS.find((preset) => sameColors(preset.colors, colors));

  const selectZone = (next: Zone) => {
    setZone(next);
    setView({ ...ZONE_VIEWS[next], key: nextKey() });
  };

  const paint = (hex: string) => {
    draftStore.set((current) => ({ ...current, colors: { ...current.colors, [zone]: hex } }));
    setPulse({ zone, key: nextKey() });
  };

  const applyColors = (next: ShoeColors) => {
    draftStore.set((current) => ({ ...current, colors: next }));
    setView({ ...ZONE_VIEWS.upper, key: nextKey() });
  };

  const randomize = () => {
    const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)].hex;
    const next = Object.fromEntries(ZONES.map((z) => [z, pick()])) as ShoeColors;
    applyColors(next);
  };

  const reset = () => {
    draftStore.reset();
    setZone("upper");
    setSize(null);
    setSizeError(false);
    setView({ ...ZONE_VIEWS.upper, key: nextKey() });
    toast({ title: "Design reset", description: "Back to the Signal starting point. Your saved draft was cleared." });
  };

  const add = () => {
    if (!size) {
      setSizeError(true);
      sizeGroup.current?.querySelector("button")?.focus();
      return;
    }
    const title = name.trim() || "Custom build";
    addToBag({
      id: `custom:${ZONES.map((z) => colors[z].slice(1)).join("")}:${name.trim()}:${size}`,
      kind: "custom",
      name: title,
      code: "RT-CX",
      variant: `${colorName(colors.upper)} upper, ${colorName(colors.accent)} tape`,
      size,
      unitPrice: CUSTOM_PRICE,
      colors,
      build: CUSTOM_BUILD,
      href: "/customize",
    });
    toast({ title: "Added to bag", description: `${title} · US ${size}`, action: { label: "View bag", href: "/bag" } });
  };

  const current = colors[zone];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,1fr)] lg:gap-12">
      {/* Preview */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--gutter)] border-b border-line bg-ink/95 backdrop-blur lg:top-[calc(var(--header-h)+1.5rem)] lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="relative lg:overflow-hidden lg:rounded-[var(--radius-md)] lg:border lg:border-line lg:bg-surface">
          <ShoeStage
            colors={colors}
            build={CUSTOM_BUILD}
            label={`Your custom pair: ${ZONES.map((z) => `${ZONE_INFO[z].label} ${colorName(colors[z])}`).join(", ")}`}
            view={view}
            pulse={pulse}
            fill={0.9}
            glow="strong"
            className="h-[34svh] min-h-56 w-full lg:aspect-[5/4] lg:h-auto"
          />
          <p className="eyebrow pointer-events-none absolute left-4 top-4 hidden text-dim lg:block">
            Editing · <span className="text-paper">{ZONE_INFO[zone].label}</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-8">
        <div>
          <p className="eyebrow text-signal">Build your pair</p>
          <h1 className="display-lg mt-3">Make it yours</h1>
          <p className="mt-4 text-mute">
            Based on the Strand runner. Choose a zone, then a colour: the preview updates as you go and your draft is
            saved in this browser.
          </p>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-xl">{formatPrice(CUSTOM_PRICE)}</span>
            <span className="eyebrow text-dim">Concept price</span>
          </p>
        </div>

        <section aria-labelledby="presets-title">
          <h2 id="presets-title" className="eyebrow text-dim">
            Start from a preset
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </section>

        <section aria-labelledby="zones-title" className="border-t border-line pt-6">
          <h2 id="zones-title" className="eyebrow text-dim">
            1 · Choose a zone
          </h2>
          <div role="group" aria-labelledby="zones-title" className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {ZONES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={zone === item}
                onClick={() => selectZone(item)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-[var(--radius-xs)] border px-3 text-left text-[0.9rem] transition-colors",
                  zone === item ? "border-paper bg-surface-2" : "border-line hover:border-line-strong",
                )}
              >
                <span aria-hidden className="size-5 shrink-0 rounded-full ring-1 ring-white/20" style={{ background: colors[item] }} />
                <span className="min-w-0">
                  <span className="block font-semibold leading-tight">{ZONE_INFO[item].label}</span>
                  <span className="block truncate text-[0.75rem] text-dim">{colorName(colors[item])}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby={ids.palette} className="border-t border-line pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id={ids.palette} className="eyebrow text-dim">
              2 · Colour for {ZONE_INFO[zone].label.toLowerCase()}
            </h2>
            <p className="text-[0.85rem] text-mute">{ZONE_INFO[zone].hint}</p>
          </div>
          <div role="group" aria-labelledby={ids.palette} className="mt-3 grid grid-cols-7 gap-1.5">
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
                    "relative grid aspect-square min-h-11 place-items-center rounded-[var(--radius-xs)] ring-1 ring-inset ring-white/15 transition-transform duration-200 hover:scale-[1.06]",
                    selected && "ring-2 ring-paper ring-offset-2 ring-offset-ink",
                  )}
                  style={{ background: swatch.hex }}
                >
                  {selected && <Check className={cn("size-4", isLightColor(swatch.hex) ? "text-ink" : "text-paper")} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label htmlFor={ids.custom} className="flex items-center gap-3 text-[0.9rem]">
              <span className="relative grid size-11 place-items-center overflow-hidden rounded-[var(--radius-xs)] ring-1 ring-inset ring-line-strong">
                <input
                  id={ids.custom}
                  type="color"
                  value={current}
                  onChange={(event) => paint(event.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <span aria-hidden className="size-6 rounded-full" style={{ background: current }} />
              </span>
              Custom colour
            </label>
            <p className="text-[0.9rem]" aria-live="polite">
              <span className="text-mute">{ZONE_INFO[zone].label}: </span>
              {colorName(current)} <span className="font-mono text-dim">{current.toUpperCase()}</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="summary-title" className="border-t border-line pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="summary-title" className="eyebrow text-dim">
              3 · Your design
            </h2>
            <div className="flex gap-1">
              <button type="button" onClick={randomize} className="btn btn-quiet min-h-11 px-3 text-[0.82rem]">
                <Shuffle className="size-4" /> Randomize
              </button>
              <button type="button" onClick={reset} disabled={isDefault} className="btn btn-quiet min-h-11 px-3 text-[0.82rem] disabled:opacity-40">
                <RotateCcw className="size-4" /> Reset
              </button>
            </div>
          </div>
          <dl className="mt-3 divide-y divide-line rounded-[var(--radius-sm)] border border-line bg-surface">
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
          <div className="mt-4">
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
        </section>

        <section aria-labelledby={ids.size} className="border-t border-line pt-6">
          <h2 id={ids.size} className="eyebrow text-dim">
            4 · Size · US
          </h2>
          <div
            ref={sizeGroup}
            role="group"
            aria-labelledby={ids.size}
            aria-describedby={sizeError ? ids.sizeError : undefined}
            className="mt-3 grid grid-cols-6 gap-1.5"
          >
            {SIZES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={size === item}
                onClick={() => {
                  setSize(item);
                  setSizeError(false);
                }}
                className={cn(
                  "h-11 rounded-[var(--radius-xs)] border font-mono text-[0.85rem] transition-colors",
                  size === item ? "border-paper bg-paper text-ink" : sizeError ? "border-signal/70" : "border-line-strong hover:border-mute",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          {sizeError && (
            <p id={ids.sizeError} role="alert" className="mt-3 flex items-center gap-2 text-[0.9rem] text-signal-hot">
              <AlertCircle className="size-4" /> Choose a size before adding your build.
            </p>
          )}
          <button type="button" onClick={add} className="btn btn-primary mt-5 w-full">
            <ShoppingBag className="size-4" strokeWidth={2} /> Add custom pair · {formatPrice(CUSTOM_PRICE)}
          </button>
          <p className="mt-3 text-[0.82rem] text-dim">Concept demo: nothing is produced, ordered or charged.</p>
        </section>
      </div>
    </div>
  );
}
