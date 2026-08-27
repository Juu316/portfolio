/**
 * ============================================================================
 *  EDIT THIS FILE — everything on the site comes from here.
 * ============================================================================
 *
 *  The site is bilingual. Any field written as a pair:
 *
 *      headline: { mn: "Монголоор", en: "In English" }
 *
 *  is swapped automatically per language. Fields that are NOT translatable —
 *  URLs, tech names, dates, anchor links — stay plain values.
 *
 *  Mongolian is the site's root language (/), English lives at /en/.
 *
 *  Search for "TODO" to find every placeholder. The build prints how many are
 *  left, and separately warns about any missing translation.
 *
 *  Blog posts are NOT here — they live in ./posts/ as <name>.mn.md / <name>.en.md
 * ============================================================================
 */

export const site = {
  // ---------------------------------------------------------------------
  // DEPLOYMENT PATHS
  // ---------------------------------------------------------------------
  // Do NOT put the language in basePath — the build adds /en/ itself.
  //
  // With a custom domain later, change to:
  //     url:      "https://usukherdene.dev"
  //     basePath: ""
  url: "https://juu316.github.io/portfolio",
  basePath: "/portfolio",

  // ---------------------------------------------------------------------
  // IDENTITY
  // ---------------------------------------------------------------------
  name: {
    mn: "Өсөх-Эрдэнэ Чойжамц", // TODO: check this spelling is how you write it
    en: "Usukh-Erdene Choijamts",
  },

  // Brand / logo text. Stays Latin in both — it's a handle, not a word.
  shortName: "magixx",

  role: {
    mn: "Full-stack хөгжүүлэгч", // TODO
    en: "Full-stack Developer",
  },

  location: {
    mn: "Улаанбаатар, Монгол",
    en: "Ulaanbaatar, Mongolia",
  },

  email: "uujuu316@gmail.com", // TODO: the address recruiters should use

  // One sentence. Shows in Google results and link previews. 140–160 chars.
  description: {
    mn: "TODO: Хурдан, найдвартай вэб бүтээгдэхүүн хөгжүүлдэг full-stack хөгжүүлэгч. Гүйцэтгэл, цэвэр өгөгдлийн загвар, хэрэглэгчдэд үнэхээр хэрэгтэй бүтээгдэхүүнд анхаардаг.",
    en: "TODO: Full-stack developer building fast, reliable web products. I care about performance, clean data models, and shipping things people actually use.",
  },

  // Technical terms are searched in English even in Mongolia, so this stays
  // one list rather than a translated pair.
  keywords: [
    "Full-stack Developer",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Web Performance",
  ],
};

// -------------------------------------------------------------------------
// HERO
// -------------------------------------------------------------------------
export const hero = {
  eyebrow: {
    mn: "Шинэ боломжид нээлттэй", // TODO — or set both to "" to hide
    en: "Available for new opportunities",
  },

  headline: {
    mn: "Би вэбд хурдан, хэрэгтэй зүйлс бүтээдэг.", // TODO
    en: "I build fast, useful things for the web.",
  },

  rotatingPrefix: {
    mn: "Одоо голчлон",
    en: "Currently focused on",
  },

  // Words that cycle under the headline. Keep them a similar length within
  // each language so the line doesn't jump.
  rotatingWords: {
    mn: [
      "бүтээгдэхүүний инженерчлэл", // TODO: your real focus areas
      "гүйцэтгэл сайжруулах",
      "хөгжүүлэгчийн хэрэгсэл",
      "цэвэр API",
    ],
    en: ["product engineering", "performance work", "developer tooling", "clean APIs"],
  },

  intro: {
    mn: "TODO: Би ажлын гоёмсог биш талыг нь илүү дуртай — 10 дахин хурдассан query, шөнө дунд сэрээхээ больсон deploy, эцэст нь ойлгомжтой болсон интерфейс. Доор миний хийсэн зарим ажил байна.",
    en: "TODO: I'm a full-stack developer who likes the unglamorous parts — the query that got 10x faster, the deploy that stopped waking people up, the interface that finally made sense. Below is a sample of what I've shipped.",
  },

  primaryCta: {
    label: { mn: "Бүтээлүүдийг үзэх", en: "See my work" },
    href: "#work",
  },
  secondaryCta: {
    label: { mn: "Холбоо барих", en: "Get in touch" },
    href: "#contact",
  },

  // Drop the file in ./public/ and it appears. Set `resume: null` to hide.
  resume: {
    label: { mn: "Товч намтар", en: "Resume" },
    file: "resume.pdf", // TODO: add public/resume.pdf
  },
};

