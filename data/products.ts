/**
 * The single source of truth for the Red Tape concept catalogue.
 * Every card, product page, bag line and 3D preview reads from here.
 */

export const ZONES = ["upper", "accent", "midsole", "outsole", "laces"] as const;
export type Zone = (typeof ZONES)[number];
export type ShoeColors = Record<Zone, string>;

export const ZONE_INFO: Record<Zone, { label: string; hint: string }> = {
  upper: { label: "Upper", hint: "Engineered knit body" },
  accent: { label: "Tape & heel", hint: "Side tape, heel counter and pull tab" },
  midsole: { label: "Midsole", hint: "Foam platform" },
  outsole: { label: "Outsole", hint: "Rubber ground contact" },
  laces: { label: "Laces", hint: "Flat laces and eyelets" },
};

/** Silhouette controls shared by the SVG art and the procedural 3D model. */
export type Collar = "low" | "high";
export type SoleType = "runner" | "court" | "trail";
export interface Build {
  collar: Collar;
  sole: SoleType;
}

export const CATEGORIES = [
  { id: "run", label: "Run" },
  { id: "street", label: "Street" },
  { id: "trail", label: "Trail" },
] as const;
export type Category = (typeof CATEGORIES)[number]["id"];

export const TONES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "bold", label: "Bold" },
] as const;
export type Tone = (typeof TONES)[number]["id"];

export interface Colorway {
  id: string;
  name: string;
  tone: Tone;
  colors: ShoeColors;
}

export interface Product {
  slug: string;
  code: string;
  name: string;
  category: Category;
  build: Build;
  /** Concept price in USD. Nothing is for sale. */
  price: number;
  tagline: string;
  description: string;
  materials: string[];
  fit: string;
  care: string;
  colorways: Colorway[];
  featured?: boolean;
}

export const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"] as const;
export type Size = (typeof SIZES)[number];

/** Named swatches used by the customizer and colourway naming. */
export const PALETTE = [
  { name: "Signal Red", hex: "#FF2638" },
  { name: "Ember", hex: "#E8542C" },
  { name: "Clay", hex: "#B8704E" },
  { name: "Sand", hex: "#CDB894" },
  { name: "Bone", hex: "#E9E5DF" },
  { name: "Paper", hex: "#F4F2F0" },
  { name: "Fog", hex: "#B9B7B3" },
  { name: "Concrete", hex: "#7C7B78" },
  { name: "Graphite", hex: "#3A3A3E" },
  { name: "Coal", hex: "#1A1A1D" },
  { name: "Ink", hex: "#1D2436" },
  { name: "Cobalt", hex: "#3150D4" },
  { name: "Moss", hex: "#56653F" },
  { name: "Lilac", hex: "#A99BD6" },
] as const;

export function colorName(hex: string): string {
  const match = PALETTE.find((swatch) => swatch.hex.toLowerCase() === hex.toLowerCase());
  return match ? match.name : `Custom ${hex.toUpperCase()}`;
}

const c = (upper: string, accent: string, midsole: string, outsole: string, laces: string): ShoeColors => ({
  upper,
  accent,
  midsole,
  outsole,
  laces,
});

