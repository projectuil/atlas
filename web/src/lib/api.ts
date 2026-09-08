import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');
const OFFICIAL_DOMAINS = ["AU", "DW", "FF", "KI", "LE", "MB", "OS", "WI"];

export function getDocs() {
  const docsDir = path.join(contentDir, 'docs');
  if (!fs.existsSync(docsDir)) return [];
  const files = fs.readdirSync(docsDir).filter((f: string) => f.endsWith('.md'));
  return files.map((file: string) => {
    const raw = fs.readFileSync(path.join(docsDir, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      slug: data.slug || file.replace(/\.md$/, ''),
      title: data.title || file,
      category: data.category || 'General',
      status: data.status || 'Official',
      content
    };
  }).sort((a: any, b: any) => a.title.localeCompare(b.title));
}

export function getFrictions() {
  const atlasDir = path.join(contentDir, 'atlas');
  if (!fs.existsSync(atlasDir)) return [];
  
  const frictions: any[] = [];
  const categories = fs.readdirSync(atlasDir);
  
  for (const cat of categories) {
    const catPath = path.join(atlasDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    
    const files = fs.readdirSync(catPath);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const raw = fs.readFileSync(path.join(catPath, file), 'utf8');
        const { data, content } = matter(raw);
        frictions.push({
          ...data,
          identity: {
            ...data.identity,
            apid: data.identity?.apid || data.identity?.id
          },
          content
        });
      }
    }
  }
  return frictions;
}

export function getFrictionByApid(apid: string) {
  const frictions = getFrictions();
  return frictions.find(f => f.identity?.apid?.toLowerCase() === apid.toLowerCase()) || null;
}

export function getCategories() {
  const frictions = getFrictions();
  const catMap = new Map();

  frictions.forEach(f => {
    const code = f.metadata?.category_code || (f.identity?.apid ? f.identity.apid.split('-')[0] : null);
    if (!code) return;
    const upperCode = code.toUpperCase();

    // STRICT DOMAIN ENFORCEMENT
    if (!OFFICIAL_DOMAINS.includes(upperCode)) return;

    if (!catMap.has(upperCode)) {
      catMap.set(upperCode, {
        code: upperCode,
        name: f.metadata?.category || upperCode,
        count: 0,
        subcategories: new Set()
      });
    }

    const cat = catMap.get(upperCode);
    cat.count += 1;
    if (f.metadata?.subcategory) {
      cat.subcategories.add(f.metadata.subcategory);
    }
  });

  return Array.from(catMap.values()).map(c => ({
    ...c,
    subcategories: Array.from(c.subcategories).sort()
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getFrictionsByCategory(code: string) {
  const frictions = getFrictions();
  return frictions.filter(f => {
    const fCode = f.metadata?.category_code || (f.identity?.apid ? f.identity.apid.split('-')[0] : null);
    return fCode?.toUpperCase() === code.toUpperCase();
  });
}

export function getPatterns() {
  const dir = path.join(contentDir, 'patterns');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);
    
    // Clean up volume string (fix encoding artifacts from em-dash)
    let volume = data.metadata?.volume || 'Uncategorized';
    volume = volume.replace(/[^\x00-\x7F]/g, '-').replace(/-+/g, '-');
    if (data.metadata) {
      data.metadata.volume = volume;
    }
    
    // Clean up tags (remove **Tags:** prefix)
    let tags = data.metadata?.tags || [];
    tags = tags.map((t: string) => t.replace(/\*\*(?:Tags|Keywords):?\*\*\s*/i, '').trim()).filter((t: string) => t);
    
    // Extract Confidence, Status, and Category from content if not explicitly set
    const statusMatch = content.match(/Status:\s*([A-Za-z]+)/i);
    const status = statusMatch ? statusMatch[1].toLowerCase() : (data.metadata?.status || 'candidate');

    const confMatch = content.match(/Level\s*(\d)/i);
    const confidence = confMatch ? parseInt(confMatch[1], 10) : 4;

    const catMatch = content.match(/Category:\s*([^\n]+)/i);
    const category = catMatch ? catMatch[1].trim() : (data.metadata?.category || 'Unknown');

    if (!data.metadata) data.metadata = {};
    data.metadata.tags = tags;
    data.metadata.volume = volume;
    data.metadata.status = status;
    data.metadata.category = category;
    
    if (!data.evidence) data.evidence = {};
    data.evidence.confidence = confidence;

    return {
      ...data,
      identity: {
        ...data.identity,
        apid: data.identity?.apid || data.identity?.id || file.replace('.md', '')
      },
      content
    } as any;
  }).sort((a, b) => a.identity.apid.localeCompare(b.identity.apid));
}

export function getPatternsByVolume() {
  const patterns = getPatterns();
  const volumes = new Map<string, any[]>();
  
  patterns.forEach(p => {
    const vol = p.metadata?.volume || 'Uncategorized';
    if (!volumes.has(vol)) volumes.set(vol, []);
    volumes.get(vol)?.push(p);
  });
  
  // Sort volumes alphabetically, typically "Volume 01..."
  const sortedVolumes = Array.from(volumes.keys()).sort();
  return sortedVolumes.map(vol => ({
    name: vol,
    patterns: volumes.get(vol) || []
  }));
}

export function getRegistries() {
  const dir = path.join(contentDir, 'registries');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      ...data,
      slug: file.replace(/\.md$/, ''),
      title: data.title || file.replace(/\.md$/, ''),
      content
    } as any;
  });
}
