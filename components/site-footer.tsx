import Link from "next/link";
import { XMark } from "@/components/logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/shop", label: "Collection" },
      { href: "/shop?category=run", label: "Running shoes" },
      { href: "/shop?category=trail", label: "Trail shoes" },
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
            Cut the <span className="text-signal">red tape.</span>
            <br />
            Keep moving.
          </p>
          <p className="mt-5 text-[0.92rem] leading-relaxed text-mute">
            Red Tape is a fictional footwear label created as a design prototype. Nothing here is for sale, and no
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

      <div aria-hidden className="shell relative select-none">
        <div className="flex items-end gap-[2vw] border-t border-line pt-6">
          <XMark className="mb-[1.6vw] size-[12vw] shrink-0 md:size-[9vw]" />
          <span
            className="font-display text-[22vw] uppercase leading-[0.78] tracking-tight text-transparent md:text-[17.5vw]"
            style={{ WebkitTextStroke: "1px var(--color-line-strong)" }}
          >
            Red Tape
          </span>
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 text-[0.8rem] text-dim sm:flex-row sm:justify-between">
        <p>A concept storefront. All products, names and prices are fictional.</p>
        <p className="font-mono uppercase tracking-[0.14em]">Concept season 01</p>
      </div>
    </footer>
  );
}
