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

Redesigned on 2026-10-29 with the taste skill (`design-taste-frontend`,
direction "The page is the object", seed 40748748). The owner chose that the
taste skill's house rules win over the previous design (glass pill header,
hero terminal, shooting-star sky, hairline rules). The working files live in
`.taste-skill/` (git-ignored).

Tokens live in `src/styles/tokens.css`; components never hard-code colour,
type size or spacing.

- **Idea:** the systems that "have to be right" are paperwork, so the page
  is printed stationery on a forest-green ground: the hero is a striped card,
  client work is a pile of folders, own work is a ticket, the timeline is a
  till receipt, About is a letter with a tear-off strip, Contact is a coupon
  and the footer is the back of a postcard. Shaped edges come from
  `src/lib/edges.ts` (`teeth`, `scallops`, `notches`, as `clip-path`);
  perforations are 5px round dots (`--perf`) in the ground colour.
- **Palette** ("Forest and lime"): dark ground `#0F1F10`, ink `#FFFFFF`,
  muted `#A7B1A7`, surface `#1A321B`; sheets `#FFFFFF` with ink `#0F1F10`,
  soft ink `#4A574B`, tone step `#E8EEE5`; field `#000000`; lime `#C6F19D`
  only on small squares (the main action, the stamp mount, selection).
  Light (`:root[data-theme="light"]`): ground `#DDE6D7`, ink `#0F1F10`,
  muted `#3F4D40`, surface `#CBD8C4`, field `#0F1F10`.
- **Project accents** are the clients' real brand colours. `--accent` is the
  fill of the project's folder, tab, ticket and case-study band, always with
  dark ink: GTC `#4CC3F7`, Shuren `#D4A38A`, Orchuulga `#3CD3A9`, Degfim
  `#5C9CE6`, movie `#FFCC00`. `--accent-text` is the AA version on white:
  `#0A6A9C`, `#8F5338`, `#0A7356`, `#1D64B0`, `#8A6100`. Shuren's colour
  trips the inspector's terracotta rule; it is the client's brand, so run
  `inspect.mjs` with `--allow palette-terracotta`.
- **Type:** Onest for everything, self-hosted from fontsource (latin,
  cyrillic, cyrillic-ext; Ө and Ү are in cyrillic-ext). The dealt face,
  General Sans, has no Cyrillic, so it was replaced. Text 400, emphasis 500,
  display 700 at -0.02em, leading 0.95. Five sizes only: `--step--1` to
  `--step-2` plus the giant Expertise word (sized in container units).
  Mongolian is the root locale, so check every heading in Cyrillic first.
  The system monospace is for code in case studies only.
- **Theme:** `Base.astro` applies the saved choice (`localStorage.theme`)
  before paint; the header button flips it. Without JS the site is dark.
- **Header:** a plain bar on the ground: wordmark, section links, MN|EN, theme
  and crewmate toggles, "View CV" (opens the PDF in a new tab) and the lime
  "Contact" button. Below 72rem the links, CV and contact move into a
  `<details>` menu that opens as a white sheet. No glass, no pill.
- **Buttons:** one shape, square and flat. `.btn` takes the ink of what it
  sits on; `.btn.lime` is the main action.
- **Do not add** (the taste house rules, measured by `inspect.mjs`):
  eyebrows or small labels above headings, all-caps tracked labels, 01/02/03
  numbering, thin rules or 1px outlined boxes, gradients, shadows on things
  at rest, glass, rows of identical cards, `→` appended to links, monospace
  outside code, a styled accent word in a headline, more than two lines in
  any headline. The GitHub calendar box is a `data-ui` fragment and keeps
  GitHub's own border and radius. Never copy text, photos or invented
  metrics from a reference site.
