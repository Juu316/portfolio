#!/usr/bin/env node
/**
 * Output validator.
 *
 *   npm run check     build, then audit every generated page
 *
 * This is not a substitute for running Lighthouse — it checks the things
 * that are deterministic from the HTML itself (SEO tags, accessibility
 * structure, broken internal links, render-blocking resources) so that a
 * regression shows up in CI instead of in a recruiter's browser.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { site } from "./content.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BASE = site.basePath.replace(/\/$/, "");

let failures = 0;
let warnings = 0;

function fail(page, message) {
  console.log(`  ✗ ${page}: ${message}`);
  failures++;
}

function warn(page, message) {
  console.log(`  ! ${page}: ${message}`);
  warnings++;
}

/** Collect every generated HTML file. */
function htmlFiles(dir = ROOT, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    if (entry.name === "src" || entry.name === "posts" || entry.name === "public") continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, found);
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

function attr(html, regex) {
  const match = regex.exec(html);
  return match ? match[1] : null;
}

/* --------------------------------------------------------------------------
 * Per-page checks
 * ------------------------------------------------------------------------ */
function checkPage(file) {
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, "utf8");

  // ---- SEO ------------------------------------------------------------
  const title = attr(html, /<title>([^<]*)<\/title>/);
  if (!title) fail(rel, "missing <title>");
  else if (title.length > 65) warn(rel, `title is ${title.length} chars (Google truncates ~60)`);

  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!description) fail(rel, "missing meta description");
  else if (description.length > 165)
    warn(rel, `meta description is ${description.length} chars (truncates ~160)`);

  if (!/<link rel="canonical"/.test(html)) fail(rel, "missing canonical link");
  if (!/<meta property="og:title"/.test(html)) fail(rel, "missing og:title");
  if (!/<meta property="og:image"/.test(html)) fail(rel, "missing og:image");
  if (!/<meta name="twitter:card"/.test(html)) fail(rel, "missing twitter:card");

  // Structured data must be valid JSON or search engines silently drop it.
  const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ldMatches.length) fail(rel, "missing JSON-LD structured data");
  for (const [, json] of ldMatches) {
    try {
      JSON.parse(json);
    } catch (error) {
      fail(rel, `invalid JSON-LD (${error.message})`);
    }
  }

  // ---- Accessibility --------------------------------------------------
  if (!/<html lang="[a-z-]+"/.test(html)) fail(rel, "missing lang attribute on <html>");

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count === 0) fail(rel, "no <h1>");
  else if (h1Count > 1) fail(rel, `${h1Count} <h1> elements (expected exactly 1)`);

  if (!/class="skip-link"/.test(html)) warn(rel, "no skip-to-content link");

  // Every image needs alt text (empty alt is fine for decorative images).
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(tag)) fail(rel, `<img> without alt: ${tag.slice(0, 60)}`);
  }

  // Icon-only buttons and links need an accessible name.
  for (const [tag, inner] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text && !/aria-label=/.test(tag)) fail(rel, "icon button without aria-label");
  }

  // Form inputs need a matching label.
  for (const [tag] of html.matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
    const type = attr(tag, /type="([^"]*)"/) || "text";
    if (["hidden", "submit", "checkbox"].includes(type)) continue;
    const id = attr(tag, /id="([^"]*)"/);
    if (!id) {
      fail(rel, `form field without id: ${tag.slice(0, 50)}`);
    } else if (!new RegExp(`<label[^>]*for="${id}"`).test(html)) {
      fail(rel, `no <label for="${id}">`);
    }
  }

  // ---- Performance ----------------------------------------------------
  // Anything that blocks the first render costs you LCP directly.
  const blockingCss = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)];
  if (blockingCss.length) fail(rel, `${blockingCss.length} render-blocking stylesheet(s)`);

  for (const [tag] of html.matchAll(/<script\b([^>]*)>/g)) {
    if (/\bsrc=/.test(tag) && !/\b(defer|async|type="module")/.test(tag)) {
      fail(rel, `render-blocking script: ${tag.slice(0, 60)}`);
    }
  }

  if (!/<meta name="viewport"/.test(html)) fail(rel, "missing viewport meta (mobile will fail)");

  // Control characters in the output almost always mean a template-literal
  // escape went wrong (\b becomes a backspace, \t a tab, and the emitted
  // JavaScript silently stops working).
  for (const [char] of html.matchAll(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g)) {
    fail(rel, `control character U+${char.charCodeAt(0).toString(16).padStart(4, "0")} in output (check template-literal escaping)`);
    break;
  }

  const raw = Buffer.byteLength(html);
  const gzipped = zlib.gzipSync(html).length;
  if (gzipped > 60 * 1024) warn(rel, `${(gzipped / 1024).toFixed(1)} kB gzipped is large`);

  // ---- Internal links -------------------------------------------------
  for (const [, href] of html.matchAll(/href="([^"#][^"]*)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;

    let target = href.split("#")[0].split("?")[0];
    if (!target) continue;
    if (BASE && target.startsWith(BASE)) target = target.slice(BASE.length);

    const candidate = path.join(ROOT, target);
    const resolved = target.endsWith("/") ? path.join(candidate, "index.html") : candidate;

    if (!fs.existsSync(resolved)) {
      // resume.pdf is an expected optional asset — nudge rather than fail.
      if (/resume\.pdf$/.test(target)) warn(rel, `link to missing ${target} (add public/resume.pdf)`);
      else fail(rel, `broken internal link: ${href}`);
    }
  }

  return { raw, gzipped };
}

