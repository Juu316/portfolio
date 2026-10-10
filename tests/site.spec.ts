import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PROJECTS = ["b2c", "shuren", "orchuulga"];

/** Every indexable page, in both locales. Paths are relative to the base. */
const PAGES = ["", "en/", ...PROJECTS.flatMap((p) => [`projects/${p}/`, `en/projects/${p}/`])];

/** Fails the test on console errors and on failed same-origin requests. */
function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => errors.push(`request failed: ${req.url()}`));
  page.on("response", (res) => {
    if (res.status() >= 400 && res.url().startsWith("http://localhost")) {
      errors.push(`${res.status()}: ${res.url()}`);
    }
  });
  return errors;
}

/** Scroll through the page so lazy images load, then return to the top. */
async function loadEverything(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForLoadState("networkidle");
}

for (const path of PAGES) {
  test.describe(`/${path}`, () => {
    test("renders without errors, broken images or overflow", async ({ page }) => {
      const errors = watchForErrors(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await loadEverything(page);

      await expect(page.locator("h1")).toHaveCount(1);

      const broken = await page.$$eval("img", (imgs) =>
        imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc),
      );
      expect(broken).toEqual([]);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      expect(errors).toEqual([]);
    });

    test("has no detectable accessibility violations", async ({ page }) => {
      await page.goto(path);
      await loadEverything(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      const summary = results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
      expect(summary).toEqual([]);
    });

    test("has correct language, canonical and hreflang tags", async ({ page }) => {
      await page.goto(path);
      const isEnglish = path.startsWith("en/");
      await expect(page.locator("html")).toHaveAttribute("lang", isEnglish ? "en" : "mn");

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://juu316.github.io/portfolio/${path}`);

      const neutral = path.replace(/^en\//, "");
      const alternates = await page.$$eval('link[rel="alternate"][hreflang]', (links) =>
        Object.fromEntries(links.map((l) => [l.getAttribute("hreflang"), l.getAttribute("href")])),
      );
      expect(alternates).toEqual({
        mn: `https://juu316.github.io/portfolio/${neutral}`,
        en: `https://juu316.github.io/portfolio/en/${neutral}`,
        "x-default": `https://juu316.github.io/portfolio/${neutral}`,
      });

      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /^https:\/\//,
      );
    });

    test("every internal link resolves", async ({ page, request }) => {
      await page.goto(path);
      const hrefs = await page.$$eval("a[href]", (links) =>
        links
          .map((a) => (a as HTMLAnchorElement).href)
          .filter((h) => h.startsWith("http://localhost")),
      );
      for (const href of new Set(hrefs.map((h) => h.split("#")[0]!))) {
        const res = await request.get(href);
        expect(res.status(), href).toBe(200);
      }
      // In-page anchors must point at something that exists.
      const anchors = await page.$$eval('a[href*="#"]', (links) =>
        links
          .map((a) => new URL((a as HTMLAnchorElement).href))
          .filter((u) => u.pathname === location.pathname && u.hash)
          .map((u) => u.hash.slice(1)),
      );
      for (const id of anchors) {
        await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
      }
    });
  });
}

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });
  for (const path of ["en/", "projects/b2c/", "en/projects/shuren/", "en/projects/orchuulga/"]) {
    test(`/${path} has no contrast or other axe violations`, async ({ page }) => {
      await page.goto(path);
      await loadEverything(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  }
});

test("the language switch keeps you on the same page", async ({ page }) => {
  await page.goto("projects/shuren/");
  await page.getByRole("link", { name: "Англиар үзэх" }).click();
  await expect(page).toHaveURL(/\/portfolio\/en\/projects\/shuren\/$/);
  await page.getByRole("link", { name: "View in Mongolian" }).click();
  await expect(page).toHaveURL(/\/portfolio\/projects\/shuren\/$/);
});

test("keyboard: skip link comes first and moves focus to main", async ({ page }) => {
  await page.goto("en/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("project index links to every case study in both languages", async ({ page }) => {
  for (const [home, prefix] of [
    ["", ""],
    ["en/", "en/"],
  ] as const) {
    await page.goto(home);
    for (const slug of PROJECTS) {
      await expect(
        page.locator(`#work a[href="/portfolio/${prefix}projects/${slug}/"]`),
      ).toHaveCount(1);
    }
  }
});

test("contact: mailto link and a form that posts to Web3Forms", async ({ page }) => {
  await page.goto("en/");
  const contact = page.locator("#contact");
  await expect(contact.locator('a[href="mailto:iikii427@proton.me"]')).toHaveCount(1);
  await expect(contact.locator('a[href="https://github.com/Juu316"]')).toHaveCount(1);

  const form = contact.locator("form");
  await expect(form).toHaveAttribute("action", "https://api.web3forms.com/submit");
  await expect(form).toHaveAttribute("method", /post/i);
  await expect(form.locator('input[name="access_key"]')).toHaveValue(/^[0-9a-f-]{36}$/);
  await expect(form.locator('input[name="redirect"]')).toHaveValue(
    "https://juu316.github.io/portfolio/en/thanks/",
  );
  for (const label of ["Name", "Email", "Message"]) {
    await expect(form.getByLabel(label)).toHaveAttribute("required", "");
  }
});

test("the crewmate cursor can be switched off and stays off", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the buddy only runs with a mouse");
  await page.goto("en/");
  const toggle = page.locator("[data-cursor-toggle]");
  await page.mouse.move(400, 400);
  await expect(page.locator(".cursor-buddy")).toHaveCount(1);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAccessibleName("Crewmate cursor: off");
  await expect(page.locator(".cursor-buddy")).toHaveCount(0);

  await page.reload();
  await page.mouse.move(500, 500);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".cursor-buddy")).toHaveCount(0);
});

test("404 page is served for unknown paths", async ({ page }) => {
  const res = await page.goto("does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Ийм хуудас алга");
});
