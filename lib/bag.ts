import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { productImage } from "@/lib/shoe-images";
import { parseColors, type Build, type Colorway, type Product, type ShoeColors } from "@/data/products";

export const MAX_QTY = 10;

export interface BagLine {
  id: string;
  kind: "product" | "custom";
  name: string;
  code: string;
  variant: string;
  size: string;
  qty: number;
  unitPrice: number;
  colors: ShoeColors;
  build: Build;
  href: string;
  /** Pre-rendered still for catalogue pairs; custom builds use the illustration. */
  image?: string;
}

function parseLine(raw: unknown): BagLine | null {
  if (!raw || typeof raw !== "object") return null;
  const line = raw as Partial<BagLine>;
  const colors = parseColors(line.colors);
  if (
    typeof line.id !== "string" ||
    (line.kind !== "product" && line.kind !== "custom") ||
    typeof line.name !== "string" ||
    typeof line.size !== "string" ||
    typeof line.unitPrice !== "number" ||
    typeof line.qty !== "number" ||
    !colors ||
    !line.build
  ) {
    return null;
  }
  return {
    id: line.id,
    kind: line.kind,
    name: line.name,
    code: typeof line.code === "string" ? line.code : "RC",
    variant: typeof line.variant === "string" ? line.variant : "",
    size: line.size,
    qty: Math.min(MAX_QTY, Math.max(1, Math.round(line.qty))),
    unitPrice: line.unitPrice,
    colors,
    build: line.build,
    href: typeof line.href === "string" && line.href.startsWith("/") ? line.href : "/shop",
    image: typeof line.image === "string" && line.image.startsWith("/images/") ? line.image : undefined,
  };
}

export const bagStore = createLocalStore<BagLine[]>("redtape:bag:v1", [], (raw) =>
  Array.isArray(raw) ? raw.map(parseLine).filter((line): line is BagLine => line !== null) : null,
);

export function useBag() {
  return useLocalStore(bagStore);
}

export function addToBag(line: Omit<BagLine, "qty">, qty = 1) {
  bagStore.set((lines) => {
    const existing = lines.find((item) => item.id === line.id);
    if (existing) {
      return lines.map((item) =>
        item.id === line.id ? { ...item, qty: Math.min(MAX_QTY, item.qty + qty) } : item,
      );
    }
    return [...lines, { ...line, qty: Math.min(MAX_QTY, qty) }];
  });
}

export function setQty(id: string, qty: number) {
  bagStore.set((lines) =>
    lines.map((item) => (item.id === id ? { ...item, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : item)),
  );
}

export function removeFromBag(id: string) {
  bagStore.set((lines) => lines.filter((item) => item.id !== id));
}

export function clearBag() {
  bagStore.reset();
}

export function bagCount(lines: BagLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function bagSubtotal(lines: BagLine[]) {
  return lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
}

export function productLine(product: Product, colorway: Colorway, size: string): Omit<BagLine, "qty"> {
  return {
    id: `${product.slug}:${colorway.id}:${size}`,
    kind: "product",
    name: product.name,
    code: product.code,
    variant: colorway.name,
    size,
    unitPrice: product.price,
    colors: colorway.colors,
    build: product.build,
    href: `/product/${product.slug}?colorway=${colorway.id}`,
    image: productImage(product.slug, colorway.id),
  };
}
