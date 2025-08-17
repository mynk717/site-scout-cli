import { fetchHtml, downloadAsset } from "../utils/fetcher.js";
import { findAssets, findInternalLinks } from "../utils/parser.js";
import { saveHtml } from "../utils/file-handler.js";
import { Crawler } from "../core/crawler.js";
import * as cheerio from "cheerio";
import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import { URL } from "url";

// A simple function to map a URL to a local HTML file path
function urlToHtmlFilePath(url, baseOrigin) {
  const urlObj = new URL(url);
  if (urlObj.origin !== baseOrigin) return null;
  let localPath = decodeURIComponent(urlObj.pathname);
  if (localPath === "/") return "index.html";
  if (localPath.startsWith("/")) localPath = localPath.substring(1);
  if (localPath.endsWith("/")) localPath += "index.html";
  else if (!path.extname(localPath)) localPath += ".html";
  return localPath;
}

export async function cloneCommand(url, options) {
  const crawler = new Crawler(url, parseInt(options.depth, 10) || 1);
  const outputDir = path.resolve(process.cwd(), options.output);
  await fs.emptyDir(outputDir);

  console.log(
    chalk.blue(
      `Initializing crawl from ${url} with depth ${crawler.maxDepth}...`
    )
  );

  while (crawler.hasItems()) {
    const current = crawler.getNext();
    console.log(
      chalk.cyan(`\nProcessing [Depth ${current.depth}]: ${current.url}`)
    );

    try {
      const html = await fetchHtml(current.url);
      if (!html) continue;

      const $ = cheerio.load(html);

      // --- ASSET REWRITING ---
      const assets = findAssets($, current.url);
      console.log(chalk.gray(`  Found ${assets.length} assets on this page.`));
      const assetPromises = assets.map(asset => {
        const fullAssetLocalPath = path.join(outputDir, asset.localPath);
        crawler.addResource(asset.absoluteUrl, asset.localPath, "asset");
        const attribute = asset.element.is("link") ? "href" : "src";
        // **THE FINAL FIX: Use root-absolute paths**
        asset.element.attr(
          attribute,
          "/" + asset.localPath.replace(/\\/g, "/")
        );
        return downloadAsset(asset.absoluteUrl, fullAssetLocalPath);
      });

      // --- LINK REWRITING ---
      const links = findInternalLinks($, current.url);
      console.log(chalk.gray(`  Found ${links.length} internal links.`));
      links.forEach(link => {
        const linkLocalPath = urlToHtmlFilePath(
          link.absoluteUrl,
          crawler.startUrl.origin
        );
        if (linkLocalPath) {
          // **THE FINAL FIX: Use root-absolute paths**
          link.element.attr("href", "/" + linkLocalPath);
          crawler.addToQueue(link.absoluteUrl, current.depth);
        }
      });

      await Promise.all(assetPromises);

      const modifiedHtml = $.html();
      const currentPageLocalPath = urlToHtmlFilePath(
        current.url,
        crawler.startUrl.origin
      );
      if (currentPageLocalPath) {
        const htmlPath = path.join(outputDir, currentPageLocalPath);
        await fs.ensureDir(path.dirname(htmlPath));
        await saveHtml(htmlPath, modifiedHtml);
        crawler.addResource(current.url, currentPageLocalPath, "page");
      }
    } catch (error) {
      console.error(
        chalk.red(`  Failed to process ${current.url}: ${error.message}`)
      );
    }
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  await fs.writeJson(manifestPath, crawler.manifest, { spaces: 2 });

  console.log(chalk.green(`\nCrawl finished. Manifest saved.`));
  console.log(
    chalk.bgGreen.bold(`\n✅ Success! Site scouted in: ${outputDir}`)
  );
  console.log(
    chalk.yellow(`\nTo view your offline site, run the following commands:`)
  );
  console.log(chalk.white(`  cd ${options.output}`));
  console.log(chalk.white(`  npx serve`));
}
