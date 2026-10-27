"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { NAV_LINKS, isActive } from "@/components/nav-links";
import { bagCount, useBag } from "@/lib/bag";
import { useHydrated } from "@/lib/local-store";
import { cn } from "@/lib/format";

const MENU_LINKS = [{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/bag", label: "Bag" }];

/** Matches the longest exit animation for `.mobile-menu[data-closing]` in globals.css. */
const MENU_EXIT_MS = 380;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Play the menu's exit animation (skipped for reduced motion), then close it and run `then`. */
  const closeMenu = (then?: () => void) => {
    const dialog = menu.current;
    if (!dialog?.open) return then?.();
    window.clearTimeout(closeTimer.current);
    const finish = () => {
      delete dialog.dataset.closing;
      dialog.close();
      then?.();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    dialog.dataset.closing = "";
    closeTimer.current = window.setTimeout(finish, MENU_EXIT_MS);
  };

  // Let the menu animate away before the page transition snapshots the screen.
  const navigateFromMenu = (event: { preventDefault: () => void }, href: string) => {
    event.preventDefault();
    closeMenu(() => router.push(href));
  };

  const openMenu = () => {
    const dialog = menu.current;
    if (!dialog) return;
    window.clearTimeout(closeTimer.current);
    delete dialog.dataset.closing;
    if (!dialog.open) dialog.showModal();
  };

  // The menu is phone-only: drop it (and its scroll lock) if the window grows past it.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 48rem)");
    const onChange = () => {
      if (wide.matches && menu.current?.open) {
        window.clearTimeout(closeTimer.current);
        delete menu.current.dataset.closing;
        menu.current.close();
      }
    };
    wide.addEventListener("change", onChange);
    return () => {
      wide.removeEventListener("change", onChange);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Fading a ready-blurred layer is far smoother than animating the blur itself. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 border-b border-line bg-ink/80 backdrop-blur-md transition-opacity duration-300 ease-out",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
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
            onClick={openMenu}
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
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className="shell flex h-full flex-col">
          <div className="flex h-[var(--header-h)] items-center justify-between">
            <Link href="/" onNavigate={(event) => navigateFromMenu(event, "/")} aria-label="Red Crown home">
              <Wordmark />
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center"
              aria-label="Close menu"
              onClick={() => closeMenu()}
              autoFocus
            >
              <X className="size-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="space-y-1">
              {MENU_LINKS.map((link, i) => (
                <li
                  key={link.href}
                  className="menu-item"
                  style={{ "--i": i, "--r": MENU_LINKS.length - 1 - i } as React.CSSProperties}
                >
                  <Link
                    href={link.href}
                    onNavigate={(event) => navigateFromMenu(event, link.href)}
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
