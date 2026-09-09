# 16 — Design Decisions

This document explains the key architectural choices made in Project UIL, the reasoning behind each decision, and the tradeoffs involved. Understanding *why* the system was designed this way prevents accidental regression of intentional constraints.

---

## Decision 1: The Filesystem Is the Database

**Choice**: All research data is stored as Markdown files in `web/content/`. There is no database.

**Why**:

1. **Eliminates operational overhead** — No database server to provision, maintain, back up, or migrate schemas for.
2. **Git is the version history** — Every change to every friction or pattern is tracked in Git with full diff history, author attribution, and rollback capability.
3. **Portability** — The research corpus can be read, searched, and edited with any text editor on any platform, without any special tooling.
4. **Deterministic builds** — Given the same content files, the build always produces identical output. No database state can cause non-deterministic builds.
5. **Scale is appropriate** — ~375 frictions + ~64 patterns is a corpus that fits easily in memory. A database would be over-engineering for this size.

**Tradeoffs**:
- No relational queries (joins must be done in-memory as JavaScript array operations)
- No partial updates (modifying content requires re-running migration and rebuilding)
- No full-text search at query time (requires Pagefind to be pre-built)
- File I/O must complete synchronously at build time (not acceptable for >10,000 files)

---

## Decision 2: Static Site Generation with `output: 'export'`

**Choice**: All pages are pre-rendered at build time to static HTML. No server is required in production.

**Why**:

1. **Zero server attack surface** — There is nothing to hack at runtime. The output is just files.
2. **Free hosting** — Static files can be hosted on GitHub Pages, Netlify, Cloudflare Pages, S3 at virtually no cost.
3. **Infinite CDN cacheability** — Every file can be cached indefinitely at edge nodes worldwide.
4. **Research data never changes in real-time** — Frictions and patterns are authored asynchronously and published via deliberate builds. There is no user-generated content, no real-time feeds, no need for server-side rendering per request.
5. **Simplicity of reasoning** — Every developer can understand exactly what the build output contains without reasoning about runtime state.

**Tradeoffs**:
- Content updates require a full rebuild (~60 seconds)
- No server-side personalization or authentication
- No real-time comments, reactions, or collaboration features
- Search index must be pre-built (stale until next build)

---

## Decision 3: Research Content in `.docx`, Web Content in `.md`

**Choice**: Source documents are Word `.docx` files. The web application reads Markdown files in `web/content/`.

**Why**:

1. **Researcher ergonomics** — Researchers and domain experts are not engineers. They use word processors. Forcing them to write YAML frontmatter in a text editor would create friction and errors.
2. **Rich authoring environment** — Word provides spell checking, tracked changes, comments, and formatting tools that enhance research quality.
3. **Structured output** — Markdown + YAML frontmatter provides a deterministic, machine-readable format for the web application.
4. **Clear roles** — Researchers own `.docx`. Engineers own `web/`. Neither needs to understand the other's format deeply.

**Tradeoffs**:
- Two-step pipeline (migrate then build) instead of one
- Migration scripts must be maintained as Word template evolves
- Unicode artifacts from Word (curly quotes, em-dashes) require cleanup in migration scripts
- Non-obvious data flow for new contributors

---

## Decision 4: The `/atlas/[slug]` Polymorphic Route

**Choice**: A single dynamic route handles both category pages (`/atlas/au`) and friction dossiers (`/atlas/au-001`).

**Why**:

1. **URL consistency** — All ATLAS-related content lives under `/atlas/`. Users can navigate up from a friction to its category without a URL structure change.
2. **Intuitive hierarchy** — `/atlas/au` clearly contains AU frictions. `/atlas/au-001` is clearly one of them.
3. **Avoids nested routes** — Alternative: `/atlas/au/au-001` introduces redundancy in the URL (`/au/au-001`).

**How disambiguation works**:
```typescript
const isCategory = categories.some(c => c.code.toLowerCase() === slug.toLowerCase());
```
- `slug = 'au'` matches a category code → render `<CategoryClient />`
- `slug = 'au-001'` does NOT match any category code → render friction dossier

**Tradeoffs**:
- More complex Server Component logic (two rendering paths)
- `generateStaticParams()` must explicitly include both types of slugs
- If a new domain code were `AU-001` (hypothetically), it would be ambiguous — but domain codes are exactly 2 characters, so this is impossible in practice

---

## Decision 5: HTML-Preserved Registries and Metrics

**Choice**: Registry and metrics documents are stored with raw HTML as the Markdown body (instead of pure Markdown).

