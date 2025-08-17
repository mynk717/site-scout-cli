#!/usr/bin/env node
import { Command } from "commander";
import { cloneCommand } from "./commands/clone.js";
import { deepCloneCommand } from "./commands/deepClone.js"; // <-- 1. Import the new command

const program = new Command();

program
  .name("chaicode")
  .description("Site Scout: The Asset Fetcher by ChaiCode")
  .version("1.0.0");

// The original "shallow" clone command
program
  .command("clone <url>")
  .description(
    "Clone a website using static asset discovery (fast, for simple sites)"
  )
  .option("-o, --output <dir>", "Output directory name", "cloned-site")
  .option("-d, --depth <number>", "Crawl depth for links", "1")
  .action((url, options) => {
    cloneCommand(url, options);
  });

// 2. Define the new "deep-clone" command
program
  .command("deep-clone <url>")
  .description(
    "Clone a site using a headless browser (slower, for complex JS sites)"
  )
  .option("-o, --output <dir>", "Output directory name", "deep-cloned-site")
  .action((url, options) => {
    deepCloneCommand(url, options.output);
  });

program.parse(process.argv);
