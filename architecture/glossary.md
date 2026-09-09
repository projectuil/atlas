# Glossary

This glossary defines every technical and domain-specific term used in Project UIL and its architecture documentation. Terms are organized alphabetically.

---

## A

**APID** (Atlas Problem Identifier)
The unique identifier for a Human Friction observation. Format: `XX-NNN` where `XX` is a 2-letter domain code and `NNN` is a 3-digit sequential number. Example: `AU-001`, `FF-023`. APIDs are permanent and never reused.

**ATLAS**
Aggregated Taxonomy of Latent Atlas Signals. The research engine and knowledge archive that forms the core of Project UIL. Contains all Human Frictions, Patterns, Registries, and governing Standards.

**Atlas Explorer**
The `/atlas` section of the web application. The domain discovery interface that shows all 8 research categories as interactive cards.

**Accepted**
A lifecycle status value for both Human Frictions and Behavioral Patterns. Means the entry has been peer-reviewed and formally accepted into the canonical corpus.

---

## B

**Behavioral Pattern** (see also: Pattern)
A synthesized research finding that generalizes across multiple Human Friction observations. Represents a broad cognitive or behavioral principle rather than a specific problem instance.

**Body**
The Markdown (or HTML) content of a content file after the frontmatter delimiter (`---`). Distinct from frontmatter (structured data) — body is the narrative prose.

---

## C

**Candidate**
A lifecycle status value meaning an entry has been submitted for review but not yet formally accepted.

**Category**
In the UIL web application, a Category is a derived entity — it represents one of the 8 official research domains (e.g., `AU` = Authentication & Forms). Categories are computed from friction files, not stored as documents.

**Category Registry**
The master index document tracking all official domain categories, their prefix codes, and lifecycle status.

**Cheerio**
A server-side HTML DOM parsing library (like jQuery for Node.js). Used in `registryParser.ts` to extract structured data from HTML-body registry documents.

**Client Component**
A React component marked with `"use client"` that runs in the browser after hydration. Can use React state, effects, and browser APIs. All UIL client components have the `Client` suffix (e.g., `AtlasClient`, `CategoryClient`).

**Confidence Score**
A float from 0.00 to 1.00 representing the research confidence behind a Behavioral Pattern. Set in the `evidence.confidence` frontmatter field.

**Content Database**
The directory `web/content/`. Contains all Human Friction, Pattern, Documentation, Registry, and Metrics files as Markdown. The sole data store for the web application.

---

## D

**`dangerouslySetInnerHTML`**
A React prop that injects a pre-compiled HTML string directly into the DOM. Used to render `marked.parse()` output in friction/pattern dossier pages. Safe in UIL because the content source is controlled (not user input).

**Data Pagefind Body**
The HTML attribute `data-pagefind-body` applied to the `<main>` element in `layout.tsx`. Tells the Pagefind indexer which part of each page to include in the search index.

**Domain**
One of the 8 official research areas in ATLAS, identified by a 2-letter code. Domains group related Human Frictions together. The complete set: `AU`, `DW`, `FF`, `KI`, `LE`, `MB`, `OS`, `WI`.

**Domain Code**
The 2-letter uppercase prefix for a domain (e.g., `AU`, `FF`). Used as the first segment of every APID and as URL slugs for category pages.

**Draft**
A lifecycle status value for content that is still being developed and has not been peer-reviewed.

---

## F

**`fixMarkdownTables()`**
A utility function that scans a Markdown string and inserts missing `|---|---|` separator rows after table header lines. Compensates for a Turndown conversion artifact. Currently duplicated in 3 page files.

**Friction** (see also: Human Friction)
Shorthand for Human Friction.

**Frontmatter**
YAML metadata at the top of a Markdown file, delimited by `---` on both sides. Contains structured fields like `identity`, `metadata`, `evidence`, and `relationships`. Parsed by `gray-matter`.

**`getFrictions()`**
The primary data loading function in `api.ts`. Reads all Human Friction `.md` files and returns a normalized array of friction objects.

**`gray-matter`**
An npm package that splits Markdown files into `{ data, content }` — the YAML frontmatter object and the body text respectively.

---

## H

**Human Friction**
The core research artifact in ATLAS. A single, documented, evidence-based observation of a recurring problem experienced by users interacting with a digital system. Each friction has a unique APID.

**Human Impact**
A required section in every Human Friction and Pattern document body. Describes the consequences of the friction for users.

**Hydration**
The process by which React in the browser attaches JavaScript event handlers and state management to Server-side rendered HTML. Client Components hydrate on page load; Server-only pages have zero hydration cost.

---

## I

