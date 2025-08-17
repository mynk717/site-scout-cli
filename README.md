```markdown
# Site Scout CLI

Site Scout CLI is a powerful Node.js command-line tool developed by ChaiCode for cloning modern JavaScript websites offline, verifying internal links for integrity, and performing basic SEO (GEO/AEO) analysis with actionable suggestions.

## Features

- **Deep Clone**: Multi-pass crawler to mirror websites into browsable offline static sites, handling JS-rendered content.
- **Verify Links**: Scans cloned sites for broken internal links.
- **Analyze SEO**: Checks title, meta description, headings, and provides improvement suggestions.

## Installation

### Global Usage (No Install Needed)

Run commands directly via npx:
```

npx chaicode [options]

```

### Global Install (For Frequent Use)
```

npm install -g site-scout-chaicode

```
Now run as:
```

chaicode [options]

```

## Usage

All commands support help with `--help` (e.g., `chaicode deep-clone --help`).

### 1. Deep Clone a Site
Clones the site's pages and assets into a local folder for offline browsing.

```

chaicode deep-clone --output

```

**Example:**
```

chaicode deep-clone https://piyushgarg.dev --output deep-cloned-site

```
- This creates a folder `deep-cloned-site` with all pages saved as `.html` files and assets downloaded.
- Navigate to the folder and serve locally: `npx serve` (open in browser to browse offline).

### 2. Verify Links in Cloned Site
Checks for broken internal links in the cloned folder. Run this inside the cloned directory.

```

chaicode verify --broken-links

```

**Example:**
```

cd deep-cloned-site
chaicode verify --broken-links

```
- Output: Lists any broken links or "No broken internal links found!" if all good.
- Ignores external links, mailto:, anchors (#), etc.

### 3. Analyze SEO of a URL
Performs basic SEO audit and saves results to JSON.

```

chaicode analyze --output

```

**Example:**
```

chaicode analyze https://piyushgarg.dev --output seo_results.json

```
- Output: Displays title, meta description, H1 count, and suggestions (e.g., "Title should be 10-70 characters").
- Saves detailed results to the specified JSON file.

## Examples

### Full Workflow
1. Clone: `chaicode deep-clone https://example.com --output my-site`
2. Verify: `cd my-site && chaicode verify --broken-links`
3. Analyze: `chaicode analyze https://example.com --output analysis.json`

### Sample Output (Analyze)
```

Analyzing SEO for https://piyushgarg.dev...
SEO Analysis Results:

- Title: Piyush Garg - Software Engineer & Educator
- Meta Description: Meet Piyush Garg... (truncated)
- H1 Count: 5
  Suggestions:
  - Meta description should be 50-160 characters.
  - Should have exactly one tag per page.
    Results saved to seo_results.json

```

## Development

### Setup
```

git clone https://github.com/mynk717/site-scout-cli.git
cd site-scout-cli
npm install

```

### Run Locally
```

node src/index.js [options]

```

### Testing
- Manual: Follow the full workflow above and check outputs.
- Add tests later with Jest (update `scripts.test` in package.json).

## Contribution

1. Fork the repo.
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Commit changes: `git commit -m "feat: add new feature"`
4. Push: `git push origin feat/new-feature`
5. Open a Pull Request on GitHub.

Follow code style (use Prettier/ESLint) and include tests if possible.

## License

ISC License © 2025 Mayank

---

For issues or suggestions, open a GitHub issue.
```
