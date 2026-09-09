# 08 — Registry System

The Registry System provides the authoritative master indexes for all identifiers in Project UIL. There are three registries: APID, Category, and Pattern. This document explains how registries are structured, stored, parsed, and rendered.

---

## Purpose of Registries

Registries serve as the **official record of existence and status** for every classified element in the research corpus:

| Registry | What It Tracks |
|----------|---------------|
| APID Registry | Every issued Human Friction ID with title, category, and status |
| Category Registry | Every official domain category with prefix and status |
| Pattern Registry | Every issued Pattern ID with title, volume, and status |

Registries provide:
- **Discoverability** — See all elements in a single searchable table
- **Governance** — Track lifecycle status of every element
- **Reference** — Canonical source for checking whether an APID has been issued
- **Onboarding** — New researchers can survey the full corpus scope at a glance

---

## Source Documents

**Location**: `atlas/Registries/`

The three source documents are maintained as `.docx` files:
- `APID-Registry.docx`
- `Category-Registry.docx`
- `Pattern-Registry.docx`

Each document contains:
- An introduction paragraph explaining the registry's purpose
- A "Registry Fields" section with column definitions
- A "Registry Statistics" section with aggregate counts
- A "Document Information" section (version, status, owner)
- A "Registry Rules" ordered list
- The main data table with all registry entries

---

## Migration: DOCX to HTML-Embedded Markdown

**Script**: `tools/migration/migrate-registries.js`

Unlike friction/pattern documents which convert to pure Markdown, registries use a **hybrid approach**: the document is converted to **HTML** and stored verbatim as the body of a Markdown file.

**Why HTML and not Markdown?**

Registry tables are structurally complex:
- Multi-column with specific column widths
- Status values with specific formatting
- Potentially nested content within cells

`mammoth.convertToHtml()` preserves this structure faithfully. Turndown's HTML-to-Markdown conversion would collapse complex table structures into flat text, losing the semantic structure needed for parsing.

**Output** (`web/content/registries/APID-Registry.md`):

```markdown
---
title: APID Registry
slug: apid-registry
source: atlas/Registries
---
<html content of the original document>
```

The YAML frontmatter provides routing metadata. The body is verbatim HTML from Mammoth.

---

## Parsing: The Registry Parser

**File**: `web/src/lib/registryParser.ts`

**Main Function**: `parseRegistryDocument(html: string): ParsedDocument`

This function uses **Cheerio** (a server-side jQuery-like DOM library) to navigate the HTML structure and extract all sections.

### Section Extraction Logic

```
HTML Input (from Mammoth-converted DOCX)
    │
    ├─ Cheerio('p') → intro paragraphs → intro[]
    ├─ Cheerio('table[0]') → Registry Fields table → fields[]
    ├─ Cheerio('table[1]') → Registry Statistics table → statistics{}
    ├─ Cheerio('table[2]') → Document Information table → docInfo{}
    ├─ Cheerio('ol') → Registry Rules → rules[]
    └─ Remaining tables → entry data → entries[]
```

### Table Type Detection

The registry parser determines what kind of entries a table contains by inspecting its **header row**:

```typescript
function detectTableType(headers: string[]): 'friction' | 'category' | 'pattern' | 'unknown' {
  if (headers.includes('APID') && headers.includes('Human Friction')) return 'friction';
  if (headers.includes('Category ID') && headers.includes('Prefix')) return 'category';
  if (headers.some(h => h.includes('PTID') || h.includes('PAT ID') || h.includes('Pattern'))) return 'pattern';
  return 'unknown';
}
```

### Entry Schemas

**APID Registry Entry**:
```typescript
type ApidEntry = {
  id: string;       // e.g., "AU-001"
  title: string;    // e.g., "Repeated Login Forms Every Day"
  status: string;   // e.g., "Accepted"
  category: string; // e.g., "Authentication & Forms"
}
```

**Category Entry**:
```typescript
type CategoryEntry = {
  id: string;     // e.g., "CAT-001"
  prefix: string; // e.g., "AU"
  title: string;  // e.g., "Authentication & Forms"
  domain: string; // e.g., "Digital Interaction"
  status: string; // e.g., "Active"
}
```

