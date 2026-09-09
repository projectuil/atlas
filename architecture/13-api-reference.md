# 13 — API Reference

This document is the complete reference for all public functions in `web/src/lib/api.ts`, `web/src/lib/registryParser.ts`, and `web/src/lib/tableParser.ts`. These are the sole data access and transformation interfaces for the UIL web application.

---

## `web/src/lib/api.ts`

This module is the **data access layer** — the only interface between the raw content database and the Next.js rendering engine. All functions run server-side at build time (in Node.js). They are never called in the browser.

---

### `getFrictions()`

```typescript
function getFrictions(): Friction[]
```

Reads all Human Friction documents from `web/content/atlas/` and returns a normalized array.

**Algorithm**:
1. Reads the `content/atlas/` directory for subdirectories (one per domain prefix)
2. For each subdirectory, reads all `.md` files
3. Parses each file with `gray-matter`
4. Normalizes: `identity.apid ← identity.apid || identity.id`
5. Derives `category_code` from APID prefix if not explicitly set in frontmatter
6. Returns the full array

**Returns**: `Friction[]` where each friction contains:
```typescript
{
  identity: {
    id: string;
    apid: string;      // Normalized: guaranteed to be present
    uuid?: string;
    slug?: string;
  };
  metadata: {
    title: string;
    category: string;
    category_code: string;  // Derived: 2-letter domain prefix
    subcategory?: string;
    version?: string;
    status: string;         // Default: "draft" if absent
    tags?: string[];
  };
  evidence: {
    observation_level: number;  // Default: 4 if invalid
    confidence?: number;
    methodology?: string;
    citations?: string[];
  };
  relationships: {
    patterns?: string[];
    related_apids?: string[];
    papers?: string[];
  };
  change_log?: ChangeLogEntry[];
  content: string;  // The raw Markdown body (not compiled)
}
```

**Notes**:
- Called at build time for every page that needs friction data
- Reads all ~375 files each time it is called (no caching between build steps)
- Excludes any subdirectory whose name is not in `OFFICIAL_DOMAINS`

**Called by**: `getFrictionsByCategory()`, `getFrictionByApid()`, `getCategories()`, and directly by multiple page Server Components

---

### `getFrictionByApid(apid: string)`

```typescript
function getFrictionByApid(apid: string): Friction | null
```

Finds a single friction by its APID. Case-insensitive match.

**Algorithm**:
```typescript
const frictions = getFrictions();
return frictions.find(f =>
  f.identity.apid.toLowerCase() === apid.toLowerCase()
) ?? null;
```

**Returns**: A single friction object or `null` if not found.

**Called by**: `app/atlas/[slug]/page.tsx`

---

### `getFrictionsByCategory(code: string)`

```typescript
function getFrictionsByCategory(code: string): Friction[]
```

Returns all frictions for a specific domain code. Case-insensitive match.

**Returns**: Filtered `Friction[]`, potentially empty.

**Called by**: `app/atlas/[slug]/page.tsx` (category view branch)

---

### `getCategories()`

```typescript
function getCategories(): Category[]
```

Derives the list of active categories from friction data, enforcing the `OFFICIAL_DOMAINS` whitelist.

**Algorithm**:
1. Call `getFrictions()`
2. Collect unique domain codes present in friction APIDs
3. Intersect with `OFFICIAL_DOMAINS = ['AU', 'DW', 'FF', 'KI', 'LE', 'MB', 'OS', 'WI']`
4. For each surviving code, compute:
   - `name`: from the first friction's `metadata.category`
   - `description`: from a hardcoded map in `api.ts`
   - `count`: number of frictions with this code prefix

**Returns**:
```typescript
{
  code: string;          // 2-letter domain code (uppercase)
  name: string;          // Full category name
  description: string;   // Brief description
  count: number;         // Number of frictions in this category
}[]
```

**Domain Enforcement**: If a content directory exists in `web/content/atlas/` with code `XY` but `XY` is not in `OFFICIAL_DOMAINS`, the category will not appear in the output.

**Called by**: `app/atlas/page.tsx`, `app/atlas/[slug]/page.tsx`, `app/page.tsx`

