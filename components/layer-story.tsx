"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_BUILD, HERO_COLORS, ZONE_INFO, type Zone } from "@/data/products";
import { ShoeArt } from "@/components/shoe-art";
import { cn } from "@/lib/format";

const LAYERS: { zone: Zone; title: string; body: string }[] = [
  {
    zone: "upper",
    title: "One continuous knit",
    body: "The upper is knitted as a single piece: denser where the foot needs hold, more open where it needs air, and without stitched seams to rub.",
  },
  {
    zone: "accent",
    title: "The tape that holds the fit",
    body: "A bonded strip runs from the sole up to the laces and wraps the heel. It is the line that locks the midfoot, and the one you will recognise from across the street.",
  },
  {
    zone: "midsole",
    title: "A rockered platform",
    body: "The foam midsole curves up at the toe and bevels at the heel, so each step is designed to roll through as one motion.",
  },
  {
    zone: "outsole",
    title: "Rubber only where it counts",
    body: "Rubber covers the contact zones and stops there. Less material underfoot keeps the shoe light and lets it flex where your foot does.",
  },
  {
    zone: "laces",
    title: "Flat laces, low eyelets",
    body: "Flat laces sit close to the foot and stay tied. Metal eyelets keep the lacing even from the toe to the collar.",
  },
];

export function LayerStory() {
  const [active, setActive] = useState<Zone>("upper");
  const steps = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.zone as Zone);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    steps.current.forEach((step) => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);

  const activeIndex = LAYERS.findIndex((layer) => layer.zone === active);

  return (
    <div className="grid gap-x-16 lg:grid-cols-2">
      <div className="sticky top-[var(--header-h)] z-10 -mx-[var(--gutter)] bg-ink/95 px-[var(--gutter)] pb-4 pt-2 backdrop-blur lg:top-[calc(var(--header-h)+3rem)] lg:mx-0 lg:h-[min(70vh,36rem)] lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="relative flex h-full flex-col justify-center">
          <ShoeArt
            colors={HERO_COLORS}
            build={HERO_BUILD}
            focus={active}
            title={`Strand with the ${ZONE_INFO[active].label.toLowerCase()} highlighted`}
            className="mx-auto h-auto w-full max-w-[34rem] lg:max-w-none"
          />
          <div className="mt-2 flex items-center gap-4 lg:mt-8">
            <span className="font-mono text-[0.8rem] text-signal">0{activeIndex + 1}</span>
            <div className="h-px flex-1 bg-line">
              <div
                className="h-px bg-signal transition-[width] duration-500 ease-[var(--ease-out-expo)]"
                style={{ width: `${((activeIndex + 1) / LAYERS.length) * 100}%` }}
              />
            </div>
            <span className="eyebrow text-mute">{ZONE_INFO[active].label}</span>
          </div>
        </div>
      </div>

      <ol className="relative">
        {LAYERS.map((layer, i) => (
          <li
            key={layer.zone}
            ref={(node) => {
              steps.current[i] = node;
            }}
            data-zone={layer.zone}
            className="flex min-h-[46vh] flex-col justify-center border-b border-line py-12 last:border-b-0 lg:min-h-[62vh]"
          >
            <p
              className={cn(
                "eyebrow transition-colors duration-300",
                active === layer.zone ? "text-signal" : "text-dim",
              )}
            >
              0{i + 1} · {ZONE_INFO[layer.zone].label}
            </p>
            <h3
              className={cn(
                "display-md mt-4 transition-colors duration-300",
                active === layer.zone ? "text-paper" : "text-dim",
              )}
            >
              {layer.title}
            </h3>
            <p className="mt-4 max-w-[30rem] text-[1.02rem] leading-relaxed text-mute">{layer.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
