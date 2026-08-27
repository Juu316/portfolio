/**
 * HTML templates.
 *
 * Every page is rendered to static HTML at build time — nothing here runs in
 * the browser. That's what keeps the SEO honest (crawlers get real markup,
 * not an empty div) and the Lighthouse performance score high.
 */
import { escapeHtml } from "./markdown.js";

/* --------------------------------------------------------------------------
 * Icons — inlined so there are no extra requests and no icon-font flash.
 * ------------------------------------------------------------------------ */
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  github: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true" class="icon-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true" class="icon-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  external: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>`,
  download: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><path d="M12 3v12M7 11l5 5 5-5M4 21h16"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" ${STROKE} aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
};

/* --------------------------------------------------------------------------
 * Small helpers
 * ------------------------------------------------------------------------ */

/** Prefix an internal path with the deployment base path. */
export function url(ctx, path = "/") {
  const base = ctx.site.basePath.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}` || "/";
}

/** Absolute URL, for canonical tags, OG tags, sitemap and feed. */
export function absoluteUrl(ctx, path = "/") {
  const origin = ctx.site.url.replace(/\/$/, "");
  const base = ctx.site.basePath.replace(/\/$/, "");
  // site.url may already include the base path — don't double it up.
  const withoutBase = origin.endsWith(base) && base ? origin.slice(0, -base.length) : origin;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${withoutBase}${base}${clean}`;
}

export function formatDate(iso, lang = "en") {
  const date = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === "en" ? "en-GB" : lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** True when a content field is still an unfilled placeholder. */
function isPlaceholder(value) {
  return typeof value === "string" && /^TODO/i.test(value.trim());
}

/* --------------------------------------------------------------------------
 * Document shell
 * ------------------------------------------------------------------------ */
function head(ctx, page) {
  const { site } = ctx;
  const title = page.title;
  const description = page.description || site.description;
  const canonical = absoluteUrl(ctx, page.path);
  const ogImage = absoluteUrl(ctx, "/og.png");

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta name="author" content="${escapeHtml(site.name)}">
<meta name="keywords" content="${escapeHtml(site.keywords.join(", "))}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#fcfcfd" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0c0d11" media="(prefers-color-scheme: dark)">

<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${escapeHtml(site.name)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(site.name)} — ${escapeHtml(site.role)}">
<meta property="og:locale" content="en_US">
${page.publishedTime ? `<meta property="article:published_time" content="${page.publishedTime}">` : ""}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" href="${url(ctx, "/favicon.svg")}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${url(ctx, "/apple-touch-icon.png")}">
<link rel="manifest" href="${url(ctx, "/site.webmanifest")}">
<link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.name)} — Writing" href="${absoluteUrl(ctx, "/feed.xml")}">

<style>${ctx.css}</style>

<script>
/* Two jobs, both of which must happen before first paint:
   1. Apply the saved theme, so there is no flash of the wrong colours.
   2. Add the "js" class, which is what lets the scroll-reveal CSS hide
      elements. The watchdog removes it again if main.js has not booted
      within 2.5s, so a failed script can never leave the page blank. */
(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){d.setAttribute("data-theme",t)}}catch(e){}d.className+=" js";setTimeout(function(){if(!window.__booted){d.className=d.className.replace(/\\bjs\\b/," ")}},2500)})();
</script>

<script type="application/ld+json">${JSON.stringify(page.schema)}</script>`;
}

function header(ctx, { activeHref } = {}) {
  const { site, nav } = ctx;

  const links = nav
    .map((item) => {
      // On sub-pages, in-page anchors need to point back at the homepage.
      const href = item.href.startsWith("#") && !ctx.isHome ? url(ctx, "/") + item.href : item.href;
      const current = activeHref === item.href ? ' aria-current="true"' : "";
      return `<li><a class="nav-link" href="${href}"${current}>${escapeHtml(item.label)}</a></li>`;
    })
    .join("");

  return `<header class="header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="${url(ctx, "/")}"><span class="brand-dot"></span>${escapeHtml(site.shortName)}</a>
    <nav class="nav" aria-label="Main">
      <ul class="nav-list" data-nav-list id="nav-list">${links}</ul>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch theme">${icons.sun}${icons.moon}</button>
      <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="nav-list" aria-label="Open menu">${icons.menu}</button>
    </nav>
  </div>
</header>`;
}

