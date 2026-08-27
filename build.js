#!/usr/bin/env node
/**
 * Static site build.
 *
 *   node build.js          build once into the repo root
 *   node build.js --quiet  build without the summary report
 *
 * Output (all generated — safe to delete, regenerated every build):
 *   index.html, blog/, 404.html, main.js, sitemap.xml, robots.txt,
 *   feed.xml, og.png, favicon.svg, apple-touch-icon.png, site.webmanifest
 *
 * Anything you drop in public/ is copied to the root last, so your own
 * favicon or og.png always wins over the generated defaults.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site, hero, projects, about, writing, contact, social, nav } from "./content.js";
import { parseFrontmatter, renderMarkdown, readingTime, toPlainText } from "./src/markdown.js";
import { homePage, blogIndexPage, postPage, notFoundPage, absoluteUrl } from "./src/templates.js";
import { generateOgImage, generateIcon } from "./src/og.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const QUIET = process.argv.includes("--quiet");

/* --------------------------------------------------------------------------
 * Small utilities
 * ------------------------------------------------------------------------ */
function write(relativePath, contents) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  return Buffer.byteLength(contents);
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // comments
    .replace(/\s*([{}:;,>])\s*/g, "$1") // space around punctuation
    .replace(/;}/g, "}") // trailing semicolons
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Conservative HTML minification: strip comments and collapse the
 * indentation whitespace. Contents of pre/script/style/textarea are pulled
 * out first so nothing inside them is touched.
 */
function minifyHtml(html) {
  const stash = [];

  // NUL bytes as delimiters: they cannot appear in the rendered HTML, so
  // restoring can never collide with real content. A plain " 12 " token
  // does collide -- it happily eats things like "&copy; 2026 Name".
  const protectedHtml = html.replace(
    /<(pre|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (match) => {
      stash.push(match);
      return `\u0000${stash.length - 1}\u0000`;
    }
  );

  const minified = protectedHtml
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return minified.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[+i]);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return [];
  const copied = [];
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copied.push(...copyDir(src, dest));
    } else {
      fs.copyFileSync(src, dest);
      copied.push(entry.name);
    }
  }
  return copied;
}

function xmlEscape(text) {
  return String(text).replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/* --------------------------------------------------------------------------
 * Load blog posts
 * ------------------------------------------------------------------------ */
function loadPosts() {
  const dir = path.join(ROOT, "posts");
  if (!fs.existsSync(dir)) return [];

  const warnings = [];
  const posts = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, body } = parseFrontmatter(raw);

      // Slug comes from frontmatter, else the filename minus any NN- prefix.
      const slug =
        data.slug ||
        file
          .replace(/\.md$/, "")
          .replace(/^\d+[-_]/, "")
          .toLowerCase()
          .replace(/[^\w-]+/g, "-");

      if (!data.title) warnings.push(`${file}: missing "title" in frontmatter`);
      if (!data.date) warnings.push(`${file}: missing "date" in frontmatter`);

      return {
        file,
        slug,
        draft: data.draft === true,
        title: data.title || slug,
        date: data.date || "1970-01-01",
        description: data.description || toPlainText(body, 160),
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        path: `/blog/${slug}/`,
        html: renderMarkdown(body),
        readingTime: readingTime(body),
        wordCount: body.trim().split(/\s+/).filter(Boolean).length,
      };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return Object.assign(posts, { warnings });
}

/* --------------------------------------------------------------------------
 * Feeds and crawler files
 * ------------------------------------------------------------------------ */
