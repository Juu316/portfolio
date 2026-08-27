/**
 * ============================================================================
 *  EDIT THIS FILE — everything on the site comes from here.
 * ============================================================================
 *
 *  Search for "TODO" to find every placeholder you need to replace.
 *  Run `npm run build` (or `npm run dev`) to see changes.
 *
 *  Blog posts are NOT here — they live as markdown files in ./posts/
 * ============================================================================
 */

export const site = {
  // ---------------------------------------------------------------------
  // DEPLOYMENT PATHS
  // ---------------------------------------------------------------------
  // Your repo is Juu316/portfolio, so GitHub Pages serves it from a
  // subfolder: https://juu316.github.io/portfolio/
  //
  // If you later add a custom domain (e.g. usukherdene.dev), change to:
  //     url:      "https://usukherdene.dev"
  //     basePath: ""
  url: "https://juu316.github.io/portfolio",
  basePath: "/portfolio",

  // ---------------------------------------------------------------------
  // IDENTITY  (used in <title>, SEO tags, schema.org, footer)
  // ---------------------------------------------------------------------
  name: "Usukh-Erdene Choijamts", // TODO: confirm the name you want recruiters to see
  shortName: "magixx", // shown in the navbar / logo
  role: "Full-stack Developer", // TODO: your headline role
  location: "Ulaanbaatar, Mongolia", // TODO
  email: "uujuu316@gmail.com", // TODO: the address recruiters should use

  // One-sentence pitch. Shows up in Google results and link previews.
  // Aim for 140–160 characters.
  description:
    "TODO: Full-stack developer building fast, reliable web products. I care about performance, clean data models, and shipping things people actually use.",

  // Comma-free keyword list for SEO. Keep it honest — 6–12 real skills.
  keywords: [
    "Full-stack Developer",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Web Performance",
  ],

  // Language of the site content
  lang: "en",
};

// -------------------------------------------------------------------------
// HERO — the first thing anyone sees
// -------------------------------------------------------------------------
export const hero = {
  // Small label above the headline
  eyebrow: "Available for new opportunities", // TODO or set to "" to hide

  // The headline. Keep it short and human.
  headline: "I build fast, useful things for the web.", // TODO

  // Words that cycle in the animated line under the headline.
  // Keep them a similar length so the layout doesn't jump.
  // (Falls back to the first word for users who prefer reduced motion.)
  rotatingPrefix: "Currently focused on",
  rotatingWords: [
    "product engineering", // TODO: swap these for your real focus areas
    "performance work",
    "developer tooling",
    "clean APIs",
  ],

  // Two short paragraphs max. This is your elevator pitch.
  intro:
    "TODO: I'm a full-stack developer who likes the unglamorous parts — the query that got 10x faster, the deploy that stopped waking people up, the interface that finally made sense. Below is a sample of what I've shipped.",

  // Buttons
  primaryCta: { label: "See my work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "#contact" },

  // Optional resume/CV. Drop the file in ./public/ and reference it here.
  // Set to null to hide the link entirely.
  resume: { label: "Resume", file: "resume.pdf" }, // TODO: add public/resume.pdf, or set to null
};

// -------------------------------------------------------------------------
// PROJECTS
// -------------------------------------------------------------------------
// `featured: true` projects get a larger card at the top of the section.
//
// METRICS are what separate a portfolio from a list of links. Recruiters
// skim for numbers. Use real ones — even small, honest numbers ("cut build
// time from 4m to 40s") beat vague claims ("improved performance").
// -------------------------------------------------------------------------
export const projects = [
  {
    featured: true,
    title: "TODO: Flagship Project", // the one you're proudest of
    tagline: "TODO: One line on what it does and who it's for.",
    description:
      "TODO: Two or three sentences. What problem did it solve? What was hard about it? What decision are you proud of? Write like you're explaining it to a smart engineer who has 20 seconds.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"], // TODO
    metrics: [
      { value: "TODO", label: "monthly active users" },
      { value: "TODO", label: "p95 response time" },
      { value: "TODO", label: "uptime" },
    ],
    demo: "", // TODO: https://... (leave "" to hide the button)
    repo: "", // TODO: https://github.com/... (leave "" to hide)
    year: "2026",
    status: "Live", // e.g. "Live", "In progress", "Archived" — or "" to hide
  },
  {
    featured: true,
    title: "TODO: Second Project",
    tagline: "TODO: One line on what it does.",
    description:
      "TODO: What it does, what you built, and one interesting technical detail.",
    stack: ["Next.js", "Tailwind", "Supabase"], // TODO
    metrics: [
      { value: "TODO", label: "users onboarded" },
      { value: "TODO", label: "faster page loads" },
    ],
    demo: "",
    repo: "",
    year: "2025",
    status: "Live",
  },
  {
    featured: false,
    title: "TODO: Third Project",
    tagline: "TODO: One line.",
    description: "TODO: Short description.",
    stack: ["Python", "FastAPI", "Docker"], // TODO
    metrics: [{ value: "TODO", label: "records processed/day" }],
    demo: "",
    repo: "",
    year: "2025",
    status: "",
  },
  {
    featured: false,
    title: "TODO: Fourth Project",
    tagline: "TODO: One line.",
    description: "TODO: Short description.",
    stack: ["Go", "Redis"], // TODO
    metrics: [{ value: "TODO", label: "req/s sustained" }],
    demo: "",
    repo: "",
    year: "2024",
    status: "",
  },
];

