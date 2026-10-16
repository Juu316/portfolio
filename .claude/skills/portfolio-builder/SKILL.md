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

- **Palette:** dark by default, light on request. Dark: paper `#0C1226`,
  surface `#151D38`, ink `#EDEAE2`, muted `#97A0BC`, rule `#24305A`. Light
  (`:root[data-theme="light"]`): paper `#F2F4F9`, surface `#FFFFFF`, ink
  `#0C1226`, muted `#4A5470`, rule `#D3D9E8`. `--signal` (green) is the
  "online" dot only, never a project colour.
- **Project accents** are the projects' real brand colours, adjusted until
  they pass WCAG AA on each paper. Dark: GTC `#4CC3F7`, Shuren `#D4A38A`,
  Orchuulga `#3CD3A9`. Light: GTC `#0A6A9C`, Shuren `#8F5338`, Orchuulga
  `#0A7356`. An accent appears only inside its project's context
  (`--accent` set on the element), including the client links in the hero
  sentence and the domains in the hero terminal.
- **Type:** Geologica for everything, self-hosted from the `-shrp-` files
  (weight + sharpness axes). Body at weight 380 with `"SHRP" 0`; `.display`
  (names, project titles, the hero sentence) at 750 with `"SHRP" 100`. It
  covers Mongolian Cyrillic including Ө/Ү (Golos Text was the previous face;
  Unbounded was dropped because it lacks them). Mongolian is the root locale,
  so check every heading in Cyrillic first. The system monospace
  (`--font-code`) is for the hero terminal and inline code only.
- **Theme:** `Base.astro` applies the saved choice (`localStorage.theme`)
  before paint; the header button flips it. Without JS the site is dark.
- **Header:** a floating bar after ihzorig.vercel.app's: brand dot + short
  name, section links, EN|MN segmented switch, theme and crewmate toggles,
  "View CV" (opens the PDF in a new tab) and "Contact" pill buttons. It is bare at the top and turns
  into a glass pill over the first 80px of scroll (CSS scroll timeline).
  Below 72rem the links, CV and contact move into a `<details>` menu.
- **Do not add:** all-caps eyebrows, 01/02/03 markers on content that isn't a
  sequence, gradient washes on content (the site sky is the one exception),
  glass panels other than the header bar, identical card grids, `→` appended
  to links, or a mono font for labels. Borders and radii only on screenshot
  frames, the hero terminal, form fields, pill buttons and the GitHub
  calendar box. Never copy text,
  photos or invented metrics from a reference site.
- **GitHub calendar** (`GithubActivity.astro`): owner asked for GitHub's own
  look, so it uses GitHub's calendar greens (`--gh-0..4`, scoped to the
  component), not `--signal`, and GitHub's language colours in the language
  bar. Data is read at build time: GraphQL with `GITHUB_TOKEN` (CI passes the
  built-in token; locally `GITHUB_TOKEN=$(gh auth token)`) for the calendar,
  the year's totals and languages; without a token, only the calendar, from
  the public `github.com/users/<login>/contributions` HTML.
- **Sky:** the page background is `SpaceBackground.astro`, chosen by the
  owner: a canvas port of Aceternity's "Shooting Stars and Stars Background"
  with a twinkling star field and many shooting stars at once. It pauses
  when the tab is hidden, draws a still star field with no shooting stars
  under reduced motion, and leaves the plain paper colour without JS. In light
  mode the canvas is hidden and its loop stops.
- **Motion:** chosen by the owner, CSS-only (no client JS added), all of it
  behind `prefers-reduced-motion: no-preference` (the header's glass fade is
  a state change, not motion, and runs for everyone):
  - the sky;
  - cross-document view transitions (`@view-transition` in `global.css`),
    with each project's title and cover morphing between the index and its
    case study (`title-<slug>` / `cover-<slug>`; names must stay unique per
    page);
  - a staggered entrance on load (`.enter` + `--i`);
  - scroll reveals via `animation-timeline: view()` (`.reveal`), and the
    timeline rail drawing in;
  - interaction feedback: the project-index crossfade, the mobile menu
    panel, hover underlines and nudges; the hero terminal's blinking caret.
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

- No framework runtime on the client. Total client JS is at most 5 KB and
  limited to progressive enhancement. The site works with JS off. Current
  scripts: the sky, the crewmate cursor, the theme (pre-paint + toggle), the
  menu close and the contact copy buttons — about 4.6 KB inline on the
  homepage (2026-10-14), so there is little room left; measure the inline
  `<script>` bytes in `dist/en/index.html` after each build.
- Images only through `astro:assets` (`<Picture>` AVIF/WebP) with explicit
  `widths`/`sizes`. The hero/LCP image gets `loading="eager"` + `fetchpriority="high"`.
- Fonts are self-hosted via fontsource; preload only the Cyrillic and Latin
  files that the first screen uses.

## 6. Screenshots

- Capture with `pnpm run capture [project]`. The output goes to
  `src/assets/projects/<slug>/`.
- Review every new image. Reject anything that shows placeholder products
  (Shuren has a "test" item at 100₮), placeholder phone numbers, personal data
  or third-party ads.

## 7. Testing and review before calling anything done

Run each of these and report the real output:

```
pnpm run check      # astro check (types + .astro diagnostics)
pnpm run build
pnpm run lint       # prettier --check
pnpm test           # Playwright: routes, links, axe, overflow, keyboard, SEO
```

Then screenshot the homepage and one case study at 390 and 1440 and look at
them before claiming a visual change is finished.
