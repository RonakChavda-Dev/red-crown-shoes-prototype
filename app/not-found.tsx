import type { Metadata } from "next";
import Link from "next/link";
import { XMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="shell section-y flex min-h-[70svh] flex-col justify-center">
      <div className="flex items-center gap-4">
        <XMark className="size-10" />
        <p className="eyebrow text-dim">Error 404</p>
      </div>
      <h1 className="display-xl mt-8 max-w-4xl">
        Wrong turn.
        <br />
        <span className="text-signal">The crown&apos;s still yours.</span>
      </h1>
      <p className="lede mt-6 max-w-lg">This page doesn&apos;t exist. Here is the quickest way back to something that does.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/shop" className="btn btn-ghost">
          Browse the collection
        </Link>
        <Link href="/customize" className="btn btn-ghost">
          Build your pair
        </Link>
      </div>
    </div>
  );
}
