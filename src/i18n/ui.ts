/**
 * The site's own UI strings and locale helpers. The author's copy lives in
 * src/data/site.ts and the case studies in src/content/projects/.
 *
 * Mongolian is the root language (/), English lives at /en/.
 */
import { getRelativeLocaleUrl } from "astro:i18n";

export const LOCALES = ["mn", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "mn";

export const OG_LOCALE: Record<Locale, string> = { mn: "mn_MN", en: "en_US" };

export const ui = {
  mn: {
    skipToContent: "Агуулга руу шилжих",
    navLabel: "Үндсэн цэс",
    work: "Төслүүд",
    expertise: "Ур чадвар",
    background: "Туршлага, боловсрол",
    experience: "Ажлын туршлага",
    education: "Боловсрол",
    languages: "Хэл",
    viewResume: "CV үзэх",
    about: "Миний тухай",
    contact: "Холбоо барих",
    switchLanguageLabel: "Англиар үзэх",
    cursorBuddyOn: "Курсорын дүр: асаалттай",
    cursorBuddyOff: "Курсорын дүр: унтраалттай",
    selectedWork: "Бодит төслүүд",
    readCaseStudy: "Дэлгэрэнгүй",
    allProjects: "Бүх төсөл",
    client: "Захиалагч",
    role: "Үүрэг",
    period: "Хугацаа",
    stack: "Технологи",
    liveSite: "Вэбсайт",
    visitSite: "{domain} руу орох",
    nextProject: "Дараагийн төсөл",
    problem: "Асуудал",
    decision: "Шийдэл",
    tradeoff: "Төлөх үнэ",
    emailMe: "И-мэйл бичих",
    formHeading: "Эсвэл энд зурвас үлдээгээрэй",
    fieldName: "Нэр",
    fieldEmail: "И-мэйл",
    fieldMessage: "Зурвас",
    send: "Илгээх",
    thanksTitle: "Баярлалаа",
    thanksBody: "Таны зурвас хүрлээ. Удахгүй хариу бичнэ.",
    backHome: "Нүүр хуудас руу буцах",
    notFoundTitle: "Ийм хуудас алга",
    notFoundBody: "Холбоос хуучирсан эсвэл хуудас зөөгдсөн байж магадгүй.",
    footerNote: "Astro дээр бүтээв.",
    homeLabel: "Нүүр хуудас",
    menu: "Цэс",
    downloadCv: "CV татах",
    themeToLight: "Гэгээлэг горимд шилжих",
    themeToDark: "Харанхуй горимд шилжих",
    languageLabel: "Хэл сонгох",
    location: "Байршил",
    locationValue: "Улаанбаатар, GMT+8",
    nowAt: "Одоо",
    liveSites: "Ажиллаж буй сайт",
    terminalLabel: "Товч танилцуулга, терминалын хэлбэрээр",
    copy: "Хуулах",
    copied: "Хуулагдлаа",
    copiedEmail: "И-мэйл хаяг хуулагдлаа",
    copiedPhone: "Утасны дугаар хуулагдлаа",
    call: "Залгах",
    phone: "Утас",
    email: "И-мэйл",
    openViber: "Viber-ээр бичих",
    timezone: "Цагийн бүс",
    replyTime: "Хариу өгөх хугацаа",
    availabilityLabel: "Ажлын санал",
    kindWork: "Ажил",
    kindStudy: "Сургалт",
    certificates: "Гэрчилгээ",
  },
  en: {
    skipToContent: "Skip to content",
    navLabel: "Main",
    work: "Work",
    expertise: "Expertise",
    background: "Experience & education",
    experience: "Experience",
    education: "Education",
    languages: "Languages",
    viewResume: "View resume",
    about: "About",
    contact: "Contact",
    switchLanguageLabel: "View in Mongolian",
    cursorBuddyOn: "Crewmate cursor: on",
    cursorBuddyOff: "Crewmate cursor: off",
    selectedWork: "Selected work",
    readCaseStudy: "Read the case study",
    allProjects: "All projects",
    client: "Client",
    role: "Role",
    period: "Period",
    stack: "Stack",
    liveSite: "Live site",
    visitSite: "Visit {domain}",
    nextProject: "Next project",
    problem: "Problem",
    decision: "Decision",
    tradeoff: "Trade-off",
    emailMe: "Email me",
    formHeading: "Or leave a message here",
    fieldName: "Name",
    fieldEmail: "Email",
    fieldMessage: "Message",
    send: "Send",
    thanksTitle: "Thank you",
    thanksBody: "Your message came through. I'll reply soon.",
    backHome: "Back to the homepage",
    notFoundTitle: "This page doesn't exist",
    notFoundBody: "The link may be out of date, or the page may have moved.",
    footerNote: "Built with Astro.",
    homeLabel: "Home",
    menu: "Menu",
    downloadCv: "Download CV",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
    languageLabel: "Language",
    location: "Location",
    locationValue: "Ulaanbaatar, GMT+8",
    nowAt: "Now",
    liveSites: "Live sites",
    terminalLabel: "A short introduction, written as a terminal session",
    copy: "Copy",
    copied: "Copied",
    copiedEmail: "Email address copied",
    copiedPhone: "Phone number copied",
    call: "Call",
    phone: "Phone",
    email: "Email",
    openViber: "Message on Viber",
    timezone: "Time zone",
    replyTime: "Reply time",
    availabilityLabel: "Availability",
    kindWork: "Work",
    kindStudy: "Study",
    certificates: "Certificates",
  },
} satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["en"];

export function t(locale: Locale, key: UIKey, vars: Record<string, string> = {}) {
  return ui[locale][key].replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "mn" ? "en" : "mn";
}

/** Locale-aware URL for a path such as "projects/b2c/" (no leading slash). */
export function localeUrl(locale: Locale, path = "") {
  return getRelativeLocaleUrl(locale, path);
}

/** "b2c/mn" → { slug: "b2c", locale: "mn" } */
export function splitId(id: string) {
  const [slug, locale] = id.split("/") as [string, Locale];
  return { slug, locale };
}

export function domainOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}
