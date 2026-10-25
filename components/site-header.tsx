"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { NAV_LINKS, isActive } from "@/components/nav-links";
import { bagCount, useBag } from "@/lib/bag";
import { useHydrated } from "@/lib/local-store";
import { cn } from "@/lib/format";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => menu.current?.close();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-line bg-ink/80 backdrop-blur-md" : "border-transparent bg-ink/0",
      )}
    >
      <a
        href="#main"
        className="btn btn-primary absolute left-3 top-3 z-10 -translate-y-24 focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" aria-label="Red Crown home" className="-m-2 rounded-[var(--radius-xs)] p-2">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="link-draw py-2 text-[0.9rem] text-mute transition-colors hover:text-paper aria-[current=page]:text-paper"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <BagLink active={pathname === "/bag"} />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-[var(--radius-xs)] text-paper md:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => menu.current?.showModal()}
          >
            <Menu className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        aria-label="Site menu"
        className="mobile-menu m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-paper backdrop:bg-ink/80 md:hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="shell flex h-full flex-col">
          <div className="flex h-[var(--header-h)] items-center justify-between">
            <Link href="/" onNavigate={closeMenu} aria-label="Red Crown home">
              <Wordmark />
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center"
              aria-label="Close menu"
              onClick={closeMenu}
              autoFocus
            >
              <X className="size-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="space-y-1">
              {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/bag", label: "Bag" }].map((link, i) => (
                <li key={link.href} className="menu-item" style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={link.href}
                    onNavigate={closeMenu}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="group flex items-baseline justify-between border-b border-line py-4"
                  >
                    <span className="display-lg transition-colors group-hover:text-signal group-aria-[current=page]:text-signal">
                      {link.label}
                    </span>
                    <span className="eyebrow text-dim">0{i + 1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="eyebrow pb-8 text-dim">Red Crown is a fictional concept label.</p>
        </div>
      </dialog>
    </header>
  );
}

function BagLink({ active }: { active: boolean }) {
  const lines = useBag();
  const hydrated = useHydrated();
  const count = hydrated ? bagCount(lines) : 0;
  return (
    <Link
      href="/bag"
      aria-current={active ? "page" : undefined}
      aria-label={count ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag, empty"}
      className="group relative flex h-11 items-center gap-2 rounded-[var(--radius-xs)] px-3 text-mute transition-colors hover:text-paper aria-[current=page]:text-paper"
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} />
      <span className="hidden text-[0.9rem] sm:inline">Bag</span>
      <span
        key={count}
        className={cn(
          "bag-count grid h-5 min-w-5 place-items-center rounded-full px-1 font-mono text-[0.68rem] font-semibold",
          count ? "bg-signal text-ink" : "bg-surface-3 text-mute",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
