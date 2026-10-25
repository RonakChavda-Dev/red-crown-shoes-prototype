// Renders the social share cards in public/og and the apple-touch icon.
// Usage: node render-og.mjs <project-dir>
// Needs playwright-core + sharp (not app dependencies) and a local Chrome.
import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [project] = process.argv.slice(2);
if (!project) throw new Error("Usage: node render-og.mjs <project-dir>");
const data = await import(pathToFileURL(`${project}/data/products.ts`).href);
const out = `${project}/public/og`;
mkdirSync(out, { recursive: true });

const shoe = (name) => `data:image/webp;base64,${readFileSync(`${project}/public/images/shoes/${name}.webp`).toString("base64")}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const X_MARK = (size, ink = "#0B0B0D") => `
  <svg width="${size}" height="${size}" viewBox="0 0 32 32">
    <path d="M6 6 26 26" stroke="#FF2638" stroke-width="5.5" stroke-linecap="square"/>
    <path d="M26 6 6 26" stroke="${ink}" stroke-width="9"/>
    <path d="M26 6 6 26" stroke="#FF2638" stroke-width="5.5" stroke-linecap="square"/>
  </svg>`;

const CSS = `
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; background: #0B0B0D; overflow: hidden; }
  body { position: relative; color: #F4F2F0; font-family: Geist, system-ui, sans-serif; }
  .glow { position: absolute; right: -60px; bottom: -40px; width: 860px; height: 520px;
    background: radial-gradient(50% 46% at 55% 62%, rgb(255 38 56 / .34), rgb(255 38 56 / .08) 55%, transparent 75%); }
  .vignette { position: absolute; inset: 0; background: radial-gradient(70% 90% at 30% 40%, #17171b 0%, transparent 70%); }
  .brand { position: absolute; left: 64px; top: 56px; display: flex; align-items: center; gap: 14px;
    font-family: Anton, Impact, sans-serif; font-size: 34px; letter-spacing: .06em; text-transform: uppercase; line-height: 1; }
  .eyebrow { font-family: "Geist Mono", ui-monospace, monospace; font-size: 17px; letter-spacing: .18em; text-transform: uppercase; color: #9b9792; }
  .eyebrow b { color: #FF2638; font-weight: 400; }
  .copy { position: absolute; z-index: 1; left: 64px; top: 168px; width: 520px; }
  h1 { margin-top: 22px; font-family: Anton, Impact, sans-serif; font-weight: 400; text-transform: uppercase;
    line-height: .9; letter-spacing: .005em; }
  h1 .red { color: #FF2638; }
  .lede { margin-top: 24px; font-size: 24px; line-height: 1.4; color: #b9b5b0; max-width: 470px; }
  .shoe { position: absolute; right: 8px; top: 110px; width: 650px; filter: drop-shadow(0 30px 40px rgb(0 0 0 / .55)); }
  .foot { position: absolute; left: 64px; right: 64px; bottom: 44px; display: flex; justify-content: space-between;
    padding-top: 18px; border-top: 1px solid #27272b; }
  .dots { display: flex; gap: 10px; margin-top: 30px; }
  .dot { width: 34px; height: 34px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgb(255 255 255 / .18); }
`;

const page = (body) => `<!doctype html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Geist:wght@400;500&family=Geist+Mono&display=block" rel="stylesheet">
  <style>${CSS}</style></head><body>
  <div class="vignette"></div><div class="glow"></div>
  <div class="brand">${X_MARK(38)}<span>Red Crown</span></div>
  ${body}
  </body></html>`;

const foot = (left, right) =>
  `<div class="foot"><span class="eyebrow">${left}</span><span class="eyebrow">${right}</span></div>`;

const cards = [
  {
    name: "default",
    html: page(`
      <div class="copy">
        <p class="eyebrow"><b>Concept footwear</b> · Season 01</p>
        <h1 style="font-size:118px">Move<br>like you<br><span class="red">own it.</span></h1>
      </div>
      <img class="shoe" src="${shoe("strand-signal-bone")}">
      ${foot("Interactive 3D · Live customizer", "A design prototype")}`),
  },
  {
    name: "customize",
    html: page(`
      <div class="copy">
        <p class="eyebrow"><b>Build your pair</b> · 5 zones</p>
        <h1 style="font-size:96px">Your pair.<br><span class="red">Your rules.</span></h1>
        <div class="dots">${data.PRESETS.map((p) => `<span class="dot" style="background:linear-gradient(135deg,${p.colors.upper} 50%,${p.colors.accent} 50%)"></span>`).join("")}</div>
      </div>
      <img class="shoe" src="${shoe("preset-field")}">
      ${foot("Colour every zone in live 3D", "A design prototype")}`),
  },
  ...data.PRODUCTS.map((product) => {
    const colorway = product.colorways[0];
    const size = product.name.length > 6 ? 116 : 150;
    return {
      name: `product-${product.slug}`,
      html: page(`
        <div class="copy">
          <p class="eyebrow"><b>${esc(product.code)}</b> · ${esc(product.category)}</p>
          <h1 style="font-size:${size}px">${esc(product.name)}</h1>
          <p class="lede">${esc(product.tagline)}</p>
        </div>
        <img class="shoe" src="${shoe(`${product.slug}-${colorway.id}`)}">
        ${foot(esc(colorway.name), `${product.colorways.length} colourways · Concept shoe`)}`),
    };
  }),
];

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of cards) {
  await tab.setContent(card.html, { waitUntil: "networkidle" });
  await tab.evaluate(() => document.fonts.ready);
  const png = await tab.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(`${out}/${card.name}.jpg`);
  console.log("rendered", card.name);
}

// Apple touch icon: the X mark on ink, 180×180.
await tab.setViewportSize({ width: 180, height: 180 });
await tab.setContent(`<body style="margin:0;width:180px;height:180px;background:#080808;display:grid;place-items:center">${X_MARK(120, "#080808")}</body>`);
await tab.screenshot({ path: `${project}/app/apple-icon.png` });
console.log("rendered apple-icon");
await browser.close();