function footer(ctx) {
  const { site, social } = ctx;
  const year = ctx.buildYear;

  const links = social
    .filter((item) => item.href)
    .map(
      (item) =>
        `<li><a class="social-link" href="${escapeHtml(item.href)}" aria-label="${escapeHtml(
          item.name
        )}"${item.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${
          icons[item.icon] || icons.external
        }</a></li>`
    )
    .join("");

  return `<footer class="footer">
  <div class="wrap footer-inner">
    <p>&copy; ${year} ${escapeHtml(site.name)}</p>
    <ul class="footer-links">${links}</ul>
  </div>
</footer>`;
}

/** Wrap page content in the full HTML document. */
export function layout(ctx, page, body) {
  return `<!doctype html>
<html lang="${ctx.site.lang}">
<head>
${head(ctx, page)}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header(ctx, { activeHref: page.activeHref })}
<main id="main">
${body}
</main>
${footer(ctx)}
<script type="application/json" id="site-config">${JSON.stringify(ctx.clientConfig)}</script>
<script src="${url(ctx, "/main.js")}" defer></script>
</body>
</html>`;
}

/* --------------------------------------------------------------------------
 * Homepage sections
 * ------------------------------------------------------------------------ */
function heroSection(ctx) {
  const { hero, site, social } = ctx;

  const badge = hero.eyebrow
    ? `<p class="hero-badge"><span class="hero-badge-dot"></span>${escapeHtml(
        hero.eyebrow.replace(/^TODO:?\s*/i, "")
      )}</p>`
    : "";

  const resume =
    hero.resume && hero.resume.file
      ? `<a class="btn btn-ghost" href="${url(ctx, "/" + hero.resume.file)}">${
          icons.download
        }${escapeHtml(hero.resume.label)}</a>`
      : "";

  const socialLinks = social
    .filter((item) => item.href)
    .map(
      (item) =>
        `<a class="social-link" href="${escapeHtml(item.href)}" aria-label="${escapeHtml(
          item.name
        )}"${item.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${
          icons[item.icon] || icons.external
        }</a>`
    )
    .join("");

  // The first rotating word is server-rendered, so it's visible with JS off
  // and for anyone who prefers reduced motion.
  const firstWord = hero.rotatingWords[0] || "";

  return `<section class="hero wrap" aria-labelledby="hero-title">
  ${badge}
  <h1 class="hero-title" id="hero-title">${escapeHtml(hero.headline.replace(/^TODO:?\s*/i, ""))}</h1>
  <p class="hero-rotator">
    <span>${escapeHtml(hero.rotatingPrefix)}</span>
    <span class="rotator-word" data-rotator>${escapeHtml(firstWord)}</span>
  </p>
  <p class="hero-intro">${escapeHtml(hero.intro.replace(/^TODO:?\s*/i, ""))}</p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="${hero.primaryCta.href}">${escapeHtml(
    hero.primaryCta.label
  )}${icons.arrowRight}</a>
    <a class="btn btn-secondary" href="${hero.secondaryCta.href}">${escapeHtml(
    hero.secondaryCta.label
  )}</a>
    ${resume}
  </div>
  <div class="hero-social">${socialLinks}</div>
</section>`;
}

