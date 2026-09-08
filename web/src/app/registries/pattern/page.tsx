import fs from 'fs';
import path from 'path';
import { parseRegistryDocument } from '@/lib/registryParser';
import PatternRegistryClient from '@/components/PatternRegistryClient';

export default async function PatternRegistryPage() {
  const registryFile = path.join(process.cwd(), 'content', 'registries', 'pattern-registry.md');
  let rawContent = fs.existsSync(registryFile) ? fs.readFileSync(registryFile, 'utf8') : '';

  let htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim();
  const data = parseRegistryDocument(htmlContent);

  return <PatternRegistryClient data={data} />;
}
