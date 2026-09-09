# 17 — Extension Guide

This guide explains how to safely extend the UIL system with new content types, new features, and new infrastructure without breaking existing functionality.

---

## Extension Philosophy

UIL follows an **additive-only** extension model:

- Never modify the meaning of an existing APID or PTID
- Never rename frontmatter fields that existing files depend on
- Never change the URL structure of existing routes (permanent links must be permanent)
- Always add new content types alongside existing ones, never replacing them
- Always maintain backward compatibility with existing content files

---

## Adding a New Content Type

Follow this pattern to introduce a completely new category of content (e.g., "Case Studies", "Templates", "Design Patterns").

### Step 1: Define the Frontmatter Schema

Document the fields the new content type will use. Keep it flat and simple.

Example (Case Study):
```yaml
---
id: "CS-001"
title: "Authentication Failure in Banking App"
category: "Case Studies"
status: "draft"
related_apids:
  - "AU-001"
  - "AU-009"
published_date: "2025-01-15"
---
```

### Step 2: Create the Content Directory

```bash
mkdir web/content/case-studies
```

### Step 3: Write the Loader Function

Add a new function to `web/src/lib/api.ts`:

```typescript
export function getCaseStudies(): CaseStudy[] {
  const dir = path.join(process.cwd(), 'content', 'case-studies');
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        id: data.id,
        title: data.title,
        category: data.category || 'Case Studies',
        status: data.status || 'draft',
        related_apids: data.related_apids || [],
        published_date: data.published_date || '',
        content
      } as CaseStudy;
    })
    .filter(cs => cs.id); // Exclude files without an ID
}
```

### Step 4: Add Routes

Create the directory and page files:

```
web/src/app/case-studies/
├── page.tsx                    # /case-studies (index)
└── [slug]/page.tsx             # /case-studies/cs-001 (detail)
```

**Index page** (Server Component):
```typescript
// app/case-studies/page.tsx
import { getCaseStudies } from '@/lib/api';
import CaseStudyClient from '@/components/CaseStudyClient';

export default function CaseStudiesPage() {
  const studies = getCaseStudies();
  return <CaseStudyClient studies={studies} />;
}
```

**Detail page** (Server Component):
```typescript
// app/case-studies/[slug]/page.tsx
import { getCaseStudies } from '@/lib/api';
import { marked } from 'marked';

export async function generateStaticParams() {
  const studies = getCaseStudies();
  return studies.map(s => ({ slug: s.id.toLowerCase() }));
}

export default async function CaseStudyDetail({ params }) {
  const { slug } = await params;
  const studies = getCaseStudies();
  const study = studies.find(s => s.id.toLowerCase() === slug);
  if (!study) return <div>Not found</div>;
  
  const contentHtml = await marked.parse(study.content);
  return (
    <article>
      <h1>{study.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
```

### Step 5: Create the Client Component

```typescript
// components/CaseStudyClient.tsx
"use client";

export default function CaseStudyClient({ studies }) {
  const [query, setQuery] = useState('');
  const filtered = studies.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {filtered.map(s => <CaseStudyCard key={s.id} study={s} />)}
    </div>
  );
}
```

### Step 6: Add to Navigation

Update the header in `app/layout.tsx` to include a link to `/case-studies`.

### Step 7: Create Migration Script

```javascript
// tools/migration/migrate-case-studies.js
const mammoth = require('mammoth');
const fs = require('fs-extra');
const path = require('path');

// Convert .docx case study files to .md
// Write to ../../web/content/case-studies/
```

### Step 8: Build and Verify

```bash
cd web && npm run build
node server.js
```

Check that:
- `/case-studies` renders the index
- `/case-studies/cs-001` renders the detail page
- Search picks up the new content automatically (no changes needed)

---

## Adding a New Domain Category

A new Human Friction domain requires a governance decision as well as code changes.

### Code Changes Required

**1. Update `OFFICIAL_DOMAINS` in `web/src/lib/api.ts`**:
```typescript
const OFFICIAL_DOMAINS = ['AU', 'DW', 'FF', 'KI', 'LE', 'MB', 'OS', 'WI', 'XX'];
```