function projectCard(ctx, project) {
  const stack = project.stack.length
    ? `<ul class="stack" aria-label="Tech stack">${project.stack
        .map((tech) => `<li>${escapeHtml(tech)}</li>`)
        .join("")}</ul>`
    : "";

  const metrics = project.metrics.length
    ? `<ul class="metrics" aria-label="Impact metrics">${project.metrics
        .map(
          (metric) =>
            `<li><span class="metric-value" data-placeholder="${isPlaceholder(
              metric.value
            )}">${escapeHtml(metric.value)}</span><span class="metric-label">${escapeHtml(
              metric.label
            )}</span></li>`
        )
        .join("")}</ul>`
    : "";

  const links = [];
  if (project.demo) {
    links.push(
      `<a class="project-link" href="${escapeHtml(
        project.demo
      )}" target="_blank" rel="noopener noreferrer">${icons.external}Live demo<span class="hp"> for ${escapeHtml(
        project.title
      )}</span></a>`
    );
  }
  if (project.repo) {
    links.push(
      `<a class="project-link" href="${escapeHtml(
        project.repo
      )}" target="_blank" rel="noopener noreferrer">${icons.github}Source<span class="hp"> for ${escapeHtml(
        project.title
      )}</span></a>`
    );
  }
  const linksHtml = links.length ? `<div class="project-links">${links.join("")}</div>` : "";

  const meta = [
    project.status ? `<span class="project-status">${escapeHtml(project.status)}</span>` : "",
    project.year ? `<span>${escapeHtml(project.year)}</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  const left = `<div class="project-head">
      <h3 class="project-title">${escapeHtml(project.title.replace(/^TODO:?\s*/i, ""))}</h3>
      <div class="project-meta">${meta}</div>
    </div>
    <p class="project-tagline">${escapeHtml(project.tagline.replace(/^TODO:?\s*/i, ""))}</p>
    <p class="project-desc">${escapeHtml(project.description.replace(/^TODO:?\s*/i, ""))}</p>
    ${stack}`;

  // Featured cards split into two columns on wide screens.
  if (project.featured) {
    return `<article class="project project-featured reveal">
  <div class="project-body">${left}</div>
  <div class="project-side">${metrics}${linksHtml}</div>
</article>`;
  }

  return `<article class="project reveal">${left}${metrics}${linksHtml}</article>`;
}

function projectsSection(ctx) {
  const featured = ctx.projects.filter((p) => p.featured);
  const rest = ctx.projects.filter((p) => !p.featured);

  return `<section class="section" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="eyebrow">Selected work</p>
        <h2 class="section-title" id="work-title">Projects</h2>
      </div>
      <p class="section-blurb">Things I've designed, built and shipped. Numbers are real outcomes, not vanity metrics.</p>
    </div>
    <div class="project-grid">
      ${[...featured, ...rest].map((project) => projectCard(ctx, project)).join("\n      ")}
    </div>
  </div>
</section>`;
}

function aboutSection(ctx) {
  const { about } = ctx;

  const paragraphs = about.paragraphs
    .map((text) => `<p>${escapeHtml(text.replace(/^TODO:?\s*/i, ""))}</p>`)
    .join("");

  const skills = about.skills.length
    ? `<ul class="skills">${about.skills
        .map(
          (group) =>
            `<li><h3 class="skill-group-name">${escapeHtml(
              group.group
            )}</h3><ul class="stack">${group.items
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}</ul></li>`
        )
        .join("")}</ul>`
    : "";

  const timeline = about.timeline.length
    ? `<ol class="timeline">${about.timeline
        .map(
          (entry) => `<li>
        <div class="timeline-period">${escapeHtml(entry.period)}</div>
        <div>
          <h3 class="timeline-title">${escapeHtml(entry.title.replace(/^TODO:?\s*/i, ""))}</h3>
          <p class="timeline-org">${escapeHtml(entry.org.replace(/^TODO:?\s*/i, ""))}</p>
          <p class="timeline-detail">${escapeHtml(entry.detail.replace(/^TODO:?\s*/i, ""))}</p>
        </div>
      </li>`
        )
        .join("")}</ol>`
    : "";

  return `<section class="section" id="about" aria-labelledby="about-title">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="eyebrow">Background</p>
        <h2 class="section-title" id="about-title">${escapeHtml(about.heading)}</h2>
      </div>
    </div>
    <div class="about-grid">
      <div class="about-prose reveal">${paragraphs}</div>
      <div class="reveal">${skills}</div>
    </div>
    ${timeline}
  </div>
</section>`;
}

function postListItem(ctx, post) {
  const tags = post.tags.length
    ? `<ul class="post-tags">${post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
    : "";

  return `<li class="post-item">
  <a class="post-link" href="${url(ctx, post.path)}">
    <time class="post-date" datetime="${post.date}">${formatDate(post.date, ctx.site.lang)}</time>
    <div>
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <p class="post-desc">${escapeHtml(post.description)}</p>
      ${tags}
    </div>
    <span class="post-arrow" aria-hidden="true">${icons.arrowRight}</span>
  </a>
</li>`;
}

function writingSection(ctx) {
  const { writing, posts } = ctx;
  const shown = posts.slice(0, writing.homepageCount);

  const body = shown.length
    ? `<ul class="post-list">${shown.map((post) => postListItem(ctx, post)).join("")}</ul>`
    : `<p class="empty-note">No posts yet. Add a markdown file to <code>posts/</code> and it'll appear here.</p>`;

  const more =
    posts.length > shown.length
      ? `<div style="margin-top:1.75rem"><a class="btn btn-secondary" href="${url(
          ctx,
          "/blog/"
        )}">All ${posts.length} posts${icons.arrowRight}</a></div>`
      : "";

  return `<section class="section" id="writing" aria-labelledby="writing-title">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="eyebrow">Notes</p>
        <h2 class="section-title" id="writing-title">${escapeHtml(writing.heading)}</h2>
      </div>
      <p class="section-blurb">${escapeHtml(writing.blurb)}</p>
    </div>
    <div class="reveal">${body}${more}</div>
  </div>
</section>`;
}

function contactSection(ctx) {
  const { contact, site, social } = ctx;

  const direct = [
    site.email
      ? `<a href="mailto:${escapeHtml(site.email)}">${icons.mail}${escapeHtml(site.email)}</a>`
      : "",
    ...social
      .filter((item) => item.href && item.icon !== "mail")
      .map(
        (item) =>
          `<a href="${escapeHtml(
            item.href
          )}" target="_blank" rel="noopener noreferrer">${icons[item.icon] || icons.external}${escapeHtml(
            item.name
          )}</a>`
      ),
  ]
    .filter(Boolean)
    .join("");

  return `<section class="section" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="eyebrow">Contact</p>
        <h2 class="section-title" id="contact-title">${escapeHtml(contact.heading)}</h2>
      </div>
    </div>
    <div class="contact-grid">
      <div class="contact-aside reveal">
        <p>${escapeHtml(contact.blurb.replace(/^TODO:?\s*/i, ""))}</p>
        <div class="contact-direct">${direct}</div>
      </div>

      <form class="form reveal" data-contact-form action="https://api.web3forms.com/submit" method="POST">
        <input type="hidden" name="access_key" value="${escapeHtml(contact.web3formsKey)}">
        <input type="hidden" name="subject" value="${escapeHtml(contact.subject)}">
        <input type="hidden" name="from_name" value="${escapeHtml(site.name)} portfolio">
        <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">

        <div class="field">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" required autocomplete="name" placeholder="Jane Doe" maxlength="100">
          <span class="field-error" role="alert"></span>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required autocomplete="email" placeholder="jane@company.com" maxlength="150">
          <span class="field-error" role="alert"></span>
        </div>

        <div class="field">
          <label for="message">Message <span class="hint">— what's the role, or what are you building?</span></label>
          <textarea id="message" name="message" required placeholder="Hi! We're hiring for…" maxlength="3000"></textarea>
          <span class="field-error" role="alert"></span>
        </div>

        <p class="form-status" data-form-status role="status" aria-live="polite"></p>

        <button class="btn btn-primary" type="submit"><span class="spinner" aria-hidden="true"></span>Send message</button>
      </form>
    </div>
  </div>
</section>`;
}

export function homePage(ctx) {
  const body = [
    heroSection(ctx),
    projectsSection(ctx),
    aboutSection(ctx),
    writingSection(ctx),
    contactSection(ctx),
  ].join("\n");

  const page = {
    title: `${ctx.site.name} — ${ctx.site.role}`,
    description: ctx.site.description.replace(/^TODO:?\s*/i, ""),
    path: "/",
    activeHref: null,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": absoluteUrl(ctx, "/#person"),
          name: ctx.site.name,
          alternateName: ctx.site.shortName,
          jobTitle: ctx.site.role,
          email: `mailto:${ctx.site.email}`,
          url: absoluteUrl(ctx, "/"),
          image: absoluteUrl(ctx, "/og.png"),
          address: { "@type": "PostalAddress", addressLocality: ctx.site.location },
          knowsAbout: ctx.site.keywords,
          sameAs: ctx.social.filter((s) => s.href && s.href.startsWith("http")).map((s) => s.href),
        },
        {
          "@type": "WebSite",
          "@id": absoluteUrl(ctx, "/#website"),
          url: absoluteUrl(ctx, "/"),
          name: `${ctx.site.name} — ${ctx.site.role}`,
          description: ctx.site.description.replace(/^TODO:?\s*/i, ""),
          publisher: { "@id": absoluteUrl(ctx, "/#person") },
          inLanguage: ctx.site.lang,
        },
      ],
    },
  };

  return layout(ctx, page, body);
}

