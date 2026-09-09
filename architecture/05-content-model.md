# 05 — Content Model

This document defines the complete data schema for every content type in Project UIL. These schemas represent the canonical structure that all content must conform to.

---

## Overview

All content in the web application is stored as Markdown files with YAML frontmatter in `web/content/`. The data model is enforced through:

1. **Migration scripts** — which generate frontmatter during ingestion
2. **`api.ts` functions** — which normalize and load with fallback defaults
3. **Governance standards** — the APID Standard and Naming Convention documents define what fields are required

---

## 1. Human Friction

**File Location**: `web/content/atlas/<DOMAIN_CODE>/<APID>.md`

**Example**: `web/content/atlas/AU/AU-001.md`

### Full Schema

```yaml
identity:
  id: string          # REQUIRED. The canonical APID (e.g., "AU-001")
  uuid: string        # REQUIRED. A stable UUID for long-term reference (e.g., "urn:uuid:...")
  slug: string        # OPTIONAL. URL-safe version of the title (e.g., "repeated-login-forms-every-day")

metadata:
  title: string       # REQUIRED. Full human-readable title of the observed friction
  category: string    # REQUIRED. Full category name (e.g., "Authentication & Forms")
  category_code: string # OPTIONAL. 2-letter prefix (e.g., "AU"). Derived from identity.id prefix if absent.
  subcategory: string # OPTIONAL. Specific domain within the category
  volume: string      # OPTIONAL. Source volume document name
  version: string     # OPTIONAL. Document version (e.g., "1.0")
  revision: number    # OPTIONAL. Increment counter for edits (e.g., 1)
  status: string      # REQUIRED. One of: "accepted" | "candidate" | "draft" | "archived"
  created_date: string  # OPTIONAL. ISO date (YYYY-MM-DD)
  updated_date: string  # OPTIONAL. ISO date (YYYY-MM-DD)
  tags: string[]      # OPTIONAL. Array of keyword tags for search and cross-referencing

evidence:
  observation_level: number  # REQUIRED. Integer 1–4 (1=Exploratory, 4=Strong Evidence)
  confidence: number         # OPTIONAL. Float 0.00–1.00 (default: 0.90)
  methodology: string        # OPTIONAL. Research approach (e.g., "observation")
  citations: string[]        # OPTIONAL. Supporting references or academic citations

relationships:
  patterns: string[]        # OPTIONAL. Associated PAT IDs (e.g., ["PAT-002"])
  related_apids: string[]   # OPTIONAL. Peer friction APIDs sharing causality
  papers: string[]          # OPTIONAL. Research papers referencing this friction

change_log:
  - revision: number        # OPTIONAL. Revision number
    date: string            # OPTIONAL. ISO date of this revision
    description: string     # OPTIONAL. Summary of what changed
```

### Body Content

After the frontmatter delimiter (`---`), the document body is Markdown containing:
- Narrative description of the friction
- `**Human Impact**` section — consequences for users
- `**Context**` section — where and when the friction appears
- `**Evidence / Observation**` section — empirical basis
- `**Research Notes**` section — connections to other research
- `**Revision History**` table

### Validation Rules

| Rule | Detail |
|------|--------|
| APID uniqueness | No two frictions may share the same APID |
| Domain enforcement | `identity.id` prefix must be one of the 8 official domains |
| Status constraint | Must be one of the four allowed status values |
| Observation level | Must be an integer 1–4; defaults to 4 if parsing fails |
| Category code | Derived from `identity.id.split('-')[0]` if `metadata.category_code` absent |

### Cross-References

A Human Friction connects to:
- **Patterns** — via `relationships.related_apids` in pattern documents (reverse lookup)
- **Peer Frictions** — via `relationships.related_apids` in own frontmatter
- **Category** — via `metadata.category_code` / `identity.id` prefix

---

## 2. Behavioral Pattern

**File Location**: `web/content/patterns/<PAT-ID>.md`

**Example**: `web/content/patterns/PAT-001.md`

### Full Schema

```yaml
identity:
  id: string          # REQUIRED. Pattern identifier (e.g., "PAT-001")
  apid: string        # REQUIRED. Alias of id (e.g., "PAT-001"). Both should match.
  uuid: string        # REQUIRED. Stable UUID for long-term reference

metadata:
  title: string       # REQUIRED. Pattern name (e.g., "Context Loss Over Time")
  volume: string      # REQUIRED. Volume name (e.g., "Volume 01 — Cognitive Behaviour")
  category: string    # OPTIONAL. Research category extracted from body if absent
  status: string      # REQUIRED. "accepted" | "candidate" | "draft"
  tags: string[]      # OPTIONAL. Keywords, may need cleanup of "**Tags:**" prefix

evidence:
  confidence: number  # OPTIONAL. Extracted from body regex "Level \d" if absent in frontmatter

relationships:
  related_apids: string[]  # REQUIRED. List of Human Friction APIDs that support this pattern
```