**Why**:

1. **Table fidelity** — Complex HTML tables from Mammoth conversion cannot be reliably reproduced in Markdown. Turndown loses colspan/rowspan, specific widths, and nested structures.
2. **Cheerio parsing** — The registry parser relies on the `<table>` DOM structure available from HTML. Parsing Markdown tables is significantly harder and more fragile.
3. **Metrics live override** — Regex replacement of numbers in an HTML string is straightforward. Doing this in Markdown would require parsing the table cell values and modifying them, which is far more brittle.

**Tradeoffs**:
- Registry and metrics files are not human-readable in their stored form (raw HTML)
- Changes to the DOCX template may break the Cheerio parser (table structure assumptions)
- Harder to manually edit these files if needed

---

## Decision 6: Live Number Interpolation for Metrics

**Choice**: Metrics pages read static HTML reports but perform regex replacement to inject live counts at build time.

**Why**:

1. **Reports are authored infrequently** — Researchers write metrics reports at milestones. The numbers in the DOCX become stale as new frictions are added.
2. **Keeps reports current automatically** — As long as friction files are added to `web/content/`, the total counts in the metrics pages self-update with every build.
3. **No migration required for count updates** — Researchers don't need to re-migrate the DOCX just because the friction count changed by 5.

**The mechanism**:
```typescript
const totalFrictions = getFrictions().length;
htmlContent = htmlContent.replace(/>375</g, `>${totalFrictions}<`)
```

**Tradeoffs**:
- The regex is fragile — if the baseline number in the HTML changes significantly, the regex must be manually updated in the Server Component
- Only numeric totals are interpolated — percentage calculations must also be hard-coded and updated
- This is a "clever" solution that requires documentation to avoid future confusion

---

## Decision 7: Pagefind for Offline Search

**Choice**: Use Pagefind (a static site search engine) rather than an API-based search service.

**Why**:

1. **No subscription cost** — ElasticSearch, Algolia, and similar services cost money at scale.
2. **Offline capability** — Researchers may need to access the archive in environments without internet access (air-gapped networks, remote fieldwork).
3. **No third-party dependency at runtime** — The search system has zero external dependencies after the build.
4. **Performance** — Pagefind is extremely fast for the corpus size.
5. **Privacy** — No search queries are sent to external servers.

**Tradeoffs**:
- Search index must be rebuilt on each content update
- Index is stale during development until rebuilt
- Requires custom MIME type configuration for `.pf_*` files on some hosts
- No advanced features (analytics, A/B testing, personalized results)

---

## Decision 8: Duplicate Utility Functions Across Pages

**Choice**: `fixMarkdownTables()` and `linkifyAPIDs()` are copy-pasted into 3 and 2 page files respectively, rather than extracted to a shared module.

**Why** (observed, not necessarily endorsed):
- The functions were likely written in-place during initial page development
- The shared `lib/` directory was reserved for data access (api.ts, parsers), not markup utilities
- Pages are Server Components and cannot import from client-code modules

**This is a known code smell** and should be refactored:
- Extract both functions to `web/src/lib/markdownUtils.ts`
- Import from all three page files

**Current impact**: If `fixMarkdownTables` behavior needs to change, the change must be made in three places. This is a DRY violation but not a correctness issue.

---

## Decision 9: No Per-Page Metadata

**Choice**: All pages share the global `metadata` object from `app/layout.tsx`. No per-page `generateMetadata()` is implemented.

**Why** (observed):
- Simplifies initial implementation
- Every page has the same project identity in its `<title>` tag

**Tradeoff**: Search engine indexing is less precise. Each friction page has `title = "Project UIL | ATLAS Research Repository"` instead of `title = "AU-001 — Repeated Login Forms | ATLAS"`.

**This is an extension opportunity** — adding `generateMetadata()` to friction/pattern pages would significantly improve SEO.

---

## Decision 10: No Authentication or Access Control

**Choice**: The application is a fully public, anonymous knowledge portal. There is no login, no roles, no permissions.

**Why**:

1. **Research is meant to be shared** — UIL's mission is to document and disseminate knowledge about human frictions.
2. **Static export is incompatible with server-side auth** — `output: 'export'` has no request-time processing.
3. **Simplicity** — Authentication would require an identity provider, session management, and protected routes — all of which conflict with the zero-server philosophy.

**Tradeoff**: All research content is publicly accessible. If restricted access is ever needed, the architecture would need to change fundamentally (add a server, add auth middleware, change from `output: 'export'` to `output: 'server'`).
