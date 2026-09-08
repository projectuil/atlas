const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'web', 'content', 'registries');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const sources = [
  {
    file: 'C:\\Jothish\\atlas\\atlas\\Registries\\APID-Registry.docx',
    slug: 'apid-registry',
    title: 'APID Registry',
  },
  {
    file: 'C:\\Jothish\\atlas\\atlas\\Registries\\Category-Registry.docx',
    slug: 'category-registry',
    title: 'Category Registry',
  },
  {
    file: 'C:\\Jothish\\atlas\\atlas\\Registries\\Pattern-Registry.docx',
    slug: 'pattern-registry',
    title: 'Pattern Registry',
  }
];

async function run() {
  for (const src of sources) {
    const result = await mammoth.convertToHtml({ path: src.file });
    let content = result.value
      .replace(/[^\x00-\x7F]/g, c => {
        if (c === '\u2013' || c === '\u2014') return '-';
        if (c === '\u2018' || c === '\u2019') return "'";
        if (c === '\u201C' || c === '\u201D') return '"';
        return '';
      });

    const fm = `---
title: "${src.title}"
slug: "${src.slug}"
source: "atlas/atlas/Registries"
---

${content}
`;
    fs.writeFileSync(path.join(outputDir, `${src.slug}.md`), fm, 'utf8');
    console.log(`✅ Migrated: ${src.slug}`);
  }
  console.log('\nMigration complete.');
}

run().catch(console.error);
