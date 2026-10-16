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
 * Items without an entry (Playwright, QPay, HiPay, Wire) have no logo in
 * simple-icons and stay text only; its "Wire" is the messenger app. Java and
 * AWS are in `traced` below. */
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

export type Logo = {
  title: string;
  path: string;
  dark: string | null;
  light: string | null;
  viewBox?: string;
};

/** Java and AWS are not in simple-icons. These paths were traced with potrace
 * from logo images the owner supplied (2026-10-16); hexes are the ones
 * simple-icons used before it removed them. */
const traced: Record<string, { title: string; hex: string; viewBox: string; path: string }> = {
  Java: {
    title: "Java",
    hex: "007396",
    viewBox: "0 0 90 90",
    path: "M 54.5 1.8 C 55.7 5.9, 51.7 12.3, 43.8 18.8 C 30.7 29.5, 30.2 32.1, 38.9 42.8 C 43.5 48.4, 44.7 48.1, 41 42.3 C 35.9 34.3, 36.6 30.9, 44.9 23 C 48.7 19.4, 52.8 14.9, 53.9 13 C 56.2 9.2, 56.8 1.6, 54.9 0.4 C 54.2 0, 54 0.4, 54.5 1.8 M 55.9 21.3 C 44.8 27, 42.7 33.1, 48.6 41.9 C 50.9 45.4, 51.1 46.4, 50.2 48.5 C 48.7 51.7, 51.2 50.9, 53.4 47.5 C 55.7 44.1, 55.4 40.9, 52.5 37 C 51.1 35.1, 50 32.7, 50 31.7 C 50 29.7, 56.3 22.9, 61 19.8 C 65.1 17.1, 62.6 17.8, 55.9 21.3 M 71.2 49.4 C 76.5 52.5, 75.3 58.8, 68.5 63 C 63.9 65.8, 64 66.4, 68.8 64.5 C 79.7 59.9, 81.6 50.1, 71.9 48.5 L 68.5 47.9 71.2 49.4 M 24.6 50.8 C 19.2 52.6, 17.9 54.3, 20.7 55.5 C 24.3 56.9, 42.7 57.3, 51.1 56.1 C 62.5 54.4, 64.9 52.8, 54.5 53.8 C 43.7 54.8, 28.9 54.7, 26.5 53.6 C 24.7 52.9, 24.9 52.6, 28.5 50.9 C 33.5 48.6, 31.1 48.5, 24.6 50.8 M 27 61.5 C 25 63.9, 26.8 64.9, 34.4 66.1 C 41.5 67.2, 57.5 65.8, 59.5 63.9 C 60.7 62.7, 60.1 62.7, 44.3 63 C 32.9 63.2, 30.9 63, 30.4 61.6 C 29.6 59.6, 28.6 59.6, 27 61.5 M 29.4 71.5 C 28.5 73.9, 29.8 74.8, 35.7 76.1 C 41.7 77.3, 50.7 76.8, 55.5 75 C 60.5 73.1, 55.9 71, 49 72.1 C 43.1 73, 33.3 72.3, 32.4 70.9 C 31.6 69.5, 30 69.8, 29.4 71.5 M 16.5 77.4 C 7.2 81.4, 10.2 83.4, 28.4 85 C 47.6 86.8, 72.4 83.6, 73.8 79.2 C 74.1 78.1, 73.7 78.1, 71.9 79.3 C 67.9 81.9, 54.1 83.3, 37.2 82.8 C 18 82.3, 12.8 80.5, 21.3 77.3 C 24.2 76.2, 24.3 76.1, 22 76.1 C 20.6 76.1, 18.2 76.7, 16.5 77.4 M 74.8 83.7 C 69.1 86.6, 57.8 88.3, 42 88.4 C 32.4 88.4, 28 88.7, 30.5 89.2 C 46 92, 78 87.8, 78 83 C 78 82.4, 77.9 82, 77.8 82.1 C 77.6 82.2, 76.3 82.9, 74.8 83.7",
  },
  AWS: {
    title: "Amazon Web Services",
    hex: "232F3E",
    viewBox: "0 0 96 96",
    path: "M 10 20.3 C 7.6 21.1, 6.4 22.2, 6.2 23.8 C 5.9 25.8, 6.1 25.9, 8.5 25 C 11.6 23.8, 18 23.7, 19.7 24.8 C 20.4 25.2, 21.3 27, 21.6 28.8 L 22.3 32 15.8 32 C 10.1 32, 8.9 32.3, 6.6 34.6 C -1.5 42.7, 10.3 54, 19.4 46.9 C 22 44.8, 22.2 44.8, 23.5 46.6 C 25.1 48.8, 28.9 47.3, 28.1 44.8 C 27.8 44.1, 27.4 39.2, 27 34 C 26.4 23.2, 26 22.3, 21.4 20.4 C 17.4 18.7, 14.7 18.7, 10 20.3 M 76.1 20.7 C 68.2 24.8, 70 32.1, 79.7 35.9 C 86.8 38.7, 88.2 40.6, 84.8 43.3 C 82.6 45.2, 77.4 45.2, 72.7 43.4 C 71.4 43, 71 43.3, 71 44.9 C 71 50, 85.5 50.5, 89.7 45.6 C 94.4 40.1, 92 34.9, 83.2 31.9 C 74 28.8, 74.6 23.5, 84 24.2 C 89.2 24.6, 90 24.4, 90 22.9 C 90 19.3, 81.3 17.9, 76.1 20.7 M 30 20.5 C 30 20.8, 31.8 27, 34 34.1 C 36.2 41.3, 38 47.3, 38 47.6 C 38 47.8, 39.3 48, 41 48 C 44.2 48, 44.2 48.1, 47.4 34.1 C 48.2 30.7, 49.1 27.6, 49.3 27.4 C 49.5 27.2, 50.7 31.7, 52 37.5 L 54.3 48.1 57.4 47.8 C 60.6 47.5, 60.3 48.3, 68.5 22.2 C 69.1 20.1, 68.9 19.9, 66.4 20.2 C 63.7 20.5, 63.4 21, 60.6 31.4 L 57.6 42.4 55.7 34.9 C 51.8 19, 52.2 19.8, 49.2 20.2 C 46.7 20.5, 46.3 21.1, 43.9 31 C 42.4 36.8, 41.1 41.3, 41 41 C 40.9 40.7, 39.6 36, 38.2 30.5 C 35.7 21.1, 35.3 20.5, 32.8 20.2 C 31.2 20, 30 20.1, 30 20.5 M 12.3 36 C 9.7 37, 9.1 41.7, 11.2 43.8 C 14.2 46.8, 22 42.8, 22 38.2 C 22 35.5, 16.6 34.3, 12.3 36 M 81 56.8 L 77.5 58.5 84.3 58.8 L 91 59.1 91 62.1 C 91 63.7, 90.3 66.6, 89.6 68.5 C 87.1 74.4, 90.5 72.8, 93.3 66.8 C 97.1 58.7, 97.4 56.3, 94.7 55.6 C 90.7 54.5, 84.6 55.1, 81 56.8 M 1 57.9 C 1 61.3, 17.9 70.9, 29.5 74.1 C 47.5 79.1, 71.7 75.5, 85.1 65.9 C 90.2 62.3, 86.9 61.9, 77.4 65 C 53.4 72.7, 27.7 70.6, 5.2 59.1 C 2.9 57.9, 1 57.4, 1 57.9",
  },
};

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

for (const [item, icon] of Object.entries(traced)) {
  logos[item] = [
    {
      title: icon.title,
      path: icon.path,
      viewBox: icon.viewBox,
      dark: brand(icon.hex, PAPER.dark),
      light: brand(icon.hex, PAPER.light),
    },
  ];
}