**2. Add a category description**:
```typescript
const categoryDescriptions: Record<string, string> = {
  // ... existing entries ...
  'XX': 'Description of the new domain'
};
```

**3. Create the content directory**:
```bash
mkdir web/content/atlas/XX
```

**4. Update the APID Registry DOCX** with the new prefix.

**5. Update the Category Registry DOCX** with the new category.

**6. Re-run migrations and rebuild**.

---

## Adding a New Filter to CategoryClient

To add a new filtering dimension (e.g., filter by `methodology` field):

1. Ensure the new field is present in friction frontmatter (via migration script update if needed)
2. In `CategoryClient.tsx`, add:
   - New `useState` for the filter value
   - A derived list of unique values from `initialFrictions`
   - Filter the `filteredFrictions` array to apply the new condition
   - Render a new `<select>` or filter pill UI

---

## Adding Per-Page SEO Metadata

Each page Server Component can export `generateMetadata()` to override the global title:

```typescript
// app/atlas/[slug]/page.tsx

import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const friction = getFrictionByApid(slug.toUpperCase());
  
  if (!friction) return {};
  
  return {
    title: `${friction.identity.apid} — ${friction.metadata.title} | ATLAS`,
    description: `Human Friction observation: ${friction.metadata.subcategory || friction.metadata.category}`
  };
}
```

This is a purely additive change that does not affect any existing functionality.

---

## Adding a New Registry

To add a fourth official registry (e.g., "Volume Registry"):

1. Author the Registry DOCX in `atlas/Registries/`
2. Add migration to `tools/migration/migrate-registries.js`
3. Create `web/content/registries/Volume-Registry.md`
4. Create `web/src/app/registries/volume/page.tsx` (dedicated page, like `apid/page.tsx`)
5. Create `web/src/components/VolumeRegistryClient.tsx`
6. Update `parseRegistryDocument()` in `registryParser.ts` if the new registry has a different table structure
7. Add a card to the `/registries` index page

---

## Adding a New Sorting Option

To add a sort option in any Client Component (e.g., sort frictions by `created_date`):

1. Ensure the data field is present in props (it will be if it's in friction frontmatter)
2. Add the new option to the `sortBy` state type
3. Add the comparison function in the sort logic:
   ```typescript
   case 'date':
     return new Date(a.metadata.created_date ?? '') > new Date(b.metadata.created_date ?? '') ? 1 : -1;
   ```
4. Add the `<option>` to the sort dropdown render

---

## Modifying the Migration Pipeline

When the Word template changes (new metadata fields, restructured sections):

1. **Test the migration** on a single DOCX first before running on all volumes:
   ```bash
   node migrate-full.js --file "atlas/Human-Frictions/AU/AU Volume 01.docx"
   ```
   (You may need to add a `--file` flag if the script doesn't support it)

2. **Validate the output** by inspecting the generated `.md` files

3. **Update `api.ts` normalization** if new fields need default handling

4. **Update TypeScript types** to include new fields

5. **Run full migration** after validation

---

## Extending the Metrics Dashboard

To add a new analytics panel to `FrictionDashboardClient`:

1. Identify which table in the metrics HTML contains the data (use `extractTablesFromHtml()` and inspect the `tables` array by index)
2. Access it via `tables[N].headers` and `tables[N].rows`
3. Render the new panel in `FrictionDashboardClient`
4. If the metrics DOCX doesn't contain the data yet, add it to the DOCX, re-migrate, and rebuild

---

## Extension Checklist

For any extension, verify:

- [ ] No existing frontmatter fields were renamed or removed
- [ ] No existing URLs were changed or removed
- [ ] `generateStaticParams()` covers all new dynamic routes
- [ ] New Client Components are marked `"use client"`
- [ ] New Server Component data accesses happen only through `api.ts` or `registryParser.ts`
- [ ] Migration scripts write to the correct directory (`web/content/`)
- [ ] After running migrations and `npm run build`, no TypeScript errors appear
- [ ] New content appears in search (rebuilt with `npx pagefind --site out`)
- [ ] Scroll restoration is implemented if the new page uses `useState` for filters
