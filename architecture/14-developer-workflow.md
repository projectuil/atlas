# 14 — Developer Workflow

This document provides step-by-step workflows for the most common development tasks in Project UIL. Follow these procedures exactly to ensure content is processed correctly and the web application builds without errors.

---

## Prerequisites

### Tools Required

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Run Next.js and migration scripts |
| npm | ≥ 9.x | Package management |
| Git | Any | Version control |

### Initial Setup

```bash
# Clone the repository
git clone <repo-url> atlas
cd atlas

# Install web application dependencies
cd web
npm install

# Install migration tool dependencies
cd ../tools/migration
npm install
```

---

## Workflow 1: Adding a New Human Friction

Use this workflow when a new friction observation has been documented and peer-reviewed.

### Step 1: Author the Document

Open the appropriate DOCX volume file in `atlas/Human-Frictions/<Domain>/`.

Add the new friction following the **APID Template** format:
- Assign the next sequential APID for the domain
- Fill all required metadata fields (title, category, subcategory, observation level, status, tags)
- Write the narrative body sections (Human Impact, Context, Evidence, Research Notes)
- Add to the Revision History table

### Step 2: Register the APID

Open the APID Registry DOCX in `atlas/Registries/APID-Registry.docx` and add the new entry with status `Candidate`.

### Step 3: Run Migration

```bash
cd tools/migration
node migrate-full.js
```

This will:
- Read all friction volumes
- Generate/update the Markdown files in `web/content/atlas/<DOMAIN>/`
- Create `<APID>.md` for the new friction

**Verify the output**:
```bash
cat web/content/atlas/AU/AU-051.md   # Replace with actual new APID
```

Confirm the frontmatter has:
- Correct `identity.id` and `identity.apid`
- All metadata fields populated
- `evidence.observation_level` is an integer 1–4
- `relationships.patterns` if applicable

### Step 4: Re-run Registry Migration

```bash
node migrate-registries.js
```

This updates `web/content/registries/APID-Registry.md` with the new entry.

### Step 5: Build the Web Application

```bash
cd ../../web
npm run build
```

The build runs:
1. `next build` — Compiles all pages including the new friction dossier
2. `npx pagefind --site out` — Updates the search index with the new friction
3. `node scripts/copy-search.js` — Syncs search index to `public/`

### Step 6: Verify

Preview the result:
```bash
node server.js
# Open http://localhost:3001
```

Check:
- Navigate to `/atlas/au-051` — does the new friction dossier render correctly?
- Navigate to `/atlas/au` — does the new friction appear in the category list?
- Open search (⌘K) and search for the friction title — does it appear?

---

## Workflow 2: Adding a New Behavioral Pattern

### Step 1: Author the Document

Create a new DOCX file in `atlas/Patterns/<Volume>/PAT-<NNN> — <Title>.docx` using the Pattern Template.

Required content:
- PAT-ID in filename AND in document body
- Volume assignment
- Title
- Tags
- Related APIDs (the supporting Human Frictions)
- Body sections (Pattern, Human Impact, Evidence, Research Notes)

### Step 2: Register the Pattern

Update the Pattern Registry DOCX in `atlas/Registries/Pattern-Registry.docx`.

### Step 3: Run Migration

```bash
cd tools/migration
node migrate-full.js
node migrate-registries.js
```

Verify `web/content/patterns/PAT-065.md` (or next sequential) is created correctly.

### Step 4: Build and Verify

```bash
cd ../../web
npm run build
node server.js
```

Check:
- `/patterns/pat-065` — pattern dossier renders
- `/patterns` — pattern appears in volume card or PAT-ID list
- `/patterns/volume/<volume-slug>` — pattern appears in volume page
- Friction dossiers for each `related_apid` — the new pattern appears in Related Patterns cards

---

## Workflow 3: Updating a Governance Document

Use this for Constitution, Brand Book, Publishing Manual, Standards, etc.

### Step 1: Edit the Source Document

Open and edit the relevant `.docx` in `docs/`.

### Step 2: Run Docs Migration

```bash
cd tools/migration
node migrate-docs.js
```

This regenerates the corresponding Markdown file in `web/content/docs/`.

> **Important**: `migrate-docs.js` operates from a hard-coded manifest. If you are adding a **new** doc file, you must first add it to the manifest in `migrate-docs.js` with its source path, slug, title, and category.

### Step 3: Build and Verify