/* --------------------------------------------------------------------------
 * Blog index
 * ------------------------------------------------------------------------ */
export function blogIndexPage(ctx) {
  const body = `<section class="section" style="border-top:0" aria-labelledby="blog-title">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="eyebrow">Notes</p>
        <h1 class="section-title" id="blog-title">${escapeHtml(ctx.writing.heading)}</h1>
      </div>
      <p class="section-blurb">${escapeHtml(ctx.writing.blurb)}</p>
    </div>
    ${
      ctx.posts.length
        ? `<ul class="post-list">${ctx.posts.map((post) => postListItem(ctx, post)).join("")}</ul>`
        : `<p class="empty-note">No posts yet. Add a markdown file to <code>posts/</code> and it'll appear here.</p>`
    }
    <div style="margin-top:2.5rem">
      <a class="back-link" href="${url(ctx, "/")}">${icons.arrowLeft}Back home</a>
    </div>
  </div>
</section>`;

  const page = {
    title: `Writing — ${ctx.site.shortName}`,
    description: ctx.writing.blurb,
    path: "/blog/",
    activeHref: "#writing",
    schema: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${ctx.site.name} — Writing`,
      url: absoluteUrl(ctx, "/blog/"),
      author: { "@type": "Person", name: ctx.site.name },
      blogPost: ctx.posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.date,
        url: absoluteUrl(ctx, post.path),
      })),
    },
  };

  return layout(ctx, page, body);
}

