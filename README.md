Site Scout CLI
Site Scout CLI is a powerful Node.js command-line interface designed to help web developers and SEO professionals manage and audit websites efficiently. It provides capabilities to clone modern JavaScript-heavy websites for offline access, thoroughly verify all internal links for broken references, and perform a fundamental SEO audit to identify common optimization opportunities.

Why Use Site Scout CLI?
Multi-Pass Crawling: Efficiently navigates and processes complex modern websites, including those rendered by JavaScript.

Playwright Rendering: Leverages a headless browser (Playwright) to ensure accurate content capture, especially for dynamically loaded pages.

Automatic Link Rewriting: Cloned sites have internal links automatically adjusted to work seamlessly in an offline environment.

Zero-Install Execution: Get started instantly by running commands directly via npx, with no global installation required.

Quick SEO Insights: Provides immediate feedback on critical SEO elements like page titles, meta descriptions, and heading structures.

Quick Start
Run without install (recommended for one-off use)
You can run Site Scout CLI commands directly using npx without installing it globally:

npx site-scout-cli <command> [options]

Global install (optional)
For frequent use, you might prefer to install Site Scout CLI globally:

npm install -g site-scout-cli

Once installed globally, you can run commands directly:

site-scout-cli <command> [options]

Commands & Usage
Here are the primary commands available in Site Scout CLI:

Command

Purpose

Example

deep-clone <url> --output <folder>

Clones a website, including assets, for offline access.

npx site-scout-cli deep-clone https://example.com --output ./my-site

verify --broken-links

Scans the cloned site for broken internal links.

npx site-scout-cli verify --broken-links

analyze <url> --output <file.json>

Performs a basic SEO audit (title, meta, h-tag check).

npx site-scout-cli analyze https://example.com --output seo-report.json

Full Workflow Example
Here's an example of a complete workflow, cloning, verifying, and analyzing https://example.com:

Clone the website:

npx site-scout-cli deep-clone https://example.com --output ./example-clone

Verify broken links within the cloned site:

# Navigate into the cloned directory first

cd example-clone
npx site-scout-cli verify --broken-links

Analyze the original site for SEO elements:

npx site-scout-cli analyze https://example.com --output seo-report.json

Development & Contribution
Want to contribute or run Site Scout CLI locally? Follow these steps:

Clone the repository:

git clone https://github.com/your-username/site-scout-cli.git
cd site-scout-cli

Install dependencies:

npm install

Run locally:
You can execute commands using Node directly:

node src/index.js deep-clone https://example.com --output ./test-site

We welcome contributions! Please feel free to open issues for bugs or feature requests, and submit pull requests following standard code style guidelines.

License
ISC License © 2025 Mayank
