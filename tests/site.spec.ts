import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PROJECTS = ["b2c", "shuren", "orchuulga", "degfim"];

/** Every indexable page, in both locales. Paths are relative to the base. */
const PAGES = ["", "en/", ...PROJECTS.flatMap((p) => [`projects/${p}/`, `en/projects/${p}/`])];

const LIVE_API = "https://github-contributions-api.jogruber.de/**";
const CORS = { "access-control-allow-origin": "*" };

// The live calendar API is third-party; tests never depend on it being up.
// Tests that need it register their own route, which takes precedence.
test.beforeEach(async ({ page }) => {
  await page.route(LIVE_API, (route) => route.fulfill({ status: 503, headers: CORS }));
});

/** Fails the test on console errors and on failed same-origin requests. */
function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    // A down live-calendar API only leaves the build-time calendar in place.
    if (msg.location().url.includes("github-contributions-api")) return;
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => {
    if (!req.url().includes("github-contributions-api"))
      errors.push(`request failed: ${req.url()}`);
  });
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
      // Scroll reveals leave off-screen content mid-fade; check the settled page.
      await page.emulateMedia({ reducedMotion: "reduce" });
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
  for (const path of [
    "en/",
    "projects/b2c/",
    "en/projects/shuren/",
    "en/projects/orchuulga/",
    "en/projects/degfim/",
  ]) {
    test(`/${path} has no contrast or other axe violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await loadEverything(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  }
});

test.describe("light mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
  });
  for (const path of [
    "",
    "en/",
    "projects/b2c/",
    "en/projects/shuren/",
    "en/projects/orchuulga/",
    "en/projects/degfim/",
  ]) {
    test(`/${path} has no contrast or other axe violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await loadEverything(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  }
});

test("the theme toggle switches to light and the choice survives a reload", async ({ page }) => {
  await page.goto("en/");
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-theme", "light");
  const toggle = page.getByRole("button", { name: "Switch to light mode" });
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(html).not.toHaveAttribute("data-theme", "light");
});

test("header: section links, CV view and contact from a case study", async ({ page }, testInfo) => {
  await page.goto("en/projects/shuren/");
  const header = page.locator(".site-header");
  if (testInfo.project.name === "mobile") {
    await header.locator(".menu summary").click();
  }
  const nav = header.getByRole("navigation", { name: "Main" });
  for (const [name, hash] of [
    ["Work", "work"],
    ["Experience", "background"],
    ["Expertise", "expertise"],
    ["About", "about"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      `/portfolio/en/#${hash}`,
    );
  }
  const cv = header.getByRole("link", { name: "View resume" });
  await expect(cv).toHaveAttribute("href", "/portfolio/resume.pdf");
  await expect(cv).toHaveAttribute("target", "_blank");
  await expect(cv).not.toHaveAttribute("download");
  await expect(header.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
    "href",
    "/portfolio/en/#contact",
  );
});

test("mobile menu closes after picking a link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the menu only exists on narrow screens");
  await page.goto("en/");
  const menu = page.locator(".menu");
  await expect(menu.locator("summary")).toHaveAccessibleName("Menu");
  await menu.locator("summary").click();
  await expect(menu).toHaveAttribute("open", "");
  await menu.getByRole("link", { name: "About" }).click();
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(page).toHaveURL(/#about$/);
});

test("hero names the live sites and links the clients to their case studies", async ({ page }) => {
  await page.goto("en/");
  const statement = page.locator(".statement");
  await expect(statement.getByRole("link", { name: "a tour operator" })).toHaveAttribute(
    "href",
    "/portfolio/en/projects/b2c/",
  );
  await expect(statement.getByRole("link", { name: "a jewelry shop" })).toHaveAttribute(
    "href",
    "/portfolio/en/projects/shuren/",
  );
  const terminal = page.locator(".terminal");
  for (const domain of [
    "global-travel.mn",
    "shuren.mn",
    "orchuulga.mn",
    "degfim.nova-shop.workers.dev",
  ]) {
    const link = terminal.getByRole("link", { name: domain });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute(
      "href",
      new RegExp(`^https?://(www\\.)?${domain.replace(/\./g, "\\.")}`),
    );
  }
});

test("timeline lists work and study newest first; certificates stay hidden while empty", async ({
  page,
}) => {
  await page.goto("en/");
  const years = await page.locator("#background .year-label").allTextContents();
  expect(years).toEqual([...years].sort().reverse());
  expect(years[0]).toBe("2026");
  await expect(page.locator("#background .certificates")).toHaveCount(0);
});

