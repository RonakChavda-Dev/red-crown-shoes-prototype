"use client";

import Link from "next/link";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Info, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import { ShoeArt } from "@/components/shoe-art";
import { SHOE_IMAGE } from "@/lib/shoe-images";
import { QtyStepper } from "@/components/qty-stepper";
import { bagCount, bagSubtotal, clearBag, removeFromBag, setQty, useBag } from "@/lib/bag";
import { useHydrated } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/format";

export function BagView() {
  const lines = useBag();
  const hydrated = useHydrated();
  const dialog = useRef<HTMLDialogElement>(null);

  if (!hydrated) {
    return (
      <div aria-busy="true" aria-label="Loading your bag" className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="h-48 animate-pulse rounded-[var(--radius-md)] bg-surface" />
        <div className="h-64 animate-pulse rounded-[var(--radius-md)] bg-surface" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-md)] border border-dashed border-line-strong px-6 py-20 text-center">
        <ShoppingBag className="size-9 text-signal" strokeWidth={1.4} />
        <h2 className="display-md mt-6">Your bag is empty</h2>
        <p className="mt-3 max-w-sm text-mute">
          Add a pair from the collection or build your own. Items stay in this browser until you remove them.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Browse the collection
          </Link>
          <Link href="/customize" className="btn btn-ghost">
            Build your pair
          </Link>
        </div>
      </div>
    );
  }

  const count = bagCount(lines);
  const subtotal = bagSubtotal(lines);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <section aria-labelledby="items-title">
        <h2 id="items-title" className="sr-only">
          Items
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.li
                key={line.id}
                layout
                exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
                className="grid grid-cols-[6.5rem_1fr] gap-4 overflow-hidden py-6 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <Link href={line.href} className="rounded-[var(--radius-sm)] bg-surface p-2" tabIndex={-1} aria-hidden>
                  {line.image ? (
                    <Image src={line.image} alt="" width={SHOE_IMAGE.width} height={SHOE_IMAGE.height} sizes="10rem" className="h-auto w-full" />
                  ) : (
                    <ShoeArt colors={line.colors} build={line.build} shadow={false} className="w-full" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow text-dim">
                        {line.code} {line.kind === "custom" && "· Custom build"}
                      </p>
                      <h3 className="display-sm mt-1.5">
                        <Link href={line.href} className="link-draw">
                          {line.name}
                        </Link>
                      </h3>
                      <p className="mt-1 truncate text-[0.9rem] text-mute">
                        {line.variant} · US {line.size}
                      </p>
                    </div>
                    <p className="font-mono">{formatPrice(line.unitPrice * line.qty)}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <QtyStepper label={`Quantity for ${line.name}`} value={line.qty} onChange={(qty) => setQty(line.id, qty)} />
                    <button
                      type="button"
                      onClick={() => {
                        removeFromBag(line.id);
                        toast({ title: "Removed from bag", description: `${line.name} · US ${line.size}` });
                      }}
                      className="inline-flex min-h-11 items-center gap-2 text-[0.88rem] text-mute transition-colors hover:text-signal-hot"
                    >
                      <Trash2 className="size-4" /> Remove<span className="sr-only"> {line.name}</span>
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <button
          type="button"
          onClick={() => {
            clearBag();
            toast({ title: "Bag cleared" });
          }}
          className="link-draw mt-5 py-2 text-[0.88rem] text-mute hover:text-paper"
        >
          Clear bag
        </button>
      </section>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="rounded-[var(--radius-md)] border border-line bg-surface p-6">
          <h2 id="summary-title" className="display-sm">
            Summary
          </h2>
          <dl className="mt-6 space-y-3 text-[0.92rem]">
            <div className="flex justify-between">
              <dt className="text-mute">
                {count} {count === 1 ? "pair" : "pairs"}
              </dt>
              <dd className="font-mono">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Shipping</dt>
              <dd className="text-dim">Not applicable</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-semibold">Subtotal</dt>
              <dd className="font-mono text-xl" aria-live="polite">
                {formatPrice(subtotal)}
              </dd>
            </div>
          </dl>
          <button type="button" onClick={() => dialog.current?.showModal()} className="btn btn-primary mt-6 w-full">
            Checkout <ArrowRight className="size-4" />
          </button>
          <p className="mt-4 flex gap-2 text-[0.82rem] leading-relaxed text-dim">
            <Info className="mt-0.5 size-4 shrink-0" />
            Concept demo: prices are fictional and no purchase or payment is processed.
          </p>
        </div>
      </aside>

      <dialog
        ref={dialog}
        aria-labelledby="checkout-title"
        aria-describedby="checkout-body"
        className="demo-dialog m-auto w-[min(92vw,30rem)] rounded-[var(--radius-md)] border border-line-strong bg-surface-2 p-0 text-paper backdrop:bg-ink/75 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id="checkout-title" className="display-md">
              This is a demo
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="-mr-2 -mt-1 grid size-11 place-items-center text-dim hover:text-paper"
            >
              <X className="size-5" />
            </button>
          </div>
          <div id="checkout-body" className="mt-4 space-y-3 text-mute">
            <p>
              Red Crown is a fictional label and this storefront is a design prototype. There is no checkout: no order is
              placed, no payment is taken and no personal details are collected.
            </p>
            <p>
              Your bag of {count} {count === 1 ? "pair" : "pairs"} ({formatPrice(subtotal)} in concept prices) stays
              saved in this browser.
            </p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" autoFocus onClick={() => dialog.current?.close()} className="btn btn-primary flex-1">
              Back to my bag
            </button>
            <Link href="/shop" onClick={() => dialog.current?.close()} className="btn btn-ghost flex-1">
              Keep browsing
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  );
}
