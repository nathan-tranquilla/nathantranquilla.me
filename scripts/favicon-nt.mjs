// Renders the NT mark (src/assets/nt-mark.ts) to the favicon PNGs in src/assets/:
// paper lines on an ink navy tile. Run after changing the mark: `node scripts/favicon-nt.mjs`
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const src = readFileSync(new URL("../src/assets/nt-mark.ts", import.meta.url), "utf8");
const pick = (name) => JSON.parse(src.match(new RegExp(`${name} = (\\[[^\\]]*\\])`))[1]);
const color = (key) => src.match(new RegExp(`${key}: "([^"]+)"`))[1];
const paths = pick("PATHS");
const gaps = pick("GAP_PATHS");
const passes = [
  [15, "#fff", paths],
  [9, "#000", gaps],
  [3, "#fff", paths],
];
const strokes = passes
  .flatMap(([w, ink, ds]) =>
    ds.map((d) => `<path d="${d}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round" fill="none"/>`)
  )
  .join("");

// The tile is 106 units with the lines centred in it (see FAVICON.viewBox).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106 106">
  <rect x="-20" y="-20" width="146" height="146" fill="${color("tile")}"/>
  <mask id="m" maskUnits="userSpaceOnUse" x="-20" y="-20" width="146" height="146">${strokes}</mask>
  <rect x="-20" y="-20" width="146" height="146" fill="${color("lines")}" mask="url(#m)"/>
</svg>`.replace('viewBox="0 0 106 106"', `viewBox="${color("viewBox")}"`);

const browser = await chromium.launch();
const page = await browser.newPage();
for (const px of [16, 32, 48, 96, 180, 192, 256, 512]) {
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${px}px;height:${px}px}</style>${svg}`
  );
  writeFileSync(
    new URL(`../src/assets/favicon-nt-${px}.png`, import.meta.url),
    await page.locator("svg").screenshot()
  );
}
await browser.close();
console.log("wrote favicon-nt-{16,32,48,96,180,192,256,512}.png");
