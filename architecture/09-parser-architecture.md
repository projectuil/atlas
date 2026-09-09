# 09 — Parser Architecture

The UIL application uses three distinct parsing tiers operating at different points in the content lifecycle. Each tier uses different tools and serves a different purpose. Understanding the parser architecture is essential for debugging content rendering issues and adding new content types.

---

## Three-Tier Parsing Model

```
TIER 1: Migration-Time Parsing      (runs once, developer-initiated)
        tools/migration/*.js
        Mammoth (DOCX→HTML) + Turndown (HTML→MD) + js-yaml

TIER 2: Runtime Document Parsing    (runs at each Next.js build)
        web/src/lib/api.ts
        gray-matter (YAML frontmatter) + marked (MD→HTML)

TIER 3: Runtime Structure Parsing   (runs at each Next.js build)
        web/src/lib/registryParser.ts + tableParser.ts
        Cheerio (HTML DOM) + custom regex
```

---

## Tier 1: Migration-Time Parsing

**Location**: `tools/migration/*.js`
**Trigger**: Manually run by developers after research documents change
**Tools**: `mammoth`, `turndown`, `js-yaml`, `fs-extra`, `glob`

### Stage 1a: DOCX to HTML (Mammoth)

Mammoth converts Microsoft Word `.docx` binary format to HTML:

```javascript
const result = await mammoth.convertToHtml({ path: docxPath });
const html = result.value;
```

Mammoth performs:
- Preserves heading levels (h1–h6)
- Converts bold/italic to `<strong>` and `<em>`
- Converts tables to `<table><thead><tbody>` structure
- Strips most Word-specific formatting (track changes, comments)
- Converts images (ignored in this project)

**For registries and metrics**: The HTML output is used directly (stored verbatim as the document body).

**For frictions and patterns**: The HTML is passed to Stage 1b.

### Stage 1b: HTML to Markdown (Turndown)

For frictions and patterns, HTML is converted to Markdown using Turndown:

```javascript
const TurndownService = require('turndown');
const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
const markdown = td.turndown(html);
```

**Known Turndown artifacts** that require post-processing:
- **Table separator rows**: Turndown sometimes omits the `|---|---|` separator row in Markdown tables, making them invalid. The `fixMarkdownTables()` utility in `api.ts` fixes these at read time.
- **Bold tags in table content**: Turndown occasionally wraps cell content in `**` markers, leaving strings like `**Tags: cognitive-load**`. The `getPatterns()` function strips these.
- **Non-ASCII characters**: Word documents often contain curly quotes (`"`, `"`), em-dashes (`—`), and other Unicode. Turndown preserves these in Markdown, but the migration scripts apply regex cleanup to sanitize them.

### Stage 1c: Metadata Extraction and Frontmatter Generation

For frictions:
```javascript
// 1. Split markdown on APID anchor (regex: /^## (AU|DW|...)-\d{3}/m)
const sections = splitOnApiAnchors(markdown);
// 2. Extract metadata from each section's opening table
const metadata = extractMetadataTable(section);
// 3. Build YAML frontmatter object
const frontmatter = buildFrontmatter(apid, metadata);
// 4. Write APID.md with frontmatter + body
writeFrictionFile(apid, frontmatter, sectionBody);
```

For patterns (one DOCX per pattern):
```javascript
// 1. Extract PAT-ID from filename
const patId = path.basename(docxFile, '.docx').match(/PAT-\d+/)[0];
// 2. Parse the entire converted markdown as a single document
// 3. Extract fields via regex (Title, Volume, Tags, Related APIDs)
// 4. Write PAT-ID.md with frontmatter
```

---

## Tier 2: Runtime Document Parsing

**Location**: `web/src/lib/api.ts`
**Trigger**: Every `next build` run
**Tools**: `gray-matter`, `marked`, built-in regex

### Stage 2a: Frontmatter Parsing (gray-matter)

All Markdown files in `web/content/` are read with `gray-matter`:

```typescript
import matter from 'gray-matter';

const fileContent = fs.readFileSync(filePath, 'utf8');
const { data: frontmatter, content: body } = matter(fileContent);
```

`gray-matter` splits the file at the `---` delimiters and parses the YAML header into a JavaScript object. The body text (everything after the second `---`) is returned separately.

### Stage 2b: Body Cleanup Utilities

Before compiling Markdown to HTML, two cleanup utilities are applied:

#### `fixMarkdownTables(content: string): string`

Detects Markdown tables that are missing the separator row and inserts them:

```typescript
function fixMarkdownTables(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    result.push(lines[i]);
    // If current line looks like a table header and next line is not a separator
    if (lines[i].startsWith('|') && lines[i+1] && !lines[i+1].startsWith('|---')) {
      // Count columns and insert separator
      const cols = lines[i].split('|').length - 2;
      result.push('|' + ' --- |'.repeat(cols));
    }
  }
  return result.join('\n');
}
```

This function is **duplicated** in three page files (`atlas/[slug]/page.tsx`, `patterns/[slug]/page.tsx`, `docs/[[...slug]]/page.tsx`). It is not extracted to a shared module — a potential refactoring opportunity.

#### `linkifyAPIDs(content: string): string`

Auto-converts bare APID references in body text to hyperlinks:

```typescript
function linkifyAPIDs(content: string): string {
  // Match APID-like strings not already inside markdown links
  return content.replace(
    /(?<!\[)\b([A-Z]{2,3}-\d{3})\b(?!\])/g,
    (match) => {
      if (match.startsWith('PAT-')) {
        return `[${match}](/patterns/${match.toLowerCase()})`;
      }
      return `[${match}](/atlas/${match.toLowerCase()})`;
    }
  );
}
```

The negative lookbehind `(?<!\[)` and negative lookahead `(?!\])` prevent double-linking already-linked APIDs.

