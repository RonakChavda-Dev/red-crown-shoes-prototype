# Red Tape Shoes — Project Guide for Claude Code

## Project goal

Build a polished, responsive, multi-page concept storefront for **Red Tape Shoes**, an entirely fictional footwear label. This repository currently contains visual references in `inspirations/` and no application code. Begin by inspecting the repository and the inspiration images before choosing or creating assets.

The site should feel like a premium, energetic footwear campaign: deep black surfaces, high-contrast white type, and controlled neon-red light. The landing page must put one large, unbranded 3D shoe at the center of the experience, with concise editorial copy and useful actions around it. A dedicated shoe customizer must let visitors change visible shoe colors and see their choices reflected immediately.

Treat this as a complete, believable design prototype. Do not present it as a real operating company or invent real-world business details.

## Read the references

Review all files in `inspirations/`. Use them as visual direction, not as assets to reproduce literally.

- Draw from the editorial product layouts, oversized footwear imagery, condensed headlines, product grids, and responsive compositions in the references.
- The supplied palette reference suggests near-black backgrounds, bright white typography, and restrained secondary grays. Red Tape's signature accent should instead be vivid red with a soft, carefully controlled glow.
- Create a distinct Red Tape design. Do not reuse third-party logos, trademarks, product names, brand claims, or copied page compositions visible in screenshots. The shoe and all branding in the finished site must be original and unbranded apart from Red Tape's own wordmark and X mark.
- The logo is a simple **X made from two crossing strokes**. Create it with inline SVG or CSS and pair it with the words “RED TAPE”. Do not use a swoosh, a cross/plus sign, or another company's mark.

## Product and design direction

### Brand voice

Confident, precise, kinetic, and modern. Use short, original copy about movement, comfort, materials, and personal style. Avoid empty hype, unverifiable performance claims, fake reviews, fake customer counts, fake sustainability claims, fake scarcity, and lorem ipsum.

### Visual system

- Main background: almost-black charcoal such as `#080808` or `#0B0B0D`.
- Raised surfaces: subtly differentiated charcoal such as `#121214` and `#1A1A1D`.
- Main text: warm white such as `#F4F2F0`; secondary text: muted gray with sufficient contrast.
- Accent: vivid neon red such as `#FF2638`; use brighter red sparingly for active states and a soft red glow around focal elements.
- Use a strong condensed display face for headlines and a highly legible sans serif for body/UI. Prefer bundled/local fonts when practical; if using a font service, provide a robust system fallback and avoid blocking page rendering.
- Use generous negative space, a disciplined grid, crisp separators, subtle grain only if inexpensive, and rounded corners only where they support product imagery or controls. Avoid turning every element into a pill.
- Make text readable over imagery. Glow must not reduce contrast or become a large blurry haze.
- Establish reusable design tokens for colors, type scale, spacing, radii, shadows, content width, and motion.

### Motion and interaction

Make the site feel alive through purposeful motion: an elegant hero entrance, restrained shoe float/turn, scroll reveals, quick product-card feedback, responsive buttons, navigation transitions, and smooth customizer changes. Keep motion short and coherent; avoid continuous animation on every element, scroll hijacking, excessive parallax, flashing, and animation that delays access to content.

Honor `prefers-reduced-motion` throughout, with a calm static presentation when requested. Make all hover actions work with keyboard focus and touch. Provide visible focus indicators and generous tap targets.

## Recommended implementation

First inspect installed tooling and the current repository state. If there is no existing app to preserve, use:

- **Next.js App Router + React + TypeScript** for a maintainable multi-page experience, with server-rendered content by default and small client components for interactive features.
- **Tailwind CSS** for responsive styling, with shared CSS variables/design tokens for the brand system.
- **Three.js via React Three Fiber** for the interactive shoe scene. Keep the canvas isolated behind a client-side/lazy-loaded boundary.
- **Motion for React** for a small set of purposeful interface animations; use CSS transitions for simple hover and focus states.
- A lightweight icon set such as Lucide React, or inline SVGs. Do not use emoji as interface icons.

Use compatible stable package versions, checking official documentation when APIs or compatibility are uncertain. Do not install a large component framework, a full commerce platform, an animation suite, or multiple overlapping libraries without a concrete need. Keep the existing package manager and lockfile if present. If starting from an empty repo, choose a current package manager and commit the lockfile. Avoid inventing a backend or requiring credentials.

## Pages and navigation

Implement these real, directly navigable routes with shared header/footer and coherent page metadata:

1. **`/` — Home**
   - A strong first-screen campaign with Red Tape wordmark/X, navigation, an oversized unbranded 3D shoe, headline, one-sentence supporting copy, and clear “Explore the collection” and “Customize your pair” actions.
   - Place supporting labels or feature notes beside the shoe on wide screens; stack them without overlap on small screens.
   - Continue with a concise featured collection, a short design/materials story, and a clear route into the customizer.
2. **`/shop` — Collection**
   - A useful catalog of original fictional shoe designs with locally available imagery, names, short descriptions, and clearly marked concept prices in one consistent fictional currency (prefer neutral `$` only if the design needs it; do not imply a live offer).
   - Working category/filter and sort controls, useful empty state, product links, and add-to-bag actions.
3. **`/product/[slug]` — Product detail**
   - Build a shared product-detail template and at least a few valid product slugs from the local product data.
   - Include product imagery/3D view where available, product description, color selection, size selection, quantity, and add-to-bag interaction. Validate selections and provide clear feedback.
   - Invalid slugs must render a proper not-found page, never a broken image or dead end.
