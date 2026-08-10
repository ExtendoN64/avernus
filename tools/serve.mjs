/** Tiny static file server for previewing a built Quartz output. No deps. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const root = resolve(process.argv[2] || "preview");
const port = Number(process.argv[3] || 8080);
const base = process.argv[4] || "/avernus";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
};

async function tryFiles(p) {
  const candidates = [p, p + ".html", join(p, "index.html")];
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  // the site is built for a /avernus base path; strip it when serving locally
  if (base && url.startsWith(base)) url = url.slice(base.length) || "/";
  const target = join(root, url);
  if (!target.startsWith(root)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  const file = await tryFiles(target);
  if (!file) {
    const notFound = await tryFiles(join(root, "404"));
    if (notFound) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(await readFile(notFound));
      return;
    }
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(await readFile(file));
}).listen(port, () => {
  console.log(`\n  preview -> http://localhost:${port}${base}/`);
  console.log(`  serving  ${root}`);
  console.log(`  Ctrl+C to stop\n`);
});
