#!/usr/bin/env node
/**
 * Output validator.
 *
 *   npm run check     build, then audit every generated page in both languages
 *
 * Not a substitute for Lighthouse — it checks what is deterministic from the
 * HTML itself (SEO tags, hreflang reciprocity, accessibility structure, broken
 * links, render-blocking resources) so a regression shows up in CI instead of
 * in a recruiter's browser.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { site } from "./content.js";
import { LOCALES } from "./src/i18n.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BASE = site.basePath.replace(/\/$/, "");
const ORIGIN = site.url.replace(/\/$/, "");

let failures = 0;
let warnings = 0;

function fail(where, message) {
  console.log(`  ✗ ${where}: ${message}`);
  failures++;
}

function warn(where, message) {
  console.log(`  ! ${where}: ${message}`);
  warnings++;
}

/**
 * Currently-indexed URLs that must keep resolving. Moving Mongolian to the
 * root changed what these serve; GitHub Pages cannot issue redirects, so if
 * one of them stops resolving it is a hard 404 with no way to recover it.
 */
const LEGACY_PERMALINKS = [
  "/",
  "/blog/",
  "/blog/how-this-site-is-built/",
  "/blog/template-what-i-learned/",
];

/* --------------------------------------------------------------------------
 * Path helpers
 * ------------------------------------------------------------------------ */

/** Map a site-absolute URL back to the file on disk that serves it. */
function fileForUrl(absoluteUrl) {
  if (!absoluteUrl.startsWith(ORIGIN)) return null;
  return fileForPath(absoluteUrl.slice(ORIGIN.length) || "/");
}

/** Map a base-relative path (already stripped of basePath) to a file. */
function fileForPath(rel) {
  const clean = decodeURIComponent(rel.split("#")[0].split("?")[0]) || "/";
  const candidate = path.normalize(path.join(ROOT, clean));
  if (!candidate.startsWith(ROOT)) return null;

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const index = path.join(candidate, "index.html");
    return fs.existsSync(index) ? index : null;
  }
  return fs.existsSync(candidate) ? candidate : null;
}

