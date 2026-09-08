"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Search, Filter } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function PatternClient({ initialPatterns, volumes }: { initialPatterns: any[], volumes: any[] }) {
  useScrollRestoration("patterns");
  const [viewMode, setViewMode] = useState<'volume' | 'apid'>('volume');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortOption, setSortOption] = useState("apid-asc");
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories and domains from patterns
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    initialPatterns.forEach(p => {
      if (p.metadata?.category) cats.add(p.metadata.category);
    });
    return Array.from(cats).sort();
  }, [initialPatterns]);

  const uniqueDomains = useMemo(() => {
    const doms = new Set<string>();
    initialPatterns.forEach(p => {
      (p.relationships?.related_apids || []).forEach((apid: string) => {
        const prefix = apid.split('-')[0];
        if (prefix && prefix !== 'PAT') doms.add(prefix);
      });
    });
    return Array.from(doms).sort();
  }, [initialPatterns]);

  const filteredPatterns = useMemo(() => {
    let result = [...initialPatterns];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const idMatch = p.identity.apid.toLowerCase().includes(q);
        const titleMatch = p.metadata?.title?.toLowerCase().includes(q);
        const tagMatch = p.metadata?.tags?.some((t: string) => t.toLowerCase().includes(q));
        const volMatch = p.metadata?.volume?.toLowerCase().includes(q);
        const contentMatch = p.content?.toLowerCase().includes(q);
        return idMatch || titleMatch || tagMatch || volMatch || contentMatch;
      });
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter(p => p.metadata?.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Confidence
    if (confidenceFilter !== "all") {
      result = result.filter(p => p.evidence?.confidence === parseInt(confidenceFilter));
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter(p => p.metadata?.category === categoryFilter);
    }

    // Domain
    if (domainFilter !== "all") {
      result = result.filter(p => {
        return p.relationships?.related_apids?.some((apid: string) => apid.startsWith(domainFilter));
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "apid-asc":
          return a.identity.apid.localeCompare(b.identity.apid);
        case "apid-desc":
          return b.identity.apid.localeCompare(a.identity.apid);
        case "alpha":
          return (a.metadata?.title || "").localeCompare(b.metadata?.title || "");
        case "recent":
          return new Date(b.metadata?.updated_date || 0).getTime() - new Date(a.metadata?.updated_date || 0).getTime();
        case "confidence":
          return (b.evidence?.confidence || 0) - (a.evidence?.confidence || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [initialPatterns, searchQuery, statusFilter, confidenceFilter, categoryFilter, domainFilter, sortOption]);

  const filteredVolumes = useMemo(() => {
    const vols = new Map<string, any[]>();
    filteredPatterns.forEach(p => {
      const vol = p.metadata?.volume || 'Uncategorized';
      if (!vols.has(vol)) vols.set(vol, []);
      vols.get(vol)?.push(p);
    });
    return Array.from(vols.keys()).sort().map(vol => ({
      name: vol,
      patterns: vols.get(vol) || []
    }));
  }, [filteredPatterns]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl font-semibold mb-4">Patterns</h1>
        <p className="text-muted mb-4">Research insights mapping interconnected systemic problems.</p>

        {/* Live Stats */}
        <div className="flex flex-wrap gap-6 mb-8 py-4 border-y border-border/50">
          <div><span className="font-mono text-primary font-semibold">{initialPatterns.length}</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Total Patterns</span></div>
          <div><span className="font-mono font-semibold">{initialPatterns.filter(p => p.metadata?.status?.toLowerCase() === 'accepted').length}</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Accepted</span></div>
          <div><span className="font-mono font-semibold">{initialPatterns.filter(p => p.metadata?.status?.toLowerCase() === 'candidate').length}</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Candidate</span></div>
          <div><span className="font-mono font-semibold">{((initialPatterns.length / 200) * 100).toFixed(1)}%</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Pattern Progress</span></div>
        </div>

        {/* Search & View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Search Patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm bg-background border border-border rounded-lg p-1">
              <span className="px-3 text-muted">View By</span>
              <button
                onClick={() => setViewMode('volume')}
                className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'volume' ? 'bg-primary/10 text-primary' : 'hover:bg-background/50'}`}
              >
                Volume
              </button>
              <button
                onClick={() => setViewMode('apid')}
                className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'apid' ? 'bg-primary/10 text-primary' : 'hover:bg-background/50'}`}
              >
                PAT ID
              </button>
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
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-6 p-6 bg-card border border-border rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Research Status</label>
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
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Confidence Level</label>
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
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Category</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Supporting Domain</label>
              <select 
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Domains</option>
                {uniqueDomains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
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
                <option value="confidence">Confidence Level</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'volume' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolumes.length > 0 ? filteredVolumes.map((vol: any) => {
            const slug = vol.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <Link key={vol.name} href={`/patterns/volume/${slug}`} className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-all group hover:-translate-y-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <BookOpen size={24} />
                  </div>
                </div>
                <h2 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {vol.name}
                </h2>
                <p className="text-muted text-sm">
                  {vol.patterns.length} Pattern{vol.patterns.length !== 1 && 's'}
                </p>
              </Link>
            );
          }) : (
            <div className="col-span-full py-12 text-center text-muted">
              No volumes found matching the current filters.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPatterns.length > 0 ? filteredPatterns.map((p: any) => (
            <Link key={p.identity.apid} href={`/patterns/${p.identity.apid.toLowerCase()}`} className="block bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-primary font-mono text-sm font-semibold group-hover:underline">{p.identity.apid}</span>
                </div>
                <div className="flex space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-border text-muted">L{p.evidence?.confidence || 4}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${p.metadata?.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-background border border-border text-muted'}`}>
                    {p.metadata?.status || 'Candidate'}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-medium group-hover:text-primary transition-colors mb-2">{p.metadata?.title}</h3>
              <div className="text-xs text-muted mb-3">{p.metadata?.volume}</div>
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
              No patterns found matching the current search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