This function is **duplicated** in two page files (`atlas/[slug]/page.tsx`, `patterns/[slug]/page.tsx`).

### Stage 2c: Markdown to HTML (marked)

The cleaned Markdown body is compiled to HTML:

```typescript
import { marked } from 'marked';

const contentHtml = await marked.parse(content);
```

`marked` is configured with default options (no custom renderer). It produces standard HTML: headings, paragraphs, lists, code blocks, blockquotes, and tables.

The HTML string is injected via `dangerouslySetInnerHTML` in the JSX:
```tsx
<div dangerouslySetInnerHTML={{ __html: contentHtml }} />
```

This is safe because the content source is controlled (markdown files in the repository, not user input).

---

## Tier 3: Runtime Structure Parsing

**Location**: `web/src/lib/registryParser.ts`, `web/src/lib/tableParser.ts`
**Trigger**: Every `next build` run, only for registry and metrics pages
**Tools**: `cheerio`, custom regex

### Registry Parser (`registryParser.ts`)

The registry parser uses Cheerio to navigate the HTML DOM structure and extract typed data:

```typescript
import * as cheerio from 'cheerio';

export function parseRegistryDocument(html: string): ParsedDocument {
  const $ = cheerio.load(html);
  
  const result: ParsedDocument = {
    intro: [],
    fields: [],
    statistics: {},
    docInfo: {},
    rules: [],
    entries: []
  };

  // Extract intro paragraphs
  $('p').each((i, el) => {
    const text = $(el).text().trim();
    if (text) result.intro.push(text);
  });

  // Extract tables by position
  $('table').each((tableIndex, table) => {
    const headers = $(table).find('th')
      .map((_, th) => $(th).text().trim())
      .get();

    const rows = $(table).find('tbody tr').map((_, row) => {
      return [$(row).find('td').map((_, td) => $(td).text().trim()).get()];
    }).get();

    // Determine table role by header signature
    if (isFieldDefinitionTable(headers)) {
      rows.forEach(([field, description]) => {
        result.fields.push({ field, description });
      });
    } else if (isStatisticsTable(headers)) {
      rows.forEach(([key, value]) => {
        result.statistics[key] = value;
      });
    } else if (isEntryTable(headers)) {
      result.entries = parseEntries(headers, rows);
    }
  });

  // Extract rules from ordered list
  $('ol li').each((_, li) => {
    result.rules.push($(li).text().trim());
  });

  return result;
}
```

**Entry parsing** uses the table header signature to dispatch to the correct typed parser:
- Headers contain `APID` + `Human Friction` → parse as friction entries
- Headers contain `Category ID` + `Prefix` → parse as category entries
- Headers contain `PTID` or `PAT` → parse as pattern entries

### Table Parser (`tableParser.ts`)

The metrics table parser is a lightweight alternative to Cheerio for simpler table extraction:

```typescript
export function extractTablesFromHtml(html: string): Table[] {
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  const tables: Table[] = [];
  
  let match;
  while ((match = tableRegex.exec(html)) !== null) {
    const tableHtml = match[0];
    const headers = extractHeaders(tableHtml);
    const rows = extractRows(tableHtml);
    tables.push({ headers, rows });
  }
  
  return tables;
}

function extractHeaders(tableHtml: string): string[] {
  const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
  const headers: string[] = [];
  let m;
  while ((m = thRegex.exec(tableHtml)) !== null) {
    headers.push(m[1].replace(/<[^>]+>/g, '').trim());
  }
  return headers;
}
```

This regex-based approach is simpler than Cheerio but less robust. It works for the specific metrics HTML because the table structure is predictable and consistent.

---

## Parser Decision Tree

When content arrives in the web application, the correct parser is selected by content type:

```
Is the content a registry file?
├── YES → Parse with registryParser.ts (Cheerio)
│         Pass result to *RegistryClient component
└── NO
    Is it a metrics file?
    ├── YES → Apply live interpolation (regex replace)
    │         Parse with tableParser.ts (regex tables)
    │         Pass tables to *DashboardClient component
    └── NO
        Is it a friction, pattern, or doc file?
        ├── YES → gray-matter parse (frontmatter)
        │         fixMarkdownTables() (fix table rendering)
        │         linkifyAPIDs() (auto-hyperlink APIDs, friction/pattern only)
        │         marked.parse() (Markdown → HTML)
        │         Render with dangerouslySetInnerHTML
        └── NO → Unknown content type, not handled
```

---

## Parser Error Behavior

All parsers apply **graceful degradation** — they never throw exceptions that would crash the build:

| Parser | Error Behavior |
|--------|---------------|
| gray-matter | Returns empty `data` and full content as body if YAML is malformed |
| Cheerio | Returns empty arrays/objects if DOM structure is unexpected |
| Regex table parser | Returns empty `headers`/`rows` arrays if no tables found |
| `fixMarkdownTables` | Returns original content unchanged if no table-like content found |
| `linkifyAPIDs` | Returns original content unchanged if no APID-like patterns found |

This means a malformed content file will produce a broken page at runtime (empty fields, missing data) but will not fail the build. Developers should validate content files before building.

---

## Known Parser Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| `fixMarkdownTables` is duplicated in 3 files | DRY violation; changes must be made in 3 places | Extract to `lib/markdownUtils.ts` |
| `linkifyAPIDs` is duplicated in 2 files | Same DRY issue | Same fix |
| Registry Cheerio parser assumes fixed table order | If DOCX structure changes, parser breaks | Update `registryParser.ts` when DOCX template changes |
| `marked` has no custom renderer | Tables may not render optimally | Configure `marked` with a custom table renderer |
| Tier 1 metadata extraction is regex-based | Sensitive to Word formatting changes | Migration scripts need maintenance when templates change |