// -------------------------------------------------------------------------
// PROJECTS
// -------------------------------------------------------------------------
// METRICS are what separate a portfolio from a list of links. Recruiters skim
// for numbers. Use real ones — even small honest numbers beat vague claims.
//
// `stack` stays untranslated: tech names are the same in both languages.
// -------------------------------------------------------------------------
export const projects = [
  {
    featured: true,
    title: {
      mn: "TODO: Гол төсөл",
      en: "TODO: Flagship Project",
    },
    tagline: {
      mn: "TODO: Юу хийдэг, хэнд зориулагдсаныг нэг өгүүлбэрээр.",
      en: "TODO: One line on what it does and who it's for.",
    },
    description: {
      mn: "TODO: Хоёр гурван өгүүлбэр. Ямар асуудлыг шийдсэн бэ? Юу нь хэцүү байсан бэ? Ямар шийдвэрээрээ бахархдаг вэ? 20 секундын зав-тай инженерт тайлбарлаж байгаа мэт бич.",
      en: "TODO: Two or three sentences. What problem did it solve? What was hard about it? What decision are you proud of? Write like you're explaining it to a smart engineer who has 20 seconds.",
    },
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    metrics: [
      { value: "TODO", label: { mn: "сарын идэвхтэй хэрэглэгч", en: "monthly active users" } },
      { value: "TODO", label: { mn: "p95 хариу өгөх хугацаа", en: "p95 response time" } },
      { value: "TODO", label: { mn: "тасралтгүй ажиллагаа", en: "uptime" } },
    ],
    demo: "", // TODO: https://…  (leave "" to hide the button)
    repo: "", // TODO: https://github.com/…
    year: "2026",
    status: { mn: "Ажиллаж байгаа", en: "Live" }, // "" in both to hide
  },
  {
    featured: true,
    title: { mn: "TODO: Хоёр дахь төсөл", en: "TODO: Second Project" },
    tagline: {
      mn: "TODO: Юу хийдгийг нэг өгүүлбэрээр.",
      en: "TODO: One line on what it does.",
    },
    description: {
      mn: "TODO: Юу хийдэг, чи юуг нь бүтээсэн, нэг сонирхолтой техникийн нарийн ширийн зүйл.",
      en: "TODO: What it does, what you built, and one interesting technical detail.",
    },
    stack: ["Next.js", "Tailwind", "Supabase"],
    metrics: [
      { value: "TODO", label: { mn: "бүртгүүлсэн хэрэглэгч", en: "users onboarded" } },
      { value: "TODO", label: { mn: "хуудас хурдассан", en: "faster page loads" } },
    ],
    demo: "",
    repo: "",
    year: "2025",
    status: { mn: "Ажиллаж байгаа", en: "Live" },
  },
  {
    featured: false,
    title: { mn: "TODO: Гурав дахь төсөл", en: "TODO: Third Project" },
    tagline: { mn: "TODO: Нэг өгүүлбэр.", en: "TODO: One line." },
    description: { mn: "TODO: Товч тайлбар.", en: "TODO: Short description." },
    stack: ["Python", "FastAPI", "Docker"],
    metrics: [
      { value: "TODO", label: { mn: "өдөрт боловсруулсан бичлэг", en: "records processed/day" } },
    ],
    demo: "",
    repo: "",
    year: "2025",
    status: { mn: "", en: "" },
  },
  {
    featured: false,
    title: { mn: "TODO: Дөрөв дэх төсөл", en: "TODO: Fourth Project" },
    tagline: { mn: "TODO: Нэг өгүүлбэр.", en: "TODO: One line." },
    description: { mn: "TODO: Товч тайлбар.", en: "TODO: Short description." },
    stack: ["Go", "Redis"],
    metrics: [{ value: "TODO", label: { mn: "секундэд хүсэлт", en: "req/s sustained" } }],
    demo: "",
    repo: "",
    year: "2024",
    status: { mn: "", en: "" },
  },
];

