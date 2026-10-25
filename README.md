# Red Crown — concept storefront

A multi-page design prototype for **Red Crown**, a fictional footwear label. Nothing here is for sale: prices are concept prices, the bag is a local demo and no payment is processed.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## Hosting & SEO

Set the public address before building so canonical URLs, the sitemap and share images point at it:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

On Vercel this falls back to the project's production URL automatically; elsewhere it falls back to `http://localhost:3000`. The value is read at build time, so rebuild after changing it.

What's included: per-page titles, descriptions and canonical URLs (`lib/seo.ts`), Open Graph + Twitter `summary_large_image` cards, `sitemap.xml`, `robots.txt`, a web manifest, an apple-touch icon and `WebSite` structured data on the home page. The bag is `noindex`.

Share images are 1200×630 JPEGs in `public/og/`: a site-wide card, one for the customizer and one per product. Regenerate them with `scripts/og/render-og.mjs` after changing products or renders, then bump `OG_VERSION` in `lib/seo.ts` so social platforms fetch the new ones.

## Stack

- **Next.js 16** (App Router, Cache Components, Turbopack) · **React 19.3** · **TypeScript**
- **Tailwind CSS v4**, with brand tokens defined in `app/globals.css` (`@theme`)
- **three.js + React Three Fiber**: the realistic 3D shoe, lazy loaded on the client and recoloured live by zone
- **Motion** for layout/presence animation; CSS for everything simpler; native **View Transitions** between routes
- **Lucide** icons; fonts (Anton, Geist, Geist Mono) are self-hosted at build time via `next/font`

## Routes

| Route | What it does |
| --- | --- |
| `/` | Campaign hero with the interactive 3D shoe, line-up, "built in layers" scroll story, customizer teaser |
| `/shop` | Collection with category/tone filters and sort (kept in the URL), empty state, quick add |
| `/product/[slug]` | Shared detail template: 3D view, colourway, size, quantity, validated add to bag. Unknown slugs return a 404 page |
| `/customize` | Five-zone configurator with presets, palette + custom colour, live 3D, summary, reset, local draft |
| `/story` | Design principles and the imagined process |
| `/bag` | Demo bag: quantities, remove, subtotal, honest demo checkout dialog |
| `/privacy` | What the demo stores (only local storage) and what it doesn't |

## Where things live

- `data/products.ts`: the single source for products, colourways, zones, palette and presets
- `components/shoe/shoe-assets.ts`: loads `public/models/shoe.glb` and its maps; a small shader tints each zone (upper, tape & heel, laces, midsole, outsole) while keeping the model's scanned shading
- `components/shoe/shoe-stage.tsx`: poster/fallback, lazy canvas, drag/keyboard rotation, offscreen pausing
- `public/images/shoes/`: still renders of every colourway, preset and layer, used for cards, posters and the no-WebGL fallback
- `components/shoe-art.tsx`: SVG illustration, used only as the fallback for custom colour combinations
- `scripts/shoe-pipeline/`: how the model and renders were produced
- `lib/bag.ts`, `lib/local-store.ts`: the localStorage-backed bag and draft stores

Append `?webgl=off` to any URL to preview the no-WebGL fallback.

## Credits

The 3D shoe is based on [“Materials Variants Shoe”](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) © 2021 Shopify, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modified: original colourways removed, demo marks painted out, recoloured by zone. Red Crown names, colourways, copy and branding are original to this concept.
