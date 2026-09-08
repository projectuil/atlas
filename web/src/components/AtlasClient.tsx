"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpen, Search, Filter } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function AtlasClient({ categories, totalFrictions }: { categories: any[]; totalFrictions: number }) {
  useScrollRestoration("atlas");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [countFilter, setCountFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const totalObs = categories.reduce((s, c) => s + (c.count || 0), 0);

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        (c.code || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q)
      );
    }

    // Count
    if (countFilter !== "all") {
      const threshold = parseInt(countFilter);
      result = result.filter(c => c.count >= threshold);
    }

    // Domain
    if (domainFilter !== "all") {
      result = result.filter(c => c.code === domainFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "alpha":
          return (a.name || "").localeCompare(b.name || "");
        case "count":
          return (b.count || 0) - (a.count || 0);
        case "default":
        default:
          return 0; // Maintain original repository order
      }
    });

    return result;
  }, [categories, searchQuery, countFilter, domainFilter, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl font-semibold mb-4">ATLAS Explorer</h1>
        <p className="text-muted mb-4">Browse {categories.length} core domains of documented human frictions.</p>

        {/* Live Stats */}
        <div className="flex flex-wrap gap-6 mb-8 py-4 border-y border-border/50">
          <div><span className="font-mono text-primary font-semibold">{totalFrictions}</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Human Frictions</span></div>
          <div><span className="font-mono text-primary font-semibold">{categories.length}</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Core Domains</span></div>
          <div><span className="font-mono font-semibold">{((totalFrictions / 1000) * 100).toFixed(1)}%</span> <span className="text-xs text-muted uppercase tracking-wider ml-1">Repository Progress</span></div>
        </div>

        {/* Search & View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Search Domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm bg-background border border-border rounded-lg p-1">
              <span className="px-3 text-muted">View By</span>
              <button
                className="px-3 py-1.5 rounded-md transition-colors bg-primary/10 text-primary"
              >
                Core Domains
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
          <div className="mt-6 p-6 bg-card border border-border rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Observation Count</label>
              <select 
                value={countFilter}
                onChange={(e) => setCountFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Counts</option>
                <option value="10">{'>'} 10 Observations</option>
                <option value="20">{'>'} 20 Observations</option>
                <option value="50">{'>'} 50 Observations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Domain</label>
              <select 
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Domains</option>
                {categories.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
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
                <option value="default">Repository Order (Default)</option>
                <option value="alpha">Alphabetical</option>
                <option value="count">Observation Count</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
          <Link key={cat.code} href={`/atlas/${cat.code.toLowerCase()}`} className="group block bg-card border border-border rounded-lg p-6 hover:border-primary transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary/10 text-primary font-mono text-sm px-2 py-1 rounded border border-primary/20">
                {cat.code}
              </div>
              <div className="text-xs font-mono text-muted bg-background border border-border px-2 py-1 rounded">
                {cat.count} Observations
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-3 group-hover:text-primary transition-colors flex items-center">
              <FolderOpen className="mr-2 opacity-50" size={18} />
              {cat.name}
            </h3>
            
            {cat.subcategories && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted mb-2 uppercase tracking-wider">Subcategories</p>
                <div className="flex flex-wrap gap-2">
                  {cat.subcategories.slice(0, 3).map((sub: string) => (
                    <span key={sub} className="text-[10px] bg-background border border-border px-2 py-1 rounded text-muted-dark truncate max-w-[120px]">
                      {sub}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className="text-[10px] bg-background border border-border px-2 py-1 rounded text-muted-dark">
                      +{cat.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </Link>
        )) : (
          <div className="col-span-full py-12 text-center text-muted">
            No domains found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
