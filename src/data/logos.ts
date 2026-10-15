import {
  siBetterauth,
  siClaude,
  siCloudflare,
  siCss,
  siDrizzle,
  siExpress,
  siGit,
  siGithub,
  siGo,
  siHtml5,
  siLinux,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siRailway,
  siReact,
  siSocketdotio,
  siSpringboot,
  siSqlite,
  siSvelte,
  siTailwindcss,
  siTypescript,
  siVite,
  siVitest,
  siZod,
  type SimpleIcon,
} from "simple-icons";

/** Logos for the items in `expertise`, keyed by the item's exact label.
 * Items without an entry (AWS, Java, Playwright, QPay, HiPay, Wire) have no
 * logo in simple-icons and stay text only; its "Wire" is the messenger app. */
const icons: Record<string, SimpleIcon[]> = {
  TypeScript: [siTypescript],
  "HTML / CSS": [siHtml5, siCss],
  "Svelte 5 / SvelteKit": [siSvelte],
  "React 19": [siReact],
  "Next.js": [siNextdotjs],
  "Tailwind CSS": [siTailwindcss],
  Vite: [siVite],
  "Node.js": [siNodedotjs],
  Express: [siExpress],
  "Spring Boot": [siSpringboot],
  Go: [siGo],
  "Better Auth": [siBetterauth],
  "Socket.IO": [siSocketdotio],
  Zod: [siZod],
  PostgreSQL: [siPostgresql],
  MongoDB: [siMongodb],
  "SQLite / Cloudflare D1": [siSqlite],
  "Drizzle ORM": [siDrizzle],
  "Cloudflare Workers, D1, R2": [siCloudflare],
  Railway: [siRailway],
  Vitest: [siVitest],
  "Git / GitHub": [siGit, siGithub],
  Linux: [siLinux],
  "Anthropic Claude": [siClaude],
};

/** Paper colours from tokens.css, for the contrast check below. */
const PAPER = { dark: "#0C1226", light: "#F2F4F9" };

function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.replace("#", "").slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Brand colour for one theme, or null (the logo then uses --ink) when it
 * falls under 3:1 (WCAG 1.4.11) on that theme's paper. Brand colours were the
 * owner's choice (2026-10-15), an exception to accents being project-only. */
function brand(hex: string, paper: string) {
  return contrast(`#${hex}`, paper) >= 3 ? `#${hex}` : null;
}

export type Logo = { title: string; path: string; dark: string | null; light: string | null };

export const logos: Record<string, Logo[]> = Object.fromEntries(
  Object.entries(icons).map(([item, list]) => [
    item,
    list.map((icon) => ({
      title: icon.title,
      path: icon.path,
      dark: brand(icon.hex, PAPER.dark),
      light: brand(icon.hex, PAPER.light),
    })),
  ]),
);
