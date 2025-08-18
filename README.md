```markdown
# Site Scout CLI

Site Scout CLI is a powerful Node.js command-line interface designed to help web developers and SEO professionals manage and audit websites efficiently. It provides capabilities to clone modern JavaScript-heavy websites for offline access, thoroughly verify all internal links for broken references, and perform a fundamental SEO audit to identify common optimization opportunities.

1. **Clone** modern JavaScript-heavy websites for full offline access.
2. **Verify** every internal link to catch broken references.
3. **Analyze** fundamental SEO elements to spot quick wins.

---

## Why Use Site Scout CLI?

- **Multi-Pass Crawling** – Handles complex, JS-rendered sites.
- **Playwright Rendering** – Uses a headless browser for 100 % content capture.
- **Automatic Link Rewriting** – All internal links work offline out of the box.
- **Zero-Install via npx** – Try it instantly; no global install needed.
- **Quick SEO Insights** – Checks titles, meta descriptions, H-tags in seconds.

---

## Quick Start

### Run without install (recommended)
```

npx chaicode [options]

```

### Global install (optional)

```

npm install -g site-scout-chaicode
chaicode [options]

```

---

## Commands & Usage

| Command & Options                                   | Purpose                                          | Example                                                                   |
| --------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `deep-clone  --output `                | Clone a site (pages + assets) for offline use.   | `npx chaicode deep-clone https://example.com --output ./my-site`          |
| `verify --broken-links` *(run inside clone)*        | Scan cloned HTML for broken internal links.      | `cd my-site && npx chaicode verify --broken-links`                        |
| `analyze  --output `                | Basic SEO audit (title, meta, headings).         | `npx chaicode analyze https://example.com --output seo-report.json`       |

---

## Full Workflow Example

```

# 1 Clone the website

npx chaicode deep-clone https://example.com --output example-clone

# 2 Verify broken links

cd example-clone
npx chaicode verify --broken-links
cd ..

# 3 Analyze original site for SEO

npx chaicode analyze https://example.com --output seo-report.json

```

---

## Development & Contribution

```

# Clone the repo

git clone https://github.com/mynk717/site-scout-cli.git
cd site-scout-cli

# Install dev dependencies

npm install

# Run CLI locally

node src/index.js deep-clone https://example.com --output ./test-site

```

Contributions are welcome!
Open issues for bugs or features and submit pull requests following the existing ESLint/Prettier style.

---

## License

ISC License © 2025 Mayank
```
