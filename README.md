# Red Tape — concept storefront

A multi-page design prototype for **Red Tape**, a fictional footwear label. Nothing here is for sale: prices are concept prices, the bag is a local demo and no payment is processed.

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

## Stack

- **Next.js 16** (App Router, Cache Components, Turbopack) · **React 19.3** · **TypeScript**
- **Tailwind CSS v4**, with brand tokens defined in `app/globals.css` (`@theme`)
- **three.js + React Three Fiber**: the procedural 3D shoe, lazy loaded on the client
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
- `components/shoe/geometry.ts`: the procedural, unbranded shoe. Swap in a GLB by returning equivalent meshes from `shoe-canvas.tsx` and keeping the zone → material mapping
- `components/shoe/shoe-stage.tsx`: poster/fallback, lazy canvas, drag/keyboard rotation, offscreen pausing
- `components/shoe-art.tsx`: the SVG illustration used for cards, the poster and the no-WebGL fallback
- `lib/bag.ts`, `lib/local-store.ts`: the localStorage-backed bag and draft stores

Append `?webgl=off` to any URL to preview the no-WebGL fallback.