/* --------------------------------------------------------------------------
 * Site-level checks
 * ------------------------------------------------------------------------ */
function checkSiteFiles() {
  for (const file of ["sitemap.xml", "robots.txt", "feed.xml", "og.png", "favicon.svg", "404.html"]) {
    if (!fs.existsSync(path.join(ROOT, file))) fail("site", `missing ${file}`);
  }

  const og = fs.readFileSync(path.join(ROOT, "og.png"));
  if (og.slice(0, 8).toString("hex") !== "89504e470d0a1a0a") fail("site", "og.png is not a valid PNG");
  if (og.readUInt32BE(16) !== 1200 || og.readUInt32BE(20) !== 630)
    warn("site", "og.png should be 1200x630 for best link previews");

  // Sitemap and feed must be well-formed enough to parse as XML.
  for (const file of ["sitemap.xml", "feed.xml"]) {
    const xml = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (!xml.trimStart().startsWith("<?xml")) fail("site", `${file} missing XML declaration`);

    // Count a couple of specific elements rather than trying to balance every
    // tag — attribute values contain "/" and defeat a naive regex.
    const pairs = file === "sitemap.xml" ? ["url", "loc"] : ["item", "link"];
    for (const tag of pairs) {
      const open = (xml.match(new RegExp(`<${tag}>`, "g")) || []).length;
      const close = (xml.match(new RegExp(`</${tag}>`, "g")) || []).length;
      if (open !== close) fail("site", `${file}: ${open} <${tag}> vs ${close} </${tag}>`);
    }
    if (/<loc><\/loc>|<link><\/link>/.test(xml)) fail("site", `${file} has an empty URL element`);
  }
}

/* --------------------------------------------------------------------------
 * Run
 * ------------------------------------------------------------------------ */
console.log("\n  Checking generated output\n");

const files = htmlFiles();
let totalGzip = 0;

for (const file of files) {
  const { gzipped } = checkPage(file);
  totalGzip += gzipped;
}

checkSiteFiles();

const home = path.join(ROOT, "index.html");
const homeGzip = zlib.gzipSync(fs.readFileSync(home)).length;
const jsGzip = zlib.gzipSync(fs.readFileSync(path.join(ROOT, "main.js"))).length;

console.log(`\n  ${files.length} pages checked`);
console.log(`  Homepage:  ${(homeGzip / 1024).toFixed(1)} kB gzipped (HTML + inlined CSS)`);
console.log(`  main.js:   ${(jsGzip / 1024).toFixed(1)} kB gzipped (deferred)`);
console.log(`  First view: ~${((homeGzip + jsGzip) / 1024).toFixed(1)} kB over 2 requests\n`);

if (failures) {
  console.log(`  ${failures} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
}

console.log(`  All checks passed${warnings ? ` (${warnings} warning(s))` : ""}\n`);
