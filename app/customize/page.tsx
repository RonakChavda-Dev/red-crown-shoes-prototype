import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Customizer } from "@/components/customizer";

export const metadata: Metadata = pageMetadata({
  title: "Build your pair",
  description: "Colour every zone of a Red Crown runner, from the knit upper to the laces, and see it update live in 3D.",
  path: "/customize",
  image: "customize",
  imageAlt: "The Red Crown customizer: one runner shown in five colour builds",
});

export default function CustomizePage() {
  return (
    <div className="shell page-bottom lg:page-top">
      <Customizer />
    </div>
  );
}