/** Collect every generated HTML file. */
function htmlFiles(dir = ROOT, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (["src", "posts", "public", "node_modules"].includes(entry.name)) continue;

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

/** hreflang alternates declared by a page, excluding x-default. */
function alternatesOf(html) {
  const found = {};
  for (const [, lang, href] of html.matchAll(
    /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g
  )) {
    if (lang === "x-default") continue;
    found[lang] = href;
  }
  return found;
}

/* --------------------------------------------------------------------------
 * Per-page checks
 * ------------------------------------------------------------------------ */
function checkPage(file) {
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, "utf8");
  const is404 = rel === "404.html";

  // ---- SEO ------------------------------------------------------------
  const title = attr(html, /<title>([^<]*)<\/title>/);
  if (!title) fail(rel, "missing <title>");
  else if (title.length > 65) warn(rel, `title is ${title.length} chars (Google truncates ~60)`);

  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!description) fail(rel, "missing meta description");
  else if (description.length > 175)
    warn(rel, `meta description is ${description.length} chars (truncates ~160)`);

  // The 404 is served at arbitrary URLs, so it deliberately has no canonical
  // and is deliberately noindex.
  if (is404) {
    if (/<link rel="canonical"/.test(html)) fail(rel, "404 must not declare a canonical");
    if (!/<meta name="robots" content="noindex/.test(html))
      fail(rel, "404 must be noindex (otherwise it's an indexable soft-404)");
  } else {
    if (!/<link rel="canonical"/.test(html)) fail(rel, "missing canonical link");
    if (!/<meta name="robots" content="index/.test(html)) fail(rel, "page is not indexable");
  }

  if (!/<meta property="og:title"/.test(html)) fail(rel, "missing og:title");
  if (!/<meta property="og:image"/.test(html)) fail(rel, "missing og:image");
  if (!/<meta property="og:locale"/.test(html)) fail(rel, "missing og:locale");
  if (!/<meta name="twitter:card"/.test(html)) fail(rel, "missing twitter:card");

  for (const [, json] of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  )) {
    try {
      JSON.parse(json);
    } catch (error) {
      fail(rel, `invalid JSON-LD (${error.message})`);
    }
  }

  // ---- Language -------------------------------------------------------
  const lang = attr(html, /<html lang="([^"]+)"/);
  if (!lang) fail(rel, "missing lang attribute on <html>");
  else if (!LOCALES.some((l) => l.htmlLang === lang))
    fail(rel, `unknown lang "${lang}"`);

  // ---- Accessibility --------------------------------------------------
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count === 0) fail(rel, "no <h1>");
  else if (h1Count > 1) fail(rel, `${h1Count} <h1> elements (expected exactly 1)`);

  if (!/class="skip-link"/.test(html)) warn(rel, "no skip-to-content link");

  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(tag)) fail(rel, `<img> without alt: ${tag.slice(0, 60)}`);
  }

  for (const [, tagAttrs, inner] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text && !/aria-label=/.test(tagAttrs)) fail(rel, "icon button without aria-label");
  }

  // Icon-only links (the language pill excepted — it has visible text).
  for (const [, tagAttrs, inner] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text && !/aria-label=/.test(tagAttrs)) fail(rel, "icon link without aria-label");
  }

  for (const [tag] of html.matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
    const type = attr(tag, /type="([^"]*)"/) || "text";
    if (["hidden", "submit", "checkbox"].includes(type)) continue;
    const id = attr(tag, /id="([^"]*)"/);
    if (!id) fail(rel, `form field without id: ${tag.slice(0, 50)}`);
    else if (!new RegExp(`<label[^>]*for="${id}"`).test(html)) fail(rel, `no <label for="${id}">`);
  }

  // ---- Performance ----------------------------------------------------
  const blockingCss = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)];
  if (blockingCss.length) fail(rel, `${blockingCss.length} render-blocking stylesheet(s)`);

  for (const [tag] of html.matchAll(/<script\b([^>]*)>/g)) {
    if (/\bsrc=/.test(tag) && !/\b(defer|async|type="module")/.test(tag)) {
      fail(rel, `render-blocking script: ${tag.slice(0, 60)}`);
    }
  }

  if (!/<meta name="viewport"/.test(html)) fail(rel, "missing viewport meta (mobile will fail)");

  // Control characters almost always mean a template-literal escape went
  // wrong (\b becomes a backspace and the emitted JavaScript stops working).
  for (const [char] of html.matchAll(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g)) {
    fail(
      rel,
      `control character U+${char.charCodeAt(0).toString(16).padStart(4, "0")} in output (check template-literal escaping)`
    );
    break;
  }

  const gzipped = zlib.gzipSync(html).length;
  if (gzipped > 60 * 1024) warn(rel, `${(gzipped / 1024).toFixed(1)} kB gzipped is large`);

  // ---- Internal links -------------------------------------------------
  for (const [, href] of html.matchAll(/href="([^"#][^"]*)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;

    let target = href.split("#")[0].split("?")[0];
    if (!target) continue;
    if (BASE && target.startsWith(BASE)) target = target.slice(BASE.length) || "/";

    if (!fileForPath(target)) {
      if (/resume\.pdf$/.test(target)) warn(rel, `link to missing ${target} (add public/resume.pdf)`);
      else fail(rel, `broken internal link: ${href}`);
    }
  }

  return { gzipped, alternates: alternatesOf(html) };
}

/* --------------------------------------------------------------------------
 * hreflang reciprocity
 *
 * If page A declares B as its "en" alternate, B must declare A back. A
 * one-sided annotation makes Google discard the ENTIRE cluster, not just the
 * bad edge — so a post that exists in only one language must declare only
 * itself.
 * ------------------------------------------------------------------------ */
function checkHreflang(pages) {
  for (const [file, { alternates }] of pages) {
    const rel = path.relative(ROOT, file);
    if (rel === "404.html") continue;

    for (const [lang, href] of Object.entries(alternates)) {
      const target = fileForUrl(href);
      if (!target) {
        fail(rel, `hreflang="${lang}" points at ${href}, which nothing serves`);
        continue;
      }

      const targetEntry = pages.get(target);
      if (!targetEntry) {
        fail(rel, `hreflang="${lang}" target ${path.relative(ROOT, target)} was not generated`);
        continue;
      }

      const back = targetEntry.alternates;
      const mine = Object.keys(alternates).sort().join(",");
      const theirs = Object.keys(back).sort().join(",");
      if (mine !== theirs) {
        fail(
          rel,
          `hreflang set [${mine}] is not reciprocal with ${path.relative(
            ROOT,
            target
          )} which declares [${theirs}]`
        );
      }
    }
  }
}

/* --------------------------------------------------------------------------
 * Site-level checks
 * ------------------------------------------------------------------------ */
