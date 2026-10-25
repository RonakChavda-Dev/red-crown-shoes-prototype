import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Finish, Zone } from "@/data/products";

/**
 * The realistic shoe: geometry from /public/models/shoe.glb plus texture maps.
 * Colour is not baked in. Zone masks (zones-a: upper/accent/laces,
 * zones-b: midsole/outsole/lining) let a small shader tint each zone while
 * the detail map keeps the scanned shading, knit holes and stitching.
 *
 * Model: "Materials Variants Shoe" © 2021 Shopify, CC BY 4.0, modified
 * (colourways removed, marks painted out, recoloured by zone).
 */

const BASE = "/models";
export const SHOE_LENGTH = 3.2;
/** The lining is the upper's colour in shadow, so the inside matches the outside. */
const LINING_SHADE = 0.82;

export interface ShoeAssets {
  geometry: THREE.BufferGeometry;
  height: number;
  maps: Record<"normal" | "orm" | "detail" | "zonesA" | "zonesB", THREE.Texture>;
}

let pending: Promise<ShoeAssets> | null = null;

function loadTexture(loader: THREE.TextureLoader, file: string, srgb = false) {
  return loader.loadAsync(`${BASE}/${file}`).then((texture) => {
    texture.flipY = false;
    texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = 8;
    return texture;
  });
}

/**
 * The GLB stores quantized (normalized integer) attributes to stay small.
 * Expand them to floats so transforms can be baked into the geometry.
 */
function dequantize(source: THREE.BufferGeometry) {
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(source.getIndex());
  for (const [name, attribute] of Object.entries(source.attributes)) {
    const { count, itemSize } = attribute;
    const array = new Float32Array(count * itemSize);
    for (let i = 0; i < count; i++) {
      for (let c = 0; c < itemSize; c++) array[i * itemSize + c] = attribute.getComponent(i, c);
    }
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
  }
  return geometry;
}