---

### `getPatterns()`

```typescript
function getPatterns(): Pattern[]
```

Reads all Pattern documents from `web/content/patterns/` and returns a normalized array.

**Normalization steps**:
1. `gray-matter` parse
2. Volume name: `replace(/[^\x00-\x7F]/g, '-')` strips em-dashes to produce ASCII-only slugs
3. Tags: strip `**Tags:**` and `**Keywords:**` prefix strings (Turndown artifact)
4. `metadata.status`: extract via body regex `/(Status|status):\s*(\w+)/` if not in frontmatter
5. `metadata.category`: extract via body regex `/(Category|category):\s*(.+)/` if absent
6. `evidence.confidence`: extract via body regex `/Level\s+(\d)/` if absent

**Returns**: `Pattern[]` — same nested schema as Friction but with pattern-specific fields.

**Called by**: `app/patterns/page.tsx`, `app/patterns/[slug]/page.tsx`, `app/patterns/volume/[slug]/page.tsx`, and pages computing related pattern backlinks

---

### `getPatternsByVolume()`

```typescript
function getPatternsByVolume(): Record<string, Pattern[]>
```

Groups all patterns by their `metadata.volume` field.

**Returns**: An object mapping volume name → patterns array, sorted alphabetically by volume name.

```typescript
{
  "Volume 01  Cognitive Behaviour": [PAT-001, PAT-005, PAT-012, ...],
  "Volume 02  Input Dynamics": [PAT-002, PAT-008, ...],
  ...
}
```

Note: Volume names have em-dashes stripped, so they appear as `Volume 01  Cognitive Behaviour` (with double space replacing the em-dash).

**Called by**: `app/patterns/page.tsx`, `app/patterns/volume/[slug]/page.tsx`

---

### `getDocs()`

```typescript
function getDocs(): Doc[]
```

Reads all documentation files from `web/content/docs/` and returns their frontmatter metadata.

**Returns**:
```typescript
{
  slug: string;       // From frontmatter `slug` field
  title: string;
  category: string;   // "Governance" | "Standards" | "Publishing" | "Templates" | "General"
  status: string;     // "Official" | "Draft"
  content: string;    // Raw Markdown body (not compiled)
}[]
```

**Called by**: `app/docs/[[...slug]]/page.tsx`, `app/page.tsx` (for count display)

---

### `getRegistries()`

```typescript
function getRegistries(): Registry[]
```

Reads all registry files from `web/content/registries/` and returns their frontmatter metadata (without parsing the HTML body — body parsing happens in the specific registry pages).

**Returns**:
```typescript
{
  slug: string;
  title: string;
  source?: string;
  content: string;  // Raw HTML body
}[]
```

**Called by**: `app/registries/[slug]/page.tsx`

---

## `web/src/lib/registryParser.ts`

### `parseRegistryDocument(html: string)`

```typescript
function parseRegistryDocument(html: string): ParsedDocument
```

Parses the HTML body of a registry document using Cheerio to extract all structured sections.

**Input**: Raw HTML string (the body of a registry `.md` file after frontmatter stripping)

**Returns**:
```typescript
{
  intro: string[];                           // Introductory paragraphs
  fields: { field: string; description: string }[];  // Registry field definitions
  statistics: Record<string, string>;         // Key-value statistics
  docInfo: Record<string, string>;            // Document metadata
  rules: string[];                            // Ordered governance rules
  entries: RegistryEntry[];                  // Master data rows
}
```

Where `RegistryEntry` is a union type:
```typescript
type ApidEntry = { id: string; title: string; status: string; category: string };
type CategoryEntry = { id: string; prefix: string; title: string; domain: string; status: string };
type PatternEntry = { id: string; title: string; status: string; volume: string };
type RegistryEntry = ApidEntry | CategoryEntry | PatternEntry;
```

**Entry type detection** by table header signature:
- `APID` + `Human Friction` → `ApidEntry[]`
- `Category ID` + `Prefix` → `CategoryEntry[]`
- `PTID` / `PAT ID` / `Pattern` → `PatternEntry[]`

