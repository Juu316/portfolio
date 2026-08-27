/**
 * Localisation: locale config, the UI string table, and the resolver that
 * flattens bilingual content down to one language before rendering.
 *
 * Two separate concerns live here:
 *
 *   UI      — the site's own chrome ("Send message", "min read", aria-labels).
 *             Fixed strings that belong to the app, not to the author.
 *
 *   content — the author's copy in content.js, written as { mn, en } pairs.
 *             Resolved by localize() below.
 */

/* --------------------------------------------------------------------------
 * Locales
 *
 * Mongolian is the root language, so its prefix is empty. Order matters:
 * the first entry is the default and owns the shared root files.
 * ------------------------------------------------------------------------ */
export const LOCALES = [
  { code: "mn", prefix: "", label: "МН", name: "Монгол", htmlLang: "mn", ogLocale: "mn_MN" },
  { code: "en", prefix: "/en", label: "EN", name: "English", htmlLang: "en", ogLocale: "en_US" },
];

export const DEFAULT_LOCALE = LOCALES[0].code;

/** Order the two halves appear in the toggle pill (left to right). */
export const TOGGLE_ORDER = ["en", "mn"];

export function getLocale(code) {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}

export function otherLocale(code) {
  return LOCALES.find((l) => l.code !== code).code;
}

/* --------------------------------------------------------------------------
 * Dates
 *
 * Hand-rolled rather than routed through Intl. toLocaleDateString("mn")
 * silently falls back to English on a small-ICU Node build, which would mean
 * the site rendered differently in CI than locally — an invisible environment
 * dependency in a project whose whole premise is determinism.
 * ------------------------------------------------------------------------ */
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso, locale) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  if (!match) return String(iso);
  const [, year, month, day] = match;

  // Mongolian convention is numeric and dot-separated. It's also short, which
  // matters — the post list gives the date a fixed column.
  if (locale === "mn") return `${year}.${month}.${day}`;

  return `${Number(day)} ${EN_MONTHS[Number(month) - 1]} ${year}`;
}

/* --------------------------------------------------------------------------
 * UI strings
 *
 * `client` is the subset shipped to the browser in the site-config blob;
 * everything else is used only at build time.
 * ------------------------------------------------------------------------ */
