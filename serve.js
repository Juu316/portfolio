#!/usr/bin/env node
/**
 * Development server: rebuilds on change and serves the site locally.
 *
 *   npm run dev     →  http://localhost:3000
 *
 * It mounts the site at site.basePath (so local links behave exactly like
 * they will on GitHub Pages) and redirects / to it.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

let basePath = "";

/**
 * Rebuild in a child process.
 *
 * Importing build.js with a cache-busting query only busts build.js itself —
 * the modules IT imports (src/templates.js, src/markdown.js, …) stay in
 * Node's ESM cache, so edits to those would silently produce stale output.
 * A fresh process has no cache and cannot get this wrong.
 */
function rebuild(reason) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["build.js"], { cwd: ROOT, stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0 && reason) console.log(`  ↻ rebuilt (${reason})\n`);
      if (code !== 0) console.error(`\n  Build failed (exit ${code})\n`);
      resolve();
    });
  });
}

/** Read basePath from source each time, so it is never a cached value. */
function readBasePath() {
  const src = fs.readFileSync(path.join(ROOT, "content.js"), "utf8");
  const match = /basePath:\s*"([^"]*)"/.exec(src);
  return match ? match[1].replace(/\/$/, "") : "";
}

basePath = readBasePath();
await rebuild();

/* --------------------------------------------------------------------------
 * Watch sources and rebuild
 * ------------------------------------------------------------------------ */
const WATCHED = ["content.js", "build.js", "src", "posts", "public"];
let pending = null;

for (const target of WATCHED) {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) continue;

  fs.watch(full, { recursive: fs.statSync(full).isDirectory() }, (_event, filename) => {
    // Debounce: editors often fire several events for one save.
    clearTimeout(pending);
    pending = setTimeout(() => {
      basePath = readBasePath();
      rebuild(filename || target);
    }, 60);
  });
}

/* --------------------------------------------------------------------------
 * Static file server
 * ------------------------------------------------------------------------ */
function resolveFile(urlPath) {
  // Strip the base path so /portfolio/blog/ maps to ./blog/
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (basePath && rel.startsWith(basePath)) rel = rel.slice(basePath.length);
  if (!rel.startsWith("/")) rel = "/" + rel;

  // Prevent path traversal outside the project directory.
  const candidate = path.normalize(path.join(ROOT, rel));
  if (!candidate.startsWith(ROOT)) return null;

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const index = path.join(candidate, "index.html");
    return fs.existsSync(index) ? index : null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;

  // Try adding .html for extensionless URLs
  const asHtml = candidate + ".html";
  return fs.existsSync(asHtml) ? asHtml : null;
}

http
  .createServer((req, res) => {
    // Send bare "/" to the base path so local URLs match production.
    if (basePath && (req.url === "/" || req.url === "")) {
      res.writeHead(302, { Location: basePath + "/" });
      return res.end();
    }

    const file = resolveFile(req.url);

    if (!file) {
      const notFound = path.join(ROOT, "404.html");
      res.writeHead(404, { "Content-Type": MIME[".html"] });
      return res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "Not found");
    }

    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store", // always see the latest build while developing
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`  Serving  http://localhost:${PORT}${basePath}/`);
    console.log(`  Watching content.js, src/, posts/, public/ — Ctrl+C to stop\n`);
  });