**Called by**: `app/registries/apid/page.tsx`, `app/registries/category/page.tsx`, `app/registries/pattern/page.tsx`

---

## `web/src/lib/tableParser.ts`

### `extractTablesFromHtml(html: string)`

```typescript
function extractTablesFromHtml(html: string): Table[]
```

Extracts all `<table>` elements from an HTML string using regex and returns their headers and rows as arrays.

**Input**: HTML string (from a metrics `.md` file body after frontmatter stripping and live interpolation)

**Returns**:
```typescript
{
  headers: string[];   // Column header texts (stripped of HTML tags)
  rows: string[][];    // Array of rows, each a string array of cell texts
}[]
```

**Notes**:
- This is a regex-based parser, not a DOM parser
- Strips inner HTML tags from cell content (returns text only)
- Order of tables in the return array matches order of appearance in HTML
- Does not handle nested tables

**Called by**: `app/metrics/frictions/page.tsx`, `app/metrics/patterns/page.tsx`

---

## Inline Utilities in Page Files

These functions are duplicated across multiple page files. They are documented here for reference. They should eventually be consolidated into a shared `lib/markdownUtils.ts` module.

### `fixMarkdownTables(content: string): string`

Scans a Markdown string for table-header lines that are missing the mandatory `|---|---|` separator line. When found, inserts a dynamically computed separator row.

**Duplicated in**:
- `app/atlas/[slug]/page.tsx`
- `app/patterns/[slug]/page.tsx`
- `app/docs/[[...slug]]/page.tsx`

**Detection heuristic**:
- A line starting with `|` is a potential table row
- If the next line also starts with `|` but doesn't start with `|---`, insert a separator

### `linkifyAPIDs(content: string): string`

Auto-links bare APID references in Markdown body text:
- `AU-001` → `[AU-001](/atlas/au-001)`
- `PAT-001` → `[PAT-001](/patterns/pat-001)`

**Regex pattern**:
```
/(?<!\[)\b([A-Z]{2,3}-\d{3})\b(?!\])/g
```

The negative lookbehind prevents double-linking APIDs that are already inside `[...]` markdown link brackets.

**Duplicated in**:
- `app/atlas/[slug]/page.tsx`
- `app/patterns/[slug]/page.tsx`

---

## Constants

### `OFFICIAL_DOMAINS`

```typescript
const OFFICIAL_DOMAINS = ['AU', 'DW', 'FF', 'KI', 'LE', 'MB', 'OS', 'WI'];
```

The authoritative list of valid domain codes. Defined in `api.ts`. Used by `getCategories()` to whitelist content directories.

**Adding a new domain** requires:
1. Adding the 2-letter code to this array
2. Adding a category description to the `categoryDescriptions` map in `api.ts`
3. Creating the `web/content/atlas/<CODE>/` directory
4. Adding friction files to that directory

---

## TypeScript Types

```typescript
interface Friction {
  identity: { id: string; apid: string; uuid?: string; slug?: string };
  metadata: { title: string; category: string; category_code: string; subcategory?: string; status: string; tags?: string[]; version?: string; revision?: number; created_date?: string; updated_date?: string; };
  evidence: { observation_level: number; confidence?: number; methodology?: string; citations?: string[]; };
  relationships: { patterns?: string[]; related_apids?: string[]; papers?: string[]; };
  change_log?: { revision: number; date: string; description: string; }[];
  content: string;
}

interface Pattern {
  identity: { id: string; apid: string; uuid?: string; };
  metadata: { title: string; volume: string; category?: string; status: string; tags?: string[]; };
  evidence: { confidence?: number; };
  relationships: { related_apids?: string[]; };
  content: string;
}

interface Category {
  code: string;
  name: string;
  description: string;
  count: number;
}

interface Doc {
  slug: string;
  title: string;
  category: string;
  status: string;
  content: string;
}

interface ParsedDocument {
  intro: string[];
  fields: { field: string; description: string }[];
  statistics: Record<string, string>;
  docInfo: Record<string, string>;
  rules: string[];
  entries: RegistryEntry[];
}

interface Table {
  headers: string[];
  rows: string[][];
}
```
