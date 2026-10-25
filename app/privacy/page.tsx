import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Privacy & demo notice",
  description: "Red Crown is a concept demo. It does not sell anything, process payments or collect personal data.",
  path: "/privacy",
});

const ITEMS = [
  {
    title: "Nothing is for sale",
    body: "Red Crown is a fictional label. Products, names, prices and copy were created for this design prototype. The checkout explains this and does not complete an order.",
  },
  {
    title: "No payments, no accounts",
    body: "There are no payment forms, accounts or sign-ups. The site never asks for your name, address, email or card details.",
  },
  {
    title: "What stays in your browser",
    body: "Your demo bag and customizer draft are saved in your browser's local storage so they survive a refresh. They never leave your device. Clear them from the bag and customizer pages, or by clearing this site's data in your browser.",
  },
  {
    title: "Credits",
    body: "The 3D shoe is based on “Materials Variants Shoe” © 2021 Shopify, licensed under CC BY 4.0 and published in the Khronos glTF sample assets. It was modified for this site: the original colourways were removed, small marks were painted out, and the surfaces are recoloured live by zone. All Red Crown names, colourways and copy are original to this concept.",
  },
  {
    title: "No tracking",
    body: "The site does not use analytics, advertising cookies or third-party trackers. Fonts are bundled with the site at build time.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="shell page-bottom">
      <header className="page-head max-w-3xl">
        <p className="eyebrow fade-up text-signal">About this site</p>
        <h1 className="display-lg mt-4">
          <span className="rise-line">
            <span>Privacy & demo notice</span>
          </span>
        </h1>
        <p className="lede fade-up mt-6" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
          The short version: this is a design prototype. It doesn&apos;t sell anything and it doesn&apos;t collect
          anything about you.
        </p>
      </header>
      <dl className="max-w-3xl divide-y divide-line border-y border-line">
        {ITEMS.map((item) => (
          <div key={item.title} className="reveal grid gap-2 py-8 md:grid-cols-[14rem_1fr] md:gap-10">
            <dt className="font-semibold">{item.title}</dt>
            <dd className="leading-relaxed text-mute">{item.body}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/bag" className="btn btn-quiet">
          Manage your demo bag
        </Link>
        <Link href="/customize" className="btn btn-quiet">
          Open the customizer
        </Link>
      </div>
    </div>
  );
}
