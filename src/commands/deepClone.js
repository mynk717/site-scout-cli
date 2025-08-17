import { chromium } from "playwright";
import path from "path";
import fs from "fs-extra";
import { URL } from "url";

export async function deepCloneCommand(
  startUrl,
  outputDir = "deep-cloned-site"
) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const assets = new Set();
  const visitedPages = new Set();
  const pagesToVisit = [startUrl];

  await fs.emptyDir(outputDir);

  // Collect all network requests for assets
  page.on("requestfinished", async request => {
    const url = request.url();
    const protocol = url.split(":")[0];
    if (!["http", "https"].includes(protocol)) return;
    // Ignore API endpoints if desired
    if (!url.includes("/api/")) assets.add(url);
  });

  while (pagesToVisit.length) {
    const pageUrl = pagesToVisit.pop();
    if (visitedPages.has(pageUrl)) continue;
    visitedPages.add(pageUrl);

    await page.goto(pageUrl, { waitUntil: "networkidle" });

    // Extract internal links for further crawling
    const links = await page.$$eval("a[href]", as =>
      Array.from(as)
        .map(a => a.href)
        .filter(href => href.startsWith(window.location.origin))
    );
    links.forEach(href => {
      if (!visitedPages.has(href)) pagesToVisit.push(href);
    });

    // Save HTML
    const urlObj = new URL(pageUrl);
    let filePath =
      urlObj.pathname.endsWith("/") || urlObj.pathname === ""
        ? "index.html"
        : urlObj.pathname.slice(1);

    if (!filePath.endsWith(".html")) filePath += ".html";
    const savePath = path.join(outputDir, filePath);
    await fs.ensureDir(path.dirname(savePath));
    await fs.writeFile(savePath, await page.content(), "utf8");
  }

  // Download all captured assets
  for (const assetUrl of assets) {
    try {
      const urlObj = new URL(assetUrl);
      let assetPath = urlObj.pathname.startsWith("/")
        ? urlObj.pathname.slice(1)
        : urlObj.pathname;
      if (!assetPath) continue;
      const savePath = path.join(outputDir, assetPath);
      await fs.ensureDir(path.dirname(savePath));
      const resp = await page.goto(assetUrl);
      if (resp && resp.ok()) {
        const buffer = await resp.body();
        await fs.writeFile(savePath, buffer);
      }
    } catch (e) {
      console.error(`Couldn't fetch ${assetUrl}:`, e.message);
    }
  }

  await browser.close();
  console.log(`\n✅ Deep clone complete in: ${outputDir}`);
}
