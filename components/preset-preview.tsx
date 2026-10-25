"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { PRESETS } from "@/data/products";
import { presetImage, SHOE_IMAGE } from "@/lib/shoe-images";

/** A taste of the customizer: switch between preset builds instantly. */
export function PresetPreview() {
  const [index, setIndex] = useState(0);
  const preset = PRESETS[index];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="eyebrow text-signal">Build your pair</p>
        <h2 className="display-lg mt-5">
          Your pair.
          <br />
          Your rules.
        </h2>
        <p className="lede mt-6 max-w-md">
          Pick a colour for each of the five zones, from the knit upper to the laces, and watch the shoe change as you
          go. Start from a preset or from scratch.
        </p>
        <div className="mt-8">
          <p className="eyebrow text-dim" id="preset-label">
            Try a preset
          </p>
          <div role="group" aria-labelledby="preset-label" className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((item, i) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className="chip"
              >
                <span
                  aria-hidden
                  className="size-3 rounded-full ring-1 ring-white/20"
                  style={{ background: `linear-gradient(135deg, ${item.colors.upper} 50%, ${item.colors.accent} 50%)` }}
                />
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <Link href="/customize" className="btn btn-primary group mt-10">
          Start building
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-[10%] bottom-[10%] top-1/3 rounded-full bg-signal/15 blur-3xl"
        />
        <div key={preset.name} className="preset-swap relative">
          <Image
            src={presetImage(preset.name)}
            alt={`The ${preset.name} preset rendered on the Red Crown runner`}
            width={SHOE_IMAGE.width}
            height={SHOE_IMAGE.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
