"use client";
// TEMPORARY: renders still images of the 3D shoe for product imagery. Deleted after use.
import dynamic from "next/dynamic";

const Renderer = dynamic(() => import("./renderer"), { ssr: false });

export default function RenderPage() {
  return <Renderer />;
}
