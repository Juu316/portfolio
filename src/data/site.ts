/**
 * Everything about the person, in both languages. Project copy is NOT here;
 * it lives in src/content/projects/<slug>/<locale>.mdx.
 *
 * Search for TODO(owner): those lines are drafts built only from verifiable
 * facts (git history, the projects' own repos, the previous README) and are
 * waiting for the owner's own words.
 */
import type { Locale } from "../i18n/ui";

type Localized<T = string> = Record<Locale, T>;

export const person = {
  name: { mn: "Өсөх-Эрдэнэ Чойжамц", en: "Usukh-Erdene Choijamts" } as Localized,
  // TODO(owner): confirm the title.
  role: { mn: "Full-stack хөгжүүлэгч", en: "Full-stack developer" } as Localized,
  location: { mn: "Улаанбаатар", en: "Ulaanbaatar" } as Localized,
  email: "iikii427@proton.me",
  github: "https://github.com/Juu316",
};

/** The one sentence under the name. Built from what the three projects actually do. */
// TODO(owner): rewrite in your own voice if you like; keep it factual.
export const statement: Localized = {
  mn: "Аялал жуулчлалын компани, үнэт эдлэлийн дэлгүүр, орчуулгын товчоонд зориулж төлбөр, гэрээ, барааны үлдэгдэл зэрэг алдаа гаргаж болохгүй системүүдийг бүтээдэг.",
  en: "I build the parts of a business that have to be right: payments, signed contracts, stock counts — for a tour operator, a jewelry shop and a translation agency in Mongolia.",
};

/** Source: the previous README ("Looking for a full-time role"). */
// TODO(owner): confirm, or set to null to hide.
export const availability: Localized | null = {
  mn: "Бүтэн цагийн ажилд нээлттэй.",
  en: "Open to full-time roles.",
};

/**
 * Factual draft only: dates come from git history. Nothing about motivation
 * or personality is written for you.
 */
// TODO(owner): add a paragraph on how you work and what problems you enjoy.
export const about: Localized<string[]> = {
  mn: [
    "2025 оны 12-р сараас хойш Global Travel Corporation-д хөгжүүлэгчээр ажиллаж, компанийн аялал захиалга, цахим гэрээ, төлбөрийн системийг өөр нэг хөгжүүлэгчтэй хамт бүтээсэн. 2026 оны 4-р сараас гадна бие даан захиалгат ажил хийж, орчуулгын товчоо болон үнэт эдлэлийн дэлгүүрийн вэбсайтыг ганцаараа хийсэн.",
  ],
  en: [
    "Since December 2025 I've been a developer at Global Travel Corporation, where another developer and I built the company's booking, e-contract and payment system. Since April 2026 I've also taken freelance work on my own, building the sites for a translation agency and a jewelry shop.",
  ],
};

/**
 * Only technologies that appear in the three projects' repos.
 * The old README also listed Python, Redis, Docker and Next.js; none appear in
 * these projects, so they are left out until the owner confirms them.
 */
// TODO(owner): confirm this list.
export const expertise: { group: Localized; items: string[] }[] = [
  {
    group: { mn: "Frontend", en: "Frontend" },
    items: ["TypeScript", "Svelte 5 / SvelteKit", "React 19", "Tailwind CSS", "Vite"],
  },
  {
    group: { mn: "Backend", en: "Backend" },
    items: ["Node.js", "Express", "Better Auth", "Socket.IO", "Zod"],
  },
  {
    group: { mn: "Өгөгдөл", en: "Data" },
    items: ["PostgreSQL", "SQLite / Cloudflare D1", "Drizzle ORM"],
  },
  {
    group: { mn: "Дэд бүтэц", en: "Infrastructure" },
    items: ["Cloudflare Workers, D1, R2", "Railway"],
  },
  {
    group: { mn: "Төлбөрийн систем", en: "Payments" },
    items: ["QPay", "HiPay", "Wire"],
  },
  {
    group: { mn: "Тест", en: "Testing" },
    items: ["Vitest", "Playwright"],
  },
];

/**
 * Web3Forms delivers form posts to the owner's inbox. The key is public by
 * design (it can only send to the verified address). The form posts as plain
 * HTML and redirects to /thanks/, so it works with JavaScript disabled.
 */
export const contactForm = {
  action: "https://api.web3forms.com/submit",
  accessKey: "f8527481-2143-4fbe-9dda-5ed1a6215e47",
  subject: {
    mn: "Портфолио сайтаас шинэ зурвас",
    en: "New message from your portfolio",
  } as Localized,
};
