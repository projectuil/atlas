# 06 — Pattern System

Behavioral Patterns are the synthesis layer of UIL research. They emerge from recurring observations across multiple Human Frictions and represent the broader cognitive or behavioral laws that govern why users struggle. This document explains how the Pattern system is structured, identified, cross-referenced, and rendered.

---

## What Is a Behavioral Pattern?

A **Behavioral Pattern** is a synthesized research finding — a generalized principle derived from multiple Human Friction observations. Where a Human Friction says *"users lose their work when a modal closes unexpectedly,"* a Pattern says *"users cannot maintain context across unexpected interruptions."*

Patterns are not solutions. They are observations elevated to the level of principle.

---

## Pattern Identifier (PTID)

Every Pattern has a **Pattern Identifier** (PTID) with format `PAT-NNN`:
- `PAT` — fixed namespace prefix
- `NNN` — zero-padded sequential integer (e.g., `PAT-001`, `PAT-064`)

PTIDs are permanent. They are never reused or reassigned.

As of the current research corpus, patterns range from `PAT-001` to `PAT-064`.

---

## Pattern Volumes

Patterns are organized into **Volumes** — named research groupings that cluster related behavioral principles together. Volume naming convention:

```
Volume XX — <Descriptive Category Name>
```

**Examples**:
- `Volume 01 — Cognitive Behaviour`
- `Volume 02 — Input Dynamics`
- `Volume 03 — Navigation & Context`

Volume names contain **em-dashes** (`—`), which are non-ASCII characters. The `getPatterns()` function in `api.ts` strips non-ASCII characters from volume names during normalization to produce clean strings for URL slug generation and UI display.

---

## Pattern File Structure

**Location**: `web/content/patterns/`

Each pattern is a separate `.md` file:
```
PAT-001.md
PAT-002.md
...
PAT-064.md
```

### Frontmatter Schema

```yaml
identity:
  id: "PAT-001"
  apid: "PAT-001"
  uuid: "urn:uuid:..."

metadata:
  title: "Context Loss Over Time"
  volume: "Volume 01 — Cognitive Behaviour"
  category: "Cognitive Behaviour"
  status: "accepted"
  tags:
    - "cognitive-load"
    - "context-switching"
    - "session-management"

evidence:
  confidence: 0.93

relationships:
  related_apids:
    - "AU-009"
    - "DW-011"
    - "LE-003"
```

The `relationships.related_apids` array is the critical cross-linking field — it creates a bidirectional semantic connection between the Pattern and multiple Human Frictions.

---

## How Patterns Are Loaded

**Function**: `getPatterns()` in `web/src/lib/api.ts`

```
1. Read all .md files in web/content/patterns/
2. For each file:
   a. Parse gray-matter (frontmatter + body)
   b. Normalize volume name: replace non-ASCII chars with '-'
   c. Clean up tags: strip "**Tags:**" / "**Keywords:**" prefix strings
   d. Extract missing fields from body text via regex:
      - Status: regex for "Status: Accepted" patterns
      - Category: regex for "Category:" patterns
      - Observation Level: regex for "Level \d" patterns
   e. Return normalized pattern object
```

The extraction from body text is a resilience mechanism — if the migration script failed to properly extract a field into frontmatter, the body regex fallback catches it.

**Function**: `getPatternsByVolume()` in `web/src/lib/api.ts`

Groups patterns by `metadata.volume` into a `Record<string, Pattern[]>` map. The volumes are returned in alphabetical order (ascending by volume name).

---

## Rendering: Patterns Index

**Route**: `/patterns`
**Server Component**: `web/src/app/patterns/page.tsx`
**Client Component**: `web/src/components/PatternClient.tsx`

### Server Component Responsibilities
- Calls `getPatterns()` and `getPatternsByVolume()`
- Passes all patterns and the volume grouping to `PatternClient`

### PatternClient Features
- **Two view modes**:
  - **Volume View** — Patterns grouped into volume cards with pattern count badges
  - **PAT-ID View** — Flat list of all patterns sorted by PAT number
