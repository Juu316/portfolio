# Portfolio

A developer portfolio built as a static site with **zero dependencies**.
`npm install` does nothing, because there is nothing to install.

Live at **https://juu316.github.io/portfolio/**

---

## Quick start

```bash
npm run dev     # http://localhost:3000 — rebuilds as you edit
npm run build   # write the static site into the repo root
npm run check   # build, then validate SEO / a11y / links / performance
```

Node 18 or newer. No other tooling required.

---

## The five-minute personalisation

Everything you need to change is marked `TODO`. The build prints how many
are left every time it runs.

1. **`content.js`** — your name, role, projects, story, skills, links.
   This one file drives the entire site.
2. **`posts/*.md`** — your writing. Delete the two template posts.
3. **Contact form** — get a free key at [web3forms.com](https://web3forms.com)
   and paste it into `contact.web3formsKey`. Until then the form shows a
   friendly "not connected yet" notice rather than failing silently.
4. **`public/resume.pdf`** — drop it in and the Resume button appears. Leave
   it out and the button is hidden automatically (never a dead link).

Then:

```bash
npm run check && git add -A && git commit -m "Personalise portfolio" && git push
```

Pushing to `main` deploys automatically.

---

## Writing a post

Create `posts/my-post.md`:

```markdown
---
title: The thing I learned
description: One sentence that makes someone want to read it.
date: 2026-09-01
tags: [postgres, performance]
---

Your content here. **Bold**, `code`, [links](https://example.com),
lists, tables, blockquotes and fenced code blocks all work.
```

- The filename becomes the URL (`posts/001-my-post.md` → `/blog/my-post/`;
  a leading `NN-` is stripped so you can control ordering).
- `draft: true` keeps a post out of the build entirely — no page, no
  sitemap entry, no RSS item.
- Posts are sorted newest-first and appear on the homepage, `/blog/`, the
  sitemap and `feed.xml` automatically.

---

## How it works

```
content.js       all site copy, one object
posts/*.md       blog posts with frontmatter
public/          your assets — copied to the root last, so they override
                 anything generated (og.png, favicon.svg, resume.pdf…)

build.js         reads the above, writes the static site
check.js         validates the output; CI fails if this fails
serve.js         dev server + file watcher

src/styles.css   the stylesheet (inlined into every page at build time)
src/main.js      the only client-side script (deferred, ~4 kB gzipped)
src/templates.js page templates
src/markdown.js  markdown renderer
src/og.js        social-preview PNG generator
```

Everything in the repo root except those files is **generated output** —
`index.html`, `blog/`, `404.html`, `main.js`, `sitemap.xml`, `robots.txt`,
`feed.xml`, `og.png`, `favicon.svg`, `apple-touch-icon.png`,
`site.webmanifest`. Safe to delete; `npm run build` recreates them.

They're committed so the site works even if CI is down, and regenerated on
every deploy so they can't drift.

---

## Why it's fast

Measured with Lighthouse against a server configured like GitHub Pages
(gzip + cache headers), mobile preset:

| Category | Score |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

FCP 1.0s · LCP 1.3s · TBT 20ms · CLS 0 · **15 kB total transfer**

The decisions that get you there:

- **Static HTML.** Hero text is in the initial response, so LCP is bounded
  by one network round trip, not by a JavaScript bundle.
- **CSS inlined** into `<head>` — no render-blocking stylesheet request.
- **System font stack** — no font download, and no layout shift on swap.
- **One deferred script**, ~4 kB gzipped.
- **No framework, no bundler, no dependencies.**

## Progressive enhancement

Every interactive piece degrades cleanly, which is worth knowing before you
change any of it:

- The **theme toggle** is applied by a tiny inline script before first paint,
  so there's no flash of the wrong colours. Blocked `localStorage` falls back
  to the OS preference.
- The **scroll reveal** hides elements only once JS has confirmed it's
  running — and a watchdog un-hides everything if `main.js` fails to load, so
  a broken script can never leave the page blank.
- The **rotating hero text** is server-rendered with its first word in place,
  and doesn't animate under `prefers-reduced-motion`.
- The **contact form** is a real `<form>` with a real `action`. `fetch` just
  makes it nicer; with JS off it submits normally.

---

## Moving to a custom domain

In `content.js`:

```js
url: "https://yourdomain.com",
basePath: "",                   // no subfolder at the domain root
```

Then add a `public/CNAME` file containing `yourdomain.com`, point your DNS
at GitHub Pages, and push. Canonical tags, the sitemap, the RSS feed and
every internal link follow `basePath` automatically.

---

## Deploying elsewhere

The output is plain static files, so any host works:

- **Netlify / Vercel** — build command `node build.js`, publish directory `.`
- **Cloudflare Pages** — same
- **Any static host** — run `npm run build` and upload the repo root

Set `basePath: ""` for any host that serves from the domain root.
