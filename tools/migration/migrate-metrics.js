const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'web', 'content', 'metrics');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const sources = [
  {
    file: 'C:\\Jothish\\atlas\\atlas\\metrics\\Human Friction Metrics.docx',
    slug: 'human-friction-metrics',
    title: 'Human Friction Metrics Report',
    type: 'frictions',
  },
  {
    file: 'C:\\Jothish\\atlas\\atlas\\metrics\\Pattern Metrics.docx',
    slug: 'pattern-metrics',
    title: 'Pattern Metrics Report',
    type: 'patterns',
  },
];

async function run() {
  for (const src of sources) {
    const result = await mammoth.convertToMarkdown({ path: src.file });
    const content = result.value
      .replace(/\\\./g, '.')
      .replace(/\\-/g, '-')
      .replace(/\\,/g, ',')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\_/g, '_')
      .replace(/[^\x00-\x7F]/g, c => {
        if (c === '\u2013' || c === '\u2014') return '-';
        if (c === '\u2018' || c === '\u2019') return "'";
        if (c === '\u201C' || c === '\u201D') return '"';
        return '';
      });

    const fm = `---
title: "${src.title}"
slug: "${src.slug}"
type: "${src.type}"
source: "atlas/atlas/metrics"
---

`;
    fs.writeFileSync(path.join(outputDir, `${src.slug}.md`), fm + content, 'utf8');
    console.log(`✅ Migrated: ${src.slug}`);
  }
  console.log('\nMigration complete.');
}

run().catch(console.error);
