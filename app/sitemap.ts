import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { SITE_URL } from "@/lib/seo";

// Generated once at build time for the static export.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/customize", priority: 0.9 },
    { path: "/story", priority: 0.6 },
    { path: "/privacy", priority: 0.3 },
  ];
  return [
    ...pages.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const, priority })),
    ...PRODUCTS.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [`${SITE_URL}/images/shoes/${product.slug}-${product.colorways[0].id}.webp`],
    })),
  ];
}