function checkSiteFiles() {
  // Shared, root-only. GitHub Pages serves ONE 404 for the whole site, and
  // robots/sitemap are site-wide — per-locale copies would be dead weight.
  const shared = [
    "sitemap.xml",
    "robots.txt",
    "404.html",
    "favicon.svg",
    "apple-touch-icon.png",
    "site.webmanifest",
    "main.js",
    ".nojekyll",
  ];

  for (const file of shared) {
    if (!fs.existsSync(path.join(ROOT, file))) fail("site", `missing ${file}`);
  }

  for (const file of ["en/404.html", "en/robots.txt", "en/sitemap.xml"]) {
    if (fs.existsSync(path.join(ROOT, file))) {
      warn("site", `${file} is dead weight — GitHub Pages never serves it`);
    }
  }

  // Per-locale trees.
  for (const locale of LOCALES) {
    const dir = locale.prefix ? locale.prefix.slice(1) + "/" : "";
    for (const file of ["index.html", "blog/index.html", "feed.xml", "og.png"]) {
      if (!fs.existsSync(path.join(ROOT, dir + file))) fail("site", `missing ${dir}${file}`);
    }

    const ogPath = path.join(ROOT, dir + "og.png");
    if (fs.existsSync(ogPath)) {
      const og = fs.readFileSync(ogPath);
      if (og.slice(0, 8).toString("hex") !== "89504e470d0a1a0a")
        fail("site", `${dir}og.png is not a valid PNG`);
      else if (og.readUInt32BE(16) !== 1200 || og.readUInt32BE(20) !== 630)
        warn("site", `${dir}og.png should be 1200x630 for best link previews`);
    }
  }

  // Sitemap: xhtml:link alternates require the namespace declaration, or the
  // whole file is malformed XML and Search Console rejects it.
  const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  if (!sitemap.trimStart().startsWith("<?xml")) fail("site", "sitemap.xml missing XML declaration");
  if (/<xhtml:/.test(sitemap) && !/xmlns:xhtml="/.test(sitemap)) {
    fail("site", "sitemap.xml uses the xhtml: prefix without declaring xmlns:xhtml");
  }
  for (const tag of ["url", "loc"]) {
    const open = (sitemap.match(new RegExp(`<${tag}>`, "g")) || []).length;
    const close = (sitemap.match(new RegExp(`</${tag}>`, "g")) || []).length;
    if (open !== close) fail("site", `sitemap.xml: ${open} <${tag}> vs ${close} </${tag}>`);
  }

  // Every sitemap URL must actually resolve.
  for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!fileForUrl(loc)) fail("site", `sitemap lists ${loc}, which nothing serves`);
  }

  // Feeds.
  for (const locale of LOCALES) {
    const dir = locale.prefix ? locale.prefix.slice(1) + "/" : "";
    const feedPath = path.join(ROOT, dir + "feed.xml");
    if (!fs.existsSync(feedPath)) continue;
    const feed = fs.readFileSync(feedPath, "utf8");
    if (!feed.trimStart().startsWith("<?xml")) fail("site", `${dir}feed.xml missing XML declaration`);
    const open = (feed.match(/<item>/g) || []).length;
    const close = (feed.match(/<\/item>/g) || []).length;
    if (open !== close) fail("site", `${dir}feed.xml: ${open} <item> vs ${close} </item>`);
  }
}

/** Indexed URLs that must not start 404ing. */
function checkLegacyPermalinks() {
  for (const permalink of LEGACY_PERMALINKS) {
    if (!fileForPath(permalink)) {
      fail(
        "migration",
        `${BASE}${permalink} is already indexed but nothing serves it — GitHub Pages cannot redirect, so this is a permanent 404`
      );
    }
  }
}

/* --------------------------------------------------------------------------
 * Run
 * ------------------------------------------------------------------------ */
console.log("\n  Checking generated output\n");

const files = htmlFiles();
const pages = new Map();

for (const file of files) {
  pages.set(file, checkPage(file));
}

checkHreflang(pages);
checkSiteFiles();
checkLegacyPermalinks();

const sizeOf = (file) => zlib.gzipSync(fs.readFileSync(path.join(ROOT, file))).length;
const kb = (bytes) => (bytes / 1024).toFixed(1) + " kB";

const mnHome = sizeOf("index.html");
const enHome = sizeOf("en/index.html");
const js = sizeOf("main.js");

console.log(`\n  ${files.length} pages checked across ${LOCALES.length} languages`);
console.log(`  Homepage mn:  ${kb(mnHome)} gzipped (HTML + inlined CSS)`);
console.log(`  Homepage en:  ${kb(enHome)} gzipped`);
console.log(`  main.js:      ${kb(js)} gzipped (deferred, shared)`);
console.log(`  First view:   ~${kb(mnHome + js)} over 2 requests\n`);

if (failures) {
  console.log(`  ${failures} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
}

console.log(`  All checks passed${warnings ? ` (${warnings} warning(s))` : ""}\n`);