### Body Content

The Pattern body contains:
- Pattern identifier and title metadata section (repeated from frontmatter)
- `**Pattern**` section — behavioral explanation
- `**Human Impact**` section
- `**Evidence**` section — list of supporting Human Frictions
- `**Research Notes**` section
- `**Revision History**` table

### Validation Rules

| Rule | Detail |
|------|--------|
| PTID uniqueness | No two patterns may share the same PAT ID |
| Volume required | Must be assigned to a volume (defaults to "Uncategorized") |
| Status fallback | Extracted from body text (`Status: Accepted`) if not in frontmatter |
| Tags cleanup | Strip `**Tags:**` and `**Keywords:**` prefixes added by Turndown |
| Non-ASCII removal | Em-dashes in volume names are stripped during `getPatterns()` normalization |

### Cross-References

A Pattern connects to:
- **Supporting Frictions** — via `relationships.related_apids`
- **Volume** — via `metadata.volume` (groups patterns for `/patterns/volume/[slug]`)

---

## 3. Documentation Document

**File Location**: `web/content/docs/<slug>.md`

**Example**: `web/content/docs/constitution.md`

### Full Schema

```yaml
title: string       # REQUIRED. Human-readable document title
category: string    # REQUIRED. One of: "Governance" | "Standards" | "Publishing" | "Templates" | "General"
status: string      # REQUIRED. "Official" | "Draft"
slug: string        # REQUIRED. URL-safe routing slug
```

### Body Content

Plain Markdown body converted from the source `.docx`. Content varies by document type.

### Validation Rules

Category must match one of the five allowed values, as `DocsClient.tsx` sorts groups using a fixed `CATEGORY_ORDER = ["Governance", "Standards", "Publishing", "Templates", "General"]`.

---

## 4. Registry Document

**File Location**: `web/content/registries/<name>.md`

**Examples**: `APID-Registry.md`, `Category-Registry.md`, `Pattern-Registry.md`

### Schema

```yaml
title: string   # REQUIRED. Registry display name
slug: string    # REQUIRED. File slug for routing
source: string  # OPTIONAL. Origin directory for documentation
```

### Body Content

**Unlike other content types**, the body of a registry document is **raw HTML** — not Markdown. This is because the documents are converted using `mammoth.convertToHtml()` to preserve complex table structures that Turndown would corrupt.

The HTML body contains:
- Introductory paragraphs
- "Registry Fields" table
- "Registry Statistics" table
- "Document Information" table
- "Registry Rules" ordered list
- Master registry table(s) with entry data

### Parsing

The HTML body is parsed by `parseRegistryDocument()` using Cheerio, producing a structured object:
```typescript
{
  intro: string[],
  fields: { field: string, description: string }[],
  statistics: Record<string, string>,
  docInfo: Record<string, string>,
  rules: string[],
  entries: RegistryEntry[]
}
```

Where `RegistryEntry` is one of:

**APID entry**: `{ id: string, title: string, status: string, category: string }`
**Category entry**: `{ id: string, prefix: string, title: string, domain: string, status: string }`
**Pattern entry**: `{ id: string, title: string, status: string, volume: string }`

---

## 5. Metrics Document

**File Location**: `web/content/metrics/<slug>.md`

**Examples**: `human-friction-metrics.md`, `pattern-metrics.md`

### Schema

```yaml
title: string   # REQUIRED. Report title
slug: string    # REQUIRED. Identifier slug
type: string    # REQUIRED. "frictions" | "patterns"
source: string  # OPTIONAL. Origin directory reference
```

### Body Content

Raw HTML (same pattern as registries) containing formatted tables with statistics, progress data, category breakdowns, milestone trackers, and roadmap tables.

### Live Interpolation

Before passing to the parser, the metrics page Server Component applies regex replacements to override static numbers in the HTML with live counts from `getFrictions()` and `getPatterns()`. This means the metrics document acts as a *template* that is dynamically populated at build time.

---

## Content Relationships Diagram

```
Category (derived from domain prefix)
    │
    │ 1:N
    ▼
Human Friction (APID: AU-001, FF-012, etc.)
    │                          │
    │ N:M (reverse lookup)     │ 1:N (related_apids in frontier)
    ▼                          ▼
Behavioral Pattern ────────► Peer Friction
(PAT-001, PAT-002)     (shared cause/domain)
    │
    │ Grouped by
    ▼
Volume (Volume 01, Volume 02, ...)
    │
    │ Indexed in
    ▼
Pattern Registry (PAT-ID, title, volume, status)
    │
    ▼
APID Registry (APID, title, category, status)
    │
    ▼
Category Registry (code, prefix, domain, status)
```
