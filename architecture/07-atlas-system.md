# 07 — The ATLAS System

The ATLAS system is the core of Project UIL. It is the research engine that discovers, classifies, and archives Human Frictions. This document explains how the ATLAS domain model works, how frictions are organized and identified, and how the web application presents the Atlas.

---

## What Is the ATLAS?

ATLAS stands for **Aggregated Taxonomy of Latent Atlas Signals**. It is a structured archive of human experience failures — specific, repeatedly observable friction points that occur when people use digital systems.

The ATLAS is not a problem report. It is not a bug tracker. It is a **research corpus** — a living, peer-reviewed library of categorized observations that serves as the empirical foundation for design, product, and engineering decisions.

---

## The Domain System

ATLAS research is partitioned into **Domains** — major research areas identified by a 2-letter code prefix. There are exactly **8 official domains**:

| Code | Full Name | Description |
|------|-----------|-------------|
| `AU` | Authentication & Forms | Friction in login flows, forms, input validation, identity |
| `DW` | Desktop Workspace | Friction in desktop software, window management, multi-tasking |
| `FF` | Files & Project Management | Friction in file systems, project tools, collaboration |
| `KI` | Keyboard & Input | Friction in text input, shortcuts, keyboard UX |
| `LE` | Learning & Cognition | Friction in comprehension, help systems, onboarding |
| `MB` | Mobile Experience | Friction specific to mobile UI patterns |
| `OS` | Desktop & Operating System | Friction in OS-level interactions, settings, notifications |
| `WI` | Web & Internet | Friction in browser interactions, web navigation, UX patterns |

This domain whitelist is **hardcoded** in `web/src/lib/api.ts`:

```typescript
const OFFICIAL_DOMAINS = ['AU', 'DW', 'FF', 'KI', 'LE', 'MB', 'OS', 'WI'];
```

The `getCategories()` function enforces this whitelist — any content directory not matching these codes is silently excluded from the web application.

---

## The APID System

Every Human Friction in ATLAS is identified by an **Atlas Problem Identifier (APID)**:

```
FORMAT:  [DOMAIN CODE]-[3-DIGIT SEQUENTIAL NUMBER]
EXAMPLE: AU-001, FF-023, WI-100
```

### APID Rules (from APID Standard)

1. **Domain prefix** must be exactly 2 uppercase letters matching an official domain
2. **Number suffix** must be exactly 3 digits, zero-padded
3. **Once assigned, never reused** — retired APIDs remain in the registry as archived
4. **Sequential within domain** — AU-001, AU-002, AU-003... (no gaps without archiving)
5. **Case conventions** — stored uppercase in data, displayed uppercase, normalized to lowercase in URLs

### APID in URLs

To satisfy URL conventions:
- `/atlas/au-001` — lowercase in URL
- `AU-001` — uppercase in data and UI display

The normalization happens in `getCategories()`:
```typescript
return categories.map(c => ({ code: c.code.toLowerCase() }));
// And in routing:
const friction = frictions.find(f =>
  f.identity.apid.toLowerCase() === slug.toLowerCase()
);
```

---

## The Category Model

A **Category** in the web application is a derived concept — it is not stored as a first-class document. Instead, it is computed by:

1. Scanning all friction files in `web/content/atlas/`
2. Extracting unique domain prefixes from APID identifiers
3. Cross-referencing against `OFFICIAL_DOMAINS` whitelist
4. Counting frictions per category
5. Assembling a `Category` object with `{ code, name, description, count }`

```typescript
export function getCategories(): Category[] {
  const frictions = getFrictions();
  return OFFICIAL_DOMAINS
    .filter(code => frictions.some(f => f.identity.apid.startsWith(code)))
    .map(code => {
      const categoryFrictions = frictions.filter(f =>
        f.identity.apid.startsWith(code)
      );
      const sampleFriction = categoryFrictions[0];
      return {
        code,
        name: sampleFriction?.metadata?.category || code,
        description: categoryDescriptions[code] || '',
        count: categoryFrictions.length
      };
    });
}
```

**Important**: Categories only appear in the web application if at least one friction file exists for that domain. If `WI/` is empty, the Web & Internet category will not appear in the Atlas Explorer.

---

## Atlas Explorer UI

**Route**: `/atlas`
**Server Component**: `web/src/app/atlas/page.tsx`
**Client Component**: `web/src/components/AtlasClient.tsx`

### AtlasClient Features

The Atlas Explorer is a domain discovery interface:

- **Domain grid** — Eight category cards, each showing:
  - Domain code badge
  - Full category name
  - Description
  - Friction count
