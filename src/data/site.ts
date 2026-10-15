/**
 * Everything about the person, in both languages. Project copy is NOT here;
 * it lives in src/content/projects/<slug>/<locale>.mdx.
 *
 * Sources: the owner's CV (2026-08-24), git history and the projects' own repos.
 * Nothing private from the CV (ID number, birth date, salary) goes here. The
 * phone number below was supplied by the owner for publishing.
 */
import type { Locale } from "../i18n/ui";

type Localized<T = string> = Record<Locale, T>;

/** Flags drawn by Flag.astro. */
export type FlagCode = "MN" | "GB" | "JP";

export const person = {
  name: { mn: "Өсөх-Эрдэнэ", en: "Usukh-Erdene Choijamts" } as Localized,
  /** The header's brand mark. */
  shortName: { mn: "Өсөх-Эрдэнэ", en: "Usukh-Erdene" } as Localized,
  // src: owner CV 2026-08-24 ("Fullstack хөгжүүлэгч").
  role: { mn: "Full-stack хөгжүүлэгч", en: "Full-stack developer" } as Localized,
  location: { mn: "Улаанбаатар", en: "Ulaanbaatar" } as Localized,
  email: "iikii427@proton.me",
  github: "https://github.com/Juu316",
  instagram: "https://www.instagram.com/uujuu316/",
  facebook: "https://www.facebook.com/uujuu316",
  phone: "80383316",
  /** Shown as written; `phone` above is what tel: links and copy use. */
  phoneDisplay: "+976 8038 3316",
  // TODO(owner): confirm the phone number takes Viber messages, then set true.
  viber: false,
  /** In public/; one PDF for both locales. */
  resume: "resume.pdf",
};

/**
 * The hero sentence, built from what the three projects actually do. Linked
 * parts point at the case study they describe and carry that project's accent.
 */
export type StatementPart = string | { text: string; slug: string; accent: string };

export const statement: Localized<StatementPart[]> = {
  mn: [
    { text: "Аялал жуулчлалын компани", slug: "b2c", accent: "gtc" },
    ", ",
    { text: "үнэт эдлэлийн дэлгүүр", slug: "shuren", accent: "shuren" },
    ", төлбөр, гэрээ, барааны үлдэгдэл зэрэг алдаа гаргаж болохгүй систем бүтээдэг.",
  ],
  en: [
    "I build the parts of a business that have to be right: payments, signed contracts, stock counts — for ",
    { text: "a tour operator", slug: "b2c", accent: "gtc" },
    " and ",
    { text: "a jewelry shop", slug: "shuren", accent: "shuren" },
    " in Mongolia.",
  ],
};

/** The hero sentence as plain text, for meta descriptions. */
export function statementText(locale: Locale) {
  return statement[locale].map((part) => (typeof part === "string" ? part : part.text)).join("");
}

/** src: owner CV 2026-08-24 ("Бүтэн цагийн"). Set to null to hide. */
export const availability: Localized | null = null;

/** TODO(owner): how fast you usually reply, e.g. "within a day". Null hides it. */
export const replyTime: Localized | null = null;

/** src: owner CV 2026-08-24 (intro paragraph) and git history. */
export const about: Localized<string[]> = {
  mn: [
    "Pinecone Academy-г Full Stack Software Engineer мэргэжлээр төгссөн. 6 сарын сургалт, 2 сарын дадлагын хугацаанд React, Next.js, MongoDB, PostgreSQL дээр багийн болон хувийн олон төсөл хийсэн.",
    "2025 оны 12-р сараас Мон Тай Сино Группт (GTC Mongolia) Full-stack хөгжүүлэгчээр ажиллаж байна. Тэнд өөр нэг хөгжүүлэгчтэй хамт компанийн аялал захиалга, цахим гэрээ, төлбөрийн системийг бүтээж, orchuulga.mn сайтыг ганцаараа шилжүүлсэн. Ажлаас гадуур үнэт эдлэлийн дэлгүүр, шүдний эмнэлгийн вэбсайтыг гэрээгээр хийсэн.",
    "Байгууллагын дотоод систем, нүүр хуудсыг өндөр чанартай хийхийг зорьдог. Linux (Debian) ашигладаг.",
  ],
  en: [
    "I graduated from Pinecone Academy as a Full Stack Software Engineer. Over six months of training and a two-month internship I built team and solo projects in React, Next.js, MongoDB and PostgreSQL.",
    "Since December 2025 I've been a full-stack developer at Mon Thai Sino Group (GTC Mongolia). There, another developer and I built the company's booking, e-contract and payment system, and I moved orchuulga.mn to a new stack on my own. Outside that job I built websites for a jewelry shop and a dental clinic as freelance work.",
    "I care about building internal systems and websites properly. I work on Linux (Debian).",
  ],
};

/** Repo-backed technologies, plus the ones listed in the owner's CV (2026-08-24)
 * and Java, Spring Boot and Go added by the owner (2026-10-10), and AWS added by
 * the owner (2026-10-15). */
