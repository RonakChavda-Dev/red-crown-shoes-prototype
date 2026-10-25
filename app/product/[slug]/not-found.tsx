import Link from "next/link";
import Image from "next/image";
import { productImage, SHOE_IMAGE } from "@/lib/shoe-images";

export default function ProductNotFound() {
  return (
    <div className="shell section-y grid items-center gap-10 lg:grid-cols-2">
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
        <Image src={productImage("margin", "fog")} alt="" width={SHOE_IMAGE.width} height={SHOE_IMAGE.height} sizes="50vw" className="h-auto w-full" />
      </div>
    </div>
  );
}
