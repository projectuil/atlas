const fs = require('fs');
const path = require('path');

const examplePath = 'C:\\Jothish\\atlas\\Example.md';
const content = fs.readFileSync(examplePath, 'utf8');

const blocks = content.split('### AU-').slice(1);

blocks.forEach((block, index) => {
    const idMatch = block.match(/^(\d+)/);
    if (!idMatch) {
        console.log(`Block ${index}: idMatch failed`);
        return;
    }
    
    const apidNum = idMatch[1];
    const apid = `AU-${apidNum}`;
    
    const metadataMatch = block.match(/#### Metadata[\s\S]*?\n####/);
    if (!metadataMatch) {
        console.log(`Block ${index}: metadataMatch failed`);
        return;
    }
    
    const lines = metadataMatch[0].split('\n');
    let title = '', category = '', subcategory = '', status = '', level = '', version = '', created = '', updated = '', tags = [], related = [];
    
    lines.forEach(line => {
        if (line.includes('**Title**')) title = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Category**')) category = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Subcategory**')) subcategory = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Status**')) status = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Observation Level**')) level = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Version**')) version = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Created**')) created = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Last Updated**')) updated = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
        if (line.includes('**Tags**')) tags = line.split('|')[2].replace(/\[cite: \d+\]/g, '').split(',').map(t => `"${t.trim()}"`);
        if (line.includes('**Related APIDs**')) {
           const val = line.split('|')[2].replace(/\[cite: \d+\]/g, '').trim();
           if (val) related = val.split(',').map(t => `"${t.trim()}"`);
        }
    });
    
    let levelNum = 4;
    if (level.includes('1')) levelNum = 1;
    if (level.includes('2')) levelNum = 2;
    if (level.includes('3')) levelNum = 3;
    
    const crypto = require('crypto');
    const uuid = `urn:uuid:${crypto.randomUUID()}`;
    
    const frontmatter = `---
identity:
  apid: "${apid}"
  uuid: "${uuid}"
  slug: "${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}"

metadata:
  title: "${title}"
  category: "${category}"
  category_code: "AU"
  subcategory: "${subcategory}"
  version: "${version}"
  revision: 1
  status: "${status.toLowerCase()}"
  created_date: "${created}"
  updated_date: "${updated}"
  tags:
    - ${tags.join('\n    - ')}

evidence:
  observation_level: ${levelNum}
  confidence: 0.90
  methodology: "observation"
  citations: []

relationships:
  patterns: []
  related_apids:
    - ${related.join('\n    - ')}
  papers: []

change_log:
  - revision: 1
    date: "${created}"
    description: "Initial observation recorded."
---
`;

    const bodyMatch = block.match(/#### Problem\n([\s\S]*)/);
    let body = bodyMatch ? bodyMatch[1] : '';
    body = body.replace(/####/g, '###').replace(/\[cite: \d+\]/g, '');
    // remove trailing dashes
    body = body.replace(/\n---\n*$/, '');
    
    const outPath = `C:\\Jothish\\atlas\\web\\content\\atlas\\AU\\${apid}.md`;
    if (!fs.existsSync(path.dirname(outPath))) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
    }
    
    fs.writeFileSync(outPath, frontmatter + '\n### Problem\n' + body, 'utf8');
    console.log(`Generated ${outPath}`);
});
