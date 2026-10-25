"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SearchX } from "lucide-react";
import { CATEGORIES, PRODUCTS, TONES, type Category, type Product, type Tone } from "@/data/products";
import { ProductCard } from "@/components/product-card";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name: A to Z" },
] as const;
type Sort = (typeof SORTS)[number]["id"];

const isCategory = (value: string | null): value is Category => CATEGORIES.some((c) => c.id === value);
const isTone = (value: string | null): value is Tone => TONES.some((t) => t.id === value);
const isSort = (value: string | null): value is Sort => SORTS.some((s) => s.id === value);

function apply(products: Product[], category: Category | null, tone: Tone | null, sort: Sort) {
  const list = products.filter(
    (product) =>
      (!category || product.category === category) && (!tone || product.colorways.some((c) => c.tone === tone)),
  );
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/** Collection grid with filters kept in the URL so views can be shared. */
export function ShopCatalog() {
  const params = useSearchParams();
  return <Catalog params={params} />;
}

/** Static fallback: the unfiltered collection, rendered without URL access. */
export function ShopCatalogFallback() {
  return <Catalog params={null} />;
}

function Catalog({ params }: { params: URLSearchParams | ReturnType<typeof useSearchParams> | null }) {
  const pathname = usePathname();
  // Native history updates keep useSearchParams in sync without a route transition.
  const replace = (url: string) => window.history.replaceState(null, "", url);
  const rawCategory = params?.get("category") ?? null;
  const rawTone = params?.get("tone") ?? null;
  const rawSort = params?.get("sort") ?? null;
  const category = isCategory(rawCategory) ? rawCategory : null;
  const tone = isTone(rawTone) ? rawTone : null;
  const sort: Sort = isSort(rawSort) ? rawSort : "featured";
  const results = apply(PRODUCTS, category, tone, sort);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params?.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    replace(query ? `${pathname}?${query}` : pathname);
  };

  const filtered = category !== null || tone !== null;

  return (
    <>
      <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--gutter)] border-y border-line bg-ink/90 px-[var(--gutter)] py-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <FilterGroup
              label="Category"
              options={CATEGORIES}
              value={category}
              onChange={(value) => update("category", value)}
            />
            <FilterGroup label="Tone" options={TONES} value={tone} onChange={(value) => update("tone", value)} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[0.78rem] text-dim" aria-live="polite">
              {results.length} {results.length === 1 ? "style" : "styles"}
            </p>
            <label className="flex items-center gap-3">
              <span className="eyebrow text-dim">Sort</span>
              <select value={sort} onChange={(event) => update("sort", event.target.value === "featured" ? null : event.target.value)} className="field pr-8">
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {results.length > 0 ? (
        <motion.ul layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((product, i) => (
              <motion.li
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                className="flex"
              >
                <ProductCard product={product} className="w-full" eager={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-[var(--radius-md)] border border-dashed border-line-strong px-6 py-20 text-center">
          <SearchX className="size-8 text-signal" strokeWidth={1.5} />
          <h2 className="display-sm mt-5">Nothing in that combination</h2>
          <p className="mt-3 max-w-sm text-mute">
            No {tone ? TONES.find((t) => t.id === tone)?.label.toLowerCase() : ""}{" "}
            {category ? CATEGORIES.find((c) => c.id === category)?.label.toLowerCase() : ""} colourways yet. Clear a
            filter, or build exactly the pair you had in mind.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn btn-primary" onClick={() => replace(pathname)}>
              Clear filters
            </button>
            <Link href="/customize" className="btn btn-ghost">
              Build your own
            </Link>
          </div>
        </div>
      )}

      {filtered && results.length > 0 && (
        <p className="mt-8 text-center">
          <button type="button" className="link-draw py-2 text-[0.9rem] text-mute hover:text-paper" onClick={() => replace(pathname)}>
            Clear all filters
          </button>
        </p>
      )}
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
      <span className="eyebrow mr-1 hidden text-dim xl:inline">{label}</span>
      <button type="button" className="chip shrink-0" aria-pressed={value === null} onClick={() => onChange(null)}>
        All<span className="sr-only"> {label.toLowerCase()}s</span>
      </button>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="chip shrink-0"
          aria-pressed={value === option.id}
          onClick={() => onChange(value === option.id ? null : option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
