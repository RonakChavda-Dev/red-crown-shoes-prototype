import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FEATURED, HERO_BUILD, HERO_COLORS, PRODUCTS } from "@/data/products";
import { ShoeStage } from "@/components/shoe/shoe-stage";
import { ProductCard } from "@/components/product-card";
import { TapeBand } from "@/components/tape-band";
import { LayerStory } from "@/components/layer-story";
import { PresetPreview } from "@/components/preset-preview";

export const metadata: Metadata = {
  title: { absolute: "Red Tape — Move without red tape" },
  description:
    "A concept footwear label. Explore an interactive 3D shoe, browse the fictional collection and build your own pair.",
};

const NOTES = [
  { n: "01", title: "Engineered knit", body: "One piece, no rubbing seams." },
  { n: "02", title: "Signature tape", body: "Locks the midfoot and heel." },
  { n: "03", title: "Rockered sole", body: "Rolls heel to toe." },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_62%_45%,#16161a_0%,transparent_70%)]"
        />
        <div className="shell relative grid items-center gap-y-6 pb-14 pt-8 sm:pt-12 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,4.3fr)_minmax(0,7fr)_minmax(0,2fr)] lg:gap-x-6 lg:pb-16 lg:pt-6">
          <div className="relative z-10 lg:self-center">
            <p className="eyebrow fade-up text-mute">
              <span className="text-signal">RT-01 Strand</span> · Concept season 01
            </p>
            <h1
              id="hero-title"
              className="mt-5 font-display text-[clamp(3.6rem,15vw,6.2rem)] uppercase leading-[0.86] lg:text-[clamp(4.4rem,6.6vw,7.4rem)]"
            >
              <span className="rise-line">
                <span style={{ "--rise-delay": "80ms" } as React.CSSProperties}>Move</span>
              </span>
              <span className="rise-line">
                <span style={{ "--rise-delay": "160ms" } as React.CSSProperties}>without</span>
              </span>
              <span className="rise-line">
                <span className="text-signal" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
                  red tape.
                </span>
              </span>
            </h1>
            <p className="lede fade-up mt-6 max-w-[26rem]" style={{ "--rise-delay": "380ms" } as React.CSSProperties}>
              Engineered knit, a rockered foam sole and a fit you finish yourself: footwear designed to get out of your
              way.
            </p>
            <div
              className="fade-up mt-8 flex flex-col gap-3 min-[420px]:flex-row"
              style={{ "--rise-delay": "480ms" } as React.CSSProperties}
            >
              <Link href="/shop" className="btn btn-primary group">
                Explore the collection
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/customize" className="btn btn-ghost">
                Customize your pair
              </Link>
            </div>
          </div>

          <div className="relative -mx-[var(--gutter)] sm:mx-0 lg:-mr-[4%] lg:-ml-[2%]">
            <TapeBand className="absolute inset-x-0 top-[50%] -rotate-[6deg] sm:inset-x-[2%]" />
            <ShoeStage
              colors={HERO_COLORS}
              build={HERO_BUILD}
              label="Red Tape Strand in Bone and Signal red"
              glow="strong"
              fill={0.96}
              className="fade-up aspect-[5/4] w-full sm:aspect-[16/11] lg:aspect-[7/6]"
            />
          </div>

          <ul
            aria-label="Strand highlights"
            className="relative z-10 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-sm)] border border-line bg-line min-[520px]:grid-cols-3 lg:grid-cols-1 lg:self-center lg:rounded-none lg:border-0 lg:bg-transparent"
          >
            {NOTES.map((note, i) => (
              <li
                key={note.n}
                className="fade-up bg-ink/90 p-4 lg:border-l lg:border-line lg:bg-transparent lg:py-5 lg:pl-5 lg:pr-0"
                style={{ "--rise-delay": `${600 + i * 90}ms` } as React.CSSProperties}
              >
                <p className="font-mono text-[0.72rem] text-signal">{note.n}</p>
                <p className="mt-1.5 text-[0.95rem] font-semibold">{note.title}</p>
                <p className="mt-1 text-[0.85rem] leading-snug text-mute">{note.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Featured collection ── */}
      <section aria-labelledby="lineup-title" className="shell py-20 sm:py-28">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-signal">The line-up</p>
            <h2 id="lineup-title" className="display-lg mt-4">
              Four ways in
            </h2>
          </div>
          <div className="max-w-sm md:text-right">
            <p className="text-mute">
              Runners, court shoes and a high-top, all built on the same idea: less shoe, more you.
            </p>
            <Link href="/shop" className="link-draw mt-4 inline-flex items-center gap-1.5 py-1 font-semibold">
              View all {PRODUCTS.length} styles <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURED.map((product, i) => (
            <li
              key={product.slug}
              className="reveal flex"
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <ProductCard product={product} className="w-full" />
            </li>
          ))}
        </ul>
      </section>

      {/* ── Materials story ── */}
      <section aria-labelledby="layers-title" className="border-y border-line bg-ink-2">
        <div className="shell py-20 sm:py-28">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-signal">Built in layers</p>
            <h2 id="layers-title" className="display-lg mt-4">
              Five parts.
              <br />
              No excess.
            </h2>
            <p className="lede mt-6">
              Every Red Tape shoe is made from the same five layers. Each one has a single job, and each one is yours to
              colour.
            </p>
          </div>
          <div className="mt-10 lg:mt-4">
            <LayerStory />
          </div>
        </div>
      </section>

      {/* ── Customizer invitation ── */}
      <section aria-label="Build your pair" className="shell py-20 sm:py-28">
        <div className="reveal">
          <PresetPreview />
        </div>
      </section>

      {/* ── Approach teaser ── */}
      <section aria-labelledby="approach-title" className="shell pb-24">
        <Link
          href="/story"
          className="reveal group relative flex flex-col gap-6 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface p-8 transition-colors hover:border-line-strong sm:p-12 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="eyebrow text-dim">Our approach</p>
            <h2 id="approach-title" className="display-lg mt-4 max-w-3xl">
              Less, but <span className="text-signal">louder.</span>
            </h2>
            <p className="mt-5 max-w-lg text-mute">
              Four principles behind every pair, from the first sketch to the last eyelet.
            </p>
          </div>
          <span className="btn btn-ghost shrink-0 self-start md:self-end">
            Read the approach
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </>
  );
}