**Pattern Entry**:
```typescript
type PatternEntry = {
  id: string;     // e.g., "PAT-001"
  title: string;  // e.g., "Context Loss Over Time"
  status: string; // e.g., "Accepted"
  volume: string; // e.g., "Volume 01 — Cognitive Behaviour"
}
```

---

## Registry Pages: Server Components

Each registry has a dedicated Server Component page that handles file reading and parsing:

### APID Registry (`/registries/apid`)
**File**: `web/src/app/registries/apid/page.tsx`

```typescript
const registryFile = path.join(process.cwd(), 'content', 'registries', 'APID-Registry.md');
const rawContent = fs.readFileSync(registryFile, 'utf8');
const htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim();
const data = parseRegistryDocument(htmlContent);
return <ApidRegistryClient data={data} />;
```

### Category Registry (`/registries/category`)
**File**: `web/src/app/registries/category/page.tsx`

Same pattern, different file (`Category-Registry.md`) → `<CategoryRegistryClient />`

### Pattern Registry (`/registries/pattern`)
**File**: `web/src/app/registries/pattern/page.tsx`

Same pattern, different file (`Pattern-Registry.md`) → `<PatternRegistryClient />`

The frontmatter stripping (`.replace(/---[\s\S]*?---/, '').trim()`) removes the YAML header before passing raw HTML to the parser.

---

## Registry Client Components

Each registry has a dedicated interactive Client Component:

### `ApidRegistryClient.tsx`

Provides a full-featured interactive APID table:

| Feature | Detail |
|---------|--------|
| Text Search | Searches APID ID, title, and category columns |
| Category Filter | Dropdown populated from unique categories in the data |
| Status Filter | `Accepted` / `Candidate` / `Draft` / `Archived` |
| Sort | By APID (numerical), Title (A-Z), Status |
| Click-to-Copy | Click any APID to copy it to clipboard |
| Domain Badges | Color-coded badges showing domain prefix for each APID |
| Entry Count | Live count updates as filters are applied |

### `CategoryRegistryClient.tsx`

Interactive Category table:
- Search by category ID, prefix, title, or domain
- Filter by status
- Sort by ID or title
- Click-to-copy category prefix

### `PatternRegistryClient.tsx`

Interactive Pattern table:
- Search by PAT ID, title, or volume
- Volume filter (dropdown)
- Status filter
- Sort by PAT number or title
- Click-to-copy PAT ID
- Volume name sanitization (strips non-ASCII from volume names for display)

---

## Registry Index UI

**Route**: `/registries`
**Server Component**: `web/src/app/registries/page.tsx`

The index is a simple card grid with three colored cards:
- **APID Registry** — Blue badge → `/registries/apid`
- **Category Registry** — Green badge → `/registries/category`
- **Pattern Registry** — Purple badge → `/registries/pattern`

The cards display a summary stat (e.g., "375 Human Frictions") computed from `getFrictions()` and `getPatterns()` at build time.

---

## Generic Registry Route

**Route**: `/registries/[slug]`
**File**: `web/src/app/registries/[slug]/page.tsx`

A fallback route that renders any registry file using `marked` (plain markdown rendering). This handles the case where a registry document doesn't have a dedicated page — it renders the raw content as prose with no interactive features.

---

## Registry Governance Rules

From the APID Registry document itself:

1. All APIDs must be registered before use
2. APID format must conform to `XX-NNN` pattern
3. Once issued, APIDs are never deleted or reassigned
4. Retired/archived APIDs remain in the registry with `Archived` status
5. The registry must be updated within 48 hours of issuing a new APID
6. Category assignment is permanent after initial registration

---

## Data Freshness

The registry pages read files at **Next.js build time** only. If the APID Registry DOCX is updated and re-migrated:

1. Developer runs `tools/migration/migrate-registries.js`
2. `web/content/registries/APID-Registry.md` is updated
3. Developer runs `npm run build` in `web/`
4. The new registry data appears in the compiled HTML output

There is no real-time or hot-reload mechanism for registry data — updates require a full rebuild.
