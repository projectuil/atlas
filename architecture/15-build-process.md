# 15 — Build Process

This document explains every step of the UIL build pipeline — from running the command to what ends up in the output directory.

---

## The Build Command

```bash
cd web
npm run build
```

This single command executes three sequential operations (defined in `web/package.json`):

```json
{
  "scripts": {
    "build": "next build && npx pagefind --site out && node scripts/copy-search.js"
  }
}
```

The three stages **must run in this exact order**. If any stage fails, subsequent stages should not run.

---

## Stage 1: `next build`

### What Happens

The Next.js build engine performs Static Site Generation (SSG) for all routes.

**Phase 1A: Dependency resolution and compilation**
- TypeScript compilation with type-checking
- Tailwind CSS purging and compilation
- Module bundling (client-side JavaScript chunks)

**Phase 1B: Static params collection**

For each dynamic route, Next.js calls `generateStaticParams()`:

```
app/atlas/[slug]/page.tsx        → ~383 slugs (8 categories + ~375 friction APIDs)
app/patterns/[slug]/page.tsx     → ~64 slugs (PAT-001 to PAT-064)
app/patterns/volume/[slug]/page.tsx → ~N volume slugs
app/docs/[[...slug]]/page.tsx    → ~20 slugs (index + ~19 docs)
app/registries/[slug]/page.tsx   → ~3 slugs (registry files)
```

**Phase 1C: Page rendering**

For each static param, Next.js calls the Server Component:
- Data is fetched from `web/content/` via `api.ts`
- Markdown is compiled to HTML via `marked`
- HTML string is embedded in the JSX
- React renders the component tree to static HTML
- Client Component JavaScript is bundled and linked

**Phase 1D: Output**

All compiled files are written to `web/out/`:

```
web/out/
├── index.html                    # /
├── atlas/
│   ├── index.html               # /atlas
│   └── au-001/index.html        # /atlas/au-001  (one per APID + category)
├── patterns/
│   ├── index.html               # /patterns
│   ├── pat-001/index.html       # /patterns/pat-001
│   └── volume/
│       └── volume-01.../index.html
├── docs/
│   ├── index.html
│   └── constitution/index.html
├── metrics/
│   ├── index.html
│   ├── frictions/index.html
│   └── patterns/index.html
├── registries/
│   ├── index.html
│   ├── apid/index.html
│   ├── category/index.html
│   └── pattern/index.html
├── _next/                       # Next.js JavaScript chunks and CSS
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
└── ...
```

**Time estimate**: Approximately 30–60 seconds depending on the number of content files and machine speed.

### Verification

After `next build`, check:
- No TypeScript errors in the output
- `web/out/` directory exists and contains `index.html`
- `web/out/atlas/` contains one directory per category code and per APID
- `web/out/patterns/` contains one directory per PAT-ID

---

## Stage 2: `npx pagefind --site out`

### What Happens

Pagefind crawls the compiled HTML and builds the search index.

**Phase 2A: HTML crawl**

Pagefind reads every `.html` file in `web/out/`. For each file:
1. Parses the HTML DOM
2. Finds all elements with `data-pagefind-body` attribute
3. Extracts text content from those elements
4. Records the page URL (derived from file path) and title

**Phase 2B: Tokenization and indexing**

- Text is tokenized into word stems
- An inverted index is built (word → list of page URLs)
- Term frequency and document frequency are computed

**Phase 2C: Index sharding**

The index is split into multiple binary shard files to enable efficient partial loading:
- `.pf_index` — Compressed term index shards
- `.pf_meta` — Page metadata shards (title, URL, excerpt data)
- `.pf_fragment` — Text fragment shards (for generating excerpts)

**Phase 2D: Output**

All search assets are written to `web/out/pagefind/`:

```
web/out/pagefind/
├── pagefind.js           # Browser search engine (~50KB)
├── pagefind-entry.json   # Index manifest
├── pagefind.en_us.pf_meta
└── index/
    ├── en_us_<hash>.pf_index
    ├── en_us_<hash>.pf_meta
    └── en_us_<hash>.pf_fragment
```

