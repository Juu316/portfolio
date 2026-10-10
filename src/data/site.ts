/**
 * Everything about the person, in both languages. Project copy is NOT here;
 * it lives in src/content/projects/<slug>/<locale>.mdx.
 *
 * Sources: the owner's CV (2026-08-24), git history and the projects' own repos.
 * Nothing private from the CV (ID number, birth date, phones, salary) goes here.
 */
import type { Locale } from "../i18n/ui";

type Localized<T = string> = Record<Locale, T>;

export const person = {
  name: { mn: "Өсөх-Эрдэнэ Чойжамц", en: "Usukh-Erdene Choijamts" } as Localized,
  // src: owner CV 2026-08-24 ("Fullstack хөгжүүлэгч").
  role: { mn: "Full-stack хөгжүүлэгч", en: "Full-stack developer" } as Localized,
  location: { mn: "Улаанбаатар", en: "Ulaanbaatar" } as Localized,
  email: "iikii427@proton.me",
  github: "https://github.com/Juu316",
};

/** The one sentence under the name. Built from what the three projects actually do. */
export const statement: Localized = {
  mn: "Аялал жуулчлалын компани, үнэт эдлэлийн дэлгүүр, орчуулгын товчоонд зориулж төлбөр, гэрээ, барааны үлдэгдэл зэрэг алдаа гаргаж болохгүй системүүдийг бүтээдэг.",
  en: "I build the parts of a business that have to be right: payments, signed contracts, stock counts — for a tour operator, a jewelry shop and a translation agency in Mongolia.",
};

/** src: owner CV 2026-08-24 ("Бүтэн цагийн"). Set to null to hide. */
export const availability: Localized | null = {
  mn: "Бүтэн цагийн ажилд нээлттэй.",
  en: "Open to full-time roles.",
};

/** src: owner CV 2026-08-24 (intro paragraph) and git history. */
export const about: Localized<string[]> = {
  mn: [
    "Pinecone Academy-г Full Stack Software Engineer мэргэжлээр төгссөн. 6 сарын сургалт, 2 сарын дадлагын хугацаанд React, Next.js, MongoDB, PostgreSQL дээр багийн болон хувийн олон төсөл хийсэн.",
    "2025 оны 12-р сараас Мон Тай Сино Группт (GTC Mongolia) Full-stack хөгжүүлэгчээр ажиллаж байна. Тэнд өөр нэг хөгжүүлэгчтэй хамт компанийн аялал захиалга, цахим гэрээ, төлбөрийн системийг бүтээж, orchuulga.mn сайтыг ганцаараа шилжүүлсэн. Ажлаас гадуур үнэт эдлэлийн дэлгүүрийн вэбсайтыг гэрээгээр хийсэн.",
    "Байгууллагын дотоод систем, нүүр хуудсыг өндөр чанартай хийхийг зорьдог. Linux (Debian) ашигладаг.",
  ],
  en: [
    "I graduated from Pinecone Academy as a Full Stack Software Engineer. Over six months of training and a two-month internship I built team and solo projects in React, Next.js, MongoDB and PostgreSQL.",
    "Since December 2025 I've been a full-stack developer at Mon Thai Sino Group (GTC Mongolia). There, another developer and I built the company's booking, e-contract and payment system, and I moved orchuulga.mn to a new stack on my own. Outside that job I built a jewelry shop's website as freelance work.",
    "I care about building internal systems and websites properly. I work on Linux (Debian).",
  ],
};

/** Repo-backed technologies, plus the ones listed in the owner's CV (2026-08-24). */
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
    items: ["Node.js", "Express", "Better Auth", "Socket.IO", "Zod"],
  },
  {
    group: { mn: "Өгөгдөл", en: "Data" },
    items: ["PostgreSQL", "MongoDB", "SQLite / Cloudflare D1", "Drizzle ORM"],
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
  {
    group: { mn: "Хэрэгсэл", en: "Tools" },
    items: ["Git / GitHub", "Linux", "Anthropic Claude"],
  },
];

type Entry = { period: string | Localized; org: Localized; detail: Localized };

/** src: owner CV 2026-08-24. */
export const experience: Entry[] = [
  {
    period: { mn: "2025.12 – одоо", en: "2025.12 – present" },
    org: { mn: "Мон Тай Сино Групп ХХК (GTC Mongolia)", en: "Mon Thai Sino Group (GTC Mongolia)" },
    detail: {
      mn: "Full-stack хөгжүүлэгч. global-travel.mn, orchuulga.mn. 2 хүнтэй баг удирдсан.",
      en: "Full-stack developer. global-travel.mn and orchuulga.mn. Led a team of two.",
    },
  },
  {
    period: "2024.05 – 2024.06",
    org: { mn: "IT Park", en: "IT Park" },
    detail: { mn: "Дадлагажигч", en: "Intern" },
  },
];

/**
 * src: owner CV 2026-08-24. The owner confirmed neither bachelor's
 * programme was completed, so they read as "studied", never "graduated".
 */
export const education: Entry[] = [
  {
    period: "2024 – 2025",
    org: { mn: "Pinecone Academy", en: "Pinecone Academy" },
    detail: {
      mn: "Full Stack Software Engineer хөтөлбөр",
      en: "Full Stack Software Engineer programme",
    },
  },
  {
    period: "2022 – 2023",
    org: { mn: "King's Own Institute, Австрали", en: "King's Own Institute, Australia" },
    detail: {
      mn: "Мэдээллийн технологи, бакалаврын хөтөлбөрт суралцсан",
      en: "Studied for a bachelor's in IT",
    },
  },
  {
    period: "2021 – 2022",
    org: { mn: "ШУТИС", en: "Mongolian University of Science and Technology" },
    detail: {
      mn: "Мэдээллийн технологи, бакалаврын хөтөлбөрт суралцсан",
      en: "Studied for a bachelor's in IT",
    },
  },
];

/** src: owner CV 2026-08-24. */
export const languages: Localized = {
  mn: "Англи хэл — чөлөөтэй (IELTS 7). Япон хэл — анхан шат.",
  en: "English — fluent (IELTS 7). Japanese — beginner.",
};

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
