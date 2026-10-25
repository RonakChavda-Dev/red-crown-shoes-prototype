import { PRESETS, type ShoeColors, type Zone } from "@/data/products";

/**
 * Still renders of the 3D shoe, produced from the same model and colour data
 * as the live viewer (see README → "Product imagery").
 */
export const SHOE_IMAGE = { width: 1280, height: 730 } as const;

/** Bump whenever the renders are regenerated so browsers drop cached copies. */
const RENDER_VERSION = 3;
const still = (name: string) => `/images/shoes/${name}.webp?v=${RENDER_VERSION}`;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const productImage = (slug: string, colorwayId: string) => still(`${slug}-${colorwayId}`);
export const presetImage = (name: string) => still(`preset-${slugify(name)}`);
export const layerImage = (zone: Zone) => still(`layer-${zone}`);

/** A pre-rendered image for these exact colours, if one exists. */
export function presetImageFor(colors: ShoeColors): string | null {
  const match = PRESETS.find((preset) =>
    (Object.keys(colors) as Zone[]).every((zone) => preset.colors[zone].toLowerCase() === colors[zone].toLowerCase()),
  );
  return match ? presetImage(match.name) : null;
}
