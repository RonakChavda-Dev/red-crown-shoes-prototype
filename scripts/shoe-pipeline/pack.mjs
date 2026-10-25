// Geometry-only, meshopt-compressed GLB + WebP textures for the site.
// Usage: node pack.mjs <src.glb> <textures-dir> <public/models dir>
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { prune, dedup, weld, quantize, reorder } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const [src, texDir, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
await MeshoptEncoder.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(src);
const root = doc.getRoot();

// Strip the sample's baked colourways, variants and all textures: the site
// recolours the shoe itself from the zone masks.
root.listExtensionsUsed().filter((e) => e.extensionName === "KHR_materials_variants").forEach((e) => e.dispose());
const keep = root.listMaterials()[0];
keep.setName("shoe").setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null);
root.listMaterials().slice(1).forEach((m) => m.dispose());
for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) p.setMaterial(keep);
root.listTextures().forEach((t) => t.dispose());

await doc.transform(dedup(), prune({ keepAttributes: true }), weld(), reorder({ encoder: MeshoptEncoder }), quantize({ pattern: /^(POSITION|NORMAL)$/ }));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await io.write(`${outDir}/shoe.glb`, doc);

const jobs = [
  ["normal.jpg", "shoe-normal.webp", { quality: 90 }, 2048],
  ["detail.jpg", "shoe-detail.webp", { quality: 88 }, 2048],
  ["orm.jpg", "shoe-orm.webp", { quality: 85 }, 1024],
  ["zones-a.png", "shoe-zones-a.webp", { lossless: true }, 1024],
  ["zones-b.png", "shoe-zones-b.webp", { lossless: true }, 1024],
];
for (const [from, to, opts, size] of jobs) {
  await sharp(`${texDir}/${from}`).resize(size, size).webp(opts).toFile(`${outDir}/${to}`);
}
console.log("done");
