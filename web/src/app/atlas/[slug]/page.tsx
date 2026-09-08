import { getFrictionByApid, getFrictions, getCategories, getFrictionsByCategory, getPatterns } from "@/lib/api";
import { marked } from "marked";
import Link from "next/link";
import { ArrowLeft, GitMerge, FileText } from "lucide-react";
import CategoryClient from "@/components/CategoryClient";

export async function generateStaticParams() {
  const frictions = getFrictions();
  const categories = getCategories();

  const apidParams = frictions
    .filter((f: any) => typeof f.identity?.apid === 'string')
    .map((f: any) => ({
      slug: f.identity.apid.toLowerCase(),
    }));

  const categoryParams = categories.map((c: any) => ({
    slug: c.code.toLowerCase(),
  }));

  return [...apidParams, ...categoryParams];
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const frictions = getFrictions();
  const categories = getCategories();
  
  const isCategory = categories.some((c: any) => c.code.toLowerCase() === slug.toLowerCase());
  const friction = isCategory ? null : frictions.find((f: any) => f.identity.apid.toLowerCase() === slug.toLowerCase());
  const categoryData = isCategory ? categories.find((c: any) => c.code.toLowerCase() === slug.toLowerCase()) : null;

  if (categoryData) {
    const categoryFrictions = getFrictionsByCategory(categoryData.code);
    return <CategoryClient category={categoryData} initialFrictions={categoryFrictions} />;
  }

  if (!friction) return <div className="max-w-7xl mx-auto px-4 py-8">Not found</div>;

  const allPatterns = getPatterns();
  const relatedPatterns = friction 
    ? allPatterns.filter((p: any) => p.relationships?.related_apids?.includes(friction.identity.apid))
    : [];

  const categoryCode = friction.metadata?.category_code || (friction.identity?.apid ? friction.identity.apid.split('-')[0] : '');
  
  // Clean version data
  const cleanVal = (val: string) => val ? val.replace(/\*/g, '').trim() : '';
  let versionRaw = cleanVal(friction.metadata?.version);
  if (versionRaw.toLowerCase() === 'date' || !versionRaw) versionRaw = '1.0';
  
  const isTemplate = versionRaw.toLowerCase().includes('template');
  const templateName = isTemplate ? versionRaw : null;
  const versionNum = isTemplate ? '1.0' : versionRaw;

  let createdDate = cleanVal(friction.metadata?.created_date);
  if (createdDate.toLowerCase() === 'date' || !createdDate) createdDate = 'N/A';
  let updatedDate = cleanVal(friction.metadata?.updated_date);
  if (updatedDate.toLowerCase() === 'date' || !updatedDate) updatedDate = 'N/A';

  // Fix Markdown tables missing header separators from Turndown
  const fixMarkdownTables = (content: string) => {
    const lines = content.split('\n');
    const fixed = [];
    let inTable = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('|')) {
            fixed.push(line);
            if (!inTable) {
                const cols = line.split('|').length - 2;
                if (cols > 0) {
                    fixed.push('|' + '---|'.repeat(cols));
                }
                inTable = true;
            }
        } else {
            inTable = false;
            fixed.push(line);
        }
    }
    return fixed.join('\n');
  };

  const linkifyAPIDs = (content: string) => {
    return content.replace(/(?<!\[)\b([A-Z]{2,3}-\d{3})\b(?!\])/g, (match, apid) => {
      if (apid.startsWith('PAT-')) {
        return `[${apid}](/patterns/${apid.toLowerCase()})`;
      }
      return `[${apid}](/atlas/${apid.toLowerCase()})`;
    });
  };

  const fixedContent = linkifyAPIDs(fixMarkdownTables(friction.content));

  const contentHtml = await marked.parse(fixedContent);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <nav className="flex items-center text-sm text-muted mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/atlas" className="hover:text-foreground transition-colors">ATLAS</Link>
        <span className="mx-2">/</span>
        <Link href={`/atlas/${categoryCode.toLowerCase()}`} className="hover:text-foreground transition-colors">
          {friction.metadata?.category || categoryCode}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{friction.metadata?.subcategory || 'Friction'}</span>
      </nav>

      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-sm px-2 py-1 rounded">
              {friction.identity.apid}
            </span>
          </div>
          <div className="text-sm border border-border px-3 py-1 rounded text-muted">
            Level {friction.evidence?.observation_level ?? 4}
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-6">{friction.metadata.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {friction.metadata.tags?.map((tag: string) => (
            <span key={tag} className="text-xs bg-background border border-border px-2 py-1 rounded text-muted-dark">
              {tag}
            </span>
          ))}
        </div>

        <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-table:w-full prose-th:text-left prose-th:border-b prose-th:border-border prose-th:pb-2 prose-td:border-b prose-td:border-border/50 prose-td:py-3">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6 bg-card/50">
            <h3 className="text-sm font-medium mb-4 text-muted uppercase tracking-wider flex items-center">
              <GitMerge size={16} className="mr-2" />
              Related Patterns
            </h3>
            {relatedPatterns.length > 0 ? (
              <ul className="space-y-2">
                {relatedPatterns.map((p: any) => (
                  <li key={p.identity.apid}>
                    <Link href={`/patterns/${p.identity.apid.toLowerCase()}`} className="text-primary hover:underline font-mono text-sm flex items-center">
                      <FileText size={14} className="mr-2 opacity-50" />
                      {p.identity.apid} <span className="ml-2 text-muted truncate max-w-[200px]">{p.metadata?.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-dark">No patterns documented.</p>
            )}
          </div>

          <div className="border border-border rounded-lg p-6 bg-card/50">
            <h3 className="text-sm font-medium mb-4 text-muted uppercase tracking-wider flex items-center">
              <GitMerge size={16} className="mr-2" />
              Related Frictions
            </h3>
            {friction.relationships?.related_apids?.length > 0 ? (
              <ul className="space-y-2">
                {friction.relationships.related_apids.map((id: string) => (
                  <li key={id}>
                    <Link href={`/atlas/${id.toLowerCase()}`} className="text-primary hover:underline font-mono text-sm flex items-center">
                      <FileText size={14} className="mr-2 opacity-50" />
                      {id}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-dark">No direct relations documented.</p>
            )}
          </div>
        </div>
        
        <div className="border border-border rounded-lg p-6 bg-card/50 h-fit">
          <h3 className="text-sm font-medium mb-4 text-muted uppercase tracking-wider">Metadata</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <dt className="text-muted">Status</dt>
              <dd className="capitalize font-medium">{friction.metadata?.status || 'Unknown'}</dd>
            </div>
            {templateName ? (
              <div className="flex flex-col border-b border-border/50 pb-2">
                <dt className="text-muted mb-1">Template</dt>
                <dd className="text-xs text-muted-dark font-mono bg-background px-2 py-1 rounded w-max">{templateName}</dd>
              </div>
            ) : (
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <dt className="text-muted">Version</dt>
                <dd className="font-mono text-xs bg-background px-2 py-1 rounded">v{versionNum}</dd>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <dt className="text-muted">Revision</dt>
              <dd>{friction.metadata?.revision || 1}</dd>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <dt className="text-muted">Created</dt>
              <dd>{createdDate}</dd>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <dt className="text-muted">Last Updated</dt>
              <dd>{updatedDate}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted">Confidence</dt>
              <dd>{friction.evidence?.confidence ?? 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
