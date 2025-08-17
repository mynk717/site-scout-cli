import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import * as cheerio from "cheerio";
import { glob } from "glob";

export async function verifyCommand(options) {
  const directoryToVerify = process.cwd();
  console.log(chalk.blue(`Verifying project in ${directoryToVerify}...`));

  if (!options.brokenLinks) {
    console.log("No verification options specified. Use --broken-links.");
    return;
  }

  let brokenLinksCount = 0;
  const htmlFiles = await glob("**/*.html", { cwd: directoryToVerify });

  console.log(`Found ${htmlFiles.length} HTML files to check.`);

  for (const htmlFile of htmlFiles) {
    const htmlFilePath = path.join(directoryToVerify, htmlFile);
    const htmlContent = await fs.readFile(htmlFilePath, "utf-8");
    const $ = cheerio.load(htmlContent);

    const links = $("a");
    for (const link of links) {
      const href = $(link).attr("href");
      if (
        href &&
        !href.startsWith("http") &&
        !href.startsWith("#") &&
        !href.startsWith("//") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !href.startsWith("javascript:")
      ) {
        const targetPath = path.resolve(path.dirname(htmlFilePath), href);
        if (!fs.existsSync(targetPath)) {
          console.log(
            chalk.red(
              `[BROKEN LINK] in ${htmlFile}: points to non-existent file '${href}'`
            )
          );
          brokenLinksCount++;
        }
      }
    }
  }

  if (brokenLinksCount > 0) {
    console.log(
      chalk.yellow(
        `\nVerification complete. Found ${brokenLinksCount} broken links.`
      )
    );
  } else {
    console.log(
      chalk.green("\nVerification complete. No broken internal links found!")
    );
  }
}
