import fs from 'fs';
import path from 'path';
import { parseRegistryDocument } from '@/lib/registryParser';
import CategoryRegistryClient from '@/components/CategoryRegistryClient';

export default async function CategoryRegistryPage() {
  const registryFile = path.join(process.cwd(), 'content', 'registries', 'category-registry.md');
  let rawContent = fs.existsSync(registryFile) ? fs.readFileSync(registryFile, 'utf8') : '';

  let htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim();
  const data = parseRegistryDocument(htmlContent);

  return <CategoryRegistryClient data={data} />;
}
