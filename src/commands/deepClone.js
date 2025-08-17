import { chromium } from "playwright";
import path from "path";
import fs from "fs-extra";
import { URL } from "url";
import * as cheerio from "cheerio";

const MAX_DEPTH = 3;
const CONCURRENCY = 5;
const PAGE_TIMEOUT = 30000;
const TOTAL_TIMEOUT = 300000;

// New: Canonical URL normalization (removes trailing slash, hash, query)
function canonicalUrl(url) {
  const urlObj = new URL(url);
  urlObj.hash = "";
  urlObj.search = "";
  let p = urlObj.pathname;
  if (p.endsWith("/") && p !== "/") p = p.slice(0, -1);
  urlObj.pathname = p;
  return urlObj.href;
}

function urlToLocalPath(url, baseOrigin) {
  const urlObj = new URL(url);
  if (urlObj.origin !== baseOrigin) return null;
  let localPath = decodeURIComponent(urlObj.pathname);
  if (localPath === "/" || localPath === "") return "index.html";
  if (localPath.endsWith("/"))
    localPath = localPath.slice(0, -1) + "/index.html";
  else if (!path.extname(localPath)) localPath += ".html";
  if (localPath.startsWith("/")) localPath = localPath.slice(1);
  return localPath;
}

async function discoverSite(startUrl, baseOrigin) {
  const startTime = Date.now();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pagesQueue = [{ url: startUrl, depth: 0 }];
  const visitedPages = new Set();
  const allPagesHtml = new Map(); // canonical url -> html
  const allAssets = new Set();

  page.on("response", response => {
    const url = response.url();
    if (response.ok() && url.startsWith(baseOrigin) && !url.includes("/api/")) {
      allAssets.add(url);
    }
  });

  while (pagesQueue.length > 0) {
    const { url, depth } = pagesQueue.shift();
    const canon = canonicalUrl(url);
    if (visitedPages.has(canon) || depth > MAX_DEPTH) continue;
    visitedPages.add(canon);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: PAGE_TIMEOUT });
      const html = await page.content();
      allPagesHtml.set(canon, html);

      const $ = cheerio.load(html);
      $("a[href]").each((i, el) => {
        const href = $(el).attr("href");
        if (href) {
          try {
            const absHref = new URL(href, url).href;
            const absCanon = canonicalUrl(absHref);
            if (absHref.startsWith(baseOrigin) && !visitedPages.has(absCanon)) {
              pagesQueue.push({ url: absHref, depth: depth + 1 });
            }
          } catch {}
        }
      });
    } catch (e) {
      console.warn(`Discovery failed for ${url}: ${e.message}`);
    }

    if (Date.now() - startTime > TOTAL_TIMEOUT)
      throw new Error("Discovery exceeded total timeout");
  }

  await browser.close();
  return {
    allPages: Array.from(allPagesHtml.keys()),
    allPagesHtml,
    allAssets: Array.from(allAssets),
  };
}

async function rewriteAndSavePages(
  allPages,
  allPagesHtml,
  baseOrigin,
  outputDir
) {
  const urlMapping = new Map();
  for (const canon of allPages) {
    urlMapping.set(canon, urlToLocalPath(canon, baseOrigin));
  }

  const batches = [];
  for (let i = 0; i < allPages.length; i += CONCURRENCY) {
    batches.push(allPages.slice(i, i + CONCURRENCY));
  }

  for (const batch of batches) {
    await Promise.allSettled(
      batch.map(async canon => {
        const html = allPagesHtml.get(canon);
        if (!html) return;

        const $ = cheerio.load(html);

        $("a[href]").each((i, el) => {
          const href = $(el).attr("href");
          if (href) {
            try {
              const absHref = new URL(href, canon).href;
              const absCanon = canonicalUrl(absHref);
              if (absHref.startsWith(baseOrigin)) {
                const localPath = urlMapping.get(absCanon);
                if (localPath) $(el).attr("href", localPath);
              }
            } catch {}
          }
        });

        const localPath = urlMapping.get(canon);
        if (localPath) {
          const savePath = path.join(outputDir, localPath);
          await fs.ensureDir(path.dirname(savePath));
          await fs.writeFile(savePath, $.html(), "utf8");
          console.log(`Saved: ${localPath}`);
        }
      })
    );
  }
}

async function downloadAssets(allAssets, baseOrigin, outputDir) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const assetJobs = [];

  for (const url of allAssets) {
    const localPath = urlToLocalPath(url, baseOrigin);
    if (!localPath) continue;

    assetJobs.push(
      (async () => {
        try {
          const response = await context.request.get(url, {
            timeout: PAGE_TIMEOUT,
          });
          if (response.ok) {
            const buffer = await response.body();
            const savePath = path.join(outputDir, localPath);
            await fs.ensureDir(path.dirname(savePath));
            await fs.writeFile(savePath, buffer);
            console.log(`Downloaded: ${localPath}`);
          }
        } catch (e) {
          console.warn(`Failed to download ${url}: ${e.message}`);
        }
      })()
    );
  }

  await Promise.all(assetJobs);
  await browser.close();
}

export async function deepCloneCommand(
  startUrl,
  outputDir = "deep-cloned-site"
) {
  const baseOrigin = new URL(startUrl).origin;

  await fs.emptyDir(outputDir);
  console.log(`Starting multi-pass clone of ${startUrl} to ${outputDir}`);

  // PASS 1: Discovery
  const { allPages, allPagesHtml, allAssets } = await discoverSite(
    startUrl,
    baseOrigin
  );
  console.log(
    `Discovered ${allPages.length} pages and ${allAssets.length} assets.`
  );

  // PASS 2: Rewrite and save pages
  await rewriteAndSavePages(allPages, allPagesHtml, baseOrigin, outputDir);
  console.log("Saved all site pages with rewritten links.");

  // Asset download phase
  await downloadAssets(allAssets, baseOrigin, outputDir);
  console.log("Downloaded all assets.");

  console.log(
    `\n✅ Multi-pass deep clone complete! Site saved to ${outputDir}`
  );
  console.log(`To verify: cd ${outputDir} && chaicode verify --broken-links`);
}