/* --------------------------------------------------------------------------
 * Blog post
 * ------------------------------------------------------------------------ */
export function postPage(ctx, post) {
  const tags = post.tags.length
    ? `<ul class="post-tags">${post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
    : "";

  const body = `<article class="article wrap">
  <div class="article-inner">
    <header class="article-header">
      <a class="back-link" href="${url(ctx, "/blog/")}">${icons.arrowLeft}All writing</a>
      <h1 class="article-title">${escapeHtml(post.title)}</h1>
      <div class="article-meta">
        <time datetime="${post.date}">${formatDate(post.date, ctx.site.lang)}</time>
        <span aria-hidden="true">·</span>
        <span>${post.readingTime} min read</span>
      </div>
      ${tags}
    </header>

    <div class="article-body">
${post.html}
    </div>

    <footer class="article-footer">
      <a class="back-link" href="${url(ctx, "/blog/")}">${icons.arrowLeft}All writing</a>
      <a class="btn btn-secondary" href="${url(ctx, "/")}#contact">Get in touch</a>
    </footer>
  </div>
</article>`;

  const page = {
    title: `${post.title} — ${ctx.site.shortName}`,
    description: post.description,
    path: post.path,
    activeHref: "#writing",
    ogType: "article",
    publishedTime: post.date,
    schema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      url: absoluteUrl(ctx, post.path),
      mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(ctx, post.path) },
      image: absoluteUrl(ctx, "/og.png"),
      keywords: post.tags.join(", "),
      wordCount: post.wordCount,
      inLanguage: ctx.site.lang,
      author: {
        "@type": "Person",
        name: ctx.site.name,
        url: absoluteUrl(ctx, "/"),
      },
      publisher: { "@type": "Person", name: ctx.site.name },
    },
  };

  return layout(ctx, page, body);
}

/* --------------------------------------------------------------------------
 * 404
 * ------------------------------------------------------------------------ */
export function notFoundPage(ctx) {
  const body = `<section class="section wrap" style="border-top:0;text-align:center">
  <p class="eyebrow">Error 404</p>
  <h1 class="hero-title" style="margin-inline:auto;margin-top:.75rem">This page doesn't exist.</h1>
  <p class="hero-intro" style="margin-inline:auto">The link may be out of date, or the page may have moved. The work is all still on the homepage.</p>
  <div class="hero-actions" style="justify-content:center">
    <a class="btn btn-primary" href="${url(ctx, "/")}">Back home${icons.arrowRight}</a>
    <a class="btn btn-secondary" href="${url(ctx, "/blog/")}">Read the writing</a>
  </div>
</section>`;

  return layout(ctx, {
    title: `Page not found — ${ctx.site.shortName}`,
    description: "The page you were looking for doesn't exist.",
    path: "/404.html",
    activeHref: null,
    schema: { "@context": "https://schema.org", "@type": "WebPage", name: "Page not found" },
  }, body);
}
