"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useRef, useState, ViewTransition } from "react";
import { AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { CATEGORIES, SIZES, getColorway, type Product } from "@/data/products";
import { ShoeStage } from "@/components/shoe/shoe-stage";
import { ColorwayDot } from "@/components/colorway-dot";
import { QtyStepper } from "@/components/qty-stepper";
import { addToBag, productLine } from "@/lib/bag";
import { toast } from "@/lib/toast";
import { cn, formatPrice } from "@/lib/format";
import { productImage } from "@/lib/shoe-images";

export function ProductViewWithParams({ product }: { product: Product }) {
  const params = useSearchParams();
  return <ProductView product={product} initialColorway={params.get("colorway")} />;
}

export function ProductView({ product, initialColorway = null }: { product: Product; initialColorway?: string | null }) {
  const [colorwayId, setColorwayId] = useState(() => getColorway(product, initialColorway).id);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const sizeGroup = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const sizeLabelId = useId();
  const colorway = getColorway(product, colorwayId);
  const category = CATEGORIES.find((item) => item.id === product.category)?.label;

  const chooseColorway = (id: string) => {
    setColorwayId(id);
    // Keep the URL shareable without triggering a route transition.
    const url = new URL(window.location.href);
    if (id === product.colorways[0].id) url.searchParams.delete("colorway");
    else url.searchParams.set("colorway", id);
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  const add = () => {
    if (!size) {
      setError(true);
      sizeGroup.current?.querySelector("button")?.focus();
      return;
    }
    addToBag(productLine(product, colorway, size), qty);
    toast({
      title: qty > 1 ? `${qty} pairs added to bag` : "Added to bag",
      description: `${product.name} · ${colorway.name} · US ${size}`,
      action: { label: "View bag", href: "/bag" },
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
      <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <ViewTransition name={`shoe-${product.slug}`} share="morph" default="none">
          <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface">
            <ShoeStage
              colors={colorway.colors}
              build={product.build}
              label={`${product.name} in ${colorway.name}`}
              className="aspect-[4/3] w-full sm:aspect-[16/11]"
              fill={0.9}
              poster={productImage(product.slug, colorway.id)}
              priority
            />
          </div>
        </ViewTransition>
        <div className="mt-3 flex items-center justify-between font-mono text-[0.75rem] uppercase tracking-[0.14em] text-dim">
          <span>{product.code}</span>
          <span>{colorway.name}</span>
        </div>
      </div>

      <div>
        <nav aria-label="Breadcrumb" className="eyebrow text-dim">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/shop" className="link-draw py-1 hover:text-paper">
                Collection
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/shop?category=${product.category}`} className="link-draw py-1 hover:text-paper">
                {category}
              </Link>
            </li>
          </ol>
        </nav>
        <h1 className="display-xl mt-5">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <p className="font-mono text-2xl">{formatPrice(product.price)}</p>
          <p className="eyebrow text-dim">Concept price · not for sale</p>
        </div>
        <p className="mt-6 text-[1.1rem] leading-relaxed text-paper">{product.tagline}</p>
        <p className="mt-3 leading-relaxed text-mute">{product.description}</p>

        <div className="mt-10 border-t border-line pt-6">
          <p className="flex items-baseline justify-between">
            <span className="eyebrow text-dim">Colourway</span>
            <span className="text-[0.92rem]">{colorway.name}</span>
          </p>
          <div role="group" aria-label="Colourway" className="-ml-2 mt-2 flex flex-wrap">
            {product.colorways.map((item) => (
              <ColorwayDot
                key={item.id}
                colorway={item}
                size="lg"
                checked={item.id === colorway.id}
                onSelect={() => chooseColorway(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <p className="flex items-baseline justify-between">
            <span id={sizeLabelId} className="eyebrow text-dim">
              Size · US
            </span>
            <span className="text-[0.92rem] text-mute">{size ? `US ${size} selected` : "Choose a size"}</span>
          </p>
          <div
            ref={sizeGroup}
            role="group"
            aria-labelledby={sizeLabelId}
            aria-describedby={error ? errorId : undefined}
            className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6"
          >
            {SIZES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={size === item}
                onClick={() => {
                  setSize(item);
                  setError(false);
                }}
                className={cn(
                  "h-12 rounded-[var(--radius-xs)] border font-mono text-[0.9rem] transition-colors",
                  size === item
                    ? "border-paper bg-paper text-ink"
                    : error
                      ? "border-signal/70 text-paper hover:border-signal"
                      : "border-line-strong text-paper hover:border-mute",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          {error && (
            <p id={errorId} role="alert" className="mt-3 flex items-center gap-2 text-[0.9rem] text-signal-hot">
              <AlertCircle className="size-4" /> Choose a size to add this pair to your bag.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <QtyStepper label="Quantity" value={qty} onChange={setQty} />
          <button type="button" onClick={add} className="btn btn-primary flex-1">
            <ShoppingBag className="size-4" strokeWidth={2} />
            Add to bag · {formatPrice(product.price * qty)}
          </button>
        </div>
        <p className="mt-3 text-[0.82rem] text-dim">
          Demo bag only. Pairs are saved in this browser; nothing is ordered or charged.
        </p>

        <div className="mt-10 divide-y divide-line border-y border-line">
          <Detail title="Materials" open>
            <ul className="space-y-1.5">
              {product.materials.map((material) => (
                <li key={material} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-signal" />
                  {material}
                </li>
              ))}
            </ul>
          </Detail>
          <Detail title="Fit">{product.fit}</Detail>
          <Detail title="Care">{product.care}</Detail>
        </div>

        <Link
          href="/customize"
          className="group mt-8 flex items-center justify-between rounded-[var(--radius-sm)] border border-line bg-surface p-5 transition-colors hover:border-line-strong"
        >
          <span>
            <span className="block font-semibold">Want different colours?</span>
            <span className="mt-1 block text-[0.9rem] text-mute">Build your own pair zone by zone.</span>
          </span>
          <ArrowRight className="size-5 text-signal transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function Detail({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group py-1" open={open}>
      <summary className="flex min-h-12 list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="relative size-3">
          <span className="absolute inset-x-0 top-1/2 h-px bg-mute" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-mute transition-transform duration-300 group-open:scale-y-0" />
        </span>
      </summary>
      <div className="pb-5 text-[0.95rem] leading-relaxed text-mute">{children}</div>
    </details>
  );
}