function buildSitemap(ctx) {
  const entries = [
    { loc: absoluteUrl(ctx, "/"), priority: "1.0", changefreq: "monthly" },
    { loc: absoluteUrl(ctx, "/blog/"), priority: "0.7", changefreq: "weekly" },
    ...ctx.posts.map((post) => ({
      loc: absoluteUrl(ctx, post.path),
      priority: "0.6",
      changefreq: "yearly",
      lastmod: post.date,
    })),
  ];

  const urls = entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${entry.loc}</loc>\n${
          entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ""
        }    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${
          entry.priority
        }</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobots(ctx) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(ctx, "/sitemap.xml")}\n`;
}

function buildFeed(ctx) {
  const items = ctx.posts
    .map((post) => {
      const link = absoluteUrl(ctx, post.path);
      return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${xmlEscape(post.description)}</description>
      <content:encoded><![CDATA[${post.html}]]></content:encoded>
${post.tags.map((tag) => `      <category>${xmlEscape(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xmlEscape(ctx.site.name)} — Writing</title>
    <link>${absoluteUrl(ctx, "/blog/")}</link>
    <description>${xmlEscape(ctx.writing.blurb)}</description>
    <language>${ctx.site.lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl(ctx, "/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function buildManifest(ctx) {
  return JSON.stringify(
    {
      name: `${ctx.site.name} — ${ctx.site.role}`,
      short_name: ctx.site.shortName,
      description: ctx.site.description.replace(/^TODO:?\s*/i, ""),
      start_url: ctx.site.basePath + "/",
      scope: ctx.site.basePath + "/",
      display: "standalone",
      background_color: "#0c0d11",
      theme_color: "#0c0d11",
      icons: [
        {
          src: ctx.site.basePath + "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: ctx.site.basePath + "/favicon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ],
    },
    null,
    2
  );
}

function buildFavicon(ctx) {
  const initial = (ctx.site.shortName || ctx.site.name || "?").trim().charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#4f4fd0"/>
  <text x="32" y="45" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
        font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle">${initial}</text>
</svg>
`;
}

/* --------------------------------------------------------------------------
 * Placeholder audit — tells you exactly what's left to personalise
 * ------------------------------------------------------------------------ */
function auditPlaceholders() {
  const found = [];

  const walk = (value, trail) => {
    if (typeof value === "string") {
      if (/^TODO|TODO-PASTE/i.test(value.trim())) found.push(trail);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, `${trail}[${i}]`));
    } else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) walk(item, `${trail}.${key}`);
    }
  };

  walk({ site, hero, projects, about, writing, contact, social }, "content");
  return found;
}

/* --------------------------------------------------------------------------
 * Build
 * ------------------------------------------------------------------------ */
export function build() {
  const started = Date.now();
  const posts = loadPosts();

  const css = minifyCss(fs.readFileSync(path.join(ROOT, "src/styles.css"), "utf8"));
  const formConfigured = !/^TODO/i.test(contact.web3formsKey.trim());

  // Only surface the resume link if the file actually exists, otherwise the
  // most important button on the page 404s.
  const resumeFile = hero.resume && hero.resume.file;
  const hasResume = resumeFile && fs.existsSync(path.join(ROOT, "public", resumeFile));
  if (resumeFile && !hasResume) {
    console.log(`  ! public/${resumeFile} not found — hiding the resume link.`);
  }

  const ctx = {
    site,
    hero: { ...hero, resume: hasResume ? hero.resume : null },
    projects,
    about,
    writing,
    contact,
    social,
    nav,
    posts,
    css,
    isHome: true,
    buildYear: new Date().getFullYear(),
    clientConfig: {
      rotatingWords: hero.rotatingWords,
      formConfigured,
    },
  };

  const outputs = [];

  // Pages
  outputs.push(["index.html", write("index.html", minifyHtml(homePage(ctx)))]);

  const subCtx = { ...ctx, isHome: false };
  outputs.push(["blog/index.html", write("blog/index.html", minifyHtml(blogIndexPage(subCtx)))]);

  for (const post of posts) {
    const file = `blog/${post.slug}/index.html`;
    outputs.push([file, write(file, minifyHtml(postPage(subCtx, post)))]);
  }

  outputs.push(["404.html", write("404.html", minifyHtml(notFoundPage(subCtx)))]);

  // Runtime script
  outputs.push(["main.js", write("main.js", fs.readFileSync(path.join(ROOT, "src/main.js")))]);

  // Crawler + feed files
  outputs.push(["sitemap.xml", write("sitemap.xml", buildSitemap(ctx))]);
  outputs.push(["robots.txt", write("robots.txt", buildRobots(ctx))]);
  outputs.push(["feed.xml", write("feed.xml", buildFeed(ctx))]);
  outputs.push(["site.webmanifest", write("site.webmanifest", buildManifest(ctx))]);
  outputs.push(["favicon.svg", write("favicon.svg", buildFavicon(ctx))]);

  // Generated images (a file of the same name in public/ overrides these)
  outputs.push([
    "og.png",
    write(
      "og.png",
      generateOgImage({
        name: site.name,
        role: site.role,
        url: absoluteUrl(ctx, "/"),
      })
    ),
  ]);
  outputs.push([
    "apple-touch-icon.png",
    write("apple-touch-icon.png", generateIcon(site.shortName || site.name)),
  ]);

  // Tells GitHub Pages not to run Jekyll over the output.
  write(".nojekyll", "");

  // User assets last, so they win over anything generated above.
  const copied = copyDir(path.join(ROOT, "public"), ROOT);

  if (!QUIET) report({ outputs, copied, posts, started, formConfigured });

  return { outputs, posts };
}

function report({ outputs, copied, posts, started, formConfigured }) {
  const total = outputs.reduce((sum, [, bytes]) => sum + bytes, 0);
  const kb = (bytes) => (bytes / 1024).toFixed(1) + " kB";

  console.log(`\n  Built ${outputs.length} files in ${Date.now() - started}ms\n`);

  const home = outputs.find(([name]) => name === "index.html");
  console.log(`    index.html        ${kb(home[1])}  (CSS inlined, zero render-blocking requests)`);
  console.log(`    main.js           ${kb(outputs.find(([n]) => n === "main.js")[1])}  (deferred)`);
  console.log(`    posts             ${posts.length}`);
  if (copied.length) console.log(`    public/ copied    ${copied.length} file(s)`);
  console.log(`    total             ${kb(total)}\n`);

  if (posts.warnings && posts.warnings.length) {
    console.log("  Post warnings:");
    for (const warning of posts.warnings) console.log(`    ! ${warning}`);
    console.log("");
  }

  const todos = auditPlaceholders();
  if (todos.length) {
    console.log(`  ${todos.length} placeholder(s) still to fill in content.js:`);
    const shown = todos.slice(0, 12);
    for (const todo of shown) console.log(`    · ${todo}`);
    if (todos.length > shown.length) console.log(`    · …and ${todos.length - shown.length} more`);
    console.log("");
  }

  if (!formConfigured) {
    console.log("  ! Contact form is not connected yet.");
    console.log("    Get a free key at https://web3forms.com and set");
    console.log("    contact.web3formsKey in content.js.\n");
  }
}

// Run when invoked directly (not when imported by the dev server).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
}
