---
name: portfolio-builder
description: Rules for building and editing this portfolio (Astro, MN/EN, three client case studies). Use for any change to pages, components, styles, project copy, screenshots or tests in this repo, and before writing any claim about B2C, Shuren or Orchuulga.
---

# Portfolio builder

This site's job is to show credible engineering work. A beautiful page that
overstates something gets caught in the first interview, so content accuracy
outranks everything below it.

## 1. Content verification (non-negotiable)

- Every factual claim about a project needs a source: a repo path, a commit,
  a doc in that repo, or the live URL. Keep the source in an MDX comment next
  to the claim: `{/* src: nova/shared/src/stock.ts */}`.
- Numbers must be **counted or run**, and say which. "656 of 659 tests pass"
  is a run; "262 test cases" is a count. Never write "all tests pass" unless a
  run in this session proved it. No users, revenue, speed-ups or uptime
  unless the owner supplies them.
- Credit others. B2C was built with a second developer (ganaabna), who led
  Golomt card payments and the early e-commerce flows. Say "I" only for what
  git authorship supports.
- The project repos are client code. **No source links**, no secrets, no
  customer data, no internal admin screenshots containing real people.
- Anything about the owner (bio, availability, skills) comes from the owner.
  Until they supply it, leave a visible `TODO(owner)` in `src/data/site.ts`;
  never invent copy to fill the gap.
- MN and EN say the same thing. Change one, change the other in the same edit.

## 2. Design system

Tokens live in `src/styles/tokens.css`; components never hard-code colour,
type size or spacing.

- **Palette:** the site is dark only. Paper `#12161F`, surface `#1A1F2B`,
  ink `#E7E9EE`, muted `#9AA2B1`, rule `#2A3140`.
- **Project accents** are the projects' real brand colours, lightened until
  they pass WCAG AA on paper: GTC `#4CC3F7`, Shuren `#D4A38A`, Orchuulga
  `#3CD3A9`. An accent appears only inside its project's context
  (`--accent` set on the element).
- **Type:** Golos Text for everything (display at 700 for names and project
  titles). It covers Mongolian Cyrillic including Ө/Ү; Unbounded was dropped
  because it lacks them. Mongolian is the root locale, so check every heading
  in Cyrillic first.
- **Do not add:** all-caps eyebrows, 01/02/03 markers on content that isn't a
  sequence, gradient washes on content (the site sky is the one exception),
  glass panels, identical card grids, `→` appended to links, or a mono font
  for labels. Borders and radii only on screenshot frames.
- **Sky:** the page background is `SpaceBackground.astro`, chosen by the
  owner: a canvas port of Aceternity's "Shooting Stars and Stars Background"
  with a twinkling star field and many shooting stars at once. It pauses
  when the tab is hidden, draws a still star field with no shooting stars
  under reduced motion, and leaves the plain paper colour without JS.
- **Motion:** chosen by the owner, CSS-only (no client JS added), all of it
  behind `prefers-reduced-motion: no-preference`:
  - the sky;
  - cross-document view transitions (`@view-transition` in `global.css`),
    with each project's title and cover morphing between the index and its
    case study (`title-<slug>` / `cover-<slug>`; names must stay unique per
    page);
  - a staggered entrance on load (`.enter` + `--i`);
  - scroll reveals via `animation-timeline: view()` (`.reveal`);
  - interaction feedback: the project-index crossfade, the sliding tab pill,
    hover underlines and nudges.
    Browsers without support must see the static page; nothing may start
    hidden unless an animation brings it in.

## 3. Case-study structure

`src/content/projects/<slug>/{mn,en}.mdx`. Frontmatter is validated by
`src/content.config.ts`. The body follows:

1. Context: what the product is and who uses it.
2. What I built: the owner's scope, plus credit to others.
3. Decisions: 3–4 `<Decision>` blocks, each one problem → decision → trade-off.
4. Screenshots: `<Shot>` with a caption that says what the image shows.
5. Outcome: verified facts only.

`size: short` (Orchuulga) uses the same order with fewer decisions.

## 4. Responsive and accessibility

- Check at 360, 768, 1024 and 1440 px. No horizontal overflow at any width.
- One `<h1>` per page, no skipped heading levels, landmarks (`header`, `main`,
  `footer`, `nav` with a label).
- Visible `:focus-visible` on every interactive element; a skip link.
- Every image has `alt` describing its content, or `alt=""` if decorative.
- Each page sets `lang` correctly (`mn` / `en`), with `hreflang` alternates.
- Colour contrast is AA or better, including accent text on paper and in dark mode.

## 5. Performance budget

- No framework runtime on the client. Total client JS is at most 5 KB and
  limited to progressive enhancement. The site works with JS off.
- Images only through `astro:assets` (`<Picture>` AVIF/WebP) with explicit
  `widths`/`sizes`. The hero/LCP image gets `loading="eager"` + `fetchpriority="high"`.
- Fonts are self-hosted via fontsource; preload only the Cyrillic and Latin
  files that the first screen uses.

## 6. Screenshots

- Capture with `npm run capture [project]`. The output goes to
  `src/assets/projects/<slug>/`.
- Review every new image. Reject anything that shows placeholder products
  (Shuren has a "test" item at 100₮), placeholder phone numbers, personal data
  or third-party ads.

## 7. Testing and review before calling anything done

Run each of these and report the real output:

```
npm run check      # astro check (types + .astro diagnostics)
npm run build
npm run lint       # prettier --check
npm test           # Playwright: routes, links, axe, overflow, keyboard, SEO
```

Then screenshot the homepage and one case study at 390 and 1440 and look at
them before claiming a visual change is finished.