export const PRODUCTS: Product[] = [
  {
    slug: "strand",
    code: "RT-01",
    name: "Strand",
    category: "run",
    build: { collar: "low", sole: "runner" },
    price: 165,
    tagline: "An everyday runner with an even, unfussy stride.",
    description:
      "Strand is the shoe the rest of the line is measured against. A single-layer knit wraps the foot, the signature side tape locks the midfoot, and a rockered foam midsole rolls you from heel to toe without asking for attention.",
    materials: ["Engineered knit upper", "Bonded side tape", "Rockered foam midsole", "Full-length rubber outsole"],
    fit: "True to size with a close midfoot and a relaxed toe box.",
    care: "Remove the laces and wash cold by hand. Air dry away from direct heat.",
    featured: true,
    colorways: [
      { id: "signal-bone", name: "Bone / Signal", tone: "light", colors: c("#E9E5DF", "#FF2638", "#F4F2F0", "#1A1A1D", "#1A1A1D") },
      { id: "blackout", name: "Blackout", tone: "dark", colors: c("#1A1A1D", "#3A3A3E", "#1A1A1D", "#0E0E10", "#3A3A3E") },
      { id: "signal", name: "Full Signal", tone: "bold", colors: c("#FF2638", "#1A1A1D", "#F4F2F0", "#1A1A1D", "#F4F2F0") },
    ],
  },
  {
    slug: "kerb",
    code: "RT-02",
    name: "Kerb",
    category: "street",
    build: { collar: "low", sole: "court" },
    price: 140,
    tagline: "A low court shoe for long pavement days.",
    description:
      "Kerb borrows the flat, stitched cupsole of a court classic and strips everything else back. A clean panelled upper, a firm heel and a wide base make it the pair you reach for without thinking.",
    materials: ["Smooth synthetic leather upper", "Stitched cupsole", "Padded collar", "Herringbone rubber outsole"],
    fit: "True to size. Wide feet may prefer a half size up.",
    care: "Wipe with a damp cloth. Keep the cupsole clean with a soft brush.",
    featured: true,
    colorways: [
      { id: "chalk", name: "Chalk", tone: "light", colors: c("#F4F2F0", "#B9B7B3", "#F4F2F0", "#CDB894", "#F4F2F0") },
      { id: "ink", name: "Ink", tone: "dark", colors: c("#1D2436", "#FF2638", "#E9E5DF", "#1A1A1D", "#E9E5DF") },
    ],
  },
  {
    slug: "filament",
    code: "RT-03",
    name: "Filament",
    category: "run",
    build: { collar: "low", sole: "runner" },
    price: 180,
    tagline: "A pared-back trainer for quicker sessions.",
    description:
      "Filament trims the upper down to a thin, airy mesh and keeps only what holds the foot in place. The tape runs a little higher, the heel sits a little lower, and the whole shoe feels lighter in the hand.",
    materials: ["Open monofilament mesh", "Heat-bonded tape overlays", "Responsive foam midsole", "Segmented rubber pods"],
    fit: "Snug, performance fit. Go half a size up for a roomier feel.",
    care: "Hand wash cold. Stuff with paper to keep the shape while drying.",
    featured: true,
    colorways: [
      { id: "ember", name: "Ember", tone: "bold", colors: c("#E8542C", "#1A1A1D", "#F4F2F0", "#1A1A1D", "#1A1A1D") },
      { id: "graphite", name: "Graphite", tone: "dark", colors: c("#3A3A3E", "#FF2638", "#1A1A1D", "#0E0E10", "#B9B7B3") },
    ],
  },
  {
    slug: "overpass",
    code: "RT-04",
    name: "Overpass",
    category: "street",
    build: { collar: "high", sole: "court" },
    price: 175,
    tagline: "A high-top that frames the ankle without stiffening it.",
    description:
      "Overpass lifts the collar and pads it generously so the shoe hugs the ankle and still moves with it. The court sole keeps it grounded; the tall tape line gives it a silhouette you can read from across the street.",
    materials: ["Brushed suede-feel upper", "Padded high collar", "Stitched cupsole", "Gum-tone rubber outsole"],
    fit: "True to size. The padded collar loosens slightly with wear.",
    care: "Brush gently when dry. Use a protective spray before wet weather.",
    featured: true,
    colorways: [
      { id: "night-shift", name: "Night Shift", tone: "dark", colors: c("#1A1A1D", "#FF2638", "#1A1A1D", "#3A3A3E", "#FF2638") },
      { id: "paper", name: "Paper", tone: "light", colors: c("#F4F2F0", "#1A1A1D", "#F4F2F0", "#B8704E", "#1A1A1D") },
    ],
  },
  {
    slug: "switchback",
    code: "RT-05",
    name: "Switchback",
    category: "trail",
    build: { collar: "low", sole: "trail" },
    price: 190,
    tagline: "Steady, grippy and happy on broken ground.",
    description:
      "Switchback pairs a protective, tightly woven upper with a deeper lugged outsole. The midsole is a touch firmer for stability on uneven surfaces, and the tape wraps further around the heel to keep the foot centred.",
    materials: ["Abrasion-resistant woven upper", "Wrapped heel tape", "Stability foam midsole", "Deep-lug rubber outsole"],
    fit: "True to size with extra room for thicker socks.",
    care: "Knock off dried mud, rinse cold, and air dry with the insole removed.",
    colorways: [
      { id: "moss", name: "Moss", tone: "dark", colors: c("#56653F", "#1A1A1D", "#CDB894", "#1A1A1D", "#1A1A1D") },
      { id: "clay", name: "Clay", tone: "bold", colors: c("#B8704E", "#1D2436", "#E9E5DF", "#3A3A3E", "#E9E5DF") },
    ],
  },
  {
    slug: "margin",
    code: "RT-06",
    name: "Margin",
    category: "street",
    build: { collar: "low", sole: "court" },
    price: 120,
    tagline: "A quiet low-top for everything in between.",
    description:
      "Margin is the most reduced shoe in the line: tonal panels, a soft collar and a thin cupsole. It is designed to disappear into an outfit, with the side tape as the only line that speaks up.",
    materials: ["Soft knit-backed upper", "Tonal side tape", "Low-profile cupsole", "Rubber outsole"],
    fit: "True to size. Relaxed, easy-on fit.",
    care: "Spot clean with mild soap and water.",
    colorways: [
      { id: "fog", name: "Fog", tone: "light", colors: c("#B9B7B3", "#E9E5DF", "#F4F2F0", "#7C7B78", "#E9E5DF") },
      { id: "coal", name: "Coal", tone: "dark", colors: c("#1A1A1D", "#1D2436", "#3A3A3E", "#0E0E10", "#1A1A1D") },
    ],
  },
  {
    slug: "cadence",
    code: "RT-07",
    name: "Cadence",
    category: "run",
    build: { collar: "low", sole: "runner" },
    price: 155,
    tagline: "A cushioned daily runner that keeps the rhythm.",
    description:
      "Cadence adds a little more foam under the forefoot and a softer knit around the collar. It is built for easy miles and long days on your feet, with the same rockered profile as Strand.",
    materials: ["Plush knit upper", "Padded heel collar", "High-volume foam midsole", "Rubber outsole with flex grooves"],
    fit: "True to size with a generous forefoot.",
    care: "Hand wash cold. Air dry away from direct heat.",
    colorways: [
      { id: "static", name: "Static", tone: "light", colors: c("#E9E5DF", "#7C7B78", "#F4F2F0", "#B9B7B3", "#3A3A3E") },
      { id: "redline", name: "Redline", tone: "bold", colors: c("#1A1A1D", "#FF2638", "#FF2638", "#1A1A1D", "#F4F2F0") },
    ],
  },
  {
    slug: "ridgeback",
    code: "RT-08",
    name: "Ridgeback",
    category: "trail",
    build: { collar: "high", sole: "trail" },
    price: 210,
    tagline: "A mid-height hiker with a trail runner's stride.",
    description:
      "Ridgeback extends the collar for ankle coverage and keeps the deep lugs of Switchback underneath. It is the most protective shoe in the line, without the weight of a traditional boot.",
    materials: ["Ripstop-weave upper", "Padded mid-height collar", "Stability foam midsole", "Deep-lug rubber outsole"],
    fit: "True to size. Lace the top eyelets for a locked-in heel.",
    care: "Brush off debris, rinse cold, and air dry slowly.",
    colorways: [
      { id: "basalt", name: "Basalt", tone: "dark", colors: c("#3A3A3E", "#E8542C", "#1A1A1D", "#0E0E10", "#E8542C") },
      { id: "signal", name: "Signal", tone: "bold", colors: c("#FF2638", "#1A1A1D", "#3A3A3E", "#1A1A1D", "#1A1A1D") },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getColorway(product: Product, colorwayId: string | null | undefined): Colorway {
  return product.colorways.find((colorway) => colorway.id === colorwayId) ?? product.colorways[0];
}

export const FEATURED = PRODUCTS.filter((product) => product.featured);

/** The colours of the hero shoe on the landing page. */
export const HERO_COLORS: ShoeColors = PRODUCTS[0].colorways[0].colors;
export const HERO_BUILD: Build = PRODUCTS[0].build;

/** Customizer defaults and presets. */
export const CUSTOM_PRICE = 185;
export const CUSTOM_BUILD: Build = { collar: "low", sole: "runner" };
export const DEFAULT_CUSTOM: ShoeColors = c("#1A1A1D", "#FF2638", "#F4F2F0", "#1A1A1D", "#FF2638");

export const PRESETS: { name: string; colors: ShoeColors }[] = [
  { name: "Signal", colors: DEFAULT_CUSTOM },
  { name: "Ghost", colors: c("#F4F2F0", "#E9E5DF", "#F4F2F0", "#B9B7B3", "#F4F2F0") },
  { name: "Night Shift", colors: c("#1A1A1D", "#3A3A3E", "#1A1A1D", "#0E0E10", "#FF2638") },
  { name: "Field", colors: c("#56653F", "#E8542C", "#CDB894", "#3A3A3E", "#CDB894") },
  { name: "Harbour", colors: c("#1D2436", "#3150D4", "#E9E5DF", "#1A1A1D", "#E9E5DF") },
];

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function parseColors(value: unknown): ShoeColors | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const zone of ZONES) if (!isHexColor(record[zone])) return null;
  return Object.fromEntries(ZONES.map((zone) => [zone, record[zone] as string])) as ShoeColors;
}
