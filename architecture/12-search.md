# 12 — Search System

The UIL web application implements a fully offline, zero-dependency search system powered by **Pagefind**. This document explains how the search index is built, how the search UI works, and how the system can be maintained and extended.

---

## What Is Pagefind?

Pagefind is a static search library designed for statically generated sites. After the site is compiled, Pagefind:
1. Crawls the compiled HTML output
2. Extracts text content from designated content areas
3. Builds a binary search index (compressed shards)
4. Provides a browser-loadable JavaScript search engine

The result is a search system that:
- Requires no search service subscription (no Algolia, no ElasticSearch)
- Works completely offline
- Scales to tens of thousands of documents
- Weighs very little (~50–200KB for the engine, index size varies by content)

---

## Build-Time Indexing

### Step 1: Compile the Site

```bash
cd web
npm run build
# Which runs: next build && npx pagefind --site out && node scripts/copy-search.js
```

After `next build`, all pages are compiled to `web/out/` as static HTML files.

### Step 2: Run Pagefind Indexer

```bash
npx pagefind --site out
```

Pagefind crawls every HTML file in the `out/` directory. For each file, it:
1. Looks for elements with the `data-pagefind-body` attribute
2. Extracts all text content within those elements
3. Indexes the text with the page's URL and title

**This is why `app/layout.tsx` wraps all content in `<main data-pagefind-body>`** — every page's main content is automatically picked up by the indexer.

Pages without `data-pagefind-body` (none in this project) would produce empty search results.

### Step 3: Copy Search Assets

```bash
node scripts/copy-search.js
```

Pagefind writes its output to `out/pagefind/` (alongside the compiled HTML). This script copies those files to `public/pagefind/` so they are accessible during local development (via `next dev` or `node server.js`).

```javascript
// scripts/copy-search.js
const src = path.join(__dirname, '../out/pagefind');
const dest = path.join(__dirname, '../public/pagefind');
fs.cpSync(src, dest, { recursive: true });
```

---

## Pagefind Output Structure

After indexing, `out/pagefind/` contains:

```
pagefind/
├── pagefind.js           # Main browser search engine
├── pagefind-ui.js        # Optional pre-built UI (not used — UIL has custom UI)
├── pagefind-ui.css       # UI styles (not used)
├── pagefind.en_us.pf_meta  # Language metadata
├── pagefind-entry.json   # Index entry manifest
└── index/
    ├── *.pf_index        # Compressed search index shards
    ├── *.pf_meta         # Page metadata shards
    └── *.pf_fragment     # Text fragment shards
```

The `.pf_index`, `.pf_meta`, and `.pf_fragment` files are **binary** MIME types that the browser fetches on demand as the user types.

---

## Runtime Search Flow

### Initialization

The `SearchModal` component uses dynamic import to load Pagefind only when needed (lazy loading — no cost until the user opens search):

```typescript
useEffect(() => {
  if (isOpen && !pagefindRef.current) {
    const loadPagefind = async () => {
      const pf = await import('/pagefind/pagefind.js');
      await pf.options({ baseUrl: '/' });
      pagefindRef.current = pf;
    };
    loadPagefind();
  }
}, [isOpen]);
```

### Query Execution

On each keystroke (debounced to ~150ms):

```typescript
const search = await pagefindRef.current.search(query);
const resultData = await Promise.all(
  search.results.slice(0, 8).map(r => r.data())
);
```

`r.data()` is a lazy fetch — Pagefind only loads the fragment shard for that specific result, keeping the initial load fast.

### Result Shape

Each result from `r.data()` contains:
```typescript
{
  url: string,           // e.g., "/atlas/au-001/"
  meta: {
    title: string        // Page title from <title> or <h1>
  },
  excerpt: string,       // HTML snippet with <mark> highlighting query terms
  sub_results: [...]     // Subsection matches (unused in UIL)
}
```

### Result Categorization

UIL applies custom categorization by inspecting the result URL:

```typescript
function categorizeResult(url: string): string {
  if (/\/atlas\/[a-z]{2}-\d{3}/.test(url)) return 'Human Frictions';
  if (/\/patterns\/pat-/.test(url)) return 'Patterns';
  if (url.includes('/docs/')) return 'Documentation';
  if (url.includes('/metrics/')) return 'Metrics';
  if (url.includes('/registries/')) return 'Registries';
  return 'Results';
}
```

### Result Rendering

The search modal renders results grouped by category:
```
Human Frictions (3)
  ● AU-001 Repeated Login Forms Every Day
    "...users experience friction when logging in daily..."
  ● AU-009 Session Timeout Without Warning
    "...sessions expire silently causing..."

Patterns (2)
  ● PAT-001 Context Loss Over Time
    "...behavioral pattern observed across..."
```

---

## Local Development Search

During local development (`npm run dev` or `node server.js`), the Pagefind index is served from `public/pagefind/` (copied there by `copy-search.js`).

**Important**: The search index is **not regenerated on file changes** during development. It reflects whatever the site looked like at the last `npm run build`. Adding new content files will not appear in search results until a new build is run.

**Local development workflow with search**:
```bash
npm run build          # Compiles site + generates search index + copies index to public/
node server.js         # Serves web/out/ with correct MIME types for .pf_* files
```

The reason a custom `server.js` is provided is that the standard `npx serve` and similar tools do not configure the correct MIME type for `.pf_index`, `.pf_meta`, and `.pf_fragment` files. Without the correct MIME type, browsers may refuse to load them.

---

## Custom MIME Types in `server.js`

**File**: `web/server.js`

```javascript
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.pf_index': 'application/octet-stream',
  '.pf_meta': 'application/octet-stream',
  '.pf_fragment': 'application/octet-stream',
  // ... other types
};
```

Without these MIME types, browsers may block the binary Pagefind shards.

---

## What Gets Indexed

Because `data-pagefind-body` is on the root `<main>` element in `layout.tsx`, **all page content** is indexed:

| Content Type | Indexed? | Notes |
|-------------|---------|-------|
| Friction titles | ✅ | From APID dossier `<h1>` |
| Friction body text | ✅ | Full markdown prose |
| Friction tags | ✅ | Rendered as text in dossier |
| Pattern titles | ✅ | From pattern dossier `<h1>` |
| Pattern body text | ✅ | Full markdown prose |
| Doc titles | ✅ | From doc article `<h1>` |
| Doc body text | ✅ | Full markdown prose |
| Registry table data | ✅ | Table cells are text content |
| Metrics dashboard data | ✅ | All table data is indexed |
| Navigation links | ✅ (minor) | In `<main>` breadcrumbs |
| Footer links | ❌ | Outside `<main data-pagefind-body>` |

---

## Search Limitations

| Limitation | Detail |
|-----------|--------|
| No real-time updates | Index must be rebuilt after adding/editing content |
| Max 8 results shown | Hardcoded in `SearchModal.tsx` as `search.results.slice(0, 8)` |
| No fuzzy matching | Pagefind uses exact and prefix matching |
| No filtering by category | Results from all content types are mixed; UIL categorizes post-search |
| Language | English-only index (configures `en_us` by default) |
| Performance | First search may be slow if index shards aren't cached |

---

## Extending Search

To add a new content type to search:
1. Ensure the new page's content is rendered inside `<main data-pagefind-body>` (it is, because all pages share the root layout)
2. Add a new categorization rule in `SearchModal.tsx`'s `categorizeResult()` function
3. Rebuild the site to regenerate the search index

No configuration file needs to change — Pagefind automatically picks up all `data-pagefind-body` content.
