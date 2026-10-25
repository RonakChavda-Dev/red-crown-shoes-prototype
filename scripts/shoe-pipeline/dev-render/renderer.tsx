"use client";
import { useState } from "react";
import ShoeCanvas from "@/components/shoe/shoe-canvas";
import { Rig } from "@/components/shoe/rig";
import { parseColors } from "@/data/products";

export default function Renderer() {
  const [setup] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const rig = new Rig();
    rig.setView(Number(params.get("yaw") ?? -0.38), Number(params.get("pitch") ?? 0.1));
    rig.setActive(false);
    return { rig, colors: parseColors(JSON.parse(params.get("c") ?? "{}"))! };
  });
  const [ready, setReady] = useState(false);
  return (
    <div id="shot" data-ready={ready} style={{ width: 1600, height: 1000, position: "fixed", left: 0, top: 0, zIndex: 999 }}>
      <ShoeCanvas colors={setup.colors} rig={setup.rig} reducedMotion fill={0.94} onReady={() => setTimeout(() => setReady(true), 800)} onError={() => {}} />
    </div>
  );
}
