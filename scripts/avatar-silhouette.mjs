// Traces the head-and-shoulders silhouette out of the avatar photo and writes
// it as an SVG, shown in the frame while the photo loads so the photo fades
// in "into place". Rerun when src/assets/Profile.webp changes:
//
//   node scripts/avatar-silhouette.mjs
//
// hero.spec.ts checks the silhouette still lines up with the photo.
import fs from "node:fs";
import sharp from "sharp";

const SRC = "src/assets/Profile.webp";
const OUT = "src/assets/profile-silhouette.svg";
const N = 220; // trace resolution; the SVG scales to any size
const THRESHOLD = 22; // colour distance from the backdrop that counts as person
const FILL = "#a6a39e"; // a few shades darker than the backdrop's #b8b5b0

const { data } = await sharp(SRC).removeAlpha().resize(N, N, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => [0, 1, 2].map((i) => data[(y * N + x) * 3 + i]);

// The backdrop runs from the left edge's grey to the right edge's.
const edge = (x) => {
  const rows = [2, 10, 20, 40, 60];
  return [0, 1, 2].map((i) => rows.reduce((s, y) => s + px(x, y)[i], 0) / rows.length);
};
const [L, R] = [edge(2), edge(N - 3)];
const isPerson = (x, y) => {
  const bg = L.map((l, i) => l + ((R[i] - l) * x) / (N - 1));
  const c = px(x, y);
  return Math.hypot(c[0] - bg[0], c[1] - bg[1], c[2] - bg[2]) > THRESHOLD;
};

// Each row's span: leftmost to rightmost run of at least 3 person pixels,
// which ignores specks of noise in the backdrop.
const spans = [];
for (let y = 0; y < N; y++) {
  let left = null, right = null, run = 0;
  for (let x = 0; x < N; x++) {
    run = isPerson(x, y) ? run + 1 : 0;
    if (run === 3) {
      left ??= x - 2;
      right = x;
    } else if (run > 3) right = x;
  }
  spans.push(left === null ? null : [left, right]);
}

// Start at the top of the hair: the first row of a sustained, real span.
const top = spans.findIndex((s, y) => [0, 1, 2].every((k) => spans[y + k] && spans[y + k][1] - spans[y + k][0] > 6));
const rows = spans.slice(top).map((s, i, all) => s ?? all[i - 1]);

// Smooth each edge: a running median so hair wisps don't spike it, then a
// short running mean so the stair-steps of the pixel grid become curves.
const median = (a) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)];
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const window = (a, i, r) => a.slice(Math.max(0, i - r), i + r + 1);
const smooth = (k) => {
  const medians = rows.map((_, i) => median(window(rows, i, 2).map((s) => s[k])));
  return medians.map((_, i) => mean(window(medians, i, 3)));
};
const [lefts, rights] = [smooth(0), smooth(1)];

const pt = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const points = [
  ...lefts.map((x, i) => pt(x, top + i)),
  pt(lefts.at(-1), N),
  pt(rights.at(-1) + 1, N),
  ...rights.map((x, i) => pt(x + 1, top + i)).reverse(),
];
const svg = `<svg data-silhouette="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" preserveAspectRatio="none" aria-hidden="true"><path fill="${FILL}" d="M${points.join("L")}Z"/></svg>\n`;
fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT}: ${points.length} points, top of head at ${((100 * top) / N).toFixed(1)}%`);
