import { getRegistries } from "@/lib/api";
import { marked } from "marked";
import Link from "next/link";

export async function generateStaticParams() {
  const registries = getRegistries();
  return registries.map((r: any) => ({
    slug: r.slug.toLowerCase(),
  }));
}

export default async function RegistryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const registries = getRegistries();
  const registry = registries.find((r: any) => r.slug.toLowerCase() === slug.toLowerCase());

  if (!registry) return <div className="max-w-7xl mx-auto px-4 py-8">Registry not found</div>;

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

  const fixedContent = fixMarkdownTables(registry.content || "");
  const contentHtml = await marked.parse(fixedContent);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <nav className="flex items-center text-sm text-muted mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/registries" className="hover:text-foreground transition-colors">REGISTRIES</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{registry.title}</span>
      </nav>

      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-semibold mb-6">{registry.title}</h1>
        
        <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-table:w-full prose-th:text-left prose-th:border-b prose-th:border-border prose-th:pb-2 prose-td:border-b prose-td:border-border/50 prose-td:py-3">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
}
