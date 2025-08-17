import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

export async function analyzeCommand(url, options) {
  console.log(chalk.blue(`Analyzing SEO for ${url}...`));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);

  // Basic SEO checks
  const results = {
    title: $("title").text() || "Missing",
    metaDescription: $('meta[name="description"]').attr("content") || "Missing",
    h1Count: $("h1").length,
    suggestions: [],
  };

  // Suggestions
  if (
    !results.title ||
    results.title.length < 10 ||
    results.title.length > 70
  ) {
    results.suggestions.push(
      "Title tag should be 10-70 characters for optimal SEO."
    );
  }
  if (
    !results.metaDescription ||
    results.metaDescription.length < 50 ||
    results.metaDescription.length > 160
  ) {
    results.suggestions.push("Meta description should be 50-160 characters.");
  }
  if (results.h1Count !== 1) {
    results.suggestions.push("Should have exactly one <h1> tag per page.");
  }

  // Output
  console.log(chalk.green("SEO Analysis Results:"));
  console.log(`- Title: ${results.title}`);
  console.log(`- Meta Description: ${results.metaDescription}`);
  console.log(`- H1 Count: ${results.h1Count}`);
  if (results.suggestions.length > 0) {
    console.log(chalk.yellow("Suggestions:"));
    results.suggestions.forEach(s => console.log(`  - ${s}`));
  } else {
    console.log(chalk.green("No major SEO issues found!"));
  }

  // Save to file if --output specified
  if (options.output) {
    const outputPath = path.join(process.cwd(), options.output);
    await fs.writeJson(outputPath, results, { spaces: 2 });
    console.log(chalk.blue(`Results saved to ${outputPath}`));
  }
}
