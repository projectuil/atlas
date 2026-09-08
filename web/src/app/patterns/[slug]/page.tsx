import { getPatterns, getFrictions } from "@/lib/api";
import { marked } from "marked";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const patterns = getPatterns();
  return patterns.map((p: any) => ({
    slug: p.identity.apid.toLowerCase(),
  }));
}

export default async function PatternPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const patterns = getPatterns();
  const pattern = patterns.find((p: any) => p.identity?.apid?.toLowerCase() === slug.toLowerCase());

  if (!pattern) return <div className="max-w-7xl mx-auto px-4 py-8">Pattern not found</div>;

  const frictions = getFrictions();
  const relatedFrictions = (pattern.relationships?.related_apids || [])
    .map((apid: string) => frictions.find(f => f.identity.apid === apid))
    .filter(Boolean);

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
                if (cols > 0) fixed.push('|' + '---|'.repeat(cols));
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

  const fixedContent = linkifyAPIDs(fixMarkdownTables(pattern.content || ""));
  const contentHtml = await marked.parse(fixedContent);

  const volumeSlug = pattern.metadata?.volume
    ? pattern.metadata.volume.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted mb-4 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/patterns" className="hover:text-foreground transition-colors">PATTERNS</Link>
        {volumeSlug && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/patterns/volume/${volumeSlug}`} className="hover:text-foreground transition-colors truncate max-w-[160px]">
              {pattern.metadata.volume}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{pattern.identity.apid}</span>
      </nav>

      {/* Back link */}
      {volumeSlug && (
        <Link href={`/patterns/volume/${volumeSlug}`} className="inline-flex items-center text-sm text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} className="mr-1" />
          Back to {pattern.metadata.volume}
        </Link>
      )}

      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-sm px-2 py-1 rounded">
              {pattern.identity.apid}
            </span>
          </div>
          <div className="text-sm border border-border px-3 py-1 rounded text-muted">
            {pattern.metadata?.volume}
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-6">{pattern.metadata?.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {pattern.metadata?.tags?.map((tag: string) => (
            <span key={tag} className="text-xs bg-background border border-border px-2 py-1 rounded text-muted-dark">
              {tag}
            </span>
          ))}
        </div>

        <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-table:w-full prose-th:text-left prose-th:border-b prose-th:border-border prose-th:pb-2 prose-td:border-b prose-td:border-border/50 prose-td:py-3">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
}
