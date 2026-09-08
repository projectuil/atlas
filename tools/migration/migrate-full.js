const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const mammoth = require('mammoth');
const TurndownService = require('turndown');
const yaml = require('js-yaml');
const crypto = require('crypto');

const turndownService = new TurndownService();
turndownService.addRule('tables', {
  filter: ['table', 'tbody', 'tr', 'td', 'th'],
  replacement: function (content, node) {
    if (node.nodeName === 'TABLE') return '\n\n' + content + '\n\n';
    if (node.nodeName === 'TR') return '\n| ' + content + ' |';
    if (node.nodeName === 'TD' || node.nodeName === 'TH') return content.trim() + ' | ';
    return content;
  }
});

const contentDir = path.join('C:\\Jothish\\atlas\\web', 'content');
fs.ensureDirSync(path.join(contentDir, 'atlas'));
fs.ensureDirSync(path.join(contentDir, 'patterns'));
fs.ensureDirSync(path.join(contentDir, 'registries'));

function extractMetadata(markdownBlock) {
    const metadata = {};
    // Find lines that look like table rows
    const lines = markdownBlock.split('\n');
    lines.forEach(line => {
        if (line.trim().startsWith('|')) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 2) {
                const keyRaw = parts[0].replace(/\*\*/g, '').replace(/:/g, '').trim();
                const valRaw = parts[1].replace(/\[cite:.*?\]/g, '').trim();
                if (keyRaw && keyRaw !== 'Field') {
                    metadata[keyRaw.toLowerCase()] = valRaw;
                }
            }
        }
    });
    return metadata;
}

function extractSection(markdownBlock, sectionName) {
    // Looks for **SectionName** or ### SectionName
    const regex = new RegExp(`(?:\\*\\*|###\\s*)${sectionName}\\*?\\*?[\\s\\S]*?\\n([\\s\\S]*?)(?:\\n(?:\\*\\*|###\\s*)[A-Z]|$)`, 'i');
    const match = markdownBlock.match(regex);
    if (match) {
        return match[1].trim();
    }
    return '';
}

function parseLevel(str) {
    if (!str) return 4;
    const match = str.match(/Level\s*(\d)/i);
    return match ? parseInt(match[1]) : 4;
}

