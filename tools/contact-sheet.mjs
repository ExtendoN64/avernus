/**
 * Renders a PNG contact sheet of a shortlist of themes, plus your current palette,
 * so you can compare at a glance before doing a full preview build.
 *
 *   node tools/contact-sheet.mjs   ->  tools/theme-contact-sheet.png
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const require = createRequire(join(repo, "package.json"));
const sharp = require("sharp");
const THEMES = join(repo, ".quartz", "plugins", "quartz-themes", "dist", "themes");

const SHORTLIST = [
  "its-theme.ttrpg-dnd",
  "its-theme.ttrpg-wotc",
  "its-theme.ttrpg-pathfinder",
  "dune",
  "darkember",
  "cinderpaper",
  "mulled-wine",
  "saint-red-paper",
  "blood-rush",
  "arcane",
  "kanagawa-paper",
];

/* your hand-tuned palette, from quartz.config.yaml */
const CURRENT = {
  name: "YOURS (current)",
  light: { bg: "#f6f2e9", bg2: "#e3dbcc", text: "#2a1f1a", muted: "#b0a08d", accent: "#8b2f22", link: "#8b2f22", heading: "#4a3f35" },
  dark:  { bg: "#17120f", bg2: "#3a2f28", text: "#f0e6d8", muted: "#6b5a4d", accent: "#d9603f", link: "#d9603f", heading: "#d8cfc4" },
};

function varMap(css) {
  const m = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi;
  let x;
  while ((x = re.exec(css))) if (!m.has(x[1].trim())) m.set(x[1].trim(), x[2].trim());
  return m;
}
function resolve(map, v, d = 0) {
  if (!v || d > 8) return null;
  v = v.trim();
  const vm = v.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)$/i);
  if (vm) {
    const t = map.get(vm[1]);
    if (t) return resolve(map, t, d + 1);
    return vm[2] ? resolve(map, vm[2], d + 1) : null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return v;
  if (/^(rgba?|hsla?)\(/i.test(v)) return v;
  if (/^[a-z]+$/i.test(v)) return v;
  return null;
}
const pick = (m, names) => names.map((n) => resolve(m, m.get(n))).find(Boolean) || null;

function load(name) {
  // meta.name uses dots (its-theme.ttrpg-dnd); the file on disk uses hyphens
  const file = name.replace(/\./g, "-") + ".json";
  const data = JSON.parse(readFileSync(join(THEMES, file), "utf8"));
  const out = { name, light: null, dark: null };
  for (const mode of ["light", "dark"]) {
    const b = data[mode];
    if (!b) continue;
    const css = typeof b === "string" ? b : Object.values(b).join("\n");
    const m = varMap(css);
    out[mode] = {
      bg: pick(m, ["--background-primary", "--color-base-00"]),
      bg2: pick(m, ["--background-secondary", "--color-base-10"]),
      text: pick(m, ["--text-normal", "--color-base-100"]),
      muted: pick(m, ["--text-muted", "--color-base-70"]),
      accent: pick(m, ["--interactive-accent", "--accent-1", "--text-accent"]),
      link: pick(m, ["--text-accent", "--interactive-accent"]),
      heading: pick(m, ["--h2-color", "--h1-color", "--text-normal"]),
    };
  }
  return out;
}

const entries = [CURRENT, ...SHORTLIST.map(load)];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const CW = 430, CH = 214, COLS = 3, PAD = 18, HEAD = 62;
const rows = Math.ceil(entries.length / COLS);
const W = PAD + COLS * (CW + PAD);
const H = HEAD + PAD + rows * (CH + PAD);

function half(p, x, y, w, h, label) {
  if (!p || !p.bg || !p.text) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#222" opacity="0.25"/>
    <text x="${x + w / 2}" y="${y + h / 2}" fill="#888" font-size="11" text-anchor="middle">no ${label}</text>`;
  }
  const t = (k, fb) => p[k] || fb;
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t("bg", "#000")}"/>
  <rect x="${x}" y="${y}" width="${w}" height="16" fill="${t("bg2", p.bg)}"/>
  <text x="${x + 7}" y="${y + 12}" fill="${t("muted", p.text)}" font-size="9" font-family="sans-serif">${label}</text>
  <text x="${x + 9}" y="${y + 39}" fill="${t("heading", p.text)}" font-size="15" font-family="Georgia,serif" font-weight="bold">The Vanished City</text>
  <rect x="${x + 9}" y="${y + 46}" width="${w - 18}" height="2.5" fill="${t("accent", p.text)}"/>
  <text x="${x + 9}" y="${y + 66}" fill="${t("text", "#fff")}" font-size="10.5" font-family="Georgia,serif">Elturel is gone. No rubble, no</text>
  <text x="${x + 9}" y="${y + 80}" fill="${t("text", "#fff")}" font-size="10.5" font-family="Georgia,serif">bodies, no explanation.</text>
  <text x="${x + 9}" y="${y + 96}" fill="${t("muted", p.text)}" font-size="9.5" font-family="Georgia,serif" font-style="italic">Updated after each session.</text>
  <text x="${x + 9}" y="${y + 112}" fill="${t("link", p.text)}" font-size="10.5" font-family="Georgia,serif">Ulder Ravengard</text>`;
}

let cards = "";
entries.forEach((e, i) => {
  const cx = PAD + (i % COLS) * (CW + PAD);
  const cy = HEAD + PAD + Math.floor(i / COLS) * (CH + PAD);
  const hw = (CW - 1) / 2;
  const isYours = e.name.startsWith("YOURS");
  cards += `
  <g>
    <text x="${cx}" y="${cy - 7}" fill="${isYours ? "#e8974f" : "#d8cfc4"}" font-size="13" font-family="sans-serif" font-weight="${isYours ? "bold" : "normal"}">${esc(e.name)}</text>
    ${half(e.dark, cx, cy, hw, CH - 24, "dark")}
    ${half(e.light, cx + hw + 1, cy, hw, CH - 24, "light")}
    <rect x="${cx}" y="${cy}" width="${CW}" height="${CH - 24}" fill="none" stroke="${isYours ? "#e8974f" : "#4a3f35"}" stroke-width="${isYours ? 2 : 1}"/>
  </g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#14110f"/>
<text x="${PAD}" y="30" fill="#f0e6d8" font-size="19" font-family="Georgia,serif" font-weight="bold">Theme shortlist &#8212; Ascent from Avernus</text>
<text x="${PAD}" y="48" fill="#8a7a6c" font-size="12" font-family="sans-serif">each card: dark mode left, light mode right. Your current palette is outlined in orange.</text>
${cards}
</svg>`;

writeFileSync(join(here, "theme-contact-sheet.svg"), svg);
await sharp(Buffer.from(svg), { density: 144 })
  .resize({ width: 1600 })
  .png()
  .toFile(join(here, "theme-contact-sheet.png"));
console.log(`rendered ${entries.length} themes -> tools/theme-contact-sheet.png`);
