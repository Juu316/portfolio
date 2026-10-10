/**
 * Captures the project screenshots used on the site, straight from the live
 * products, so every image on the portfolio is the real thing.
 *
 *   npm run capture            all shots
 *   npm run capture -- shuren  one project
 *
 * Output: src/assets/projects/<project>/<name>.webp at 2x density, near-lossless
 * so astro:assets has a clean master to resize into AVIF/WebP at build time.
 *
 *   npm run capture -- og      the portfolio's own link-preview image
 *
 * "og" shoots this site at the 1200×630 Open Graph ratio into src/assets/og/.
 * It uses the deployed site; set CAPTURE_BASE to shoot a local preview instead,
 * e.g. CAPTURE_BASE=http://localhost:4321/portfolio/ npm run capture -- og
 *
 * Re-run after a project's design changes, then review every image before
 * committing — live sites can show placeholder products, test data or
 * promotions that shouldn't end up on the portfolio.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const OG = { width: 1200, height: 630 };
const SITE = process.env.CAPTURE_BASE ?? "https://juu316.github.io/portfolio/";

/** @type {Record<string, { name: string, url: string, viewport: typeof DESKTOP, locale?: string }[]>} */
const SHOTS = {
  b2c: [
    { name: "home", url: "https://global-travel.mn/", viewport: DESKTOP },
    { name: "tour", url: "https://global-travel.mn/tours/vietnam-danang", viewport: DESKTOP },
    { name: "insurance", url: "https://global-travel.mn/daatgal", viewport: DESKTOP },
    { name: "home-mobile", url: "https://global-travel.mn/", viewport: MOBILE },
  ],
  shuren: [
    { name: "home", url: "https://shuren.mn/", viewport: DESKTOP },
    { name: "category", url: "https://shuren.mn/category/suvd", viewport: DESKTOP },
    { name: "gift-card", url: "https://shuren.mn/gift-card", viewport: DESKTOP },
    {
      name: "product-mobile",
      url: "https://shuren.mn/product/ametist-dusal-zuult-zu0004",
      viewport: MOBILE,
    },
  ],
  orchuulga: [
    { name: "home", url: "https://www.orchuulga.mn/", viewport: DESKTOP },
    { name: "home-mobile", url: "https://www.orchuulga.mn/", viewport: MOBILE },
  ],
  og: [
    { name: "home-mn", url: SITE, viewport: OG, locale: "mn-MN" },
    { name: "home-en", url: new URL("en/", SITE).href, viewport: OG, locale: "en-US" },
  ],
};

const only = process.argv[2];
const projects = only ? { [only]: SHOTS[only] } : SHOTS;
if (only && !SHOTS[only]) {
  console.error(`Unknown project "${only}". Expected one of: ${Object.keys(SHOTS).join(", ")}`);
  process.exit(1);
}

const browser = await chromium.launch();
let failed = 0;

for (const [project, shots] of Object.entries(projects)) {
  const dir = new URL(
    project === "og" ? "../src/assets/og/" : `../src/assets/projects/${project}/`,
    import.meta.url,
  );
  await mkdir(dir, { recursive: true });

  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
      locale: shot.locale ?? "mn-MN",
      colorScheme: "light",
    });
    const page = await context.newPage();
    try {
      await page.goto(shot.url, { waitUntil: "networkidle", timeout: 60_000 });
      // Scroll the whole page once so lazy images and reveal-on-scroll
      // sections render, then return to the top for the shot.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      // Best effort: some pages keep a socket or poll open and never go idle.
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      // The crewmate cursor follows the (virtual) mouse and would cover the name.
      if (project === "og") await page.addStyleTag({ content: ".cursor-buddy{display:none}" });
      await page.waitForTimeout(800);
      const png = await page.screenshot();
      await sharp(png)
        .webp({ quality: 90 })
        .toFile(new URL(`${shot.name}.webp`, dir).pathname);
      console.log(`✓ ${project}/${shot.name}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${project}/${shot.name}: ${error.message.split("\n")[0]}`);
    } finally {
      await context.close();
    }
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
