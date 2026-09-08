import { getDocs } from "@/lib/api";
import { marked } from "marked";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DocsClient from "@/components/DocsClient";

export async function generateStaticParams() {
  const docs = getDocs();
  // Include the root docs index (empty slug) AND every individual doc slug
  return [
    { slug: [] },  // /docs (the landing/index page)
    ...docs.map((d: any) => ({ slug: [d.slug] })),
  ];
}

export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  
  // No slug → show the documentation landing page
  if (!slug || slug.length === 0) {
    const docs = getDocs();
    return <DocsClient docs={docs} />;
  }

  const currentSlug = slug[0];
  const docs = getDocs();
  const currentDoc = docs.find((d: any) => d.slug === currentSlug);

  if (!currentDoc) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-muted">Document not found.</p>
        <Link href="/docs" className="text-primary hover:underline text-sm mt-4 block">← Back to Documentation</Link>
      </div>
    );
  }

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

  const contentHtml = await marked.parse(fixMarkdownTables(currentDoc.content));

  // Group docs by category for the sidebar
  const categories = Array.from(new Set(docs.map((d: any) => d.category)));
  const grouped = categories.map((cat: any) => ({
    category: cat,
    docs: docs.filter((d: any) => d.category === cat),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-8">
          <Link href="/docs" className="flex items-center text-sm text-muted hover:text-primary transition-colors mb-6">
            <ArrowLeft size={14} className="mr-1" />
            All Documentation
          </Link>
          <div className="space-y-6">
            {grouped.map(({ category, docs: catDocs }: any) => (
              <div key={category}>
                <h3 className="font-semibold mb-2 text-xs tracking-wider uppercase text-muted">{category}</h3>
                <nav className="space-y-1">
                  {catDocs.map((d: any) => {
                    const isActive = d.slug === currentSlug;
                    return (
                      <Link
                        key={d.slug}
                        href={`/docs/${d.slug}`}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-card border border-border text-primary font-medium' : 'text-muted hover:text-foreground hover:bg-card/50'}`}
                      >
                        {d.title}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Content */}
      <article className="flex-1 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted mb-6 gap-2">
          <Link href="/docs" className="hover:text-foreground transition-colors">DOCS</Link>
          <span>/</span>
          <span className="text-muted text-xs bg-background border border-border px-2 py-0.5 rounded">{currentDoc.category}</span>
          <span>/</span>
          <span className="text-foreground">{currentDoc.title}</span>
        </nav>

        <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-table:w-full prose-th:text-left prose-th:border-b prose-th:border-border prose-th:pb-2 prose-td:border-b prose-td:border-border/50 prose-td:py-3">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </article>
    </div>
  );
}
