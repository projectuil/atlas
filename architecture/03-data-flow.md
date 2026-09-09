# 03 — Data Flow

This document traces the complete lifecycle of every content type in Project UIL — from source document to browser rendering. Understanding this pipeline is essential for knowing where to intervene when content changes or features are added.

---

## The Master Pipeline

All content types follow the same general pipeline:

```
Author (Word Processor)
        │
        ▼  [tools/migration/*.js]
 .docx  →  .md (YAML frontmatter + body)
        │
        ▼  [web/src/lib/api.ts]
  gray-matter → typed JavaScript objects
        │
        ▼  [web/src/app/**/page.tsx]
  Server Component → marked → HTML string
        │
        ▼  [web/src/components/*Client.tsx]
  Client Component → React JSX rendered in browser
        │
        ▼  [npx pagefind --site out]
  Static HTML → search index shards
        │
        ▼  [SearchModal.tsx]
  Runtime Pagefind query → search results UI
```

What varies between content types is:
1. The source document structure
2. The migration script used
3. The `api.ts` function that loads it
4. The parser applied to normalize it
5. The page and component that renders it

---

## 1. Human Frictions

### Source Origin
`atlas/Human-Frictions/<Domain>/<Volume>.docx`

Example: `atlas/Human-Frictions/AU — Authentication & Forms/AU Volume 01 (AU-001–AU-025).docx`

### Migration
**Script**: `tools/migration/migrate-full.js` with `type = 'friction'`

The script:
1. Converts the `.docx` to HTML using `mammoth.convertToHtml()`
2. Converts HTML to Markdown using Turndown
3. Splits the resulting document on APID anchors (regex matching `AU-001`, `DW-003`, etc.)
4. For each block, extracts metadata tables (Category, Subcategory, Version, Status, Tags, etc.)
5. Constructs a structured YAML frontmatter object
6. Writes individual `<APID>.md` files under `web/content/atlas/<PREFIX>/`

**Output**: `web/content/atlas/AU/AU-001.md`, `web/content/atlas/FF/FF-001.md`, etc.

### Data Loading
**Function**: `getFrictions()` in `web/src/lib/api.ts`

- Reads all files from `web/content/atlas/`
- Iterates subdirectories (one per domain prefix)
- Calls `gray-matter` to parse frontmatter + body
- Normalizes `identity.apid` by falling back to `identity.id`
- Returns an array of typed friction objects

**Related function**: `getFrictionByApid(apid)` — finds a single friction by identifier.

**Related function**: `getFrictionsByCategory(code)` — filters frictions by domain prefix.

### Normalization & Transformation
In `web/src/app/atlas/[slug]/page.tsx`:

1. `fixMarkdownTables(content)` — Inserts missing `|---|---|` separator lines into markdown tables (Turndown sometimes omits them)
2. `linkifyAPIDs(content)` — Regex-replaces bare APID strings with markdown hyperlinks (`[AU-006](/atlas/au-006)`)
3. `marked.parse(content)` — Compiles the cleaned markdown to an HTML string

### Rendering
- **Route**: `/atlas/[slug]`
- **If slug is a domain prefix** (e.g., `au`): renders `<CategoryClient />` with filterable friction list
- **If slug is an APID** (e.g., `au-001`): renders a static HTML dossier with APID badge, observation level, title, tags, body prose, Related Patterns card, Related Frictions card, and Metadata card

### Search Indexing
All friction detail pages are enclosed in `<main data-pagefind-body>`, making them fully indexed by Pagefind. Results categorized as "Human Frictions" in the Search Modal.

---

## 2. Behavioral Patterns

### Source Origin
`atlas/Patterns/<Volume-Name>/PAT-XXX — <Title>.docx`

### Migration
**Script**: `tools/migration/migrate-full.js` with `type = 'pattern'`

Unlike frictions (multiple per DOCX volume), each Pattern is a **separate DOCX file**. The migration:
1. Converts DOCX → Markdown
2. Extracts PAT-ID from filename
3. Extracts tags, related APIDs, and status from the markdown body using regex
4. Constructs frontmatter and writes `web/content/patterns/<PAT-ID>.md`

