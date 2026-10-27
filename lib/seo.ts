import type { Metadata } from "next";

export const SITE_NAME = "Red Crown";
export const SITE_TAGLINE = "Concept footwear";

/**
 * Absolute origin used for canonical URLs, the sitemap and share images.
 * Defaults to the live Cloudflare Pages domain so share images resolve without
 * any host configuration. NEXT_PUBLIC_SITE_URL overrides it (e.g. a custom domain);
 * `next dev` uses localhost.
 */
const PRODUCTION_URL = "https://redcrown-prototype.pages.dev";

export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return PRODUCTION_URL;
})();

/** Share images live in /public/og (see scripts/og). 1200×630. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
const OG_VERSION = 2;
export const ogImage = (name: string) => `/og/${name}.jpg?v=${OG_VERSION}`;

interface PageSeo {
  title: string;
  description: string;
  /** Route path, e.g. "/shop". Used as the canonical URL. */
  path: string;
  /** Share image name in /public/og; defaults to the site-wide card. */
  image?: string;
  imageAlt?: string;
  /** Keep the page out of search results (e.g. the personal bag). */
  noindex?: boolean;
  /** Use the title as-is instead of the "· Red Crown" template. */
  absoluteTitle?: boolean;
}

/** Title, description, canonical, Open Graph and Twitter card for one page. */
export function pageMetadata({ title, description, path, image = "default", imageAlt, noindex, absoluteTitle }: PageSeo): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  const images = [
    {
      url: ogImage(image),
      ...OG_SIZE,
      alt: imageAlt ?? `${SITE_NAME}: an original concept runner lit in neon red on black`,
      type: "image/jpeg",
    },
  ];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: shareTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images,
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
