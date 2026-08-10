/**
 * Builds a self-contained HTML gallery of every theme shipped by the
 * quartz-themes plugin, so you can shortlist without building the site 763 times.
 *
 *   node tools/build-theme-gallery.mjs
 *   -> tools/theme-gallery.html   (open it in a browser)
 *
 * Full-fidelity preview of a single theme is a different job: see preview-theme.ps1
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const THEMES = join(here, "..", ".quartz", "plugins", "quartz-themes", "dist", "themes");
const OUT = join(here, "theme-gallery.html");

/** pull `--name: value;` declarations out of a CSS blob */
function varMap(css) {
  const map = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi;
  let m;
  while ((m = re.exec(css))) {
    const k = m[1].trim();
    if (!map.has(k)) map.set(k, m[2].trim());
  }
  return map;
}

/** resolve var(--x, fallback) chains against the map */
function resolve(map, value, depth = 0) {
  if (!value || depth > 8) return null;
  let v = value.trim();
  const vm = v.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)$/i);
  if (vm) {
    const target = map.get(vm[1]);
    if (target) return resolve(map, target, depth + 1);
    if (vm[2]) return resolve(map, vm[2], depth + 1);
    return null;
  }
  // reject things we cannot paint as a flat swatch
  if (/^(color-mix|rgba?\(|hsla?\()/i.test(v)) return v;
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return v;
  if (/^[a-z]+$/i.test(v)) return v;
  return null;
}

function pick(map, names) {
  for (const n of names) {
    const r = resolve(map, map.get(n));
    if (r) return r;
  }
  return null;
}

const files = readdirSync(THEMES).filter((f) => f.endsWith(".json"));
const themes = [];

for (const f of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(THEMES, f), "utf8"));
  } catch {
    continue;
  }
  const meta = data.meta || {};
  const entry = {
    name: meta.name || f.replace(/\.json$/, ""),
    modes: meta.modes || [],
    variations: meta.variations || [],
    fonts: meta.fonts || [],
    palettes: {},
  };

  for (const mode of ["light", "dark"]) {
    const block = data[mode];
    if (!block) continue;
    const css = typeof block === "string" ? block : Object.values(block).join("\n");
    const map = varMap(css);
    const p = {
      bg: pick(map, ["--background-primary", "--color-base-00"]),
      bg2: pick(map, ["--background-secondary", "--color-base-10"]),
      text: pick(map, ["--text-normal", "--color-base-100"]),
      muted: pick(map, ["--text-muted", "--color-base-70"]),
      accent: pick(map, ["--interactive-accent", "--accent-1", "--text-accent"]),
      link: pick(map, ["--text-accent", "--link-color", "--interactive-accent"]),
      heading: pick(map, ["--h2-color", "--h1-color", "--text-title-h2", "--text-normal"]),
      border: pick(map, ["--background-modifier-border", "--color-base-30"]),
    };
    if (p.bg && p.text) entry.palettes[mode] = p;
  }

  if (Object.keys(entry.palettes).length) themes.push(entry);
}

themes.sort((a, b) => a.name.localeCompare(b.name));