/** Loaded once per page and shared by every 3D view. */
export function loadShoeAssets(): Promise<ShoeAssets> {
  if (pending) return pending;
  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const textures = new THREE.TextureLoader();
  pending = Promise.all([
    gltfLoader.loadAsync(`${BASE}/shoe.glb`),
    loadTexture(textures, "shoe-normal.webp"),
    loadTexture(textures, "shoe-orm.webp"),
    loadTexture(textures, "shoe-detail.webp"),
    loadTexture(textures, "shoe-zones-a.webp"),
    loadTexture(textures, "shoe-zones-b.webp"),
  ]).then(([gltf, normal, orm, detail, zonesA, zonesB]) => {
    let source: THREE.Mesh | null = null;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((object) => {
      if (!source && object instanceof THREE.Mesh) source = object;
    });
    if (!source) throw new Error("Shoe model has no mesh");
    const mesh = source as THREE.Mesh;
    // Bake transforms, then scale to a known length, centred, sole on y = 0.
    const geometry = dequantize(mesh.geometry).applyMatrix4(mesh.matrixWorld);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const scale = SHOE_LENGTH / (box.max.x - box.min.x);
    geometry.translate(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    geometry.scale(scale, scale, scale);
    geometry.computeBoundingBox();
    return { geometry, height: geometry.boundingBox!.max.y, maps: { normal, orm, detail, zonesA, zonesB } };
  });
  pending.catch(() => {
    pending = null;
  });
  return pending;
}

/* ── Finish: how the upper's surface responds to light ── */
const FINISH: Record<Finish, { rough: number; flat: number; detail: number; sheen: number }> = {
  knit: { rough: -1, flat: 0, detail: 1, sheen: 0.12 },
  suede: { rough: 0.97, flat: 0.75, detail: 0.35, sheen: 0.55 },
  leather: { rough: 0.38, flat: 0.88, detail: 0.22, sheen: 0 },
};

const ZONE_INDEX: Record<Zone, number> = { upper: 0, accent: 1, laces: 2, midsole: 3, outsole: 4 };

export interface ShoeMaterial {
  material: THREE.MeshPhysicalMaterial;
  colors: Record<Zone, THREE.Color>;
  setFinish: (finish: Finish) => void;
  setPulse: (zone: Zone | null, amount: number) => void;
  dispose: () => void;
}

export function createShoeMaterial(maps: ShoeAssets["maps"]): ShoeMaterial {
  const colors = {
    upper: new THREE.Color(),
    accent: new THREE.Color(),
    laces: new THREE.Color(),
    midsole: new THREE.Color(),
    outsole: new THREE.Color(),
  } satisfies Record<Zone, THREE.Color>;
  const uniforms = {
    zonesA: { value: maps.zonesA },
    zonesB: { value: maps.zonesB },
    cUpper: { value: colors.upper },
    cAccent: { value: colors.accent },
    cLaces: { value: colors.laces },
    cMidsole: { value: colors.midsole },
    cOutsole: { value: colors.outsole },
    uLiningShade: { value: LINING_SHADE },
    uUpperRough: { value: -1 },
    uUpperFlat: { value: 0 },
    uUpperDetail: { value: 1 },
    uPulseA: { value: new THREE.Vector3() },
    uPulseB: { value: new THREE.Vector2() },
  };

  const material = new THREE.MeshPhysicalMaterial({
    map: maps.detail,
    normalMap: maps.normal,
    roughnessMap: maps.orm,
    metalnessMap: maps.orm,
    aoMap: maps.orm,
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 1,
    sheen: 0.12,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#6a6a6a"),
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D zonesA;
uniform sampler2D zonesB;
uniform vec3 cUpper, cAccent, cLaces, cMidsole, cOutsole;
uniform float uLiningShade;
uniform float uUpperRough, uUpperFlat, uUpperDetail;
uniform vec3 uPulseA;
uniform vec2 uPulseB;`,
      )
      .replace(
        "#include <map_fragment>",
        `vec4 za = texture2D( zonesA, vMapUv );
vec4 zb = texture2D( zonesB, vMapUv );
float zoneSum = max( za.r + za.g + za.b + zb.r + zb.g + zb.b, 1e-3 );
float upperMask = za.r / zoneSum;
vec3 tint = ( cUpper * za.r + cAccent * za.g + cLaces * za.b + cMidsole * zb.r + cOutsole * zb.g + cUpper * uLiningShade * zb.b ) / zoneSum;
float shade = texture2D( map, vMapUv ).r * 2.0;
shade = mix( 1.0, shade, mix( 1.0, uUpperDetail, upperMask ) );
diffuseColor.rgb *= tint * shade;`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
if ( uUpperRough >= 0.0 ) roughnessFactor = mix( roughnessFactor, uUpperRough, upperMask );
// Bonded tape reads as a satin film rather than wet plastic.
roughnessFactor = mix( roughnessFactor, max( roughnessFactor, 0.62 ), za.g / zoneSum );`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
normal = normalize( mix( normal, nonPerturbedNormal, uUpperFlat * upperMask ) );`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
float pulseMask = dot( za.rgb, uPulseA ) + dot( zb.rg, uPulseB );
totalEmissiveRadiance += vec3( 0.9, 0.04, 0.07 ) * pulseMask / zoneSum;`,
      );
  };

  return {
    material,
    colors,
    setFinish(finish) {
      const f = FINISH[finish];
      uniforms.uUpperRough.value = f.rough;
      uniforms.uUpperFlat.value = f.flat;
      uniforms.uUpperDetail.value = f.detail;
      material.sheen = f.sheen;
    },
    setPulse(zone, amount) {
      uniforms.uPulseA.value.set(0, 0, 0);
      uniforms.uPulseB.value.set(0, 0);
      if (!zone || amount <= 0) return;
      const i = ZONE_INDEX[zone];
      if (i < 3) uniforms.uPulseA.value.setComponent(i, amount);
      else uniforms.uPulseB.value.setComponent(i - 3, amount);
    },
    dispose: () => material.dispose(),
  };
}
