import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * One folder per project, one MDX file per locale:
 *   src/content/projects/<slug>/mn.mdx
 *   src/content/projects/<slug>/en.mdx
 * Entry ids come out as "<slug>/<locale>"; see `splitId` in src/i18n/ui.ts.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One sentence for the project index and meta description. */
      summary: z.string(),
      client: z.string(),
      role: z.string(),
      period: z.string(),
      /** Sort key and the year shown in the index. */
      year: z.number().int(),
      order: z.number().int(),
      url: z.url(),
      stack: z.array(z.string()).min(1),
      /** Key into the accent tokens in src/styles/tokens.css. */
      accent: z.enum(["gtc", "shuren", "orchuulga"]),
      size: z.enum(["full", "short"]),
      cover: image(),
      coverAlt: z.string(),
    }),
});

export const collections = { projects };
