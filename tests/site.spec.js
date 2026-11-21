// Static + browser tests for the RV2 portfolio and its three demo sites.
//
// Coverage:
//   - every local link, image and fragment target resolves
//   - no duplicate ids
//   - one reveal-state class everywhere (is-in, never in-view)
//   - every .reveal element becomes visible after scrolling
//   - process/stat groups reveal every card in the group together
//   - reduced-motion and no-IntersectionObserver fallbacks reveal content and settle counters
//   - process steps use the shared data-delay stagger API
//   - collection hash links (#living/#dining/#bedroom/#workspace) filter the shop
//   - core portfolio interactions: theme, currency, preview modal, mobile menu

const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ignored = new Set([".git", "node_modules", "tests"]);
const revealState = "is-in";
const oldRevealState = "in-view";

function walk(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, list);
    else list.push(full);
  }
  return list;
}

const allFiles = walk(root);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html")).sort();
const sourceFiles = allFiles.filter((file) => /\.(html|css|js)$/.test(file));
const pages = htmlFiles.map((file) => path.relative(root, file).split(path.sep).join("/"));

function pageUrl(rel) {
  return "/" + rel;
}

async function blockExternal(page) {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") route.continue();
    else route.abort();
  });
}

async function scrollEveryRevealIntoView(page) {
  // Wait for late images/fonts so layout is stable while we scroll.
  await page.waitForLoadState("load", { timeout: 20000 }).catch(() => {});
  await page.evaluate(async () => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // Revisit stragglers: fast programmatic scrolling can coalesce observer
    // callbacks, and late layout shifts can move targets after their pass.
    for (let pass = 0; pass < 4; pass++) {
      const items = Array.from(document.querySelectorAll(".reveal:not(.is-in)"));
      if (!items.length) break;
      for (const item of items) {
        item.scrollIntoView({ block: "center", behavior: "instant" });
        await wait(pass === 0 ? 55 : 120);
      }
    }
    window.scrollTo(0, root.scrollHeight);
    await wait(150);
    root.style.scrollBehavior = previousBehavior;
  });
  await page.waitForTimeout(400);
}

async function expectCountersAtFinalValue(page) {
  const counters = page.locator(".counter, .stat-num");
  await expect
    .poll(async () =>
      counters.evaluateAll((els) =>
        els
          .map((el) => ({
            text: (el.textContent || "").replace(/\D/g, ""),
            target: el.getAttribute("data-target") || el.getAttribute("data-count")
          }))
          .filter(({ text, target }) => target !== null && Number(text) !== Number(target))
      )
    )
    .toEqual([]);
}

test.describe("static integrity", () => {
  test("all local href/src targets and fragments resolve", () => {
    const problems = [];
    for (const file of htmlFiles) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const html = fs.readFileSync(file, "utf8");
      const refs = [...html.matchAll(/\b(href|src)\s*=\s*"([^"]*)"/g)];

      for (const [, attr, value] of refs) {
        if (
          !value ||
          value.startsWith("#") ||
          value.startsWith("data:") ||
          value.startsWith("mailto:") ||
          value.startsWith("tel:") ||
          value.startsWith("javascript:") ||
          /^https?:\/\//.test(value) ||
          value.startsWith("//")
        ) {
          continue;
        }
        const [pathPart, fragment] = value.split("#");
        if (!pathPart) continue;
        const resolved = path.resolve(path.dirname(file), pathPart.split("?")[0]);
        if (!fs.existsSync(resolved)) {
          problems.push(`${rel}: ${attr}="${value}" does not exist`);
          continue;
        }
        if (fragment && resolved.endsWith(".html")) {
          const targetHtml = fs.readFileSync(resolved, "utf8");
          const ids = new Set([...targetHtml.matchAll(/\bid\s*=\s*"([^"]+)"/g)].map((match) => match[1]));
          if (!ids.has(fragment)) problems.push(`${rel}: "${value}" points at missing #${fragment}`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("no duplicate ids on any page", () => {
    const problems = [];
    for (const file of htmlFiles) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const html = fs.readFileSync(file, "utf8");
      const ids = [...html.matchAll(/\bid\s*=\s*"([^"]+)"/g)].map((match) => match[1]);
      const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      if (duplicates.length) problems.push(`${rel}: ${duplicates.join(", ")}`);
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("all pages use the same reveal-state class", () => {
    const offenders = [];
    for (const file of sourceFiles) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const source = fs.readFileSync(file, "utf8");
      if (source.includes(oldRevealState)) offenders.push(rel);
    }
    expect(offenders, `Use .${revealState} instead of .${oldRevealState}: ${offenders.join(", ")}`).toEqual([]);
  });

  test("every step/stat group opts into group reveal", () => {
    const problems = [];
    for (const file of htmlFiles) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const html = fs.readFileSync(file, "utf8");
      if (/class="(?:process-grid|steps)"/.test(html) && !/data-reveal-group/.test(html)) {
        problems.push(rel);
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
});

const pagesWithReveals = [];
for (const rel of pages) {
  const html = fs.readFileSync(path.join(root, rel), "utf8");
  if (/class="[^"]*\breveal\b/.test(html)) pagesWithReveals.push(rel);
}

test.describe("reveal behaviour", () => {
  for (const rel of pagesWithReveals) {
    test(`${rel} reveals every item without runtime errors`, async ({ page }) => {
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(String(error.message || error)));
      await blockExternal(page);
      await page.goto(pageUrl(rel), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(900);
      await scrollEveryRevealIntoView(page);

      await expect(page.locator(`.reveal:not(.${revealState})`)).toHaveCount(0);
      expect(pageErrors, pageErrors.join("\n")).toEqual([]);
    });
  }

  test.describe("group reveal", () => {
    const groupedPages = pagesWithReveals.filter((rel) => {
      const html = fs.readFileSync(path.join(root, rel), "utf8");
      return /data-reveal-group/.test(html);
    });

    for (const rel of groupedPages) {
      test(`${rel} reveals every card in a step group together`, async ({ page }) => {
        await blockExternal(page);
        await page.goto(pageUrl(rel), { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);

        const groups = page.locator("[data-reveal-group]");
        const groupCount = await groups.count();
        expect(groupCount).toBeGreaterThan(0);

        for (let index = 0; index < groupCount; index++) {
          const group = groups.nth(index);
          await group.scrollIntoViewIfNeeded();
          await page.waitForTimeout(550);
          await expect(group.locator(`.reveal:not(.${revealState})`)).toHaveCount(0);
        }
      });
    }
  });

  test.describe("mobile group reveal", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const rel of ["index.html", "work/furniture-now/services.html", "work/modul/about.html"]) {
      test(`${rel} keeps step cards in sync on mobile`, async ({ page }) => {
        await blockExternal(page);
        await page.goto(pageUrl(rel), { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);

        const groups = page.locator("[data-reveal-group]");
        for (let index = 0; index < (await groups.count()); index++) {
          const group = groups.nth(index);
          await group.scrollIntoViewIfNeeded();
          await page.waitForTimeout(550);
          await expect(group.locator(`.reveal:not(.${revealState})`)).toHaveCount(0);
        }
      });
    }
  });

  test("reduced-motion visitors see all content immediately", async ({ browser }) => {
    test.setTimeout(300000);
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 }
    });
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "127.0.0.1" || url.hostname === "localhost") route.continue();
      else route.abort();
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error.message || error)));

    for (const rel of pagesWithReveals) {
      await page.goto(pageUrl(rel), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(250);
      await expect(page.locator(`.reveal:not(.${revealState})`)).toHaveCount(0);
      await expectCountersAtFinalValue(page);
    }
    expect(pageErrors, pageErrors.join("\n")).toEqual([]);
    await context.close();
  });

  test("no-IntersectionObserver browsers reveal all content", async ({ browser }) => {
    test.setTimeout(300000);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      window.IntersectionObserver = undefined;
    });
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "127.0.0.1" || url.hostname === "localhost") route.continue();
      else route.abort();
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error.message || error)));

    for (const rel of pagesWithReveals) {
      await page.goto(pageUrl(rel), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(250);
      await expect(page.locator(`.reveal:not(.${revealState})`)).toHaveCount(0);
      await expectCountersAtFinalValue(page);
    }
    expect(pageErrors, pageErrors.join("\n")).toEqual([]);
    await context.close();
  });
});

