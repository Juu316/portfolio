// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// GitHub Pages serves this repo at /portfolio. With a custom domain later,
// set `site` to it and remove `base`.
export default defineConfig({
  site: "https://juu316.github.io",
  base: "/portfolio",
  trailingSlash: "always",
  i18n: {
    locales: ["mn", "en"],
    defaultLocale: "mn",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: "mn", locales: { mn: "mn-MN", en: "en-US" } },
    }),
  ],
});