**Time estimate**: Approximately 5–15 seconds.

### Why the `data-pagefind-body` Attribute Matters

This attribute in `app/layout.tsx`:
```tsx
<main data-pagefind-body>
  {children}
</main>
```

Without it, Pagefind would index the entire page including navigation, headers, and footers — producing noisy, irrelevant search results. The attribute scopes indexing to only the main content area.

---

## Stage 3: `node scripts/copy-search.js`

### What Happens

```javascript
const src = path.join(__dirname, '../out/pagefind');
const dest = path.join(__dirname, '../public/pagefind');

if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
```

Copies `web/out/pagefind/` → `web/public/pagefind/`.

### Why This Step Is Needed

During `next dev` (local development mode), Next.js serves static files from `web/public/`. The compiled site (`web/out/`) is not served by the dev server — it is the production output.

By copying the Pagefind index to `public/`, the search system becomes usable during local development (via `npm run dev` or `node server.js`).

**Time estimate**: Under 1 second.

---

## Complete Build Output

After all three stages complete successfully:

```
web/out/               # Deployable static site
web/out/pagefind/      # Search index (also in public/ for dev)
web/public/pagefind/   # Search index copy for local dev
```

The `web/out/` directory is the **complete, deployable artifact**. It can be:
- Uploaded directly to any static hosting provider (Vercel, Netlify, Cloudflare Pages, AWS S3, GitHub Pages)
- Served locally using `node server.js`
- Served by any HTTP server (nginx, Apache, serve, etc.)

---

## Development Build (`npm run dev`)

```bash
cd web
npm run dev
# Opens at http://localhost:3000
```

- Uses Next.js development server with hot module replacement
- TypeScript errors displayed in browser overlay
- Content files read dynamically on each request (no caching)
- **Search may not work** unless `public/pagefind/` is present from a previous build

---

## The Static Export Constraint

The `output: 'export'` configuration imposes hard constraints that affect the entire architecture:

| Feature | Allowed | Notes |
|---------|--------|-------|
| Static page rendering | ✅ | Core feature |
| Client-side React | ✅ | Via hydration |
| `generateStaticParams` | ✅ | Required for dynamic routes |
| API Routes | ❌ | No server runtime |
| Server Actions | ❌ | No server runtime |
| `revalidate` / ISR | ❌ | No server runtime |
| `headers()` / `cookies()` | ❌ | No request context |
| `fetch()` in Server Components | ⚠️ | Only works if fetching static data at build time |
| Image Optimization | ⚠️ | Must use `unoptimized: true` |

All of these constraints are known and accepted — they are the architectural foundation of the UIL's zero-server philosophy.

---

## Build Failure Modes

### TypeScript Errors

If `api.ts`, any page, or any component has a TypeScript error, `next build` fails immediately. All errors are logged to console.

**Fix**: Run `npx tsc --noEmit` in `web/` to check types without building.

### Missing Content Files

If `getFrictions()` encounters a file it cannot parse (invalid YAML frontmatter), it logs an error but continues. The build will succeed but that friction will be missing from the output.

### Pagefind Failure

If `npx pagefind` fails (e.g., `out/` directory doesn't exist because `next build` failed), no search index is generated. The web application will still load and render correctly, but the search modal will fail to find results.

### Missing Pagefind

If `pagefind` is not installed globally:
```bash
npm install -g pagefind
# Or use the local version via:
npx pagefind --site out
```

The `npm run build` script uses `npx pagefind`, which will automatically download the correct version if not locally installed.

---

## Deployment

After a successful build, deploy `web/out/`:

```bash
# Example: Vercel static deployment
cd web/out
npx vercel --prod

# Example: Netlify
cd web
netlify deploy --dir out --prod

# Example: AWS S3
aws s3 sync out/ s3://my-bucket --delete

# Local preview
node server.js   # Serves on http://localhost:3001
```

The static site has **no server-side dependencies** at runtime. It requires only:
- An HTTP file server
- Correct MIME types for `.pf_index`, `.pf_meta`, `.pf_fragment` files (for search)
