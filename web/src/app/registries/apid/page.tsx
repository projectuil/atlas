import fs from 'fs';
import path from 'path';
import { parseRegistryDocument } from '@/lib/registryParser';
import ApidRegistryClient from '@/components/ApidRegistryClient';

export default async function ApidRegistryPage() {
  const registryFile = path.join(process.cwd(), 'content', 'registries', 'apid-registry.md');
  let rawContent = fs.existsSync(registryFile) ? fs.readFileSync(registryFile, 'utf8') : '';

  let htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim();
  const data = parseRegistryDocument(htmlContent);

  return <ApidRegistryClient data={data} />;
}
