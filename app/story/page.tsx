import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { PRESETS } from "@/data/products";
import { presetImage, SHOE_IMAGE } from "@/lib/shoe-images";
import { XMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Our approach",
  description: "The design principles behind Red Crown, a fictional footwear label: fewer parts, a shape built around the foot, and colour left to you.",
};

const PRINCIPLES = [
  {
    title: "Remove until it hurts. Add one thing back.",
    body: "Every style starts as a complete shoe and loses parts until it stops working. The one thing we add back is the tape: the single line that holds the fit and gives the shoe its identity.",
  },
  {
    title: "Built around the foot, not the trend.",
    body: "Shapes follow how feet move: room where the toes spread, a close hold at the midfoot, a curved sole for the roll from heel to toe. The silhouette is what's left when those are in place.",
  },
  {
    title: "Every material has one job.",
    body: "Knit for the upper, foam for the platform, rubber where the shoe meets the ground. Nothing is layered on for decoration, so nothing is there to wear out early or weigh the shoe down.",
  },
  {
    title: "Yours to finish.",
    body: "Colour is the last decision in the process, and we leave it to you. The customizer exposes the same five zones the collection is designed around.",
  },
];

const PROCESS = [
  { step: "Sketch", body: "Each style begins as a single side-profile line. If the silhouette doesn't read at a glance, it doesn't move on." },
  { step: "Last", body: "The profile is wrapped around a foot-shaped form that sets the volume, toe spring and heel curve." },
  { step: "Layer", body: "Knit, tape, midsole, outsole, laces: added in that order, and each one has to earn its place." },
  { step: "Tune", body: "Colourways are drawn last, in light and dark pairs, then opened up to you in the customizer." },
];

export default function StoryPage() {
  return (
    <>
      <section className="shell page-top grid items-end gap-10 pb-[var(--space-section)] lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow fade-up text-signal">Our approach</p>
          <h1 className="display-xl mt-5">
            <span className="rise-line">
              <span>Less, but</span>
            </span>
            <span className="rise-line">
              <span className="text-signal" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
                louder.
              </span>
            </span>
          </h1>
          <p className="lede fade-up mt-8 max-w-xl" style={{ "--rise-delay": "250ms" } as React.CSSProperties}>
            Red Crown is an imagined label: a design exercise in how far a sneaker can be simplified before it loses its
            character. These are the principles the collection was drawn around.
          </p>
        </div>
        <div className="fade-up relative" style={{ "--rise-delay": "300ms" } as React.CSSProperties}>
          <div aria-hidden className="absolute inset-x-[15%] bottom-[10%] top-1/3 rounded-full bg-signal/15 blur-3xl" />
          <Image
            src={presetImage(PRESETS[1].name)}
            alt="A pared-back Red Crown runner in tonal white"
            width={SHOE_IMAGE.width}
            height={SHOE_IMAGE.height}
            sizes="(min-width: 1024px) 45vw, 100vw"
            preload
            loading="eager"
            className="relative h-auto w-full"
          />
        </div>
      </section>

      <section id="principles" aria-labelledby="principles-title" className="border-y border-line bg-ink-2">
        <div className="shell section-y">
          <h2 id="principles-title" className="eyebrow reveal text-signal">
            Four principles
          </h2>
          <ol className="mt-stack">
            {PRINCIPLES.map((item, i) => (
              <li
                key={item.title}
                className="reveal grid gap-4 border-t border-line py-10 md:grid-cols-[6rem_1fr_1fr] md:gap-10"
              >
                <span className="font-display text-5xl text-signal">0{i + 1}</span>
                <h3 className="display-md">{item.title}</h3>
                <p className="leading-relaxed text-mute md:pt-1">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="process-title" className="shell section-y">
        <div className="reveal max-w-2xl">
          <p className="eyebrow text-signal">The imagined process</p>
          <h2 id="process-title" className="display-lg mt-4">
            How a pair comes together
          </h2>
          <p className="lede mt-5">
            A concept process, written the way we would want a real one to work. Four steps, always in the same order.
          </p>
        </div>
        <ol className="mt-stack grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((item, i) => (
            <li
              key={item.step}
              className="reveal group bg-surface p-7 transition-colors hover:bg-surface-2"
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.8rem] text-dim">Step 0{i + 1}</span>
                <XMark className="size-4 opacity-30 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="display-md mt-10">{item.step}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-mute">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="reality-title" className="shell page-bottom">
        <div className="reveal grid gap-8 rounded-[var(--radius-md)] border border-dashed border-line-strong p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <h2 id="reality-title" className="eyebrow text-signal">
              A note on reality
            </h2>
            <p className="display-sm mt-4 normal-case leading-snug">
              Red Crown doesn&apos;t exist. There is no factory, team or shop behind it.
            </p>
            <p className="mt-4 text-mute">
              This site is a design prototype. Every product, name, price and process step is fictional, and nothing can
              be bought.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/customize" className="btn btn-primary group">
              Build your pair
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              See the collection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
