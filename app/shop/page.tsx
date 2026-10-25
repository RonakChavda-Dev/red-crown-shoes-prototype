import type { Metadata } from "next";
import { Suspense } from "react";
import { PRODUCTS } from "@/data/products";
import { ShopCatalog, ShopCatalogFallback } from "@/components/shop-catalog";

export const metadata: Metadata = {
  title: "Collection",
  description: "Eight original concept shoes from Red Tape: runners, court shoes, high-tops and trail. Filter by category and tone.",
};

export default function ShopPage() {
  return (
    <div className="shell pb-24">
      <header className="grid gap-6 py-12 sm:py-16 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow fade-up text-signal">Concept season 01</p>
          <h1 className="display-xl mt-4">
            <span className="rise-line">
              <span>The collection</span>
            </span>
          </h1>
        </div>
        <p className="fade-up max-w-sm text-mute md:text-right" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
          {PRODUCTS.length} original styles across run, street and trail. Prices are concept prices in USD; nothing here
          is for sale.
        </p>
      </header>
      <Suspense fallback={<ShopCatalogFallback />}>
        <ShopCatalog />
      </Suspense>
    </div>
  );
}
