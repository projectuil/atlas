const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'web', 'content', 'docs');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Define all document groups to migrate
const docSources = [
  // Official Governance docs (docs/)
  { file: 'C:\\Jothish\\atlas\\docs\\07-Constitution\\THE CONSTITUTION OF PROJECT UIL.docx', slug: 'constitution', title: 'The Constitution of Project UIL', category: 'Governance', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\08-Research-Standards\\PROJECT UIL - RESEARCH AND METHODOLOGY.docx', slug: 'research-methodology', title: 'Research and Methodology', category: 'Governance', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\02-Publishing-Manual\\PROJECT UIL PUBLISHING MANUAL.docx', slug: 'publishing-manual', title: 'Publishing Manual', category: 'Publishing', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\03-Content-Framework\\PROJECT UIL CONTENT FRAMEWORK.docx', slug: 'content-framework', title: 'Content Framework', category: 'Publishing', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\01-Brand-Book\\PROJECT UIL BRAND BOOK.docx', slug: 'brand-book', title: 'Brand Book', category: 'Publishing', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\04-Visual-Design-System\\PROJECT UIL VISUAL DESIGN SYSTEM.docx', slug: 'visual-design-system', title: 'Visual Design System', category: 'Publishing', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\05-Calendar & Growth Strategy\\PROJECT UIL CONTENT CALENDAR.docx', slug: 'content-calendar', title: 'Content Calendar & Growth Strategy', category: 'Publishing', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\docs\\06-Community-Guidelines\\?? PROJECT UIL COMMUNITY.docx', slug: 'community-guidelines', title: 'Community Guidelines', category: 'Governance', status: 'Official' },

  // Standards docs
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\01-Category-Classfication.docx', slug: 'category-classification', title: 'Category Classification Standard', category: 'Standards', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\02-APID-Standrad.docx', slug: 'apid-standard', title: 'APID Standard', category: 'Standards', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\03-Naming-Convention.docx', slug: 'naming-convention', title: 'Naming Convention Standard', category: 'Standards', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\04-Relationship-Model.docx', slug: 'relationship-model', title: 'Relationship Model', category: 'Standards', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\05-Validation-Classification.docx', slug: 'validation-classification', title: 'Validation & Classification Standard', category: 'Standards', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\06-Tagging-Standard.docx', slug: 'tagging-standard', title: 'Tagging Standard', category: 'Standards', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Standards\\07-Versioning-and-Governance.docx', slug: 'versioning-governance', title: 'Versioning and Governance', category: 'Standards', status: 'Official' },

  // Templates
  { file: 'C:\\Jothish\\atlas\\atlas\\Templates\\Human-Friction-Template.docx', slug: 'human-friction-template', title: 'Human Friction Template', category: 'Templates', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Templates\\Pattern-Template.docx', slug: 'pattern-template', title: 'Pattern Template', category: 'Templates', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Templates\\Research-Insight-Template.docx', slug: 'research-insight-template', title: 'Research Insight Template', category: 'Templates', status: 'Official' },
  { file: 'C:\\Jothish\\atlas\\atlas\\Templates\\Research-Paper-Template.docx', slug: 'research-paper-template', title: 'Research Paper Template', category: 'Templates', status: 'Official' },
];

async function migrateDoc(source) {
  const { file, slug, title, category, status } = source;
  
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  File not found: ${file}`);
    return;
  }

  try {
    const result = await mammoth.convertToMarkdown({ path: file });
    const markdown = result.value
      .replace(/[^\x00-\x7F]/g, match => {
        // Keep common Unicode: em-dash, curly quotes, etc as ASCII equivalents
        if (match === '\u2013' || match === '\u2014') return '-';
        if (match === '\u2018' || match === '\u2019') return "'";
        if (match === '\u201C' || match === '\u201D') return '"';
        return '';
      });

    const frontmatter = `---
title: "${title}"
category: "${category}"
status: "${status}"
slug: "${slug}"
---

`;

    fs.writeFileSync(path.join(outputDir, `${slug}.md`), frontmatter + markdown, 'utf8');
    console.log(`✅  Migrated: ${slug}`);
  } catch (err) {
    console.error(`❌  Failed: ${slug} — ${err.message}`);
  }
}

async function run() {
  console.log(`\nMigrating ${docSources.length} documents to ${outputDir}\n`);
  for (const src of docSources) {
    await migrateDoc(src);
  }
  console.log('\n✅ Documentation migration complete.');
}

run();
