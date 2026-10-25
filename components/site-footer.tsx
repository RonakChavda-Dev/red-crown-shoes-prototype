import Link from "next/link";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/shop", label: "Collection" },
      { href: "/shop?category=run", label: "Running shoes" },
      { href: "/shop?category=studio", label: "Studio shoes" },
      { href: "/story", label: "Our approach" },
    ],
  },
  {
    title: "Your pair",
    links: [
      { href: "/customize", label: "Build your pair" },
      { href: "/bag", label: "Bag" },
    ],
  },
  {
    title: "About this site",
    links: [
      { href: "/privacy", label: "Privacy & demo notice" },
      { href: "/story#principles", label: "Design principles" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-ink-2">
      <div className="shell grid gap-12 pb-10 pt-16 md:grid-cols-[1.4fr_2fr] md:pt-20">
        <div className="max-w-sm">
          <p className="display-md">
            Own <span className="text-signal">every step.</span>
            <br />
            Keep moving.
          </p>
          <p className="mt-5 text-[0.92rem] leading-relaxed text-mute">
            Red Crown is a fictional footwear label created as a design prototype. Nothing here is for sale, and no
            orders or payments are processed.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="eyebrow text-dim">{column.title}</h2>
              <ul className="mt-4 space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-draw inline-block py-1.5 text-[0.92rem] text-mute hover:text-paper">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 text-[0.8rem] text-dim sm:flex-row sm:justify-between">
        <p>
          A concept storefront. All products, names and prices are fictional. 3D shoe based on{" "}
          <a
            href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe"
            className="link-draw text-mute hover:text-paper"
            rel="noreferrer"
            target="_blank"
          >
            “Materials Variants Shoe”
          </a>{" "}
          © 2021 Shopify,{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="link-draw text-mute hover:text-paper" rel="noreferrer" target="_blank">
            CC BY 4.0
          </a>
          , modified.
        </p>
        <p className="font-mono uppercase tracking-[0.14em]">Concept season 01</p>
      </div>
    </footer>
  );
}
