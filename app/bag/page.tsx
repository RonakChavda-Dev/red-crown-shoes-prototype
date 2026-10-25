import type { Metadata } from "next";
import { BagView } from "@/components/bag-view";

export const metadata: Metadata = {
  title: "Bag",
  description: "Your Red Crown demo bag. Concept prices only; no purchase or payment is processed.",
};

export default function BagPage() {
  return (
    <div className="shell page-bottom">
      <header className="page-head">
        <p className="eyebrow fade-up text-signal">Demo bag</p>
        <h1 className="display-xl mt-4">
          <span className="rise-line">
            <span>Your bag</span>
          </span>
        </h1>
      </header>
      <BagView />
    </div>
  );
}
