import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Generated once at build time for the static export.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // /bag stays crawlable so its noindex tag is seen.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