4. **`/customize` — Build your pair**
   - Provide an interactive, well-labelled configurator for the shoe's major zones (for example: upper, sole, laces, heel detail). Offer a considered palette of swatches plus accessible custom color input if practical.
   - Update the 3D model live when possible. If WebGL is unavailable or the 3D asset fails, show a coherent local fallback preview and keep every control usable.
   - Include reset, selected-color feedback, and a summary of the finished design. Persist the draft locally if appropriate, with a clear way to reset it.
5. **`/story` — Our approach**
   - Original, concise copy explaining fictional design principles and the imagined craft behind the collection. Do not fabricate a physical headquarters, staff, suppliers, certifications, or company history.
6. **`/bag` — Shopping bag**
   - A working client-side demo bag that supports add, remove, quantity changes, and subtotal updates. Persist it locally if appropriate. Clearly disclose at checkout that this is a concept demo and no purchase or payment is processed.

Every visible navigation or action must work. Use internal route links for internal pages. For features that are intentionally demo-only, show helpful, honest feedback; never use `href="#"`, inert buttons, fake checkout completion, or external contact links.

## 3D shoe requirements and performance

- The hero shoe must be a real interactive 3D object, have no third-party branding, load locally, and look intentional against the dark scene. Aim for a good silhouette, believable materials, laces/sole detail, soft studio lighting, and a subtle contact shadow. Do not use the supplied screenshots as shoe textures.
- Prefer a compact, optimized local GLB authored specifically for this concept. If an appropriate local model cannot be produced, create the best feasible original model from procedural geometry and clearly isolate it so a GLB can replace it later. Never point the app at a guessed or missing asset URL.
- Support pointer drag/orbit with sensible limits and touch input. Do not make the shoe spin uncontrollably or steal page scrolling. Add an accessible hint/control for rotating it and a keyboard-operable reset/view action.
- Lazy-load the 3D code and model. Show a composed poster/fallback while loading, during WebGL failure, and on devices where rendering is unavailable. Keep the fallback local and visually consistent.
- Use modest geometry, compressed textures where useful, capped device pixel ratio, minimal lights, no real-time expensive effects, and pause/limit rendering while offscreen or when the tab is hidden. Avoid unnecessary per-frame React state updates.
- Keep the rest of the site fully useful without WebGL. The 3D scene must not block the initial text, navigation, or core page actions.

## Responsiveness, accessibility, and quality

- Design mobile-first and verify narrow phones, larger phones, tablets, and desktop widths. No horizontal page overflow, clipped controls, unreadable overlay copy, or tiny tap targets.
- Use semantic landmarks, a logical heading order, descriptive image alt text, labelled form controls, accessible dialogs/menus, keyboard navigation, and clear focus states.
- Communicate color choices with text/selection states in addition to color alone. Ensure text and controls meet WCAG AA contrast where applicable.
- Use `next/image` or an equivalent appropriate image optimization path for raster images; set image dimensions/aspect ratios to prevent layout shift. Prefer local assets and do not introduce third-party runtime image dependencies.
- Include meaningful page titles/descriptions, favicon using the X mark, and a custom not-found page.
- Avoid layout shift, excessive client JavaScript, giant dependencies, console errors, hydration mismatches, missing keys, missing assets, and broken internal routes.
- Keep components typed, focused, reusable, and easy to modify. Keep product/catalog copy and data in one obvious source rather than duplicating it across cards and pages.
- Do not add real-world addresses, emails, phone numbers, social profiles, maps, company registrations, payment credentials, or personal data. Do not make up customer testimonials or outside endorsements. Footer links should point to actual pages/sections in this project; a privacy page can explain that this concept demo does not process payments or collect customer data, if included.

## Suggested structure

Adapt to the existing repository if it has established conventions. A clean new app could use a structure like:

```text
app/
  layout.tsx
  page.tsx
  shop/page.tsx
  product/[slug]/page.tsx
  customize/page.tsx
  story/page.tsx
  bag/page.tsx
  not-found.tsx
components/
  site-header.tsx
  site-footer.tsx
  shoe-scene.tsx
  shoe-fallback.tsx
  product-card.tsx
  color-swatch.tsx
  bag-provider.tsx
data/
  products.ts
public/
  models/
  images/
```

Do not create empty pages just to match this outline. Finish the core routes and interactions end-to-end.

## Working method

1. Inspect `inspirations/`, repository files, and package-manager/tooling state. Summarize the existing state briefly before making major structural changes.
2. Establish the design tokens, typography, shared shell, and route structure before polishing individual sections.
3. Implement the real local shoe visual and fallback, then wire the same color/configuration data into the customizer and product UI.
4. Make every control and route functional. Add quality copy and meaningful empty/loading/error states as you build, not at the end.
5. Run the available project checks after implementation (install only if needed): lint, typecheck, and production build. Resolve errors caused by this work. If the repo has no checks, at minimum perform the available build and manually inspect all routes in a browser if browser access exists.
6. Check the finished result at mobile and desktop sizes. Verify keyboard navigation, reduced-motion behavior, no-WebGL fallback, and core shopping/customizer flows.
7. Finish by reporting what was created, how to run it, checks performed, and any real limitation that remains. Do not claim a check passed unless it was run successfully.

## Definition of done

- A complete, polished Red Tape Shoes concept site exists with all routes above and a consistent dark/neon-red identity.
- The landing page clearly features the large, interactive, unbranded 3D shoe and readable side copy on wide screens, adapting cleanly to mobile.
- The customizer changes the shoe preview and exposes a useful summary/reset flow, including a usable fallback when 3D is unavailable.
- Shop, product, and demo bag interactions work; all navigation destinations resolve; invalid product routes are handled.
- There is no lorem ipsum, fake business contact information, copied third-party branding, broken imagery, dead buttons, or misleading checkout.
- The app is responsive, accessible, mindful of reduced motion, and avoids needless GPU/CPU work.
- Type, lint, and production build checks pass where the project supports them, and any unverified limitation is stated plainly.
