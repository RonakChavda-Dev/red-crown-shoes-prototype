import type { Metadata } from "next";

export const SITE_NAME = "Red Crown";
export const SITE_TAGLINE = "Concept footwear";

/**
 * Absolute origin used for canonical URLs, the sitemap and share images.
 * Set NEXT_PUBLIC_SITE_URL to the deployed domain; Vercel deployments fall
 * back to the project's production URL automatically.
 */
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
})();

/** Share images live in /public/og (see scripts/og). 1200×630. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
const OG_VERSION = 1;
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
