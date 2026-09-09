# 10 — Component Architecture

This document maps every React component in the UIL web application, its responsibilities, its props interface, and how it interacts with the rest of the system.

---

## Component Model Overview

UIL uses a strict **Server/Client split**:
- All **page files** (`app/**/page.tsx`) are Server Components — run at build time
- All **component files** (`components/*Client.tsx`) are Client Components — run in browser

The naming convention enforces this: client components are suffixed with `Client`. There are no exceptions.

---

## Root Layout

**File**: `web/src/app/layout.tsx`
**Type**: Server Component (no `"use client"`)

### Responsibilities
- Applies global fonts (Inter via CSS variable `--font-inter`, IBM Plex Mono via `--font-mono`)
- Renders persistent top navigation header
- Wraps all page content in `<main data-pagefind-body>` (required for Pagefind indexing)
- Renders persistent footer with five link columns
- Provides the global `<SearchModal />` component

### Navigation Header

The header renders the ATLAS wordmark/logo and five primary navigation links:
- Atlas
- Patterns
- Docs
- Metrics
- Registries

The active route is visually distinguished using Next.js `usePathname()` within the header.

### Footer

The footer renders five link columns (mirroring the primary navigation) plus project meta information.

---

## SearchModal

**File**: `web/src/components/SearchModal.tsx`
**Type**: Client Component (`"use client"`)

### Responsibilities
- Listens for `⌘K` (macOS) / `Ctrl+K` (Windows/Linux) keyboard shortcut to open search
- Dynamically imports the Pagefind engine from `/pagefind/pagefind.js` on first open
- Debounces search queries to avoid excessive Pagefind calls
- Displays categorized results with titles, excerpts, and URL badges
- Traps keyboard focus while modal is open
- Closes on `Escape` key or backdrop click

### Props
None — this component is self-contained and mounts globally in `layout.tsx`.

### Key Implementation Details

```typescript
// Dynamic import of Pagefind (browser-only module)
const pagefind = await import('/pagefind/pagefind.js');
await pagefind.options({ baseUrl: '/' });

// Search on each keystroke
const search = await pagefind.search(query);
const results = await Promise.all(
  search.results.slice(0, 8).map(r => r.data())
);

// Categorize results by URL pattern
const category = url.includes('/atlas/') ? 'Human Frictions'
               : url.includes('/patterns/') ? 'Patterns'
               : url.includes('/docs/') ? 'Documentation'
               : url.includes('/metrics/') ? 'Metrics'
               : 'Registries';
```

### State
- `isOpen: boolean` — Modal visibility
- `query: string` — Current search input
- `results: PagefindResult[]` — Current search results
- `isLoading: boolean` — Pagefind query in progress

---

## AtlasClient

**File**: `web/src/components/AtlasClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  categories: Category[];       // All 8 domain categories with names, descriptions, counts
  totalFrictions: number;       // Total friction count for display
}
```

### Responsibilities
- Renders the domain card grid (one card per category)
- Provides text search that filters cards by category name or code
- Displays total friction count
- Preserves scroll position via `useScrollRestoration('atlas')`

### State
- `searchQuery: string` — Filter input value

---

## CategoryClient

**File**: `web/src/components/CategoryClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  category: Category;              // The specific domain (code, name, description)
  initialFrictions: Friction[];    // All frictions for this category
}
```

### Responsibilities
- Renders filtered list of frictions within a single domain
- Two view modes: APID list and Subcategory grouping
- Four filters: text search, subcategory, status, observation level
- Sort by APID, title, or observation level

### State
- `viewMode: 'apid' | 'subcategory'`
- `searchQuery: string`
- `subcategoryFilter: string`
- `statusFilter: string`
- `levelFilter: number | null`
- `sortBy: 'apid' | 'title' | 'level'`

---

## PatternClient

**File**: `web/src/components/PatternClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  patterns: Pattern[];
  volumeMap: Record<string, Pattern[]>;
}
```

### Responsibilities
- Renders patterns either as volume cards or flat PAT-ID list
- Five filters: text search, volume, status, tags, sort
- Each volume card shows the volume name, pattern count, and sample pattern titles
- Preserves scroll position via `useScrollRestoration('patterns')`

### State
- `viewMode: 'volume' | 'patid'`
- `searchQuery: string`
- `volumeFilter: string`
- `statusFilter: string`
- `tagFilter: string`
- `sortBy: 'patid' | 'title'`

---

## VolumeClient

**File**: `web/src/components/VolumeClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  volume: string;            // Volume display name
  patterns: Pattern[];       // All patterns in this volume
}
```

### Responsibilities
- Renders all patterns within a single volume
- Provides text search and tag filtering
- Shows "Evidence Count" (number of `related_apids`) per pattern

### State
- `searchQuery: string`
- `tagFilter: string`

---

## DocsClient

**File**: `web/src/components/DocsClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  docs: Doc[];    // All governance/standards documents
}
```

### Responsibilities
- Renders documentation index grouped by category
- Provides text search that filters documents by title and category
- Categories rendered in a fixed order: `["Governance", "Standards", "Publishing", "Templates", "General"]`
- Each doc card shows title, category badge, and status

### State
- `searchQuery: string`

### Hardcoded Category Order

```typescript
const CATEGORY_ORDER = ["Governance", "Standards", "Publishing", "Templates", "General"];
```

