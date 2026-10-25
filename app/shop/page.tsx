import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { PRODUCTS } from "@/data/products";
import { ShopCatalog, ShopCatalogFallback } from "@/components/shop-catalog";

export const metadata: Metadata = pageMetadata({
  title: "Collection",
  description: "Eight original concept colourways from Red Crown across run, street and studio. Filter by category and tone.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <div className="shell page-bottom">
      <header className="page-head grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow fade-up text-signal">Concept season 01</p>
          <h1 className="display-xl mt-4">
            <span className="rise-line">
              <span>The collection</span>
            </span>
          </h1>
        </div>
        <p className="fade-up max-w-sm text-mute md:text-right" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
          {PRODUCTS.length} original styles across run, street and studio. Prices are concept prices in USD; nothing here
          is for sale.
        </p>
      </header>
      <Suspense fallback={<ShopCatalogFallback />}>
        <ShopCatalog />
      </Suspense>
    </div>
  );
}
