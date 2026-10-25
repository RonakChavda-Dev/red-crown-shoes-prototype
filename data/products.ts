/**
 * The single source of truth for the Red Crown concept catalogue.
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

/** Surface of the upper, shown in 3D and selectable in the customizer. */
export const FINISHES = [
  { id: "knit", label: "Engineered knit", note: "Breathable, with a soft sheen" },
  { id: "suede", label: "Suede", note: "Brushed nap, matte and warm" },
  { id: "leather", label: "Pebbled leather", note: "Fine grain with a low gloss" },
] as const;
export type Finish = (typeof FINISHES)[number]["id"];

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
  { id: "studio", label: "Studio" },
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

/** Catalogue tones that are named but not offered as swatches. */
const EXTRA_NAMES = [
  { name: "Jet", hex: "#0E0E10" },
  { name: "Smoke", hex: "#2A2A2E" },
];

export function colorName(hex: string): string {
  const match = [...PALETTE, ...EXTRA_NAMES].find((swatch) => swatch.hex.toLowerCase() === hex.toLowerCase());
  return match ? match.name : `Custom ${hex.toUpperCase()}`;
}

const c = (upper: string, accent: string, midsole: string, outsole: string, laces: string): ShoeColors => ({
  upper,
  accent,
  midsole,
  outsole,
  laces,
});

const RUNNER: Build = { collar: "low", sole: "runner" };