export const UI = {
  mn: {
    skipToContent: "Агуулга руу шилжих",
    navLabel: "Үндсэн цэс",
    languageLabel: "Хэл сонгох",
    switchToMongolian: "Монголоор үзэх",
    switchToEnglish: "Англиар үзэх",
    themeSwitch: "Өнгө солих",
    openMenu: "Цэс нээх",

    techStack: "Ашигласан технологи",
    impactMetrics: "Үр дүн",
    liveDemo: "Демо үзэх",
    liveDemoFor: "{title} төслийн демо",
    source: "Эх код",
    sourceFor: "{title} төслийн эх код",

    selectedWork: "Сонгосон бүтээл",
    projects: "Төслүүд",
    projectsBlurb:
      "Миний зохиож, бүтээж, хэрэглээнд гаргасан зүйлс. Энд бичсэн тоонууд бол бодит үр дүн.",
    background: "Танилцуулга",
    notes: "Тэмдэглэл",
    writing: "Нийтлэл",
    contact: "Холбоо барих",

    noPostsYet:
      "Одоогоор нийтлэл алга. <code>posts/</code> хавтсанд markdown файл нэмбэл энд гарч ирнэ.",
    allPosts: "Бүх {n} нийтлэл",
    allWriting: "Бүх нийтлэл",
    backHome: "Нүүр хуудас руу",
    readTheWriting: "Нийтлэл унших",
    minRead: "{n} мин унших",
    getInTouch: "Холбоо барих",

    fieldName: "Нэр",
    fieldEmail: "И-мэйл",
    fieldMessage: "Зурвас",
    messageHint: "— ямар ажлын байр, эсвэл юу бүтээж байгаа тухай?",
    placeholderName: "Бат-Эрдэнэ",
    placeholderEmail: "bat@company.mn",
    placeholderMessage: "Сайн байна уу! Бид ажилтан хайж байна…",
    sendMessage: "Илгээх",
    fromNameSuffix: "портфолио",

    notFoundEyebrow: "Алдаа 404",
    notFoundTitle: "Ийм хуудас алга.",
    notFoundBody:
      "Холбоос хуучирсан эсвэл хуудас зөөгдсөн байж магадгүй. Бүх бүтээл нүүр хуудсанд байгаа.",
    notFoundDescription: "Таны хайсан хуудас олдсонгүй.",
    notFoundName: "Хуудас олдсонгүй",

    client: {
      themeToDark: "Харанхуй өнгө рүү шилжих",
      themeToLight: "Цайвар өнгө рүү шилжих",
      openMenu: "Цэс нээх",
      closeMenu: "Цэс хаах",
      required: "Энэ талбарыг бөглөнө үү.",
      invalidEmail: "Зөв и-мэйл хаяг оруулна уу.",
      tooShort: "Жаахан дэлгэрэнгүй бичнэ үү (хамгийн багадаа 10 тэмдэгт).",
      fixFields: "Тодруулсан талбаруудыг засна уу.",
      sent: "Баярлалаа — таны зурвас хүрлээ. Удахгүй хариу бичье.",
      queued: "Баярлалаа — таны зурвас илгээгдлээ.",
      notConfigured:
        "Энэ маягт хараахан холбогдоогүй байна. content.js доторх contact.web3formsKey талбарт Web3Forms түлхүүрээ оруулаад дахин build хийнэ үү. Түр зуур и-мэйлээр холбогдоорой.",
      rejected: "хүсэлтийг хүлээж авсангүй",
      failed: "Алдаа гарлаа ({detail}). Шууд и-мэйлээр холбогдоно уу.",
      offline:
        "Мэйл үйлчилгээ рүү холбогдож чадсангүй — холболтоо шалгах эсвэл шууд и-мэйл бичнэ үү.",
    },
  },

  en: {
    skipToContent: "Skip to content",
    navLabel: "Main",
    languageLabel: "Choose language",
    switchToMongolian: "View in Mongolian",
    switchToEnglish: "View in English",
    themeSwitch: "Switch theme",
    openMenu: "Open menu",

    techStack: "Tech stack",
    impactMetrics: "Impact metrics",
    liveDemo: "Live demo",
    liveDemoFor: "Live demo of {title}",
    source: "Source",
    sourceFor: "Source code for {title}",

    selectedWork: "Selected work",
    projects: "Projects",
    projectsBlurb:
      "Things I've designed, built and shipped. Numbers are real outcomes, not vanity metrics.",
    background: "Background",
    notes: "Notes",
    writing: "Writing",
    contact: "Contact",

    noPostsYet:
      "No posts yet. Add a markdown file to <code>posts/</code> and it'll appear here.",
    allPosts: "All {n} posts",
    allWriting: "All writing",
    backHome: "Back home",
    readTheWriting: "Read the writing",
    minRead: "{n} min read",
    getInTouch: "Get in touch",

    fieldName: "Name",
    fieldEmail: "Email",
    fieldMessage: "Message",
    messageHint: "— what's the role, or what are you building?",
    placeholderName: "Jane Doe",
    placeholderEmail: "jane@company.com",
    placeholderMessage: "Hi! We're hiring for…",
    sendMessage: "Send message",
    fromNameSuffix: "portfolio",

    notFoundEyebrow: "Error 404",
    notFoundTitle: "This page doesn't exist.",
    notFoundBody:
      "The link may be out of date, or the page may have moved. The work is all still on the homepage.",
    notFoundDescription: "The page you were looking for doesn't exist.",
    notFoundName: "Page not found",

    client: {
      themeToDark: "Switch to dark theme",
      themeToLight: "Switch to light theme",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      required: "This field is required.",
      invalidEmail: "Enter a valid email address.",
      tooShort: "A little more detail, please (10 characters minimum).",
      fixFields: "Please fix the highlighted fields.",
      sent: "Thanks — your message came through. I'll get back to you shortly.",
      queued: "Thanks — your message is on its way.",
      notConfigured:
        "This form isn't connected yet. Add your Web3Forms access key to content.js (contact.web3formsKey) and rebuild. In the meantime, email works fine.",
      rejected: "the request was rejected",
      failed: "Something went wrong ({detail}). Please email me directly instead.",
      offline:
        "Couldn't reach the mail service — check your connection, or email me directly.",
    },
  },
};

/** Fill {placeholders} in a UI string. */
export function fmt(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

/* --------------------------------------------------------------------------
 * Content resolution
 *
 * Walks the content tree once and replaces every { mn, en } pair with the
 * string for the locale being built.
 *
 * Doing this up front — rather than calling a t() helper at each of the ~40
 * template call sites — is a deliberate safety decision. escapeHtml() does
 * String(value), so a single forgotten t() would render "[object Object]"
 * into the page and every existing check would still pass. Resolving the
 * whole tree makes that class of bug structurally impossible.
 * ------------------------------------------------------------------------ */
const LOCALE_KEYS = new Set(LOCALES.map((l) => l.code));

/**
 * @param missing  array collecting dotted paths that had no translation,
 *                 so the build can report them.
 */
export function localize(node, locale, fallback, missing, trail = "content") {
  if (Array.isArray(node)) {
    return node.map((item, i) => localize(item, locale, fallback, missing, `${trail}[${i}]`));
  }

  if (node && typeof node === "object") {
    const keys = Object.keys(node);

    // A translation pair is an object whose keys are ALL locale codes. That
    // strictness is what stops { label, href } or { value, label } being
    // mistaken for one.
    const isPair = keys.length > 0 && keys.every((key) => LOCALE_KEYS.has(key));

    if (isPair) {
      // Only a genuinely absent key counts as missing. An empty string is a
      // deliberate value — it is how content.js hides an optional element
      // such as a project status badge.
      if (node[locale] !== undefined) return node[locale];
      missing.push(`${trail}.${locale}`);
      return node[fallback] !== undefined ? node[fallback] : "";
    }

    return Object.fromEntries(
      keys.map((key) => [key, localize(node[key], locale, fallback, missing, `${trail}.${key}`)])
    );
  }

  return node;
}