- **GitHub calendar** (`GithubActivity.astro`): owner asked for GitHub's own
  look, so it uses GitHub's calendar greens and box colours (`--gh-*`,
  scoped to the component) and GitHub's language colours in the language
  bar. At build time the calendar comes from the public
  `github.com/users/<login>/contributions` HTML (it counts private
  contributions; the CI Actions token can't see them, so GraphQL undercounts),
  with the GraphQL calendar as fallback. GraphQL with `GITHUB_TOKEN` (CI passes
  the owner's `GH_STATS_TOKEN` secret, a classic token with only `read:user`,
  else the built-in token; locally `GITHUB_TOKEN=$(gh auth token)`) adds the year's
  totals and languages. In the browser, the component's script redraws the
  calendar from `github-contributions-api.jogruber.de` (owner's choice; CORS
  open) and shows GitHub's dark day bubble on hover ("3 contributions on
  October 15th."). If that API fails, the build-time calendar stays. Tests mock
  the API; never let them depend on it. It is the page's one live thing.
- **Pictures:** the clients' own screenshots, plus one found photograph: the
  footer stamp, "2024-10-18 Ulaanbaatar 1" by Alexkom000 (CC BY 4.0, Wikimedia
  Commons), credited in the footer imprint. A found picture never stands in
  for a client's product.
- **Motion:** CSS-only (no client JS added), all of it behind
  `prefers-reduced-motion: no-preference`:
  - the hero picture crossfades through the client homepages (24s cycle;
    reduced motion shows the first one only);
  - cross-document view transitions (`@view-transition` in `global.css`),
    with each project's title and cover morphing between the index and its
    case study (`title-<slug>` / `cover-<slug>`; names must stay unique per
    page);
  - a staggered entrance on load (`.enter` + `--i`);
  - scroll reveals via `animation-timeline: view()` (`.reveal`); not on the
    work heading, which the language-switch test uses as its anchor;
  - folders stick into a pile on wide screens (`position: sticky`);
  - interaction feedback: button lift, screenshot zoom on hover, underlines.
  - **Minifier trap:** write `animation-timeline` and `animation-range` in a
    separate, more specific rule from the `animation` shorthand (see
    `.reveal` in `global.css`). In one rule the minifier folds the timeline
    into the shorthand, which browsers reject, and the animation silently
    never runs.
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

- No framework runtime on the client. Total client JS is at most 9 KB (owner
  raised it from 5 KB for the live GitHub calendar, then for the language
  switch) and limited to progressive enhancement. The site works with JS off.
  Current scripts: the crewmate cursor, the theme (pre-paint +
  toggle), the menu close, the in-place language switch (fetches the other
  locale's page and swaps header, main and footer without a reload; scripts
  that bind to swapped elements re-run on the `lang:swap` event), the contact
  copy buttons and the live GitHub calendar with its day bubble — 7.2 KB
  (7377 bytes) inline on the homepage (2026-10-29, after the sky was
  removed); measure the inline `<script>`
  bytes in `dist/en/index.html` after each build.
- Images only through `astro:assets` (`<Picture>` AVIF/WebP) with explicit
  `widths`/`sizes`. The hero/LCP image gets `loading="eager"` + `fetchpriority="high"`.
- Fonts are self-hosted via fontsource; preload only the Cyrillic and Latin
  files that the first screen uses.

## 6. Screenshots

- Capture with `bun run capture [project]`. The output goes to
  `src/assets/projects/<slug>/`.
- Review every new image. Reject anything that shows placeholder products
  (Shuren has a "test" item at 100₮), placeholder phone numbers, personal data
  or third-party ads.

## 7. Testing and review before calling anything done

Run each of these and report the real output:

```
bun run check      # astro check (types + .astro diagnostics)
bun run build
bun run lint       # prettier --check
bun run test       # Playwright: routes, links, axe, overflow, keyboard, SEO
```

Then screenshot the homepage and one case study at 390 and 1440 and look at
them before claiming a visual change is finished. For visual changes also run
the taste inspector on the built site (`bun run build && bun run preview`):
`node ~/.agents/skills/design-taste-frontend/scripts/inspect.mjs <url> --allow palette-terracotta`.