test.describe("Furniture Now collection links", () => {
  for (const category of ["living", "dining", "bedroom", "workspace"]) {
    test(`#${category} opens the shop filtered to ${category}`, async ({ page }) => {
      await blockExternal(page);
      await page.goto(`/work/furniture-now/products.html#${category}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(700);

      await expect(page.locator(`.chip.active[data-filter="${category}"]`)).toHaveCount(1);
      const visible = page.locator(".product-card:not(.hide)");
      expect(await visible.count()).toBeGreaterThan(0);
      const categories = await visible.evaluateAll((cards) => [...new Set(cards.map((card) => card.getAttribute("data-cat")))]);
      expect(categories).toEqual([category]);
      await expect(page.locator(".product-card:not(.hide):not(.is-in)")).toHaveCount(0);
    });
  }
});

test.describe("portfolio interactions", () => {
  test("theme toggle, currency switch and preview modal work", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error.message || error)));
    await blockExternal(page);
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1600);

    const themeBefore = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await page.click("#theme-toggle");
    // The theme flip is committed inside a View Transition callback, so poll.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")))
      .not.toBe(themeBefore);

    await page.selectOption("#currency-select", "USD");
    await expect(page.locator(".price-amount").first()).toContainText("$");

    await page.locator(".preview-trigger").first().click();
    await expect(page.locator("#preview-modal")).toHaveClass(/is-open/);
    await expect(page.locator("#preview-frame")).toHaveAttribute("src", /work\/.+\/index\.html$/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#preview-modal")).not.toHaveClass(/is-open/);

    expect(pageErrors, pageErrors.join("\n")).toEqual([]);
  });

  test("process steps share the data-delay stagger API", async ({ page }) => {
    await blockExternal(page);
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });

    const delays = await page.locator(".process-grid .step").evaluateAll((steps) =>
      steps.map((step) => getComputedStyle(step).transitionDelay)
    );
    expect(delays).toEqual(["0s", "0.08s", "0.16s", "0.24s"]);
  });

  test("phones get redirects instead of the live preview modal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await blockExternal(page);
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    await expect(page.locator(".preview-trigger").first()).toBeHidden();
    const firstChip = page.locator(".page-chips a").first();
    await expect(firstChip).toBeVisible();
    await expect(firstChip).toHaveAttribute("href", /work\/.+\/.+\.html$/);
    await expect(page.locator("#preview-modal")).toBeHidden();
  });

  test("mobile menu opens, sets aria state and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await blockExternal(page);
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1600);

    await page.click("#burger");
    await expect(page.locator("body")).toHaveClass(/menu-open/);
    await expect(page.locator("#burger")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/menu-open/);
    await expect(page.locator("#burger")).toHaveAttribute("aria-expanded", "false");
  });
});
