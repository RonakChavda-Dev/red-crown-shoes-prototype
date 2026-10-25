import Link from "next/link";
import { FEATURED } from "@/data/products";
import { ShoeArt } from "@/components/shoe-art";

export default function ProductNotFound() {
  const ghost = FEATURED[0];
  return (
    <div className="shell grid items-center gap-10 py-20 lg:grid-cols-2">
      <div>
        <p className="eyebrow text-signal">Shoe not found</p>
        <h1 className="display-xl mt-5">
          That pair
          <br />
          isn&apos;t in the line.
        </h1>
        <p className="lede mt-6 max-w-md">
          The link may be out of date, or the style was never part of the collection. Browse what is, or build the pair
          you had in mind.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Browse the collection
          </Link>
          <Link href="/customize" className="btn btn-ghost">
            Build your own
          </Link>
        </div>
      </div>
      <div className="opacity-30 grayscale" aria-hidden>
        <ShoeArt colors={ghost.colorways[0].colors} build={ghost.build} className="w-full" />
      </div>
    </div>
  );
}
