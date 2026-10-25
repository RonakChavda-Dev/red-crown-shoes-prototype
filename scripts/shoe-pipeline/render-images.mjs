// Renders still product imagery from the live 3D shoe (temporary /dev-render page).
// Usage: node render-images.mjs <project-dir> <base-url>
import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [project, base = "http://localhost:3000"] = process.argv.slice(2);
const data = await import(pathToFileURL(`${project}/data/products.ts`).href);
const out = `${project}/public/images/shoes`;
mkdirSync(out, { recursive: true });

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const jobs = [];
for (const p of data.PRODUCTS) for (const cw of p.colorways) jobs.push({ name: `${p.slug}-${cw.id}`, colors: cw.colors });
for (const preset of data.PRESETS) jobs.push({ name: `preset-${slug(preset.name)}`, colors: preset.colors });
const grey = "#34343A";
for (const zone of data.ZONES) {
  const colors = Object.fromEntries(data.ZONES.map((z) => [z, z === zone ? data.HERO_COLORS[z] : grey]));
  if (zone === "outsole") colors.outsole = "#FF2638";
  jobs.push({ name: `layer-${zone}`, colors, pitch: zone === "outsole" ? -0.55 : zone === "laces" ? 0.45 : 0.1 });
}

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
for (const job of jobs) {
  const q = new URLSearchParams({ c: JSON.stringify(job.colors), yaw: String(job.yaw ?? -0.38), pitch: String(job.pitch ?? 0.1) });
  await page.goto(`${base}/dev-render?${q}`, { waitUntil: "networkidle" });
  await page.waitForSelector('#shot[data-ready="true"]', { timeout: 60000 });
  await page.addStyleTag({ content: "html,body{background:transparent!important} header,footer,body>*:not(main){visibility:hidden!important} body::after{display:none!important} nextjs-portal{display:none!important} main *:not(#shot):not(#shot *){visibility:hidden} #shot,#shot *{visibility:visible}" });
  await page.waitForTimeout(200);
  const png = await page.locator("#shot").screenshot({ omitBackground: true });
  await sharp(png).trim({ threshold: 1 }).extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } }).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 90 }).toFile(`${out}/${job.name}.webp`);
  console.log("rendered", job.name);
}
await browser.close();
