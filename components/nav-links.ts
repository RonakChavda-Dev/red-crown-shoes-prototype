export const NAV_LINKS = [
  { href: "/shop", label: "Collection" },
  { href: "/customize", label: "Customize" },
  { href: "/story", label: "Our approach" },
] as const;

export function isActive(pathname: string, href: string) {
  return pathname === href || (href === "/shop" && pathname.startsWith("/product/"));
}
