# Shoe asset pipeline

How `public/models/*` and `public/images/shoes/*` were produced. Run only when the model or the catalogue colours change.

**Source:** [Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) © 2021 Shopify, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Download `MaterialsVariantsShoe.glb`.

Extra tools (not app dependencies): Python 3 with `numpy` and `Pillow`; Node packages `@gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp playwright-core`; a local Chrome.

1. **Extract textures** from the GLB's `images` array in order: `img0.jpg` (occlusion/roughness/metalness), `img1.jpg` (midnight), `img2.jpg` (normal), `img3.jpg` (beach), `img4.jpg` (street).
2. **Zone masks:** `python build_masks.py MaterialsVariantsShoe.glb <images-dir> <out-dir>`. Splits the mesh into connected parts (laces, tape bands, sole, lining…), rasterises them in UV space, combines that with colour differences between the sample's colourways, and writes the zone masks, a shading-detail map and the cleaned normal map (demo marks painted out).
3. **Pack:** `node pack.mjs MaterialsVariantsShoe.glb <out-dir> public/models`. Geometry-only, meshopt-compressed GLB plus WebP textures.
4. **Product imagery:** copy `dev-render/` to `app/dev-render/`, run `npm run dev`, then `node render-images.mjs <project-dir> http://localhost:3000`. Delete `app/dev-render/` afterwards.
