# Portfolio — Монгол / English

A bilingual developer portfolio built as a static site with **zero
dependencies**. `npm install` does nothing, because there is nothing to install.

- **Монгол** → https://juu316.github.io/portfolio/
- **English** → https://juu316.github.io/portfolio/en/

---

## Quick start

```bash
npm run dev     # http://localhost:3000 — rebuilds as you edit
npm run build   # write both language trees into the repo root
npm run check   # build, then validate SEO / a11y / hreflang / links
```

Node 18 or newer. No other tooling required.

---

## The five-minute personalisation

Everything you need to change is marked `TODO`. The build prints how many are
left, and separately warns about any missing translation.

1. **`content.js`** — your name, role, projects, story, skills, links, in both
   languages. This one file drives both trees.
2. **`posts/*.md`** — your writing. Delete the template posts.
3. **Contact form** — get a free key at [web3forms.com](https://web3forms.com)
   and paste it into `contact.web3formsKey`. Until then the form shows a
   friendly "not connected yet" notice instead of failing silently.
4. **`public/resume.pdf`** — drop it in and the Resume button appears. Leave it
   out and the button hides itself (never a dead link).

Then:

```bash
npm run check && git add -A && git commit -m "Personalise portfolio" && git push
```

Pushing to `main` deploys automatically.

---

## Writing bilingual content

Any field written as a pair is swapped per language:

```js
headline: { mn: "Би вэбд хурдан зүйлс бүтээдэг.", en: "I build fast things." },
```

Fields that are **not** translatable stay plain values — URLs, tech names,
dates, and the nav `href` anchors (which must match section ids):

```js
stack: ["TypeScript", "React"],
href:  "#work",
```

If you leave one language out, the build falls back to the other and tells you
which key was missing. An **empty string is a deliberate value**, not a missing
translation — that's how an optional element like a project status badge hides
itself.

Site chrome ("Send message", "min read", form errors) lives in **`src/i18n.js`**,
not `content.js` — those belong to the app rather than to you.

---

## Writing a post

Posts are per-language files. The suffix is required, so the build always knows
which tree a post belongs to:

```
posts/
  001-my-post.mn.md      → /blog/my-post/
  001-my-post.en.md      → /en/blog/my-post/
```

```markdown
---
title: Гарчиг
description: Нэг өгүүлбэр.
date: 2026-09-01
tags: [postgres, гүйцэтгэл]
---

Your content. **Bold**, `code`, [links](https://example.com), lists, tables,
blockquotes and fenced code blocks all work.
```

- The filename becomes the URL; a leading `NN-` is stripped so you can control
  ordering. **Keep filenames ASCII** — it keeps URLs clean and shareable.
- `draft: true` keeps a post out of the build entirely — no page, no sitemap
  entry, no RSS item. It is per-file, so you can draft one language only.
- **A post does not need both languages.** If a translation is missing, the post
  simply doesn't appear in that tree, and the language toggle sends the visitor
  to that language's blog index rather than a dead URL. The build lists which
  posts are single-language so it's never an accident.

---

## How it works

```
content.js       all site copy, as { mn, en } pairs
posts/*.md       blog posts, <name>.mn.md / <name>.en.md
public/          your assets — copied to the root last, so they override
                 anything generated (og.png, favicon.svg, resume.pdf…)

build.js         renders both trees
check.js         validates the output; CI fails if this fails
serve.js         dev server + file watcher

src/i18n.js      locale config, UI strings, content resolver
src/styles.css   the stylesheet (inlined into every page at build time)
src/main.js      the only client-side script (deferred, ~4.5 kB gzipped)
src/templates.js page templates
src/markdown.js  markdown renderer
src/og.js        social-preview PNG generator (Latin + Cyrillic bitmap font)
```

Everything else in the repo root is **generated output** — wiped and rewritten
on every build, and **not committed** (see `.gitignore`). CI runs
`node build.js` before uploading to Pages, so the live site is always built
fresh from source and diffs stay source-only.

After a fresh clone, run `npm run build` (or `npm run dev`) to produce a local
copy of the site.

### URL layout

```
/                 Монгол        /en/              English
/blog/                          /en/blog/
/blog/<slug>/                   /en/blog/<slug>/
/feed.xml                       /en/feed.xml
/og.png                         /en/og.png

shared: /main.js /favicon.svg /apple-touch-icon.png
        /site.webmanifest /robots.txt /sitemap.xml /404.html
```

`main.js` deliberately lives at **one** URL for the whole site, so it stays
cache-warm when a visitor switches language.

---

## Why it's fast

Lighthouse, mobile preset, against a server configured like GitHub Pages
(gzip + cache headers) — **both** language trees:

| Category | Монгол `/` | English `/en/` |
|---|---|---|
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |

LCP 0.9–1.0s · CLS 0 · ~16 kB first view over 2 requests

The decisions that get you there:

- **Static HTML in the right language.** Both trees are pre-rendered, so LCP is
  bounded by one network round trip and crawlers get real markup — not an empty
  div that JavaScript fills in.
- **The language toggle is a plain `<a href>`.** No JavaScript, no flash of the
  wrong language, works with JS off.
- **CSS inlined** into `<head>` — no render-blocking stylesheet request.
- **System font stack** — no font download, no layout shift on swap.
- **No framework, no bundler, no dependencies.**

## Progressive enhancement

Worth knowing before you change any of it:

- The **theme toggle** is applied by a tiny inline script before first paint, so
  there's no flash of the wrong colours. Blocked `localStorage` falls back to
  the OS preference.
- The **scroll reveal** hides elements only once JS has confirmed it's running —
  and a watchdog un-hides everything if `main.js` fails to load, so a broken
  script can never leave the page blank.
- The **rotating hero text** is server-rendered with its first word in place,
  and doesn't animate under `prefers-reduced-motion`. Its width is reserved at
  build time from the longest word, so the line never reflows.
- The **contact form** is a real `<form>` with a real `action`. `fetch` just
  makes it nicer; with JS off it submits normally. Its messages are localised
  through the config blob, falling back to English if that fails to parse.

---

## SEO across two languages

Handled automatically, but the rules are easy to break by hand:

- Every page declares reciprocal `hreflang` alternates. **If a post exists in
  only one language it declares only itself** — a one-sided annotation makes
  Google discard the whole cluster, not just the bad edge. `npm run check`
  enforces reciprocity.
- `x-default` points at English, which is what a visitor matching neither
  language is most likely to read.
- One `sitemap.xml` covers both trees with `xhtml:link` alternates (and the
  `xmlns:xhtml` declaration they require, without which the file is malformed).
- Per-language RSS feeds, `og:locale` / `og:locale:alternate`, and a social card
  rendered in each language.
- The 404 is `noindex` with no canonical, because GitHub Pages serves that one
  file at arbitrary URLs. It shows **both** languages, since it cannot know
  which tree the visitor came from.

---

## Adding a third language

1. Add an entry to `LOCALES` in `src/i18n.js` (code, prefix, label, htmlLang,
   ogLocale) and a matching block in the `UI` table.
2. Add that key to the pairs in `content.js`. Missing keys fall back and are
   reported — they don't break the build.
3. Name post files `<name>.<code>.md`.
4. Add the new output directory to `.gitignore` (it's generated output).

Everything else — routing, hreflang, sitemap, feeds, the toggle — follows.

---

## Moving to a custom domain

In `content.js`:

```js
url: "https://yourdomain.com",
basePath: "",                   // no subfolder at the domain root
```

Do **not** put the language in `basePath` — the build adds `/en/` itself.

Then add a `public/CNAME` file containing `yourdomain.com`, point your DNS at
GitHub Pages, and push.

---

## Deploying elsewhere

The output is plain static files, so any host works:

- **Netlify / Vercel / Cloudflare Pages** — build command `node build.js`,
  publish directory `.`
- **Any static host** — run `npm run build` and upload the repo root

Set `basePath: ""` for any host that serves from the domain root.