async function processDocx(filePath, type) {
    console.log(`Processing: ${filePath}`);
    const res = await mammoth.convertToHtml({path: filePath});
    const markdown = turndownService.turndown(res.value);

    // Split by APID or PTID marker: e.g. **AU-001 — Title** or ### AU-001 - Title
    if (type === 'pattern') {
        const fileName = path.basename(filePath, '.docx');
        const match = fileName.match(/^(PAT-\d{3})(?:\s*[\-—]\s*)(.*)$/);
        const id = match ? match[1] : fileName.replace(' - Copy', '');
        const title = match ? match[2].trim().replace(' - Copy', '') : fileName;
        
        // Extract metadata manually
        const tagsMatch = markdown.match(/\*\*(?:Standardized Search Keywords|Tags)\*\*\n+(?:Tags:\s*)?([^\n]+)/i);
        const tags = tagsMatch ? tagsMatch[1].split(',').map(t=>t.trim()).filter(t=>t) : [];
        
        // Related frictions
        const relMatch = markdown.match(/\*\*(?:Related Human Frictions|Related APIDs)\*\*\s*\n+([\s\S]*?)(?:\n\*\*|$)/i);
        const related = relMatch ? (relMatch[1].match(/[A-Z]{2,3}-\d{3}/g) || []) : [];

        const frontmatter = {
            identity: {
                id: id,
                apid: id,
                uuid: `urn:uuid:${crypto.randomUUID()}`
            },
            metadata: {
                title: title,
                volume: path.basename(path.dirname(filePath)),
                tags: tags,
                status: 'accepted'
            },
            relationships: {
                related_apids: Array.from(new Set(related))
            }
        };
        
        const yamlStr = yaml.dump(frontmatter);
        const finalMd = `---\n${yamlStr}---\n\n${markdown}`;
        const dir = path.join(contentDir, 'patterns');
        fs.ensureDirSync(dir);
        fs.writeFileSync(path.join(dir, `${id}.md`), finalMd, 'utf8');
        console.log(` -> Created ${id}.md`);
        return;
    }

    const blocks = markdown.split(/(?=(?:^|\n)(?:\*\*|###\s*)?(?:[A-Z]{2,3}-\d{3})(?:[ \-—]+).*?(?:\*\*)?\n)/g);
    
    for (const block of blocks) {
        const idMatch = block.match(/(?:^|\n)(?:\*\*|###\s*)?([A-Z]{2,3}-\d{3})(?:[ \-—]+)(.*?)(?:\*\*)?\n/);
        if (!idMatch) continue;

        const id = idMatch[1];
        const title = idMatch[2].trim();
        const rawMetadata = extractMetadata(block);
        
        const tags = (rawMetadata['tags'] || '').split(',').map(t => t.trim()).filter(t => t);
        
        let related = [];
        if (rawMetadata['related apids']) {
            related = rawMetadata['related apids'].split(',').map(t => t.trim()).filter(t => t);
        }

        const frontmatter = {
            identity: {
                id: id,
                uuid: `urn:uuid:${crypto.randomUUID()}`,
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            },
            metadata: {
                title: title || rawMetadata['title'] || id,
                category: rawMetadata['category'] || '',
                subcategory: rawMetadata['subcategory'] || '',
                volume: type === 'pattern' ? path.basename(path.dirname(filePath)) : '',
                version: rawMetadata['version'] || '1.0',
                revision: 1,
                status: (rawMetadata['status'] || 'accepted').toLowerCase(),
                created_date: rawMetadata['created'] || new Date().toISOString().split('T')[0],
                updated_date: rawMetadata['last updated'] || new Date().toISOString().split('T')[0],
                tags: tags
            },
            evidence: {
                observation_level: parseLevel(rawMetadata['observation level']),
                confidence: 0.90,
                methodology: "observation",
                citations: []
            },
            relationships: {
                patterns: [],
                related_apids: related,
                papers: []
            },
            change_log: [
                {
                    revision: 1,
                    date: rawMetadata['created'] || new Date().toISOString().split('T')[0],
                    description: "Migrated from legacy DOCX."
                }
            ]
        };

        // Extract body
        let body = block;
        // remove the header line
        body = body.replace(idMatch[0], '');
        // remove metadata table
        body = body.replace(/(?:\*\*|###\s*)Metadata\**[\s\S]*?(?=\n(?:\\*\\*|###\s*)[A-Z]|$)/i, '');
        // clean up stray asterisks and citations
        body = body.replace(/\[cite:.*?\]/g, '').trim();

        const yamlStr = yaml.dump(frontmatter);
        const finalMd = `---\n${yamlStr}---\n\n${body}`;

        if (type === 'friction') {
            const prefix = id.split('-')[0];
            const dir = path.join(contentDir, 'atlas', prefix);
            fs.ensureDirSync(dir);
            fs.writeFileSync(path.join(dir, `${id}.md`), finalMd, 'utf8');
            console.log(` -> Created ${id}.md`);
        } else if (type === 'pattern') {
            const dir = path.join(contentDir, 'patterns');
            fs.writeFileSync(path.join(dir, `${id}.md`), finalMd, 'utf8');
            console.log(` -> Created ${id}.md`);
        }
    }
}

async function run() {
    // 1. Clear old content to ensure "Remove all placeholder/demo/sample content"
    fs.emptyDirSync(path.join(contentDir, 'atlas'));
    fs.emptyDirSync(path.join(contentDir, 'patterns'));
    
    const hfFiles = glob.sync('C:/Jothish/atlas/atlas/Human-Frictions/**/*.docx');
    for (const f of hfFiles) {
        // Skip the hard copy summary if it's just a duplicate
        if (f.includes('Hard - Copy')) continue;
        await processDocx(f, 'friction');
    }

    const patFiles = glob.sync('C:/Jothish/atlas/atlas/Patterns/**/*.docx');
    for (const f of patFiles) {
        if (f.includes('Registry')) {
            // treat registries differently
            continue;
        }
        await processDocx(f, 'pattern');
    }

    // Registries
    const regFiles = glob.sync('C:/Jothish/atlas/atlas/Registries/*.docx');
    for (const f of regFiles) {
        console.log(`Converting Registry: ${f}`);
        const res = await mammoth.convertToHtml({path: f});
        const md = turndownService.turndown(res.value);
        const name = path.basename(f, '.docx');
        fs.writeFileSync(path.join(contentDir, 'registries', `${name}.md`), md, 'utf8');
    }
    
    console.log("Migration Complete.");
}

run().catch(console.error);
