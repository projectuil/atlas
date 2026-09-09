# 02 — Folder Architecture

This document explains the purpose, responsibilities, dependencies, consumers, and outputs of every important folder in the repository.

---

## Repository Root

```
c:\atlas
├── atlas/          # Canonical research corpus (DOCX source archives)
├── docs/           # Organizational governance and standards (DOCX)
├── roadmap/        # Strategic planning documents
├── tools/          # Ingestion and migration toolchain
└── web/            # The Next.js web application
```

The root is divided between **research production** (the first three folders) and **technical execution** (`tools/` and `web/`). This division is intentional: researchers should be able to understand the top level of the repository without needing engineering knowledge.

---

## `/atlas` — Canonical Research Archive

**Purpose**: The authoritative, unmodified archive of all research documents as originally authored.

**Responsibilities**:
- Houses all Human Friction volumes organized by domain category
- Stores Behavioral Pattern documents organized by volume
- Contains master Registry documents (APID, Category, Pattern)
- Maintains Standards documents that govern the research methodology
- Archives Templates for creating new frictions and patterns
- Tracks research progress in Metrics documents

**Internal Structure**:
```
atlas/
├── Human-Frictions/          # DOCX volumes organized by category prefix
│   ├── AU — Authentication & Forms/
│   │   ├── AU Volume 01 (AU-001–AU-025).docx
│   │   └── AU Volume 02 (AU-026–AU-050).docx
│   ├── DW — Desktop Workspace/
│   ├── FF — Files-and-Project-Management/
│   ├── KI — Keyboard & Input/
│   ├── LE — Learning/
│   ├── MB — Mobile Experience/
│   ├── OS — Desktop & Operating System/
│   └── WI — Web & Internet/
├── Patterns/                 # Pattern DOCX volumes
├── Registries/               # APID, Category, and Pattern Registry DOCX files
├── Standards/                # Governance standards (Category, APID, Naming, etc.)
├── Templates/                # Official document templates
├── metrics/                  # Human Friction and Pattern Metrics DOCX reports
└── README.md
```

**Dependencies**: None — this folder is the origin point of all research.

**Consumers**: `tools/migration/` reads `.docx` files from this directory.

**Produced Outputs**: Word `.docx` files authored by human researchers.

---

## `/docs` — Organizational Governance

**Purpose**: Stores all documents that define *how* Project UIL operates as an organization, as opposed to the research content itself.

**Responsibilities**:
- Defines the project's identity, values, and philosophy (Brand Book)
- Establishes editorial and publishing workflows (Publishing Manual)
- Governs content types, lifecycle, and taxonomy (Content Framework)
- Sets visual design standards (Visual Design System)
- Defines community engagement protocols (Community Guidelines)
- The constitutional supreme governing document (Constitution)
- Official research methodology for ATLAS (Research Standards)
- Long-term project roadmap and development phases (Roadmap)

**Internal Structure**:
```
docs/
├── 01-Brand-Book/
├── 02-Publishing-Manual/
├── 03-Content-Framework/
├── 04-Visual-Design-System/
├── 05-Calendar & Growth Strategy/
├── 06-Community-Guidelines/
├── 07-Constitution/
├── 08-Research-Standards/
└── 09-Roadmap/
```

**Dependencies**: None.

**Consumers**: `tools/migration/migrate-docs.js` converts these to Markdown.

**Produced Outputs**: Organizational authority documents.

---

## `/roadmap` — Strategic Planning

**Purpose**: High-level vision documents defining project phases and research priorities.

**Responsibilities**:
- Defines current development phase
- Sets research capacity goals
- Communicates progress toward milestones

**Dependencies**: Aligns with `docs/09-Roadmap/`.

**Consumers**: Project maintainers and contributors during planning.

**Produced Outputs**: `Project-Roadmap.md`.

---

## `/tools` — Ingestion and Migration Toolchain

**Purpose**: The technical bridge between the human-authored `.docx` research archive and the web application's Markdown database.

**Responsibilities**:
- Converts `.docx` files to structured Markdown using Mammoth and Turndown
- Generates YAML frontmatter for each document based on extracted metadata
- Handles domain-specific extraction for Frictions, Patterns, Registries, Docs, and Metrics
- Sanitizes Unicode artifacts (curly quotes, em-dashes) introduced by Word

**Internal Structure**:
```
tools/
└── migration/
    ├── migrate-full.js          # Primary script: Frictions + Patterns
    ├── migrate-docs.js          # Governance documents → docs MD
    ├── migrate-registries.js    # Registry DOCX → HTML-body MD
    ├── migrate-metrics-html.js  # Metrics DOCX → HTML-body MD
    ├── migrate-metrics.js       # Alternative metrics migration
    ├── migrate-community.js     # Community guidelines one-off
    ├── split-example.js         # Utility to split monolithic MD files
    └── package.json             # Dependencies (mammoth, turndown, js-yaml)
```

**Dependencies**:
- Reads from `/atlas` and `/docs` (DOCX files)
- Requires NPM packages: `mammoth`, `turndown`, `js-yaml`, `fs-extra`, `glob`

**Consumers**: Developers run migration scripts manually when research documents change.

