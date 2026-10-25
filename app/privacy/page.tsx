import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & demo notice",
  description: "Red Tape is a concept demo. It does not sell anything, process payments or collect personal data.",
};

const ITEMS = [
  {
    title: "Nothing is for sale",
    body: "Red Tape is a fictional label. Products, names, prices and copy were created for this design prototype. The checkout explains this and does not complete an order.",
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
    title: "No tracking",
    body: "The site does not use analytics, advertising cookies or third-party trackers. Fonts are bundled with the site at build time.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="shell pb-24">
      <header className="max-w-3xl py-12 sm:py-16">
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