```bash
cd ../../web
npm run build
```

Check `/docs/<slug>` renders the updated content.

---

## Workflow 4: Updating Metrics Reports

Metrics reports are periodically regenerated as new frictions are added.

### Step 1: Update the Metrics DOCX

Revise the metrics tables in `atlas/metrics/Human Friction Metrics.docx` or `atlas/metrics/Pattern Metrics.docx`.

### Step 2: Run Metrics Migration

```bash
cd tools/migration
node migrate-metrics-html.js
```

This regenerates `web/content/metrics/human-friction-metrics.md` and `pattern-metrics.md`.

### Step 3: Build

```bash
cd ../../web
npm run build
```

> **Note**: The web application performs **live number interpolation** at build time — it replaces hardcoded totals in the metrics HTML with live counts from the filesystem. You do **not** need to manually update total counts in the DOCX. The system overrides them automatically.

The interpolation pattern:
```typescript
// These replacements happen in metrics/frictions/page.tsx:
htmlContent = htmlContent.replace(/>375</g, `>${totalFrictions}<`)
htmlContent = htmlContent.replace(/>37\.5%</g, `>${completionPercent}%<`)
```

If the baseline numbers change significantly (e.g., the research reaches 400 frictions), the regex patterns in the Server Component must be updated to match the new baseline numbers in the HTML.

---

## Workflow 5: Adding a New Domain Category

This is a governance-level change requiring coordination.

### Step 1: Governance Approval

A new domain requires:
- Formal proposal and peer review
- Constitutional amendment (if needed)
- Category Registry entry approval

### Step 2: Update Code

Add the new 2-letter domain code to `OFFICIAL_DOMAINS` in `web/src/lib/api.ts`:

```typescript
const OFFICIAL_DOMAINS = ['AU', 'DW', 'FF', 'KI', 'LE', 'MB', 'OS', 'WI', 'XX'];
//                                                                              ^^^ new domain
```

Also add a description in the `categoryDescriptions` map:

```typescript
const categoryDescriptions: Record<string, string> = {
  ...existing entries,
  'XX': 'New Domain Description'
};
```

### Step 3: Create Content Directory

```bash
mkdir web/content/atlas/XX
```

### Step 4: Add Content and Build

Follow Workflow 1 to add the first friction in the new domain. Build and verify the new domain card appears in the Atlas Explorer.

---

## Workflow 6: Local Development

For making code changes to the web application:

```bash
cd web
npm run dev
# Opens http://localhost:3000
```

Next.js dev mode:
- Hot-reloads TypeScript/React changes instantly
- Reads content files from `web/content/` dynamically
- Search **does not work** unless the index was built previously and copied to `public/pagefind/`

To test search during development:
```bash
npm run build   # Must rebuild to update search index
node server.js  # Serve compiled output on :3001
```

---

## Environment Notes

### Content Directory Resolution

The `api.ts` functions use `process.cwd()` to resolve the content directory:

```typescript
const contentDir = path.join(process.cwd(), 'content');
```

This works correctly when `next build` is run from the `web/` directory. **Always run `npm run build` from within the `web/` directory**, not from the repository root.

### Migration Script Content Target

Migration scripts write output to `../../web/content/` (relative to `tools/migration/`). This path is hardcoded. Running migration scripts from a different working directory will produce incorrect paths.

**Always run migration scripts from `tools/migration/`**:
```bash
cd tools/migration
node migrate-full.js   # ✅ Correct
```

Not:
```bash
node tools/migration/migrate-full.js   # ❌ May write to wrong directory
```

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Friction doesn't appear in Atlas | APID prefix not in `OFFICIAL_DOMAINS` | Add prefix to `OFFICIAL_DOMAINS` in `api.ts` |
| Friction content is empty | `content` field empty in frontmatter (migration error) | Re-run migration, check DOCX structure |
| Tables don't render in friction dossier | Missing separator row in Markdown | `fixMarkdownTables()` should handle this; if not, check migration output |
| Search returns no results | Search index is stale | Run full `npm run build` |
| Pattern not in volume page | Volume name mismatch after em-dash stripping | Check `getPatternsByVolume()` key vs. URL slug |
| Build error: "Cannot find module" | Missing `npm install` | Run `npm install` in `web/` |
| Registry page shows no entries | Table header signature mismatch | Check `registryParser.ts` detection logic against actual HTML |
