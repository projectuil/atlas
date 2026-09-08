const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const dir = 'C:\\Jothish\\atlas\\docs\\06-Community-Guidelines';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
if (!files.length) { console.log('No docx found'); process.exit(0); }

mammoth.convertToMarkdown({ path: path.join(dir, files[0]) }).then(r => {
  const content = r.value.replace(/[^\x00-\x7F]/g, c => {
    if (c === '\u2013' || c === '\u2014') return '-';
    if (c === '\u2018' || c === '\u2019') return "'";
    if (c === '\u201C' || c === '\u201D') return '"';
    return '';
  });
  const out = `---
title: "Community Guidelines"
category: "Governance"
status: "Official"
slug: "community-guidelines"
---

${content}`;
  fs.writeFileSync('C:\\Jothish\\atlas\\web\\content\\docs\\community-guidelines.md', out, 'utf8');
  console.log('done');
}).catch(e => console.error(e.message));