**Ingestion Pipeline**
The process of converting source `.docx` research documents into structured Markdown files via `tools/migration/`. Also called the "migration pipeline."

---

## L

**`linkifyAPIDs()`**
A utility function that converts bare APID strings in Markdown body text to hyperlinks. Example: `AU-001` → `[AU-001](/atlas/au-001)`. Currently duplicated in 2 page files.

**Live Interpolation**
The practice in metrics Server Components of applying regex replacements to the HTML content at build time to inject live content counts into the otherwise-static metrics reports.

---

## M

**`mammoth`**
An npm package that converts Microsoft Word `.docx` files to HTML or Markdown. Used in all migration scripts.

**`marked`**
An npm package that compiles Markdown to HTML. Used in Server Component pages to render friction/pattern/doc body content.

**Migration**
The process of converting source `.docx` documents to `web/content/*.md` files using the `tools/migration/` scripts.

**Migration Script**
One of the Node.js scripts in `tools/migration/`: `migrate-full.js`, `migrate-docs.js`, `migrate-registries.js`, `migrate-metrics-html.js`, `migrate-community.js`.

---

## O

**Observation Level**
An integer from 1 to 4 representing the strength of empirical evidence behind a Human Friction. Stored in `evidence.observation_level`.

| Level | Label |
|-------|-------|
| 1 | Exploratory |
| 2 | Observed |
| 3 | Corroborated |
| 4 | Strong Evidence |

**OFFICIAL_DOMAINS**
The constant array `['AU', 'DW', 'FF', 'KI', 'LE', 'MB', 'OS', 'WI']` in `api.ts`. The authoritative whitelist of valid domain codes.

---

## P

**Pagefind**
A static site search engine. Post-build, it crawls compiled HTML and produces binary index shards. At runtime, the browser dynamically loads these shards to power the search modal.

**Pattern** (see also: Behavioral Pattern)
A synthesized behavioral finding derived from multiple Human Frictions. Identified by a PTID (e.g., `PAT-001`).

**Pattern Registry**
The master index document tracking all Behavioral Patterns, their volume assignments, and lifecycle status.

**PTID** (Pattern Identifier)
The unique identifier for a Behavioral Pattern. Format: `PAT-NNN`. Example: `PAT-001`, `PAT-064`. PTIDs are permanent and never reused.

**`parseRegistryDocument()`**
The main function in `registryParser.ts`. Uses Cheerio to extract structured sections from the HTML body of a registry document.

---

## R

**Registry**
An official master index document that tracks all issued identifiers of a specific type (APID, Category, or Pattern) along with their metadata and lifecycle status.

**Registry Parser**
The module `web/src/lib/registryParser.ts`. Contains the Cheerio-based HTML DOM parser for registry documents.

**Relationships**
A frontmatter section in both friction and pattern documents (`relationships.*`) that stores cross-references to related patterns, frictions, or academic papers.

---

## S

**Server Component**
A React component that runs only in Node.js at build time (in Next.js with SSG). Has filesystem access, can read content files, but cannot use browser APIs or React state. All UIL page files are Server Components.

**Slug**
A URL-safe string identifier derived from a title or code. Example: `au-001`, `pat-001`, `constitution`. Used in dynamic routes.

**SSG** (Static Site Generation)
The rendering mode where all pages are compiled to static HTML at build time. UIL uses SSG via `next build` with `output: 'export'`.

**Static Export**
The `output: 'export'` configuration in `next.config.ts` that compiles the Next.js application to a directory of static HTML, CSS, and JavaScript files.

---

## T

**Table Parser**
The module `web/src/lib/tableParser.ts`. Contains regex-based HTML table extraction for metrics documents.

**Turndown**
An npm package that converts HTML to Markdown. Used in migration scripts for frictions and patterns (but NOT for registries and metrics).

---

## U

**UIL** (User Interaction Logic)
The name of the overall research project. Both the research corpus and the web application together form Project UIL.

**useScrollRestoration**
A custom React hook in `web/src/hooks/useScrollRestoration.ts`. Saves and restores `window.scrollY` to/from `sessionStorage` to preserve scroll position across browser navigation.

---

## V

**Volume**
A named grouping of Behavioral Patterns. Volumes organize patterns by cognitive or behavioral theme. Format: `Volume XX — <Name>`. Volume names contain em-dashes which are stripped for URL generation.

---

## W

**`web/content/`**
The compiled content database — the directory that acts as the sole data store for the web application. Contains all friction, pattern, doc, registry, and metrics Markdown files.

**`web/out/`**
The build output directory. Contains the fully compiled static HTML, CSS, JavaScript, and Pagefind index. This directory is the deployable artifact.
