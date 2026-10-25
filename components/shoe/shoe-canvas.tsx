"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, use, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ZONES, type Finish, type ShoeColors, type Zone } from "@/data/products";
import { createShoeMaterial, loadShoeAssets, SHOE_LENGTH, type ShoeMaterial } from "./shoe-assets";
import type { Rig } from "./rig";

export interface ShoeCanvasProps {
  colors: ShoeColors;
  rig: Rig;
  reducedMotion: boolean;
  /** Briefly light up a zone after it changes. */
  pulse?: { zone: Zone; key: number } | null;
  /** How much of the frame the shoe fills (1 = edge to edge). */
  fill?: number;
  /** Surface of the upper. */
  finish?: Finish;
  onReady: () => void;
  onError: () => void;
}

/*
 * Drop two known, harmless three.js messages and forward everything else:
 * R3F still creates a THREE.Clock internally (deprecated in r183), and the
 * Direct3D shader compiler behind ANGLE on Windows reports precision notes
 * (warning X4122) for three's own environment-map shaders.
 */
const isBenignShaderLog = (log: unknown) =>
  typeof log === "string" &&
  log
    .split("\n")
    .filter((line) => line.trim())
    .every((line) => /warning X\d+:/.test(line));

THREE.setConsoleFunction((type: "log" | "warn" | "error", message: string, ...params: unknown[]) => {
  if (message.startsWith("THREE.Clock: This module has been deprecated")) return;
  if (type === "warn" && message.startsWith("THREE.WebGLProgram: Program Info Log") && isBenignShaderLog(params[0])) return;
  const trace = params[0] as { isStackTrace?: boolean; getError?: (m: string) => Error } | undefined;
  if (trace?.isStackTrace && trace.getError) console[type](trace.getError(message));
  else console[type](message, ...params);
});

function makeShadowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.9)");
  gradient.addColorStop(0.35, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

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
  shoe: ShoeMaterial,
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
    const color = shoe.colors[zone];
    const target = targets[zone];
    if (color.equals(target)) continue;
    color.lerp(target, colorEase);
    const diff = Math.abs(color.r - target.r) + Math.abs(color.g - target.g) + Math.abs(color.b - target.b);
    if (diff < 0.002) color.copy(target);
    else moving = true;
  }

  const p = pulse.current;
  if (p && p.amount > 0) {
    p.amount = Math.max(0, p.amount - dt * 1.6);
    shoe.setPulse(p.zone, p.amount * 0.6);
    moving = true;
  } else {
    shoe.setPulse(null, 0);
  }
  return moving;
}

function setTargets(targets: Record<Zone, THREE.Color>, colors: ShoeColors, shoe: ShoeMaterial, snap: boolean) {
  for (const zone of ZONES) {
    targets[zone].set(colors[zone]);
    if (snap) shoe.colors[zone].copy(targets[zone]);
  }
}

function frameCamera(camera: THREE.Camera, width: number, height: number, shoeHeight: number, fill: number) {
  const perspective = camera as THREE.PerspectiveCamera;
  const tan = Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2));
  const aspect = width / Math.max(1, height);
  const halfWidth = (SHOE_LENGTH + 0.1) / 2 / fill;
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
  scene.environmentIntensity = 0.7;
  return () => {
    scene.environment = null;
    env.dispose();
    pmrem.dispose();
    room.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
  };
}

function setupRenderer(
  gl: THREE.WebGLRenderer,
  rig: Rig,
  invalidate: () => void,
  onError: () => void,
  live: { current: boolean },
) {
  gl.toneMapping = THREE.NeutralToneMapping;
  gl.toneMappingExposure = 1;
  rig.connect(invalidate);
  gl.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    // R3F forces a context loss when it tears the renderer down; only a loss
    // while this canvas is still meant to be on screen is a real failure.
    if (live.current) onError();
  });
}

function Shoe({ colors, rig, reducedMotion, pulse, onReady, fill = 0.92, finish = "knit" }: Omit<ShoeCanvasProps, "onError">) {
  const assets = use(loadShoeAssets());
  const shoe = useMemo(() => createShoeMaterial(assets.maps), [assets]);
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
  const height = assets.height;
  const ground = -height / 2 - 0.04;

  useEffect(
    () => () => {
      shoe.dispose();
      shadowTexture.dispose();
    },
    [shoe, shadowTexture],
  );

  useEffect(() => {
    frameCamera(camera, size.width, size.height, height, fill);
    invalidate();
  }, [camera, size, fill, height, invalidate]);

  // New colours: ease towards them (or snap on first paint / reduced motion).
  useEffect(() => {
    setTargets(targets, colors, shoe, firstColors.current || reducedMotion);
    firstColors.current = false;
    invalidate();
  }, [colors, targets, shoe, reducedMotion, invalidate]);

  useEffect(() => {
    shoe.setFinish(finish);
    invalidate();
  }, [finish, shoe, invalidate]);

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
    const moving = animateFrame(rig, parts, shoe, targets, pulseState, Math.min(delta, 0.05), state.clock.elapsedTime, reducedMotion);
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
            <mesh geometry={assets.geometry} material={shoe.material} position={[0, ground, 0]} />
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
      <hemisphereLight args={["#f4f2f0", "#1a0a0c", 0.4]} />
      <directionalLight position={[2.5, 6, 4.5]} intensity={2.1} />
      <directionalLight position={[-3.5, 3, 3]} intensity={0.6} color="#dfe6ff" />
      <directionalLight position={[-5, 2.5, -4]} intensity={2.4} color="#ff2638" />
      <pointLight position={[3, 0.3, -2]} intensity={6} distance={8} decay={2} color="#ff3344" />
    </>
  );
}

export default function ShoeCanvas({ onError, ...props }: ShoeCanvasProps) {
  const live = useRef(false);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ fov: 28, near: 0.1, far: 60, position: [0, 1.4, 9] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl, invalidate }) => setupRenderer(gl, props.rig, invalidate, onError, live)}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Studio />
      <Suspense fallback={null}>
        <Shoe {...props} />
      </Suspense>
    </Canvas>
  );
}