**Output**: `web/content/patterns/PAT-001.md`, `web/content/patterns/PAT-002.md`, etc.

### Data Loading
**Function**: `getPatterns()` in `web/src/lib/api.ts`

- Reads all `.md` files from `web/content/patterns/`
- Parses gray-matter
- Sanitizes volume names (removes non-ASCII em-dashes)
- Strips `**Tags:**` prefixes from tag array entries
- Extracts `Status`, `Category`, and `Level` from markdown body via regex as fallback when frontmatter fields are missing

**Related function**: `getPatternsByVolume()` — groups patterns by `metadata.volume`.

### Normalization & Transformation
Same pipeline as frictions: `fixMarkdownTables()` → `linkifyAPIDs()` → `marked.parse()`.

### Rendering
- **Route Index**: `/patterns` — renders `<PatternClient />` with volume cards or PAT-ID list
- **Route Volume**: `/patterns/volume/[slug]` — renders `<VolumeClient />` with patterns in a specific volume
- **Route Detail**: `/patterns/[slug]` — renders static HTML pattern dossier with volume badge, tags, body, and supporting APID backlinks

---

## 3. Registries

### Source Origin
`atlas/Registries/<Name>-Registry.docx`

The three registries are: APID Registry, Category Registry, Pattern Registry.

### Migration
**Script**: `tools/migration/migrate-registries.js`

1. Converts DOCX → **HTML** using `mammoth.convertToHtml()` (unlike other content, HTML is preserved — not converted to Markdown — because the table structure is complex and Turndown would destroy it)
2. Sanitizes Unicode characters
3. Wraps in minimal YAML frontmatter
4. Writes to `web/content/registries/<name>.md` with the HTML as the body

**Output**: `web/content/registries/APID-Registry.md` (containing raw HTML tables in body)

### Data Loading
Registry pages **bypass `api.ts`** and read files directly:

```typescript
// In app/registries/apid/page.tsx
const rawContent = fs.readFileSync(registryFile, 'utf8');
let htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim(); // Strip frontmatter
const data = parseRegistryDocument(htmlContent);
```

### Parsing
**Function**: `parseRegistryDocument(html)` in `web/src/lib/registryParser.ts`

Uses Cheerio to navigate the HTML DOM and extract:
- `intro[]` — Introductory paragraph text
- `fields[]` — Registry field definitions `{ field, description }`
- `statistics{}` — Key-value statistics map
- `docInfo{}` — Document information key-value map
- `rules[]` — Governance rules ordered list
- `entries[]` — Master registry rows, typed by table header signature detection

### Rendering
- `/registries/apid` → `<ApidRegistryClient data={data} />`
- `/registries/category` → `<CategoryRegistryClient data={data} />`
- `/registries/pattern` → `<PatternRegistryClient data={data} />`

Each client component provides real-time text search, status filters, category/domain filters, sort controls, and a click-to-copy APID/PTID button.

---

## 4. Metrics

### Source Origin
`atlas/metrics/Human Friction Metrics.docx` and `atlas/metrics/Pattern Metrics.docx`

### Migration
**Script**: `tools/migration/migrate-metrics-html.js`

Same as registries: converts to HTML (not Markdown) to preserve table structure.

**Output**: `web/content/metrics/human-friction-metrics.md` (HTML body with YAML frontmatter)

### Data Loading and Live Override

Unlike all other content types, metrics pages perform **live data interpolation** at build time. The Server Component:

1. Reads the static HTML from disk
2. Calls `getFrictions()` and `getPatterns()` to get live file counts
3. Runs regex string replacements against the HTML to override hardcoded numbers:
   ```typescript
   htmlContent = htmlContent
     .replace(/>375</g, `>${totalFrictions}<`)
     .replace(/>37\.5%</g, `>${completion}%<`)
   ```
4. Passes the updated HTML and extracted tables to the dashboard client component

**This design means**: the metrics reports never go stale as long as content files are kept current. The report becomes "live" without needing to re-run the migration script.

### Parsing
**Function**: `extractTablesFromHtml(html)` in `web/src/lib/tableParser.ts`

Regex-based extraction of `<table>` elements → `{ headers: string[], rows: string[][] }[]`.