// -------------------------------------------------------------------------
// ABOUT — your story
// -------------------------------------------------------------------------
export const about = {
  heading: "About",

  // Each string is a paragraph. 2–4 paragraphs is the sweet spot.
  // Tell a story with a shape: where you started → what changed → where
  // you're going. Specifics beat adjectives every single time.
  paragraphs: [
    "TODO: Open with how you got into this. A concrete first moment works better than a summary — the thing you built that shouldn't have worked, the problem that annoyed you enough to fix.",
    "TODO: What you've done since, and what you got good at. Name real technologies and real outcomes. This is the paragraph a hiring manager reads most carefully, so make it load-bearing.",
    "TODO: What you're looking for now, and what you do when you're not coding. One or two human details make you memorable — most portfolios forget this part.",
  ],

  // Skill groups shown as a tidy list. Keep these honest; you may be asked
  // about anything listed here in an interview.
  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
    { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Vite"] },
    { group: "Backend", items: ["Node.js", "PostgreSQL", "REST", "Redis"] },
    { group: "Tooling", items: ["Git", "Docker", "GitHub Actions", "Linux"] },
  ], // TODO: adjust all of the above

  // Optional short timeline. Set to [] to hide the whole block.
  timeline: [
    {
      period: "2025 — Present",
      title: "TODO: Role or focus",
      org: "TODO: Company / freelance / self-directed",
      detail: "TODO: One line on what you're responsible for and one result.",
    },
    {
      period: "2023 — 2025",
      title: "TODO: Earlier role",
      org: "TODO: Where",
      detail: "TODO: One line.",
    },
  ],
};

// -------------------------------------------------------------------------
// WRITING
// -------------------------------------------------------------------------
export const writing = {
  heading: "Writing",
  blurb:
    "Notes on things I've built and broken. Writing about your work is the cheapest way to show how you think — recruiters read these.",
  // How many recent posts to show on the homepage
  homepageCount: 3,
};

// -------------------------------------------------------------------------
// CONTACT
// -------------------------------------------------------------------------
export const contact = {
  heading: "Get in touch",
  blurb:
    "TODO: Open to full-time roles and interesting freelance work. The fastest way to reach me is the form below or a direct email — I reply within a day or two.",

  // -----------------------------------------------------------------
  // EMAIL DELIVERY — Web3Forms (free, no backend needed)
  // -----------------------------------------------------------------
  // 1. Go to https://web3forms.com
  // 2. Enter the email address where you want messages delivered
  // 3. They email you an Access Key — paste it below
  //
  // The key is PUBLIC by design (it only allows sending to YOUR verified
  // address), so it is safe to commit. Until you replace this placeholder,
  // the form shows a friendly "not configured yet" notice instead of
  // silently failing.
  // -----------------------------------------------------------------
  web3formsKey: "TODO-PASTE-YOUR-WEB3FORMS-ACCESS-KEY",

  // Subject line you'll see in your inbox
  subject: "New message from your portfolio site",
};

// -------------------------------------------------------------------------
// SOCIAL LINKS
// -------------------------------------------------------------------------
// Set any href to "" to hide that link. Order here = order on the page.
export const social = [
  { name: "GitHub", href: "https://github.com/Juu316", icon: "github" },
  { name: "LinkedIn", href: "", icon: "linkedin" }, // TODO
  { name: "X", href: "", icon: "x" }, // TODO
  { name: "Email", href: "mailto:uujuu316@gmail.com", icon: "mail" }, // TODO
];

// -------------------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------------------
export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Writing", href: "#writing" },
  { label: "Contact", href: "#contact" },
];