export const expertise: { group: Localized; items: string[] }[] = [
  {
    group: { mn: "Frontend", en: "Frontend" },
    items: [
      "TypeScript",
      "HTML / CSS",
      "Svelte 5 / SvelteKit",
      "React 19",
      "Next.js",
      "Tailwind CSS",
      "Vite",
    ],
  },
  {
    group: { mn: "Backend", en: "Backend" },
    items: ["Node.js", "Express", "Java", "Spring Boot", "Go", "Better Auth", "Socket.IO", "Zod"],
  },
  {
    group: { mn: "Өгөгдөл", en: "Data" },
    items: ["PostgreSQL", "MongoDB", "SQLite / Cloudflare D1", "Drizzle ORM"],
  },
  {
    group: { mn: "Дэд бүтэц", en: "Infrastructure" },
    items: ["AWS", "Cloudflare Workers, D1, R2", "Railway"],
  },
  {
    group: { mn: "Төлбөрийн систем", en: "Payments" },
    items: ["QPay", "HiPay", "Wire"],
  },
  {
    group: { mn: "Тест", en: "Testing" },
    items: ["Vitest", "Playwright"],
  },
  {
    group: { mn: "Хэрэгсэл", en: "Tools" },
    items: ["Git / GitHub", "Linux", "Anthropic Claude"],
  },
];

type Entry = {
  /** Year the entry starts; the timeline groups by it. */
  start: number;
  /** The job the hero's "now" line and terminal name. */
  current?: boolean;
  period: string | Localized;
  org: Localized;
  role: Localized;
  points?: Localized<string[]>;
};

/** src: owner CV 2026-08-24. */
export const experience: Entry[] = [
  {
    start: 2026,
    // src: owner, 2026-10-15 (freelance, built alone, not yet handed over).
    period: "2026.10",
    org: { mn: "Degfim шүдний эмнэлэг", en: "Degfim Dental Group" },
    role: { mn: "Гэрээт хөгжүүлэгч", en: "Freelance developer" },
    points: {
      mn: ["Эмнэлгийн нэг хуудастай вэбсайт, ганцаараа."],
      en: ["The clinic's one-page website, built alone."],
    },
  },
  {
    start: 2026,
    // src: owner CV 2026-10-10 ("Freelance Developer — Shuren Goyol jewelry shop").
    period: "2026.08 – 2026.10",
    org: { mn: "Шүрэн Гоёл үнэт эдлэлийн дэлгүүр", en: "Shuren Goyol jewelry shop" },
    role: { mn: "Гэрээт хөгжүүлэгч", en: "Freelance developer" },
    points: {
      mn: ["shuren.mn: дэлгүүр болон админ портал, ганцаараа."],
      en: ["shuren.mn: storefront and admin portal, built alone."],
    },
  },
  {
    start: 2025,
    current: true,
    period: { mn: "2025.12 – одоо", en: "2025.12 – present" },
    org: { mn: "Мон Тай Сино Групп ХХК (GTC Mongolia)", en: "Mon Thai Sino Group (GTC Mongolia)" },
    role: { mn: "Full-stack хөгжүүлэгч", en: "Full-stack developer" },
    points: {
      mn: ["global-travel.mn, orchuulga.mn", "2 хүнтэй баг удирдсан."],
      en: ["global-travel.mn and orchuulga.mn", "Led a team of two."],
    },
  },
  {
    start: 2024,
    period: "2024.05 – 2024.06",
    org: { mn: "IT Park", en: "IT Park" },
    role: { mn: "Дадлагажигч", en: "Intern" },
  },
];

/**
 * src: owner CV 2026-08-24. The owner confirmed neither bachelor's
 * programme was completed, so they read as "studied", never "graduated".
 */
export const education: Entry[] = [
  {
    start: 2024,
    period: "2024 – 2025",
    org: { mn: "Pinecone Academy", en: "Pinecone Academy" },
    role: {
      mn: "Full Stack Software Engineer хөтөлбөр",
      en: "Full Stack Software Engineer programme",
    },
  },
  {
    start: 2022,
    period: "2022 – 2023",
    org: { mn: "King's Own Institute, Австрали", en: "King's Own Institute, Australia" },
    role: {
      mn: "Мэдээллийн технологи, бакалаврын хөтөлбөрт суралцсан",
      en: "Studied for a bachelor's in IT",
    },
  },
  {
    start: 2021,
    period: "2021 – 2022",
    org: { mn: "ШУТИС", en: "Mongolian University of Science and Technology" },
    role: {
      mn: "Мэдээллийн технологи, бакалаврын хөтөлбөрт суралцсан",
      en: "Studied for a bachelor's in IT",
    },
  },
];

/**
 * TODO(owner): add certificates here (name, issuer, year, link). The CV lists
 * none, so the list is empty and the homepage hides the section.
 */
export const certificates: { name: Localized; issuer: string; year: number; url?: string }[] = [];

/** src: owner CV 2026-08-24. */
export const languages: { flag: FlagCode; text: Localized }[] = [
  {
    flag: "GB",
    text: { mn: "Англи хэл — ахисан түвшин (IELTS 7).", en: "English — fluent (IELTS 7)." },
  },
  {
    flag: "JP",
    text: { mn: "Япон хэл — анхан шат.", en: "Japanese — beginner." },
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