This array determines the display order of category groups. If a new `category` value is added to a doc's frontmatter that isn't in this array, it will be placed in an "Other" bucket or not displayed depending on how the grouping logic handles it. **Extending this system requires updating this constant.**

---

## FrictionDashboardClient

**File**: `web/src/components/FrictionDashboardClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  tables: Table[];      // Extracted HTML tables from metrics document
  rawHtml: string;      // Full interpolated HTML (with live counts)
  totalFrictions: number;
  completedFrictions: number;
}
```

### Responsibilities
- Renders 9 distinct analytics panels:
  1. Overall completion progress bar
  2. Milestone tracker
  3. Category breakdown table (frictions per domain)
  4. Evidence Level distribution
  5. Status breakdown (accepted vs. candidate vs. draft)
  6. Volume completion tracking
  7. Research velocity (frictions per month)
  8. Asset status table
  9. Roadmap table
- Displays progress percentages derived from live data interpolated into the HTML

### State
- Minimal: `activeTab: string` for tab-switching in some panels

---

## PatternDashboardClient

**File**: `web/src/components/PatternDashboardClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  tables: Table[];
  rawHtml: string;
  totalPatterns: number;
  completedPatterns: number;
}
```

### Responsibilities
Similar to `FrictionDashboardClient` but for 11 pattern-specific analytics panels:
1. Overall pattern completion progress
2. Volume completion breakdown
3. Status distribution
4. Evidence (linked APIDs) per pattern
5. Pattern categories
6. Confidence score distribution
7. Revision velocity
8. Asset status
9. Roadmap alignment
10. Tag cloud
11. Cross-domain coverage

---

## ApidRegistryClient

**File**: `web/src/components/ApidRegistryClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  data: ParsedDocument;    // Structured registry data with entries[]
}
```

### Responsibilities
- Renders the APID Registry as a filterable, sortable interactive table
- Text search across ID, title, category
- Category dropdown filter
- Status filter
- Sort by APID number (numerical sort, not string sort), title
- Click any APID to copy it to clipboard (shows brief "Copied!" feedback)
- Entry count display

### Key Implementation

APID numerical sort uses `parseInt(apid.split('-')[1])` to sort `AU-001` before `AU-010` correctly (unlike string sort which would place `AU-100` before `AU-20`).

---

## CategoryRegistryClient

**File**: `web/src/components/CategoryRegistryClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  data: ParsedDocument;
}
```

### Responsibilities
- Interactive Category Registry table
- Search by category code, prefix, title, or domain
- Status filter
- Sort by ID or title
- Click-to-copy prefix

---

## PatternRegistryClient

**File**: `web/src/components/PatternRegistryClient.tsx`
**Type**: Client Component

### Props
```typescript
{
  data: ParsedDocument;
}
```

### Responsibilities
- Interactive Pattern Registry table
- Search by PAT ID, title, or volume
- Volume filter dropdown
- Status filter
- Sort by PAT number or title
- Click-to-copy PAT ID
- Volume name sanitization (strips non-ASCII for clean display)

---

## Component Tree

```
layout.tsx (Server)
├── Header (Navigation)
├── <SearchModal /> (Client)
├── <main data-pagefind-body>
│   └── {children} — Route pages
│       │
│       ├── page.tsx → <AtlasClient />          (Client)
│       ├── atlas/[slug]/page.tsx
│       │   ├── → <CategoryClient />             (Client) [category routes]
│       │   └── → Static Friction Dossier        (Server-only SSR)
│       │
│       ├── patterns/page.tsx → <PatternClient />(Client)
│       ├── patterns/[slug]/page.tsx             (Server-only SSR)
│       ├── patterns/volume/[slug]/page.tsx → <VolumeClient /> (Client)
│       │
│       ├── docs/[[...slug]]/page.tsx
│       │   ├── → <DocsClient />                (Client) [index route]
│       │   └── → Static Doc Prose              (Server-only SSR)
│       │
│       ├── metrics/frictions/page.tsx → <FrictionDashboardClient /> (Client)
│       ├── metrics/patterns/page.tsx → <PatternDashboardClient />   (Client)
│       │
│       ├── registries/apid/page.tsx → <ApidRegistryClient />        (Client)
│       ├── registries/category/page.tsx → <CategoryRegistryClient />(Client)
│       └── registries/pattern/page.tsx → <PatternRegistryClient />  (Client)
└── Footer
```

---

## Shared Hook: useScrollRestoration

**File**: `web/src/hooks/useScrollRestoration.ts`

```typescript
export function useScrollRestoration(key: string): void {
  useEffect(() => {
    // Restore scroll from sessionStorage on mount
    const stored = sessionStorage.getItem(`scroll-${key}`);
    if (stored) {
      setTimeout(() => window.scrollTo(0, parseInt(stored)), 10);
    }
    
    // Save scroll position on scroll
    const handleScroll = debounce(() => {
      sessionStorage.setItem(`scroll-${key}`, String(window.scrollY));
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [key]);
}
```

The 10ms restore delay allows the DOM to finish painting before scrolling, preventing the scroll from being ignored. The 100ms debounce on save prevents excessive `sessionStorage` writes during fast scrolling.

**Used by**: `AtlasClient`, `CategoryClient`, `PatternClient`
