import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PRODUCTS, getProduct } from "@/data/products";
import { ProductView, ProductViewWithParams } from "@/components/product-view";
import { ProductCard } from "@/components/product-card";

// Only the catalogue's slugs exist; anything else is the static 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Shoe not found", robots: { index: false, follow: true } };
  return pageMetadata({
    title: `${product.name} (${product.code})`,
    description: `${product.tagline} A Red Crown concept shoe in ${product.colorways.length} colourways.`,
    path: `/product/${product.slug}`,
    image: `product-${product.slug}`,
    imageAlt: `Red Crown ${product.name} in ${product.colorways[0].name}`,
  });
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const sameCategory = PRODUCTS.filter((item) => item.slug !== product.slug && item.category === product.category);
  const related = [...sameCategory, ...PRODUCTS.filter((item) => item.slug !== product.slug && item.category !== product.category)].slice(0, 3);

  return (
    <div className="shell page-top page-bottom">
      <Suspense fallback={<ProductView product={product} />}>
        <ProductViewWithParams product={product} />
      </Suspense>

      <section aria-labelledby="related-title" className="mt-[var(--space-section)] border-t border-line pt-[var(--space-stack)]">
        <h2 id="related-title" className="display-md reveal">
          Keep looking
        </h2>
        <ul className="mt-stack grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
