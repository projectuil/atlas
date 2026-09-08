"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, FileText, BookOpen, ChevronRight } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const CATEGORY_ORDER = ["Governance", "Standards", "Publishing", "Templates", "General"];

export default function DocsClient({ docs }: { docs: any[] }) {
  useScrollRestoration("docs");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    docs.forEach(d => cats.add(d.category));
    return CATEGORY_ORDER.filter(c => cats.has(c));
  }, [docs]);

  const filtered = useMemo(() => {
    let result = [...docs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(d => d.category === categoryFilter);
    }
    return result;
  }, [docs, searchQuery, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    filtered.forEach(d => {
      if (!map.has(d.category)) map.set(d.category, []);
      map.get(d.category)!.push(d);
    });
    return CATEGORY_ORDER.filter(c => map.has(c)).map(c => ({ category: c, docs: map.get(c)! }));
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl font-semibold mb-4">Documentation</h1>
        <p className="text-muted mb-8">Governance documents, research standards, and repository guides.</p>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
              showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 p-6 bg-card border border-border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Category groups */}
      {grouped.length > 0 ? (
        <div className="space-y-12">
          {grouped.map(({ category, docs: catDocs }) => (
            <section key={category}>
              <h2 className="flex items-center text-lg font-semibold mb-6 border-b border-border pb-3">
                <BookOpen className="mr-3 text-primary" size={20} />
                {category}
                <span className="ml-3 text-sm font-normal text-muted">{catDocs.length} document{catDocs.length !== 1 && 's'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catDocs.map(doc => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    className="group flex items-start p-5 bg-card border border-border rounded-lg hover:border-primary transition-all hover:-translate-y-0.5"
                  >
                    <FileText className="mr-3 mt-0.5 text-primary flex-shrink-0" size={18} />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium group-hover:text-primary transition-colors mb-1">{doc.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-muted">
                        <span className="bg-background border border-border px-2 py-0.5 rounded">{doc.status}</span>
                      </div>
                    </div>
                    <ChevronRight className="ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" size={14} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted">No documents match the current filters.</div>
      )}
    </div>
  );
}
