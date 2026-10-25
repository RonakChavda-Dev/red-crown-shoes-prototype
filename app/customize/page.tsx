import type { Metadata } from "next";
import { Customizer } from "@/components/customizer";

export const metadata: Metadata = {
  title: "Build your pair",
  description: "Colour every zone of a Red Crown runner, from the knit upper to the laces, and see it update live in 3D.",
};

export default function CustomizePage() {
  return (
    <div className="shell page-bottom lg:page-top">
      <Customizer />
    </div>
  );
}
