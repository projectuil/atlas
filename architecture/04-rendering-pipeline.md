# 04 — Rendering Pipeline

This document explains how the UIL web application transforms research data into HTML pages, and describes the architecture of its Server/Client Component model, static generation strategy, and client hydration behavior.

---

## Rendering Model: Static Site Generation (SSG)

The application uses Next.js with `output: 'export'` configured in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  experimental: { scrollRestoration: true }
};
```

**What this means**:
- Every route is fully pre-rendered at build time into a static HTML file
- No server is required in production — the output is a directory of files
- The browser receives complete HTML immediately (zero waiting for data fetching)
- JavaScript then hydrates interactive Client Components to make them functional

**What this prevents**:
- Any Server Actions
- Any `headers()`, `cookies()`, or request-time data access
- Any dynamic API routes
- Any `revalidate` or ISR (Incremental Static Regeneration)

---

## Server Components vs. Client Components

### Server Components (`web/src/app/**/*.tsx`)

Server Components run **only at build time** in a Node.js environment. They have access to:
- The filesystem via `import fs from 'fs'`
- All Node.js APIs
- The content database via `web/src/lib/api.ts`

**They cannot**:
- Use React state (`useState`, `useReducer`)
- Use React effects (`useEffect`)
- Attach browser event listeners
- Access `window`, `document`, or `sessionStorage`

**In UIL**, Server Components handle:
- Reading friction/pattern/docs/registry files from disk
- Parsing YAML frontmatter via `gray-matter`
- Converting Markdown to HTML via `marked`
- Passing serialized data to Client Components as props

### Client Components (`web/src/components/*Client.tsx`)

Client Components are marked with `"use client"` at the top of the file. They run in the browser after hydration.

**They can**:
- Use `useState`, `useReducer`, `useEffect`, `useRef`
- Access `window`, `document`, `sessionStorage`, clipboard API
- Attach event listeners
- Dynamically import browser-only modules (like Pagefind)

**In UIL**, Client Components handle:
- All filtering and sorting state
- View mode switching (Volume vs. PAT-ID; APID vs. Subcategory)
- Real-time text search (faceted, client-side)
- Scroll position persistence via `useScrollRestoration`
- The global search modal (Pagefind integration)
- APID/PTID click-to-copy buttons

### The Server-to-Client Data Contract

Server Components can only pass **serializable data** to Client Components as props. No functions, no promises, no class instances.

The pattern used throughout UIL:

```typescript
// Server Component (page.tsx) — runs at build time
export default function AtlasExplorer() {
  const categories = getCategories();       // Reads disk
  const totalFrictions = getFrictions().length;
  return <AtlasClient categories={categories} totalFrictions={totalFrictions} />;
}

// Client Component (AtlasClient.tsx) — runs in browser
"use client";
export default function AtlasClient({ categories, totalFrictions }) {
  const [searchQuery, setSearchQuery] = useState("");
  // ...filtering, sorting, rendering
}
```

The Server Component performs the expensive computation once at build time. The Client Component receives the result and handles interactivity.

---

## Static Route Generation

### Fixed Routes

Routes that always exist (no dynamic parameters) are automatically compiled:
- `/` — Homepage
- `/atlas` — Atlas Explorer index
- `/patterns` — Patterns index
- `/metrics` — Metrics overview
- `/metrics/frictions` — Friction dashboard
- `/metrics/patterns` — Pattern dashboard
- `/registries` — Registries overview
- `/registries/apid` — APID Registry
- `/registries/category` — Category Registry
- `/registries/pattern` — Pattern Registry

### Dynamic Routes (`generateStaticParams`)

Dynamic routes declare all valid parameter values at build time via the `generateStaticParams()` exported function:

```typescript
// app/atlas/[slug]/page.tsx
export async function generateStaticParams() {
  const frictions = getFrictions();
  const categories = getCategories();

  // Generates /atlas/au-001, /atlas/au-002, ... /atlas/au-050
  const apidParams = frictions
    .filter(f => typeof f.identity?.apid === 'string')
    .map(f => ({ slug: f.identity.apid.toLowerCase() }));

  // Generates /atlas/au, /atlas/dw, /atlas/ff, ...
  const categoryParams = categories.map(c => ({
    slug: c.code.toLowerCase(),
  }));

  return [...apidParams, ...categoryParams];
}
```

Next.js uses this list to pre-render exactly those pages and nothing else.

---

## Layout Hierarchy

The layout system wraps every page in shared UI elements:

```
app/layout.tsx (Root Layout)
├── <html lang="en">
│   ├── <body> (Inter + IBM Plex Mono CSS variables)
│   │   ├── <header> — Top navigation with SearchModal
│   │   ├── <main data-pagefind-body> — All route content
│   │   │   └── {children} → page.tsx output
│   │   └── <footer> — Five-column link grid
```

**Critical**: The `data-pagefind-body` attribute on `<main>` is the hook that tells Pagefind to index the content inside it. This must not be removed or Pagefind will index empty pages.

There are no nested layout files — all routes share the single root layout.

---

## Metadata Generation

Page metadata (title, description for SEO) is defined in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Project UIL | ATLAS Research Repository",
  description: "Understanding Human Problems Before Building Technology.",
};
```

Individual pages do not currently override this metadata (no per-page `generateMetadata()`). All pages share the same global title and description. This is a known extension opportunity.

---

## Content Rendering Pipeline (Per Request)

For a request to `/atlas/au-001`, the build-time pipeline is:

```
1. generateStaticParams() declares { slug: 'au-001' }
2. Next.js calls page.tsx with { params: { slug: 'au-001' } }
3. Server Component:
   a. getFrictions() reads all atlas/*.md files
   b. Finds friction where identity.apid === 'AU-001'
   c. getPatterns() reads all patterns/*.md files
   d. Filters patterns where relationships.related_apids includes 'AU-001'
   e. fixMarkdownTables(friction.content) fixes table formatting
   f. linkifyAPIDs(content) converts bare APIDs to hyperlinks
   g. marked.parse(fixedContent) compiles Markdown → HTML string
   h. Returns JSX with:
      - Breadcrumb navigation
      - APID badge and Observation Level badge
      - Title and tags
      - dangerouslySetInnerHTML {{ __html: contentHtml }}
      - Related Patterns card
      - Related Frictions card
      - Metadata card
4. Next.js renders the full page to web/out/atlas/au-001/index.html
```

---

## Hydration

Because the friction/pattern detail pages are pure Server Components (they render to static HTML with no `"use client"` boundary), there is **no hydration on those pages**. The HTML is fully self-contained.

Pages that use Client Components (Atlas Explorer, Category view, Patterns index, Volume view, Docs index, all registry pages, all metric dashboards) will hydrate React in the browser to activate:
- `useState` hooks for filters/sort state
- `useEffect` hooks for scroll restoration and Pagefind initialization
- Event listeners (search input, dropdown changes, clipboard)

The hydration cost is minimal because no data fetching happens in the browser — all data is already embedded in the initial HTML as serialized props.

---

## Markdown-to-HTML Rendering

Markdown body content is rendered using `marked`:

```typescript
const contentHtml = await marked.parse(fixedContent);
```

The resulting HTML string is injected via:

```tsx
<div
  className="prose prose-invert prose-emerald max-w-none
             prose-headings:font-semibold
             prose-a:text-primary
             prose-table:w-full
             prose-th:text-left
             prose-th:border-b prose-th:border-border prose-th:pb-2
             prose-td:border-b prose-td:border-border/50 prose-td:py-3"
  dangerouslySetInnerHTML={{ __html: contentHtml }}
/>
```

The `prose` classes come from `@tailwindcss/typography` and provide consistent, readable rendering of headings, paragraphs, lists, tables, and code blocks.

---

## The Dual-Role Slug Route

The `/atlas/[slug]` route deserves special attention because it serves **two fundamentally different pages** from the same file:

```typescript
export default async function SlugPage({ params }) {
  const { slug } = await params;
  const categories = getCategories();
  const frictions = getFrictions();

  const isCategory = categories.some(c => c.code.toLowerCase() === slug.toLowerCase());

  if (isCategory) {
    const categoryData = categories.find(c => c.code.toLowerCase() === slug.toLowerCase());
    const categoryFrictions = getFrictionsByCategory(categoryData.code);
    return <CategoryClient category={categoryData} initialFrictions={categoryFrictions} />;
  }

  const friction = frictions.find(f => f.identity.apid.toLowerCase() === slug.toLowerCase());
  // ... render friction dossier
}
```

- `/atlas/au` → Category page (interactive client component with all AU frictions)
- `/atlas/au-001` → Individual friction dossier (static HTML from Server Component)

Both URL patterns are declared in `generateStaticParams()` to ensure both are pre-rendered.