// -------------------------------------------------------------------------
// ABOUT — your story
// -------------------------------------------------------------------------
export const about = {
  heading: { mn: "Миний тухай", en: "About" },

  // Each string is a paragraph. 2–4 is the sweet spot. Tell a story with a
  // shape: where you started → what changed → where you're going.
  paragraphs: {
    mn: [
      "TODO: Энэ ажилд хэрхэн орсноороо эхэл. Ерөнхий тайлбараас илүү тодорхой нэг мөч илүү үнэмшилтэй — ажиллах ёсгүй байсан мөртөө ажилласан анхны програм, эсвэл засахаас өөр аргагүй болтол чинь ядаргаатай байсан асуудал.",
      "TODO: Түүнээс хойш юу хийсэн, юунд сайн болсноо бич. Бодит технологи, бодит үр дүнг нэрлэ. Ажил олгогч энэ догол мөрийг хамгийн анхааралтай уншина.",
      "TODO: Одоо юу хайж байгаа, код бичихгүй үедээ юу хийдгээ бич. Нэг хоёр хүн чанарын нарийн ширийн зүйл чамайг санагдахуйц болгоно — ихэнх портфолио үүнийг мартдаг.",
    ],
    en: [
      "TODO: Open with how you got into this. A concrete first moment works better than a summary — the thing you built that shouldn't have worked, the problem that annoyed you enough to fix.",
      "TODO: What you've done since, and what you got good at. Name real technologies and real outcomes. This is the paragraph a hiring manager reads most carefully, so make it load-bearing.",
      "TODO: What you're looking for now, and what you do when you're not coding. One or two human details make you memorable — most portfolios forget this part.",
    ],
  },

  // Group names translate; the tech names inside them don't.
  skills: [
    {
      group: { mn: "Хэл", en: "Languages" },
      items: ["TypeScript", "JavaScript", "Python", "SQL"],
    },
    {
      group: { mn: "Frontend", en: "Frontend" },
      items: ["React", "Next.js", "Tailwind CSS", "Vite"],
    },
    {
      group: { mn: "Backend", en: "Backend" },
      items: ["Node.js", "PostgreSQL", "REST", "Redis"],
    },
    {
      group: { mn: "Хэрэгсэл", en: "Tooling" },
      items: ["Git", "Docker", "GitHub Actions", "Linux"],
    },
  ],

  // Set to [] to hide the whole block.
  timeline: [
    {
      period: { mn: "2025 — одоог хүртэл", en: "2025 — Present" },
      title: { mn: "TODO: Албан тушаал", en: "TODO: Role or focus" },
      org: { mn: "TODO: Байгууллага / бие даасан", en: "TODO: Company / freelance" },
      detail: {
        mn: "TODO: Юуг хариуцдаг, ямар үр дүнд хүрснээ нэг мөрөөр.",
        en: "TODO: One line on what you're responsible for and one result.",
      },
    },
    {
      period: { mn: "2023 — 2025", en: "2023 — 2025" },
      title: { mn: "TODO: Өмнөх ажил", en: "TODO: Earlier role" },
      org: { mn: "TODO: Хаана", en: "TODO: Where" },
      detail: { mn: "TODO: Нэг мөр.", en: "TODO: One line." },
    },
  ],
};

// -------------------------------------------------------------------------
// WRITING
// -------------------------------------------------------------------------
export const writing = {
  heading: { mn: "Нийтлэл", en: "Writing" },
  blurb: {
    mn: "Миний бүтээж, эвдэж үзсэн зүйлсийн тухай тэмдэглэл. Ажлынхаа тухай бичих нь сэтгэлгээгээ харуулах хамгийн хямд арга — ажил олгогчид үүнийг уншдаг.",
    en: "Notes on things I've built and broken. Writing about your work is the cheapest way to show how you think — recruiters read these.",
  },
  homepageCount: 3,
};

// -------------------------------------------------------------------------
// CONTACT
// -------------------------------------------------------------------------
export const contact = {
  heading: { mn: "Холбоо барих", en: "Get in touch" },
  blurb: {
    mn: "TODO: Бүтэн цагийн ажил болон сонирхолтой чөлөөт ажилд нээлттэй. Доорх маягт эсвэл шууд и-мэйлээр хамгийн хурдан холбогдоно — нэг хоёр хоногт хариу бичдэг.",
    en: "TODO: Open to full-time roles and interesting freelance work. The fastest way to reach me is the form below or a direct email — I reply within a day or two.",
  },

  // -----------------------------------------------------------------
  // EMAIL DELIVERY — Web3Forms (free, no backend)
  // -----------------------------------------------------------------
  // 1. Go to https://web3forms.com
  // 2. Enter the address where you want messages delivered
  // 3. Paste the Access Key they email you below
  //
  // The key is PUBLIC by design (it only sends to YOUR verified address), so
  // it is safe to commit. Until you replace this, the form shows a friendly
  // "not configured yet" notice instead of failing silently.
  // -----------------------------------------------------------------
  web3formsKey: "f8527481-2143-4fbe-9dda-5ed1a6215e47",

  // Subject line you'll see in your inbox.
  subject: {
    mn: "Портфолио сайтаас шинэ зурвас",
    en: "New message from your portfolio site",
  },
};

// -------------------------------------------------------------------------
// SOCIAL LINKS
// -------------------------------------------------------------------------
// Set any href to "" to hide that link. Brand names stay untranslated.
export const social = [
  { name: "GitHub", href: "https://github.com/Juu316", icon: "github" },
  { name: "LinkedIn", href: "", icon: "linkedin" }, // TODO
  { name: "X", href: "", icon: "x" }, // TODO
  { name: { mn: "И-мэйл", en: "Email" }, href: "mailto:uujuu316@gmail.com", icon: "mail" }, // TODO
];

// -------------------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------------------
// `href` values are section ids — they must NOT be translated.
export const nav = [
  { label: { mn: "Ажил", en: "Work" }, href: "#work" },
  { label: { mn: "Миний тухай", en: "About" }, href: "#about" },
  { label: { mn: "Нийтлэл", en: "Writing" }, href: "#writing" },
  { label: { mn: "Холбоо барих", en: "Contact" }, href: "#contact" },
];