- **Five filters**:
  1. Text search (title + tags)
  2. Volume filter (dropdown)
  3. Status filter (`accepted` | `candidate` | `draft`)
  4. Tag filter (controlled multi-select)
  5. Sort order (PAT-ID ascending/descending, Title A-Z)
- **Scroll restoration** via `useScrollRestoration('patterns')`

---

## Rendering: Volume Pages

**Route**: `/patterns/volume/[slug]`
**Server Component**: `web/src/app/patterns/volume/[slug]/page.tsx`
**Client Component**: `web/src/components/VolumeClient.tsx`

### Static Generation
`generateStaticParams()` generates one route per unique volume:
```typescript
export async function generateStaticParams() {
  const volumeMap = getPatternsByVolume();
  return Object.keys(volumeMap).map(volume => ({
    slug: volume.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }));
}
```

### VolumeClient Features
- Renders all patterns within a single volume
- Supports text search and tag filtering
- Shows "Evidence Count" (number of related APIDs per pattern)

---

## Rendering: Pattern Detail

**Route**: `/patterns/[slug]`
**Server Component**: `web/src/app/patterns/[slug]/page.tsx`

### What Gets Rendered
- PAT-ID badge and volume badge
- Title and tags
- Compiled markdown body (via `marked.parse()`)
- **Related Frictions card** — lists all `related_apids` with their friction titles and APID links

### Related Frictions Lookup
The Server Component performs an in-memory join:
```typescript
const allFrictions = getFrictions();
const relatedFrictions = (pattern.relationships?.related_apids || [])
  .map(apid => allFrictions.find(f => f.identity.apid === apid))
  .filter(Boolean);
```

This enables the pattern detail page to display human-readable titles for each supporting friction alongside APID links.

---

## The Pattern-Friction Cross-Reference Model

The relationship between Patterns and Frictions is **many-to-many** and **bi-directional**:

```
                    ┌─────────────────┐
                    │   PAT-001       │
                    │   related_apids:│
                    │   [AU-009,      │
                    │    DW-011,      │
                    │    LE-003]      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ AU-009  │         │ DW-011  │         │ LE-003  │
    │ (fric.) │         │ (fric.) │         │ (fric.) │
    └─────────┘         └─────────┘         └─────────┘
```

**On the pattern detail page**: The pattern lists its related frictions.

**On the friction detail page**: The Server Component reverse-looks up all patterns whose `related_apids` includes this friction's APID:
```typescript
const relatedPatterns = allPatterns.filter(p =>
  p.relationships?.related_apids?.includes(friction.identity.apid)
);
```

This reverse lookup is computed at build time — it is not a database join but a linear scan of all patterns in memory.

---

## Pattern Status Lifecycle

| Status | Meaning |
|--------|---------|
| `draft` | Under development, not yet reviewed |
| `candidate` | Submitted for peer review |
| `accepted` | Validated and canonical |
| `archived` | Superseded or deprecated |

---

## Pattern vs. Human Friction: The Conceptual Boundary

| Dimension | Human Friction | Behavioral Pattern |
|-----------|---------------|-------------------|
| Scope | Single observed event | Generalized behavioral principle |
| Specificity | Highly specific (e.g., "form clears on error") | Broad (e.g., "context loss over time") |
| Identifier | `AU-001`, `FF-023` | `PAT-001`, `PAT-064` |
| Count | ~375+ | ~64 |
| Volume organization | By domain (AU, DW, FF...) | By cognitive theme |
| Contains evidence? | Is the evidence | Aggregates evidence from frictions |

---

## Pattern Registry

The Pattern Registry (at `/registries/pattern`) is the master index of all patterns, their volume assignments, and lifecycle status. It is maintained as a separate DOCX document in `atlas/Registries/` and compiled to HTML via the migration pipeline.

See [08-registry-system.md](./08-registry-system.md) for the full registry architecture.