### Rendering
- `/metrics/frictions` → `<FrictionDashboardClient tables={tables} rawHtml={htmlContent} />`
- `/metrics/patterns` → `<PatternDashboardClient tables={tables} rawHtml={htmlContent} />`

Dashboard components render progress bars, stat cards, category breakdown tables, milestone trackers, and asset status lists.

---

## 5. Documentation

### Source Origin
`docs/01-Brand-Book/`, `docs/07-Constitution/`, etc. and `atlas/Standards/`, `atlas/Templates/`

### Migration
**Script**: `tools/migration/migrate-docs.js`

Unlike other scripts, `migrate-docs.js` operates from a **hard-coded manifest** of source file paths to output slugs. Each entry defines:
- `file`: absolute path to the source `.docx`
- `slug`: routing URL slug
- `title`: human-readable title
- `category`: one of `Governance`, `Standards`, `Publishing`, `Templates`
- `status`: `Official`

Uses `mammoth.convertToMarkdown()` (clean Markdown, not HTML) since governance documents don't rely on complex table structures.

**Output**: `web/content/docs/*.md` with clean frontmatter and Markdown body.

### Data Loading
**Function**: `getDocs()` in `web/src/lib/api.ts`

Reads all `.md` files from `web/content/docs/`, extracts `slug`, `title`, `category`, and `status` from frontmatter.

### Normalization
In the doc detail page: `fixMarkdownTables()` → `marked.parse()`.

### Rendering
- `/docs` (no slug) → `<DocsClient docs={docs} />` — categorized card index
- `/docs/[slug]` → Two-column layout with sticky category sidebar and full-width prose article

---

## 6. Search

### Indexing (Build Time)
Run: `npx pagefind --site out`

Pagefind crawls all compiled HTML files in `web/out/`, finds `<main data-pagefind-body>` wrappers (set in `app/layout.tsx`), extracts text content and page metadata, and writes binary index shards to `out/pagefind/`.

The `scripts/copy-search.js` then syncs `out/pagefind/` → `public/pagefind/` so local development can serve search assets.

### Query (Runtime)
In `SearchModal.tsx`:

1. User triggers `⌘K` / `Ctrl+K`
2. Component dynamically imports: `await import('/pagefind/pagefind.js')`
3. Sets base URL: `pagefind.options({ baseUrl: '/' })`
4. On each keystroke: `pagefind.search(query)` → `search.results.slice(0, 8).map(r => r.data())`
5. Results are categorized by URL pattern:
   - `/atlas/<XX>-<NNN>` → "Human Frictions"
   - `/patterns/pat-<NNN>` → "Patterns"
   - `/docs/` → "Documentation"
   - `/metrics/` → "Metrics"
   - `/registries/` → "Registries"
6. Results display title, excerpt with match highlights, and category badge

---

## Data Flow Summary Table

| Content Type | Source | Migration Script | Storage | Loader Function | Parser | Page Route | Component |
|---|---|---|---|---|---|---|---|
| Human Friction | `.docx` volume | `migrate-full.js` | `content/atlas/` | `getFrictions()` | `fixMarkdownTables`, `linkifyAPIDs`, `marked` | `/atlas/[slug]` | Inline SSR |
| Pattern | `.docx` per-file | `migrate-full.js` | `content/patterns/` | `getPatterns()` | Same | `/patterns/[slug]` | Inline SSR |
| Registry | `.docx` | `migrate-registries.js` | `content/registries/` | Direct `fs.readFileSync` | `parseRegistryDocument()` | `/registries/<type>` | `*RegistryClient` |
| Metrics | `.docx` | `migrate-metrics-html.js` | `content/metrics/` | Direct `fs.readFileSync` | `extractTablesFromHtml()` + regex replace | `/metrics/*` | `*DashboardClient` |
| Docs | `.docx` | `migrate-docs.js` | `content/docs/` | `getDocs()` | `fixMarkdownTables`, `marked` | `/docs/[[...slug]]` | `DocsClient` + SSR |
| Search | All compiled HTML | `npx pagefind` | `public/pagefind/` | Dynamic import | Pagefind runtime | Overlay (all pages) | `SearchModal` |
