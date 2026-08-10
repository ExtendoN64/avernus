/**
 * Renders the native palettes in tools/palettes.json side by side.
 *   node tools/palette-sheet.mjs  ->  tools/palette-sheet.png
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const sharp = createRequire(join(repo, "package.json"))("sharp");

const pal = JSON.parse(readFileSync(join(here, "palettes.json"), "utf8"));
const names = Object.keys(pal).filter((k) => k !== "_note");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const CW = 470, CH = 260, PAD = 20, HEAD = 66, COLS = 2;
const rows = Math.ceil(names.length / COLS);
const W = PAD + COLS * (CW + PAD);
const H = HEAD + PAD + rows * (CH + PAD);

/** one mode rendered as a miniature wiki page */
function pane(c, x, y, w, h, label, headerFont) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.light}"/>
  <rect x="${x}" y="${y}" width="${w}" height="18" fill="${c.lightgray}"/>
  <text x="${x + 8}" y="${y + 13}" fill="${c.gray}" font-size="9.5" font-family="sans-serif">${label}</text>
  <text x="${x + 10}" y="${y + 44}" fill="${c.dark}" font-size="16" font-family="${headerFont}" font-weight="bold">The Vanished City</text>
  <rect x="${x + 10}" y="${y + 52}" width="${w - 20}" height="2.5" fill="${c.secondary}"/>
  <text x="${x + 10}" y="${y + 74}" fill="${c.darkgray}" font-size="11" font-family="Georgia,serif">Elturel is gone. No rubble, no</text>
  <text x="${x + 10}" y="${y + 89}" fill="${c.darkgray}" font-size="11" font-family="Georgia,serif">bodies, no explanation.</text>
  <text x="${x + 10}" y="${y + 108}" fill="${c.gray}" font-size="10" font-family="Georgia,serif" font-style="italic">Updated after each session.</text>
  <text x="${x + 10}" y="${y + 128}" fill="${c.secondary}" font-size="11" font-family="Georgia,serif">Ulder Ravengard</text>
  <rect x="${x + 10}" y="${y + 140}" width="${w - 20}" height="30" fill="${c.highlight}" stroke="${c.lightgray}"/>
  <text x="${x + 17}" y="${y + 159}" fill="${c.tertiary}" font-size="10" font-family="sans-serif">callout / hover accent</text>
  <g>
    ${["light", "lightgray", "gray", "darkgray", "dark", "secondary", "tertiary"]
      .map((k, i) => `<rect x="${x + 10 + i * 20}" y="${y + h - 26}" width="17" height="17" fill="${c[k]}" stroke="${c.gray}" stroke-width="0.5"/>`)
      .join("")}
  </g>`;
}

let cards = "";
names.forEach((n, i) => {
  const p = pal[n];
  const cx = PAD + (i % COLS) * (CW + PAD);
  const cy = HEAD + PAD + Math.floor(i / COLS) * (CH + PAD);
  const hw = (CW - 1) / 2;
  const isCur = n === "avernus";
  const hf = p.typography.header === "Cinzel" ? "Georgia,serif" : "Georgia,serif";
  cards += `
  <g>
    <text x="${cx}" y="${cy - 20}" fill="${isCur ? "#e8974f" : "#f0e6d8"}" font-size="14" font-family="sans-serif" font-weight="bold">${esc(n)}${isCur ? "  (current)" : ""}</text>
    <text x="${cx}" y="${cy - 6}" fill="#8a7a6c" font-size="10.5" font-family="sans-serif">${esc(p.typography.header)} / ${esc(p.typography.body)}</text>
    ${pane(p.lightMode, cx, cy, hw, CH - 34, "light", hf)}
    ${pane(p.darkMode, cx + hw + 1, cy, hw, CH - 34, "dark", hf)}
    <rect x="${cx}" y="${cy}" width="${CW}" height="${CH - 34}" fill="none" stroke="${isCur ? "#e8974f" : "#4a3f35"}" stroke-width="${isCur ? 2 : 1}"/>
  </g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#14110f"/>
<text x="${PAD}" y="32" fill="#f0e6d8" font-size="20" font-family="Georgia,serif" font-weight="bold">Native palettes &#8212; no extra CSS</text>
<text x="${PAD}" y="52" fill="#8a7a6c" font-size="12" font-family="sans-serif">light mode left, dark mode right. Swatch row is the full Quartz variable set.</text>
${cards}
</svg>`;

writeFileSync(join(here, "palette-sheet.svg"), svg);
await sharp(Buffer.from(svg), { density: 144 }).resize({ width: 1500 }).png().toFile(join(here, "palette-sheet.png"));
console.log(`rendered ${names.length} palettes -> tools/palette-sheet.png`);
