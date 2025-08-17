import * as cheerio from "cheerio";
import { URL } from "url";
import path from "path";

function getAssetInfo(element, attribute, baseUrl) {
  const src = element.attr(attribute);
  if (!src || src.startsWith("data:")) return null; // Ignore empty and data URIs

  try {
    const absoluteUrl = new URL(src, baseUrl).href;
    const urlObj = new URL(absoluteUrl);
    let localPath;

    const ext = path.extname(urlObj.pathname).toLowerCase();

    // Check if it's a page link (ends with /, .html, or no extension)
    if (ext === ".html" || ext === "" || urlObj.pathname.endsWith("/")) {
      return null; // This is a page link, not an asset
    }

    // Logic for asset paths
    if ([".css"].includes(ext)) {
      localPath = path.join("assets", "css", path.basename(urlObj.pathname));
    } else if ([".js"].includes(ext)) {
      localPath = path.join("assets", "js", path.basename(urlObj.pathname));
    } else if (
      [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"].includes(ext)
    ) {
      localPath = path.join("assets", "images", path.basename(urlObj.pathname));
    } else {
      if (absoluteUrl.includes("/_next/image")) {
        localPath = path.join(
          "assets",
          "images",
          Buffer.from(absoluteUrl).toString("base64url") + ".jpg"
        );
      } else {
        // A generic fallback for other file types like fonts
        localPath = path.join(
          "assets",
          "other",
          path.basename(urlObj.pathname)
        );
      }
    }

    return { originalSrc: src, absoluteUrl, localPath };
  } catch (error) {
    console.warn(`Skipping invalid asset URL: ${src}`);
    return null;
  }
}

export function findAssets($, baseUrl) {
  const assets = [];
  const seenUrls = new Set();

  const selectors = {
    img: "src",
    'link[rel="stylesheet"]': "href",
    'link[rel="preload"]': "href", // THE FIX IS HERE
    script: "src",
    'link[rel="icon"], link[rel="shortcut icon"]': "href",
  };

  for (const [selector, attribute] of Object.entries(selectors)) {
    $(selector).each((i, element) => {
      const assetInfo = getAssetInfo($(element), attribute, baseUrl);
      if (assetInfo && !seenUrls.has(assetInfo.absoluteUrl)) {
        // Only treat as asset if it's not a webpage
        if (assetInfo.originalSrc && !assetInfo.originalSrc.endsWith(".html")) {
          seenUrls.add(assetInfo.absoluteUrl);
          assetInfo.element = $(element);
          assets.push(assetInfo);
        }
      }
    });
  }

  return assets;
}

export function findInternalLinks($, baseUrl) {
  const links = [];
  const baseOrigin = new URL(baseUrl).origin;

  $("a").each((i, element) => {
    const href = $(element).attr("href");
    if (href) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        if (new URL(absoluteUrl).origin === baseOrigin) {
          links.push({
            absoluteUrl,
            element: $(element),
          });
        }
      } catch (e) {
        /* ignore invalid URLs */
      }
    }
  });
  return links;
}
