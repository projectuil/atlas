# 01 — System Overview

Project UIL is an evidence-based research system and interactive knowledge portal. Understanding it requires understanding both its research philosophy and its technical architecture, because the two are inseparable — the technology is shaped entirely by the demands of the research methodology.

---

## The Two-System Architecture

UIL is not a single application. It is two coupled systems that share content:

### System 1: The Research Corpus

The canonical archive, stored in the repository root under `/atlas`, `/docs`, `/roadmap`, and `/tools`. This is where research is produced and governed. It contains:

- **Human Friction documents** — individual observed problems, stored as `.docx` volumes organized by domain.
- **Behavioral Pattern documents** — synthesized insights derived from multiple frictions.
- **Registry documents** — master ledgers tracking all identifiers and their lifecycle status.
- **Governance documents** — constitutional standards, research methodology, naming conventions, tagging standards, and versioning rules.
- **Metric reports** — progress tracking tables updated as research grows.

This system is **author-facing**. Researchers and domain experts interact with it using word processors and document editors.

### System 2: The Web Application

The interactive presentation layer, located entirely within `/web`. It transforms all research documents into a highly organized, fully navigable, statically compiled knowledge portal.

This system is **reader-facing**. Engineers, researchers, designers, and product managers consume it via a browser.

---

## Core Principles

### 1. The Filesystem Is the Database

There is no PostgreSQL, SQLite, Redis, or any other database. All research data is stored as Markdown files with YAML frontmatter in `web/content/`. The `web/src/lib/api.ts` module reads these files directly from disk using Node.js `fs` during build time.

This decision eliminates all database operational overhead (migrations, schema changes, connection pools, backups) while making version control via Git the natural history tracking mechanism.

### 2. Everything Is Built at Compile Time

The web application uses Next.js with `output: 'export'`. Every single page is rendered to static HTML at build time — no page is generated at request time. The result is a directory of HTML, CSS, and JavaScript files that can be served from any static file host with zero server-side logic.

This makes the site:
- Infinitely cacheable on CDNs
- Free from server runtime vulnerabilities
- Fast to load (no database queries at request time)
- Simple to deploy (any static host works)

### 3. Identifiers Are Permanent and Unique

Every Human Friction has an **APID** (Atlas Problem Identifier) and every Behavioral Pattern has a **PTID** (Pattern Identifier). Once assigned, these identifiers are permanent. They are never reused, renamed, or deleted. This is explicitly enforced by the APID Standard governance document.

This ensures that cross-references embedded in documents, research notes, and external citations remain valid forever.

### 4. Document-Driven Content Flow

The application never manually creates, edits, or manipulates research content. All content originates in human-authored documents (`.docx` or `.md`). The system's job is to parse, normalize, and present it — not to create it.

---

## Major Subsystems

### 1. Ingestion Pipeline (`tools/migration/`)

Node.js scripts that convert `.docx` research documents into structured Markdown files. Uses `mammoth` for document parsing and `turndown` for HTML-to-Markdown conversion. Runs manually when research content is updated.

### 2. Content Database (`web/content/`)

A structured directory tree of Markdown files with YAML frontmatter. Acts as the project's sole data store. Organized into five subdirectories: `atlas/`, `patterns/`, `docs/`, `metrics/`, and `registries/`.

### 3. Data Access Layer (`web/src/lib/api.ts`)

Server-side TypeScript functions that read and normalize data from `web/content/`. Called exclusively during the Next.js build phase. Handles gray-matter parsing, domain enforcement, metadata normalization, and relational lookups (e.g., finding patterns related to a friction).

### 4. Parser Utilities (`web/src/lib/registryParser.ts`, `tableParser.ts`)

Specialized HTML parsers using Cheerio and regex that extract structured tabular data from registry and metrics files (which are stored as HTML-embedded Markdown rather than clean frontmatter).

### 5. Rendering Engine (`web/src/app/`)

Next.js App Router pages and layouts. Server components read content via `api.ts`, compile markdown to HTML using `marked`, and pass serializable data to client components.

### 6. Interactive Client Layer (`web/src/components/`)

React client components that receive pre-rendered data as props and provide faceted filtering, sorting, view switching, and scroll restoration without any server round-trips.

### 7. Offline Search (`Pagefind`)

A post-build static search indexer that crawls the compiled HTML output and generates binary index shards. The browser dynamically loads the search engine at runtime via dynamic import. No Algolia, no ElasticSearch, no subscription required.

---

## System Relationships

```
┌────────────────────────────────────────────────────────────┐
│              CANONICAL RESEARCH CORPUS                     │
│  /atlas (DOCX)  /docs (DOCX)  /roadmap  /tools (scripts)  │
└────────────────────────────────────────────────────────────┘
                              │
                     tools/migration/
                     (Mammoth + Turndown)
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                COMPILED CONTENT DATABASE                   │
│             web/content/  (Markdown + YAML)                │
│  atlas/  patterns/  docs/  metrics/  registries/           │
└────────────────────────────────────────────────────────────┘
                              │
                    web/src/lib/api.ts
                    (gray-matter + marked)
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│              NEXT.JS BUILD ENGINE (SSG)                    │
│  Server Components → generateStaticParams() → HTML/JSON    │
│                         web/out/                           │
└────────────────────────────────────────────────────────────┘
                              │
                      npx pagefind
                       (Search Index)
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                   BROWSER (CLIENT)                         │
│  React Client Components + Pagefind Search + sessionStorage│
└────────────────────────────────────────────────────────────┘
```

---

## Technology Choices

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 16.x |
| UI | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | latest |
| Markdown Parser | marked | 18.x |
| YAML Frontmatter | gray-matter | 4.x |
| HTML DOM Parser | Cheerio | 1.x |
| Search Indexer | Pagefind | CLI |
| Type Safety | TypeScript | 5.x |
| Typography | @tailwindcss/typography | 0.5.x |
| Date Utilities | date-fns | 4.x |
| Fonts | Inter + IBM Plex Mono (Google Fonts) | — |