export const PRODUCTS: Product[] = [
  {
    slug: "strand",
    code: "RC-01",
    name: "Strand",
    category: "run",
    build: RUNNER,
    price: 165,
    tagline: "An everyday runner with an even, unfussy stride.",
    description:
      "Strand is the shoe the rest of the line is measured against. An open-hole knit wraps the foot, two bonded tape bands lock the midfoot, and a soft foam sole rolls you from heel to toe without asking for attention.",
    materials: ["Open-hole engineered knit upper", "Two bonded side-tape bands", "Cushioned foam midsole", "Rubber outsole"],
    fit: "True to size with a close midfoot and a relaxed toe box.",
    care: "Remove the laces and wash cold by hand. Air dry away from direct heat.",
    featured: true,
    colorways: [
      { id: "signal-bone", name: "Bone / Signal", tone: "light", colors: c("#E9E5DF", "#FF2638", "#F4F2F0", "#1A1A1D", "#1A1A1D") },
      { id: "blackout", name: "Blackout", tone: "dark", colors: c("#1A1A1D", "#3A3A3E", "#2A2A2E", "#0E0E10", "#3A3A3E") },
      { id: "signal", name: "Full Signal", tone: "bold", colors: c("#FF2638", "#1A1A1D", "#F4F2F0", "#1A1A1D", "#F4F2F0") },
    ],
  },
  {
    slug: "kerb",
    code: "RC-02",
    name: "Kerb",
    category: "street",
    build: RUNNER,
    price: 140,
    tagline: "Quiet tones for long pavement days.",
    description:
      "Kerb takes the Strand pattern and dials it down: tonal tape, a sand outsole and colours that sit easily with everything else you own. It is the pair you reach for without thinking.",
    materials: ["Engineered knit upper", "Tonal side tape", "Foam midsole", "Sand-tone rubber outsole"],
    fit: "True to size. Wide feet may prefer a half size up.",
    care: "Spot clean with a damp cloth and mild soap.",
    featured: true,
    colorways: [
      { id: "chalk", name: "Chalk", tone: "light", colors: c("#F4F2F0", "#B9B7B3", "#F4F2F0", "#CDB894", "#E9E5DF") },
      { id: "ink", name: "Ink", tone: "dark", colors: c("#1D2436", "#FF2638", "#E9E5DF", "#1A1A1D", "#E9E5DF") },
    ],
  },
  {
    slug: "filament",
    code: "RC-03",
    name: "Filament",
    category: "run",
    build: RUNNER,
    price: 180,
    tagline: "Loud colour for quicker sessions.",
    description:
      "Filament is Strand in its brightest clothes. High-visibility colour across the knit, dark tape for contrast, and the same light foam sole built for tempo days and early starts.",
    materials: ["Engineered knit upper", "Contrast side tape", "Responsive foam midsole", "Rubber outsole"],
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
    code: "RC-04",
    name: "Overpass",
    category: "street",
    build: RUNNER,
    price: 175,
    tagline: "Built for the city after dark.",
    description:
      "Overpass pairs a deep upper with a tonal sole and a single hit of red on the tape. It reads clean in daylight and sharp under streetlights.",
    materials: ["Dense engineered knit upper", "Signal-red side tape", "Tonal foam midsole", "Rubber outsole"],
    fit: "True to size.",
    care: "Brush off dirt when dry and spot clean with mild soap.",
    featured: true,
    colorways: [
      { id: "night-shift", name: "Night Shift", tone: "dark", colors: c("#1A1A1D", "#FF2638", "#2A2A2E", "#0E0E10", "#FF2638") },
      { id: "paper", name: "Paper", tone: "light", colors: c("#F4F2F0", "#1A1A1D", "#F4F2F0", "#B8704E", "#1A1A1D") },
    ],
  },
  {
    slug: "drift",
    code: "RC-05",
    name: "Drift",
    category: "studio",
    build: RUNNER,
    price: 150,
    tagline: "Earthy colour for travel and slow days.",
    description:
      "Drift trades the city palette for moss, clay and sand. A soft knit and a cushioned sole make it an easy companion for long walks, flights and everything in between.",
    materials: ["Soft engineered knit upper", "Tonal side tape", "Cushioned foam midsole", "Gum-tone rubber outsole"],
    fit: "True to size with a relaxed fit.",
    care: "Hand wash cold and air dry.",
    colorways: [
      { id: "moss", name: "Moss", tone: "dark", colors: c("#56653F", "#1A1A1D", "#CDB894", "#B8704E", "#1A1A1D") },
      { id: "clay", name: "Clay", tone: "bold", colors: c("#B8704E", "#1D2436", "#E9E5DF", "#3A3A3E", "#E9E5DF") },
    ],
  },
  {
    slug: "margin",
    code: "RC-06",
    name: "Margin",
    category: "studio",
    build: RUNNER,
    price: 120,
    tagline: "A tonal pair that disappears into an outfit.",
    description:
      "Margin is the most reduced colourway in the line: one tone from collar to sole, with the tape barely a shade apart. It is designed to sit quietly under everything.",
    materials: ["Engineered knit upper", "Tone-on-tone side tape", "Foam midsole", "Rubber outsole"],
    fit: "True to size. Relaxed, easy-on fit.",
    care: "Spot clean with mild soap and water.",
    colorways: [
      { id: "fog", name: "Fog", tone: "light", colors: c("#B9B7B3", "#E9E5DF", "#F4F2F0", "#7C7B78", "#E9E5DF") },
      { id: "coal", name: "Coal", tone: "dark", colors: c("#1A1A1D", "#2A2A2E", "#3A3A3E", "#0E0E10", "#1A1A1D") },
    ],
  },
  {
    slug: "cadence",
    code: "RC-07",
    name: "Cadence",
    category: "run",
    build: RUNNER,
    price: 155,
    tagline: "A daily runner that keeps the rhythm.",
    description:
      "Cadence is tuned for easy miles: a breathable knit, a cushioned sole and colourways that range from barely-there grey to a full red midsole.",
    materials: ["Breathable engineered knit upper", "Bonded side tape", "High-volume foam midsole", "Rubber outsole"],
    fit: "True to size with a generous forefoot.",
    care: "Hand wash cold. Air dry away from direct heat.",
    colorways: [
      { id: "static", name: "Static", tone: "light", colors: c("#E9E5DF", "#7C7B78", "#F4F2F0", "#B9B7B3", "#3A3A3E") },
      { id: "redline", name: "Redline", tone: "bold", colors: c("#1A1A1D", "#FF2638", "#FF2638", "#1A1A1D", "#F4F2F0") },
    ],
  },
  {
    slug: "transit",
    code: "RC-08",
    name: "Transit",
    category: "street",
    build: RUNNER,
    price: 165,
    tagline: "High contrast for getting across town.",
    description:
      "Transit is the commuter colourway: a deep, practical upper with tape and laces in a colour you can spot across a platform.",
    materials: ["Dense engineered knit upper", "Contrast side tape", "Foam midsole", "Rubber outsole"],
    fit: "True to size.",
    care: "Spot clean with mild soap and water.",
    colorways: [
      { id: "basalt", name: "Basalt", tone: "dark", colors: c("#3A3A3E", "#E8542C", "#1A1A1D", "#0E0E10", "#E8542C") },
      { id: "cobalt", name: "Cobalt", tone: "bold", colors: c("#3150D4", "#F4F2F0", "#F4F2F0", "#1A1A1D", "#F4F2F0") },
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
