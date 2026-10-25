"use client";

import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { CATEGORIES, SIZES, getColorway, type Product } from "@/data/products";
import Image from "next/image";
import { productImage, SHOE_IMAGE } from "@/lib/shoe-images";
import { ColorwayDot } from "@/components/colorway-dot";
import { addToBag, productLine } from "@/lib/bag";
import { toast } from "@/lib/toast";
import { cn, formatPrice } from "@/lib/format";

export function ProductCard({ product, className, eager }: { product: Product; className?: string; eager?: boolean }) {
  const [colorwayId, setColorwayId] = useState(product.colorways[0].id);
  const [picking, setPicking] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const colorway = getColorway(product, colorwayId);
  const href =
    colorway.id === product.colorways[0].id ? `/product/${product.slug}` : `/product/${product.slug}?colorway=${colorway.id}`;
  const category = CATEGORIES.find((item) => item.id === product.category)?.label;

  const close = () => {
    setPicking(false);
    trigger.current?.focus();
  };

  const add = (size: string) => {
    addToBag(productLine(product, colorway, size));
    toast({
      title: "Added to bag",
      description: `${product.name} · ${colorway.name} · US ${size}`,
      action: { label: "View bag", href: "/bag" },
    });
    close();
  };

  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface transition-[border-color,background-color] duration-300 hover:border-line-strong hover:bg-surface-2 has-[:focus-visible]:border-line-strong",
        className,
      )}
    >
      <div className="eyebrow flex items-center justify-between px-5 pt-5 text-dim">
        <span>{product.code}</span>
        <span>{category}</span>
      </div>

      <div className="relative px-4 pb-2 pt-3">
        <div
          aria-hidden
          className="absolute inset-x-[12%] bottom-[8%] h-1/2 rounded-full bg-signal/0 blur-2xl transition-colors duration-500 group-hover/card:bg-signal/20 group-has-[:focus-visible]/card:bg-signal/20"
        />
        <ViewTransition name={`shoe-${product.slug}`} share="morph" default="none">
          <div className="relative transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-2 group-hover/card:-rotate-[4deg] group-has-[:focus-visible]/card:-translate-y-2 group-has-[:focus-visible]/card:-rotate-[4deg]">
            <Image
              src={productImage(product.slug, colorway.id)}
              alt={`${product.name} in ${colorway.name}`}
              width={SHOE_IMAGE.width}
              height={SHOE_IMAGE.height}
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              loading={eager ? "eager" : "lazy"}
              preload={eager}
              className="h-auto w-full"
            />
          </div>
        </ViewTransition>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="display-sm">
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {product.name}
            </Link>
          </h3>
          <p className="font-mono text-[0.95rem]">
            {formatPrice(product.price)}
            <span className="sr-only"> (concept price)</span>
          </p>
        </div>
        <p className="mt-2 line-clamp-2 text-[0.9rem] leading-snug text-mute">{product.tagline}</p>

        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-5">
          <div role="group" aria-label={`${product.name} colourways`} className="-ml-2 flex">
            {product.colorways.map((item) => (
              <ColorwayDot
                key={item.id}
                colorway={item}
                checked={item.id === colorway.id}
                onSelect={() => setColorwayId(item.id)}
              />
            ))}
          </div>
          <button
            ref={trigger}
            type="button"
            onClick={() => setPicking(true)}
            aria-expanded={picking}
            className="btn btn-quiet min-h-11 gap-1.5 px-3.5 text-[0.82rem]"
          >
            <Plus className="size-4" strokeWidth={2} />
            Quick add
            <span className="sr-only">
              {" "}
              {product.name}, {colorway.name}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {picking && (
          <motion.div
            role="group"
            aria-label={`Choose a size for ${product.name}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
            }}
            className="absolute inset-x-0 bottom-0 z-20 border-t border-line-strong bg-surface-2 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow text-mute">
                {colorway.name} · Select US size
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close size picker"
                className="-mr-2 grid size-10 place-items-center text-dim hover:text-paper"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {SIZES.map((size, i) => (
                <button
                  key={size}
                  type="button"
                  autoFocus={i === 0}
                  onClick={() => add(size)}
                  className="h-11 rounded-[var(--radius-xs)] border border-line-strong font-mono text-[0.85rem] transition-colors hover:border-paper hover:bg-paper hover:text-ink focus-visible:bg-paper focus-visible:text-ink"
                >
                  {size}
                  <span className="sr-only"> — add to bag</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