const withBoth = themes.filter((t) => t.palettes.light && t.palettes.dark).length;
console.log(`themes parsed: ${themes.length} of ${files.length}`);
console.log(`  with both light+dark palettes: ${withBoth}`);
console.log(`  with variations: ${themes.filter((t) => t.variations.length).length}`);

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quartz theme gallery</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;background:#14110f;color:#e8e0d4}
header{position:sticky;top:0;z-index:10;background:#14110f;border-bottom:1px solid #3a2f28;padding:1rem 1.5rem}
h1{margin:0 0 .6rem;font-size:1.2rem;letter-spacing:.04em}
.controls{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}
input[type=search]{flex:1;min-width:14rem;padding:.5rem .7rem;border-radius:4px;border:1px solid #3a2f28;background:#1d1815;color:#e8e0d4;font-size:.95rem}
button{padding:.5rem .8rem;border-radius:4px;border:1px solid #3a2f28;background:#1d1815;color:#e8e0d4;cursor:pointer;font-size:.85rem}
button.on{border-color:#d9603f;color:#d9603f}
#count{color:#8a7a6c;font-size:.85rem}
main{padding:1.5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(19rem,1fr));gap:1rem}
.card{border:1px solid #3a2f28;border-radius:6px;overflow:hidden;background:#1d1815}
.card > .title{display:flex;justify-content:space-between;align-items:center;gap:.5rem;padding:.5rem .7rem;font-size:.85rem;border-bottom:1px solid #3a2f28}
.tag{font-size:.68rem;color:#8a7a6c;border:1px solid #3a2f28;border-radius:99px;padding:.05rem .4rem}
.mock{padding:.9rem 1rem 1.1rem;font-family:Georgia,serif}
.mock .side{display:inline-block;font-size:.7rem;padding:.1rem .4rem;border-radius:3px;margin-bottom:.6rem}
.mock h3{margin:.1rem 0 .3rem;font-size:1.05rem}
.mock p{margin:.2rem 0;font-size:.82rem}
.mock .rule{height:2px;margin:.6rem 0 .5rem;border-radius:2px}
.mock .chips{display:flex;gap:.3rem;margin-top:.6rem}
.mock .chip{width:1.15rem;height:1.15rem;border-radius:3px;border:1px solid rgba(128,128,128,.35)}
.modes{display:flex;gap:.3rem}
.modes button{padding:.1rem .35rem;font-size:.65rem}
.cfg{font:11px/1.4 ui-monospace,Consolas,monospace;color:#8a7a6c;padding:.5rem .7rem;border-top:1px solid #3a2f28;white-space:pre-wrap;word-break:break-all}
</style></head><body>
<header>
<h1>Quartz theme gallery &mdash; ${themes.length} themes</h1>
<div class="controls">
<input type="search" id="q" placeholder="filter by name, e.g. ttrpg, dnd, dark, paper, dune">
<button id="fBoth">has light + dark</button>
<button id="fVar">has variations</button>
<button id="mLight">show light</button>
<button id="mDark" class="on">show dark</button>
<span id="count"></span>
</div>
</header>
<main id="grid"></main>
<script>
const THEMES = ${JSON.stringify(themes)};
let mode = "dark", fBoth = false, fVar = false, q = "";
const grid = document.getElementById("grid"), count = document.getElementById("count");
function swatch(p){
  return \`<div class="chips">
    <div class="chip" style="background:\${p.accent||"transparent"}" title="accent"></div>
    <div class="chip" style="background:\${p.link||"transparent"}" title="link"></div>
    <div class="chip" style="background:\${p.bg2||"transparent"}" title="sidebar"></div>
    <div class="chip" style="background:\${p.border||"transparent"}" title="border"></div>
  </div>\`;
}
function card(t){
  const p = t.palettes[mode] || t.palettes.light || t.palettes.dark;
  if(!p) return "";
  const tags = [...t.modes.map(m=>m), ...(t.variations.length?["+"+t.variations.length+" var"]:[])]
    .map(x=>'<span class="tag">'+x+'</span>').join("");
  const cfg = "source:\\n  name: quartz-themes\\n  repo: github:saberzero1/quartz-themes\\n  subdir: plugin\\noptions:\\n  theme: " + t.name + (t.variations.length? "\\n  variation: " + t.variations[0] : "");
  return \`<div class="card">
    <div class="title"><strong>\${t.name}</strong><span>\${tags}</span></div>
    <div class="mock" style="background:\${p.bg};color:\${p.text}">
      <span class="side" style="background:\${p.bg2||p.bg};color:\${p.muted||p.text}">sidebar</span>
      <h3 style="color:\${p.heading||p.text}">The Vanished City</h3>
      <div class="rule" style="background:\${p.accent||p.text}"></div>
      <p>Elturel is gone. No rubble, no bodies, no explanation.</p>
      <p style="color:\${p.muted||p.text}">Updated after each session.</p>
      <p><a href="#" style="color:\${p.link||p.accent||p.text}">Ulder Ravengard</a></p>
      \${swatch(p)}
    </div>
    <div class="cfg">\${cfg}</div>
  </div>\`;
}
function render(){
  const list = THEMES.filter(t=>{
    if(q && !t.name.toLowerCase().includes(q)) return false;
    if(fBoth && !(t.palettes.light && t.palettes.dark)) return false;
    if(fVar && !t.variations.length) return false;
    return true;
  });
  grid.innerHTML = list.map(card).join("");
  count.textContent = list.length + " shown";
}
document.getElementById("q").addEventListener("input", e=>{q=e.target.value.toLowerCase().trim();render()});
function toggle(id, fn){document.getElementById(id).addEventListener("click", e=>{fn();e.target.classList.toggle("on");render()})}
toggle("fBoth", ()=>fBoth=!fBoth);
toggle("fVar", ()=>fVar=!fVar);
document.getElementById("mLight").addEventListener("click", ()=>{mode="light";document.getElementById("mLight").classList.add("on");document.getElementById("mDark").classList.remove("on");render()});
document.getElementById("mDark").addEventListener("click", ()=>{mode="dark";document.getElementById("mDark").classList.add("on");document.getElementById("mLight").classList.remove("on");render()});
render();
</script>
</body></html>`;

mkdirSync(here, { recursive: true });
writeFileSync(OUT, html, "utf8");
console.log(`wrote ${OUT}`);
