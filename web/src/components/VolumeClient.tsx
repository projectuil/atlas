"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function VolumeClient({ volume, slug }: { volume: any; slug: string }) {
  useScrollRestoration(`volume-${slug}`);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("apid-asc");
  const [showFilters, setShowFilters] = useState(false);

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    volume.patterns.forEach((p: any) => {
      if (p.metadata?.category) cats.add(p.metadata.category);
    });
    return Array.from(cats).sort();
  }, [volume]);

  const filteredPatterns = useMemo(() => {
    let result = [...volume.patterns];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        return (
          p.identity.apid.toLowerCase().includes(q) ||
          p.metadata?.title?.toLowerCase().includes(q) ||
          p.metadata?.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          p.content?.toLowerCase().includes(q)
        );
      });
    }

    if (categoryFilter !== "all") {
      result = result.filter(p => p.metadata?.category === categoryFilter);
    }

    if (confidenceFilter !== "all") {
      result = result.filter(p => p.evidence?.confidence === parseInt(confidenceFilter));
    }

    if (statusFilter !== "all") {
      result = result.filter(p => p.metadata?.status?.toLowerCase() === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "apid-asc": return a.identity.apid.localeCompare(b.identity.apid);
        case "apid-desc": return b.identity.apid.localeCompare(a.identity.apid);
        case "alpha": return (a.metadata?.title || "").localeCompare(b.metadata?.title || "");
        case "recent":
          return new Date(b.metadata?.updated_date || 0).getTime() - new Date(a.metadata?.updated_date || 0).getTime();
        default: return 0;
      }
    });

    return result;
  }, [volume.patterns, searchQuery, categoryFilter, confidenceFilter, statusFilter, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/patterns" className="hover:text-foreground transition-colors">PATTERNS</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{volume.name}</span>
      </nav>

      {/* Back navigation */}
      <Link href="/patterns" className="inline-flex items-center text-sm text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to Patterns
      </Link>

      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl font-semibold mb-2">{volume.name}</h1>
        <p className="text-muted mb-8">{volume.patterns.length} Patterns</p>

        {/* Search & Filter row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${volume.name}...`}
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
          <div className="mt-6 p-6 bg-card border border-border rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Confidence</label>
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Levels</option>
                <option value="4">Level 4</option>
                <option value="3">Level 3</option>
                <option value="2">Level 2</option>
                <option value="1">Level 1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="candidate">Candidate</option>
                <option value="accepted">Accepted</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="apid-asc">PAT ID (Ascending)</option>
                <option value="apid-desc">PAT ID (Descending)</option>
                <option value="alpha">Alphabetical</option>
                <option value="recent">Recently Updated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {(searchQuery || categoryFilter !== "all" || confidenceFilter !== "all" || statusFilter !== "all") && (
        <p className="text-sm text-muted mb-6">
          Showing {filteredPatterns.length} of {volume.patterns.length} patterns
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPatterns.length > 0 ? filteredPatterns.map((p: any) => (
          <Link
            key={p.identity.apid}
            href={`/patterns/${p.identity.apid.toLowerCase()}`}
            className="block bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary font-mono text-sm font-semibold group-hover:underline">{p.identity.apid}</span>
              <div className="flex space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded border border-border text-muted">L{p.evidence?.confidence || 4}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${p.metadata?.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-background border border-border text-muted'}`}>
                  {p.metadata?.status || 'Candidate'}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-medium group-hover:text-primary transition-colors mb-3">{p.metadata?.title}</h3>
            <div className="flex flex-wrap gap-2">
              {p.metadata?.tags?.slice(0, 4).map((tag: string) => (
                <span key={tag} className="text-[10px] uppercase tracking-wider bg-background border border-border px-2 py-1 rounded text-muted-dark">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        )) : (
          <div className="col-span-full py-12 text-center text-muted">
            No patterns match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