**Produced Outputs**: Structured Markdown files deposited into `web/content/`.

---

## `/web` — The Next.js Web Application

**Purpose**: The self-contained interactive portal that reads compiled research Markdown and presents it as a polished, searchable knowledge system.

**Internal Structure**:
```
web/
├── content/         # Compiled Markdown database (the "database")
├── src/             # Application source code
│   ├── app/         # Next.js App Router pages and layouts
│   ├── components/  # React interactive client components
│   ├── hooks/       # Custom React hooks
│   └── lib/         # Data access and parsing utilities
├── public/          # Static assets (SVGs, Pagefind index after sync)
├── scripts/         # Post-build utility scripts
├── next.config.ts   # Next.js configuration (output: 'export')
├── package.json     # Dependencies and build scripts
└── server.js        # Optional static HTTP server for local preview
```

**Dependencies**: Reads from `web/content/` at build time. No external runtime dependencies.

**Consumers**: End users via a web browser.

**Produced Outputs**: `web/out/` — a fully compiled static website.

---

## `/web/content` — The Compiled Content Database

**Purpose**: Acts as the project's sole data store. All research data the web application reads comes from this directory.

**This is NOT a build artifact** — it is manually maintained and should be tracked in version control.

**Internal Structure**:
```
web/content/
├── atlas/           # Human Friction files, organized by domain prefix
│   ├── AU/          # AU-001.md, AU-002.md, ... AU-050.md
│   ├── DW/
│   ├── FF/
│   ├── KI/
│   ├── LE/
│   ├── MB/
│   ├── OS/
│   └── WI/
├── patterns/        # Pattern files (PAT-001.md … PAT-064.md)
├── docs/            # Governance and standards markdown
├── metrics/         # Metrics reports with embedded HTML tables
└── registries/      # Registry HTML-body markdown files
```

**Dependencies**: Populated by `tools/migration/` scripts.

**Consumers**: `web/src/lib/api.ts` reads all files here at build time.

**Produced Outputs**: The runtime-queryable Markdown research database.

---

## `/web/src/lib` — Data Access and Parsing Utilities

**Purpose**: Server-side TypeScript utilities that read, parse, normalize, and expose content from `web/content/`. These functions are the sole interface between the raw content database and the Next.js rendering engine.

**Files**:
- `api.ts` — Core data access layer. All primary content loading functions.
- `registryParser.ts` — Cheerio-based HTML DOM parser for registry and structured document files.
- `tableParser.ts` — Lightweight regex-based HTML table parser for metrics files.

**Dependencies**: `gray-matter`, `cheerio`, `fs`, `path`

**Consumers**: `web/src/app/**/*.tsx` Server Components.

**Produced Outputs**: Typed JavaScript objects representing content entities.

---

## `/web/src/app` — Next.js App Router Pages

**Purpose**: All routing definitions and Server Component page logic for the application.

**Internal Structure**:
```
web/src/app/
├── layout.tsx              # Root layout (nav, footer, fonts)
├── page.tsx                # Homepage
├── globals.css             # CSS custom properties and Tailwind imports
├── atlas/
│   ├── page.tsx            # Atlas Explorer index
│   └── [slug]/page.tsx     # Friction or Category detail page
├── patterns/
│   ├── page.tsx            # Patterns index
│   ├── [slug]/page.tsx     # Pattern detail page
│   └── volume/[slug]/page.tsx  # Volume group page
├── docs/
│   └── [[...slug]]/page.tsx   # Documentation catch-all route
├── metrics/
│   ├── page.tsx
│   ├── frictions/page.tsx
│   └── patterns/page.tsx
└── registries/
    ├── page.tsx
    ├── apid/page.tsx
    ├── category/page.tsx
    ├── pattern/page.tsx
    └── [slug]/page.tsx
```

**Dependencies**: `web/src/lib/api.ts`, `web/src/components/`

**Consumers**: Next.js build engine, then end users.

**Produced Outputs**: Static HTML in `web/out/`.

---

## `/web/src/components` — Interactive Client Components

**Purpose**: React `"use client"` components that implement all interactive UI behavior (search, filtering, sorting, tabs, scroll restoration). They receive pre-computed data as props from Server Components.

**Dependencies**: `web/src/hooks/`, Next.js `Link`, `lucide-react`

**Consumers**: `web/src/app/**/*.tsx` Server Components.

---

## `/web/src/hooks` — Custom React Hooks

**Purpose**: Shared stateful logic for client components.

**Files**:
- `useScrollRestoration.ts` — Saves and restores `window.scrollY` to/from `sessionStorage` to preserve scroll position across browser navigation events.

---

## `/web/public` — Static Assets

**Purpose**: Static files served directly to the browser without any processing.

**Contents**:
- SVG icons
- `pagefind/` — Pagefind search index binary shards (copied here by `scripts/copy-search.js` after build)

---

## `/web/scripts` — Post-Build Utilities

**Purpose**: Scripts that run after `next build` to complete the build pipeline.

**Files**:
- `copy-search.js` — Copies `web/out/pagefind/` to `web/public/pagefind/` so the search index is available during local development without a re-build.
