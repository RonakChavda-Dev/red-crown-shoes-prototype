"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ZONES, type Build, type ShoeColors, type Zone } from "@/data/products";
import { buildShoeGeometry, SHOE_LENGTH } from "./geometry";
import type { Rig } from "./rig";

export interface ShoeCanvasProps {
  colors: ShoeColors;
  build: Build;
  rig: Rig;
  reducedMotion: boolean;
  /** Briefly light up a zone after it changes. */
  pulse?: { zone: Zone; key: number } | null;
  /** How much of the frame the shoe fills (1 = edge to edge). */
  fill?: number;
  onReady: () => void;
  onError: () => void;
}

function makeKnitTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const offset = (y / 4) % 2 === 0 ? 0 : 2;
      ctx.fillStyle = "#b4b4b4";
      ctx.fillRect(x + offset, y, 2, 3);
      ctx.fillStyle = "#5a5a5a";
      ctx.fillRect(x + offset + 2, y + 1, 1, 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeShadowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.85)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.45)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMaterials() {
  const knit = makeKnitTexture();
  const fabric = (repeat: [number, number]) => {
    const map = knit.clone();
    map.repeat.set(...repeat);
    map.needsUpdate = true;
    return map;
  };
  const upperBump = fabric([46, 10]);
  const materials = {
    upper: new THREE.MeshPhysicalMaterial({
      roughness: 0.82,
      sheen: 0.6,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color("#5a5a5a"),
      bumpMap: upperBump,
      bumpScale: 1.4,
    }),
    shade: new THREE.MeshPhysicalMaterial({
      roughness: 0.7,
      sheen: 0.4,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color("#3a3a3a"),
      side: THREE.DoubleSide,
    }),
    lining: new THREE.MeshStandardMaterial({ color: "#121215", roughness: 1, side: THREE.BackSide }),
    accent: new THREE.MeshPhysicalMaterial({ roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    midsole: new THREE.MeshStandardMaterial({ roughness: 0.58 }),
    outsole: new THREE.MeshStandardMaterial({ roughness: 0.86 }),
    laces: new THREE.MeshStandardMaterial({ roughness: 0.75 }),
    hardware: new THREE.MeshStandardMaterial({ color: "#121214", metalness: 0.7, roughness: 0.32 }),
    insole: new THREE.MeshStandardMaterial({ color: "#161618", roughness: 1 }),
  };
  return {
    ...materials,
    dispose() {
      knit.dispose();
      upperBump.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    },
  };
}

const ZONE_MATERIAL: Record<Zone, "upper" | "accent" | "midsole" | "outsole" | "laces"> = {
  upper: "upper",
  accent: "accent",
  midsole: "midsole",
  outsole: "outsole",
  laces: "laces",
};

type Materials = ReturnType<typeof createMaterials>;

/** Per-frame update, kept outside React: no state, only three.js objects. */
function animateFrame(
  rig: Rig,
  parts: {
    pitch: THREE.Group | null;
    yaw: THREE.Group | null;
    float: THREE.Group | null;
    shadow: THREE.Mesh | null;
    shadowMaterial: THREE.MeshBasicMaterial | null;
  },
  materials: Materials,
  targets: Record<Zone, THREE.Color>,
  pulse: { current: { zone: Zone; amount: number } | null },
  dt: number,
  time: number,
  reducedMotion: boolean,
) {
  if (!parts.pitch || !parts.yaw || !parts.float) return false;
  let moving = rig.step(dt, time, reducedMotion);

  parts.yaw.rotation.y = rig.yaw;
  parts.pitch.rotation.x = rig.pitch;
  parts.float.position.y = rig.bob - rig.lift * 0.35 + 0.04;
  parts.float.rotation.z = rig.bob ? Math.sin(time * 0.9) * 0.015 : 0;

  if (parts.shadow && parts.shadowMaterial) {
    parts.shadow.rotation.z = rig.yaw;
    const tilt = Math.min(1, Math.abs(rig.pitch) * 0.9);
    parts.shadowMaterial.opacity = 0.9 * (1 - tilt * 0.65) * (1 - Math.max(0, rig.bob) * 4) * (1 - rig.lift);
  }

  const colorEase = reducedMotion ? 1 : 1 - Math.exp(-dt * 9);
  for (const zone of ZONES) {
    const material = materials[ZONE_MATERIAL[zone]];
    const target = targets[zone];
    if (material.color.equals(target)) continue;
    material.color.lerp(target, colorEase);
    const diff =
      Math.abs(material.color.r - target.r) + Math.abs(material.color.g - target.g) + Math.abs(material.color.b - target.b);
    if (diff < 0.002) material.color.copy(target);
    else moving = true;
  }
  materials.shade.color.copy(materials.upper.color).multiplyScalar(0.78);

  for (const zone of ZONES) materials[ZONE_MATERIAL[zone]].emissive.setRGB(0, 0, 0);
  const p = pulse.current;
  if (p && p.amount > 0) {
    p.amount = Math.max(0, p.amount - dt * 1.6);
    materials[ZONE_MATERIAL[p.zone]].emissive.setRGB(0.55 * p.amount, 0.03 * p.amount, 0.05 * p.amount);
    moving = true;
  }
  return moving;
}

function setTargets(targets: Record<Zone, THREE.Color>, colors: ShoeColors, materials: Materials, snap: boolean) {
  for (const zone of ZONES) targets[zone].set(colors[zone]);
  if (!snap) return;
  for (const zone of ZONES) materials[ZONE_MATERIAL[zone]].color.copy(targets[zone]);
  materials.shade.color.copy(targets.upper).multiplyScalar(0.78);
}

function frameCamera(camera: THREE.Camera, width: number, height: number, shoeHeight: number, fill: number) {
  const perspective = camera as THREE.PerspectiveCamera;
  const tan = Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2));
  const aspect = width / Math.max(1, height);
  const halfWidth = SHOE_LENGTH / 2 / fill;
  const halfHeight = (shoeHeight / 2 + 0.25) / fill;
  const distance = Math.max(halfWidth / (tan * aspect), halfHeight / tan) + 1;
  perspective.position.set(0, distance * 0.16, distance);
  perspective.lookAt(0, -0.05, 0);
  perspective.updateProjectionMatrix();
}

function applyEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.42;
  return () => {
    scene.environment = null;
    env.dispose();
    pmrem.dispose();
    room.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
  };
}

function setupRenderer(gl: THREE.WebGLRenderer, rig: Rig, invalidate: () => void, onError: () => void) {
  gl.toneMapping = THREE.NeutralToneMapping;
  gl.toneMappingExposure = 0.95;
  rig.connect(invalidate);
  gl.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    onError();
  });
}

function Shoe({ colors, build, rig, reducedMotion, pulse, onReady, fill = 0.92 }: Omit<ShoeCanvasProps, "onError">) {
  const geometry = useMemo(() => buildShoeGeometry(build), [build]);
  // Centre the shoe vertically so low and high builds frame the same way.
  const height = useMemo(() => {
    geometry.upper.computeBoundingBox();
    return geometry.upper.boundingBox!.max.y;
  }, [geometry]);
  const ground = -height / 2 - 0.04;
  const materials = useMemo(() => createMaterials(), []);
  const shadowTexture = useMemo(() => makeShadowTexture(), []);
  const targets = useMemo(() => Object.fromEntries(ZONES.map((zone) => [zone, new THREE.Color()])) as Record<Zone, THREE.Color>, []);
  const pitchGroup = useRef<THREE.Group>(null);
  const yawGroup = useRef<THREE.Group>(null);
  const floatGroup = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const shadowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const pulseState = useRef<{ zone: Zone; amount: number } | null>(null);
  const firstColors = useRef(true);
  const readySent = useRef(false);
  const { camera, size, invalidate } = useThree();

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => {
    materials.dispose();
    shadowTexture.dispose();
  }, [materials, shadowTexture]);

  // Frame the shoe for any aspect ratio.
  useEffect(() => {
    frameCamera(camera, size.width, size.height, height, fill);
    invalidate();
  }, [camera, size, fill, height, invalidate]);

  // New colours: ease towards them (or snap on first paint / reduced motion).
  useEffect(() => {
    setTargets(targets, colors, materials, firstColors.current || reducedMotion);
    firstColors.current = false;
    invalidate();
  }, [colors, targets, materials, reducedMotion, invalidate]);

  useEffect(() => {
    if (!pulse) return;
    pulseState.current = { zone: pulse.zone, amount: reducedMotion ? 0 : 1 };
    invalidate();
  }, [pulse, reducedMotion, invalidate]);

  useFrame((state, delta) => {
    const parts = {
      pitch: pitchGroup.current,
      yaw: yawGroup.current,
      float: floatGroup.current,
      shadow: shadow.current,
      shadowMaterial: shadowMaterial.current,
    };
    const moving = animateFrame(rig, parts, materials, targets, pulseState, Math.min(delta, 0.05), state.clock.elapsedTime, reducedMotion);
    if (moving) state.invalidate();
    if (!readySent.current) {
      readySent.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <>
      <mesh ref={shadow} position={[0, ground - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[3.9, 1.5]} />
        <meshBasicMaterial ref={shadowMaterial} map={shadowTexture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={pitchGroup}>
        <group ref={yawGroup}>
          <group ref={floatGroup}>
            <group position={[0, ground, 0]}>
              <mesh geometry={geometry.upper} material={materials.upper} />
              <mesh geometry={geometry.lining} material={materials.lining} />
              <mesh geometry={geometry.shade} material={materials.shade} />
              <mesh geometry={geometry.accent} material={materials.accent} />
              <mesh geometry={geometry.midsole} material={materials.midsole} />
              <mesh geometry={geometry.outsole} material={materials.outsole} />
              <mesh geometry={geometry.laces} material={materials.laces} />
              <mesh geometry={geometry.hardware} material={materials.hardware} />
              <mesh geometry={geometry.insole} material={materials.insole} />
            </group>
          </group>
        </group>
      </group>
    </>
  );
}

function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => applyEnvironment(gl, scene), [gl, scene]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 5]} intensity={2.3} />
      <directionalLight position={[0, -2, 5]} intensity={0.45} />
      <directionalLight position={[-5, 2.5, -4]} intensity={3.2} color="#ff2638" />
      <pointLight position={[3, 0.3, -2]} intensity={9} distance={8} decay={2} color="#ff3344" />
    </>
  );
}

export default function ShoeCanvas({ onError, ...props }: ShoeCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ fov: 28, near: 0.1, far: 60, position: [0, 1.4, 9] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl, invalidate }) => setupRenderer(gl, props.rig, invalidate, onError)}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Studio />
      <Shoe {...props} />
    </Canvas>
  );
}