- **Search** — Filters categories by name or code
- **Scroll restoration** — Preserves scroll position across navigation

Each category card links to `/atlas/<code>` (e.g., `/atlas/au`).

---

## Category Detail UI

**Route**: `/atlas/[slug]` where slug matches a domain code (e.g., `au`, `ff`)
**Client Component**: `web/src/components/CategoryClient.tsx`

### CategoryClient Features

Renders all frictions within a single domain category:

- **Two view modes**:
  - **APID View** — Flat list sorted by APID number (AU-001, AU-002...)
  - **Subcategory View** — Frictions grouped by `metadata.subcategory`
- **Four filters**:
  1. Text search (APID + title + tags)
  2. Subcategory filter (derived from friction data)
  3. Status filter (`accepted` | `candidate` | `draft`)
  4. Observation Level filter (1–4)
- **Scroll restoration** via `useScrollRestoration('category-<code>')`

Each friction row displays:
- APID badge (with domain color coding)
- Title
- Subcategory
- Status badge
- Observation Level badge

---

## Friction Detail UI

**Route**: `/atlas/[slug]` where slug matches an APID (e.g., `au-001`, `ff-023`)
**Server Component**: `web/src/app/atlas/[slug]/page.tsx` (no client component)

This is a fully static, Server-Component-only page. No hydration occurs.

### Friction Dossier Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [Breadcrumb] Atlas > Authentication & Forms > AU-001         │
├──────────────────────────────────────────────────────────────┤
│ ● AU-001    📊 Level 4 — Strong Evidence                     │
│ [Observation Level] [Status Badge]                           │
│                                                              │
│ # Repeated Login Forms Every Day                             │
│ 🏷 cognitive-load  🏷 authentication  🏷 session-management  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Full Markdown body prose]                                  │
│  Human Impact, Context, Evidence sections...                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Related Patterns    │  Related Frictions   │  Metadata       │
│ ──────────────────  │  ─────────────────── │  ─────────────  │
│ PAT-001 Context...  │  AU-005 ....         │  Category: AU   │
│ PAT-017 Session...  │  DW-003 ....         │  Status: acptd  │
└──────────────────────────────────────────────────────────────┘
```

### Observation Level Scale

| Level | Label | Meaning |
|-------|-------|---------|
| 1 | Exploratory | Early hypothesis, limited evidence |
| 2 | Observed | Single-source observation |
| 3 | Corroborated | Multiple independent sources |
| 4 | Strong Evidence | Extensively validated across contexts |

---

## Friction Data Normalization

When `getFrictions()` reads a file, it applies these normalizations:

1. **APID extraction**: `identity.apid || identity.id` — supports both frontmatter patterns
2. **Prefix derivation**: If `metadata.category_code` is absent, extract from `identity.apid.split('-')[0]`
3. **Status defaulting**: If `metadata.status` is absent, default to `"draft"`
4. **Observation level**: If `evidence.observation_level` is not a valid integer 1–4, default to `4`

---

## Content Validation at Build Time

Because `getCategories()` filters against `OFFICIAL_DOMAINS` at build time, any friction file placed in an unsupported domain directory (e.g., `web/content/atlas/XX/`) will:
- Be read by `getFrictions()` (it scans all subdirectories)
- Be excluded from `getCategories()` (because `XX` is not in `OFFICIAL_DOMAINS`)
- Be accessible via `/atlas/xx-001` if an APID is present in frontmatter
- Not appear in the Atlas Explorer grid

This is the enforcement mechanism for the domain whitelist.

---

## The APID Registry

The APID Registry (at `/registries/apid`) provides the master ledger of all issued APIDs with their current lifecycle status. It is the official source of truth for APID assignment and status management.

See [08-registry-system.md](./08-registry-system.md) for details.

---

## Summary: ATLAS System Architecture

```
atlas/ (DOCX Research Archive)
    └─ tools/migration/migrate-full.js
            └─ web/content/atlas/<DOMAIN>/<APID>.md  (8 domain folders)
                    └─ web/src/lib/api.ts
                            ├─ getFrictions() → all frictions (array)
                            ├─ getCategories() → 8 categories (enforced whitelist)
                            ├─ getFrictionByApid(apid) → single friction
                            └─ getFrictionsByCategory(code) → filtered array
                                    └─ web/src/app/atlas/*
                                            ├─ /atlas → AtlasClient (8 domain cards)
                                            ├─ /atlas/au → CategoryClient (friction list)
                                            └─ /atlas/au-001 → Dossier (static SSR)
```
