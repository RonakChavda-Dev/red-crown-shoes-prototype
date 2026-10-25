import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PRODUCTS, getProduct } from "@/data/products";
import { ProductView, ProductViewWithParams } from "@/components/product-view";
import { ProductCard } from "@/components/product-card";

// Every valid slug is prerendered, so letting navigation wait for the page keeps
// the card-to-hero morph intact instead of flashing a skeleton.
export const instant = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Shoe not found" };
  return {
    title: `${product.name} (${product.code})`,
    description: `${product.tagline} A Red Tape concept shoe in ${product.colorways.length} colourways.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const sameCategory = PRODUCTS.filter((item) => item.slug !== product.slug && item.category === product.category);
  const related = [...sameCategory, ...PRODUCTS.filter((item) => item.slug !== product.slug && item.category !== product.category)].slice(0, 3);

  return (
    <div className="shell pb-24 pt-8 sm:pt-12">
      <Suspense fallback={<ProductView product={product} />}>
        <ProductViewWithParams product={product} />
      </Suspense>

      <section aria-labelledby="related-title" className="mt-24 border-t border-line pt-14">
        <h2 id="related-title" className="display-md reveal">
          Keep looking
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item, i) => (
            <li key={item.slug} className="reveal flex" style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
              <ProductCard product={item} className="w-full" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