test("expertise shows decorative logos, and text only where none exists", async ({ page }) => {
  await page.goto("en/");
  const skills = page.locator("#expertise dd");
  await expect(
    skills.filter({ hasText: "TypeScript" }).locator('svg[aria-hidden="true"]'),
  ).toHaveCount(1);
  await expect(skills.filter({ hasText: "AWS" }).locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(skills.filter({ hasText: "Playwright" }).locator("svg")).toHaveCount(0);
});

test("GitHub activity: a GitHub-style calendar and a linked yearly total", async ({ page }) => {
  for (const path of ["", "en/"]) {
    await page.goto(path);
    const activity = page.locator("#activity");
    // The section is left out when GitHub can't be read at build time.
    if ((await activity.count()) === 0) continue;
    const calendar = activity.locator('.scroller > svg[aria-hidden="true"]');
    expect(await calendar.locator("rect").count()).toBeGreaterThanOrEqual(52 * 7);
    expect(await calendar.locator("text").count()).toBeGreaterThanOrEqual(10 + 3);
    await expect(calendar.locator("rect").first()).toHaveAttribute("data-count", /^\d+$/);
    const link = activity.locator(".total a");
    await expect(link).toHaveAttribute("href", "https://github.com/Juu316");
    await expect(link).toHaveText(/\d/);

    // Only built with a GitHub token.
    const stats = activity.locator(".stats dd");
    for (const value of await stats.allTextContents()) expect(value).toMatch(/^[\d,\s]+$/);
    const percents = await activity.locator(".languages .pct").allTextContents();
    if (percents.length) {
      const sum = percents.reduce((n, p) => n + parseFloat(p), 0);
      expect(Math.abs(sum - 100)).toBeLessThan(1);
    }
  }
});

test("GitHub activity: redraws from the live API and shows GitHub's day bubble", async ({
  page,
}) => {
  // 53 Sunday-aligned weeks, like the API's "last year".
  const start = Date.UTC(2025, 9, 12);
  const contributions = Array.from({ length: 53 * 7 }, (_, i) => ({
    date: new Date(start + i * 864e5).toISOString().slice(0, 10),
    count: i % 5,
    level: i % 5,
  }));
  await page.route(LIVE_API, (route) =>
    route.fulfill({ headers: CORS, json: { total: { lastYear: 4321 }, contributions } }),
  );
  await page.goto("en/");
  const activity = page.locator("#activity");
  test.skip((await activity.count()) === 0, "built without GitHub data");
  await expect(activity).toHaveAttribute("data-live", "");
  await expect(activity.locator(".total a")).toHaveText("4,321 contributions in the last year");
  const cells = activity.locator(".scroller rect");
  await expect(cells).toHaveCount(contributions.length);
  await expect(activity.locator(".scroller title")).toHaveCount(0);

  const tip = activity.locator(".tip");
  await expect(tip).toBeHidden();
  await activity.locator('rect[data-date="2026-10-15"]').scrollIntoViewIfNeeded();
  await activity.locator('rect[data-date="2026-10-15"]').hover();
  await expect(tip).toBeVisible();
  // Day 368 of the fixture: 368 % 5 = 3.
  await expect(tip).toHaveText("3 contributions on October 15th.");
  await activity.locator('rect[data-date="2025-10-12"]').scrollIntoViewIfNeeded();
  await activity.locator('rect[data-date="2025-10-12"]').hover();
  await expect(tip).toHaveText("No contributions on October 12th.");
  await activity.locator('rect[data-date="2025-10-13"]').hover();
  await expect(tip).toHaveText("1 contribution on October 13th.");
  await page.mouse.move(0, 0);
  await expect(tip).toBeHidden();
});

test("GitHub activity: keeps the build-time calendar when the live API fails", async ({ page }) => {
  await page.goto("en/");
  const activity = page.locator("#activity");
  test.skip((await activity.count()) === 0, "built without GitHub data");
  await expect(activity.locator(".total a")).toHaveText(/\d/);
  expect(await activity.locator(".scroller rect").count()).toBeGreaterThanOrEqual(52 * 7);
  await expect(activity).not.toHaveAttribute("data-live");
  const cell = activity.locator(".scroller rect").last();
  await cell.scrollIntoViewIfNeeded();
  await cell.hover();
  await expect(activity.locator(".tip")).toHaveText(/contribution/);
});

test("contact: copy buttons copy the email address and phone number", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("en/");
  const contact = page.locator("#contact");
  const buttons = contact.getByRole("button", { name: "Copy" });
  await expect(buttons).toHaveCount(2);
  await buttons.first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("iikii427@proton.me");
  await expect(contact.locator("[data-copy-status]")).toHaveText("Email address copied");
  await buttons.last().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("+97680383316");
  await expect(contact.locator('a[href="tel:+97680383316"]').first()).toBeVisible();
});

test("the language switch keeps you on the same page", async ({ page }) => {
  await page.goto("projects/shuren/");
  await page.getByRole("link", { name: "Англиар үзэх" }).click();
  await expect(page).toHaveURL(/\/portfolio\/en\/projects\/shuren\/$/);
  await page.getByRole("link", { name: "View in Mongolian" }).click();
  await expect(page).toHaveURL(/\/portfolio\/projects\/shuren\/$/);
});

test("the language switch swaps the page in place and keeps your place", async ({ page }) => {
  // Click at the link's position: locator.click() scrolls the page first on mobile.
  const clickInPlace = async (name: string) => {
    const box = (await page.getByRole("link", { name }).boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };
  const titleTop = () =>
    page.evaluate(() => document.getElementById("work-title")!.getBoundingClientRect().top);

  await page.goto("en/");
  await page.evaluate(() => {
    document.getElementById("work")!.scrollIntoView({ behavior: "instant" });
    (window as unknown as { marker: number }).marker = 1;
  });
  const before = await titleTop();
  await clickInPlace("View in Mongolian");
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "mn");
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
  expect(Math.abs((await titleTop()) - before)).toBeLessThan(2);

  // Scripts still work on the swapped page.
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // Back swaps the English page in again, still without a reload.
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveURL(/\/portfolio\/en\/$/);
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);

  await page.goto("projects/shuren/");
  await page.evaluate(() =>
    scrollTo({ top: (document.body.scrollHeight - innerHeight) / 2, behavior: "instant" }),
  );
  const y = await page.evaluate(() => scrollY);
  await clickInPlace("Англиар үзэх");
  await expect(page).toHaveURL(/\/portfolio\/en\/projects\/shuren\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(y / 2);
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
  // The address itself and the "Email me" button.
  await expect(contact.locator('a[href="mailto:iikii427@proton.me"]')).toHaveCount(2);
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
