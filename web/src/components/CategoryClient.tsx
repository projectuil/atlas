"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, FileText, FolderIcon, List } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function CategoryClient({ category, initialFrictions }: { category: any, initialFrictions: any[] }) {
  useScrollRestoration(`category-${category?.code || 'unknown'}`);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("apid-asc");
  const [viewMode, setViewMode] = useState<"apid" | "subcategory">("apid");

  // Filter Logic
  const filtered = useMemo(() => {
    let result = initialFrictions.filter(f => {
      if (query) {
        const q = query.toLowerCase();
        if (!f.identity?.apid?.toLowerCase().includes(q) &&
            !f.metadata?.title?.toLowerCase().includes(q) &&
            !f.metadata?.tags?.some((t: string) => t.toLowerCase().includes(q))) {
          return false;
        }
      }
      if (levelFilter !== "all" && f.evidence?.observation_level?.toString() !== levelFilter) {
        return false;
      }
      if (statusFilter !== "all" && f.metadata?.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (confidenceFilter !== "all") {
        const conf = parseFloat(f.evidence?.confidence);
        if (isNaN(conf)) return false;
        if (confidenceFilter === "0.0-0.25" && (conf < 0.0 || conf > 0.25)) return false;
        if (confidenceFilter === "0.25-0.50" && (conf <= 0.25 || conf > 0.50)) return false;
        if (confidenceFilter === "0.50-0.75" && (conf <= 0.50 || conf > 0.75)) return false;
        if (confidenceFilter === "0.75-1.00" && (conf <= 0.75 || conf > 1.00)) return false;
      }
      return true;
    });

    // Sort Logic
    return result.sort((a, b) => {
      const apidA = a.identity?.apid || "";
      const apidB = b.identity?.apid || "";
      
      if (sortOrder === "apid-asc") return apidA.localeCompare(apidB);
      if (sortOrder === "apid-desc") return apidB.localeCompare(apidA);
      
      if (sortOrder === "alpha") {
        return (a.metadata?.title || "").localeCompare(b.metadata?.title || "");
      }
      if (sortOrder === "date") {
        return new Date(b.metadata?.updated_date || 0).getTime() - new Date(a.metadata?.updated_date || 0).getTime();
      }
      if (sortOrder === "level") {
        return (b.evidence?.observation_level || 0) - (a.evidence?.observation_level || 0);
      }
      if (sortOrder === "confidence") {
        return parseFloat(b.evidence?.confidence || 0) - parseFloat(a.evidence?.confidence || 0);
      }
      return 0;
    });
  }, [initialFrictions, query, levelFilter, statusFilter, confidenceFilter, sortOrder]);

  // Group by subcategory
  const bySubcategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((f: any) => {
      const sub = f.metadata?.subcategory || "Uncategorized";
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(f);
    });
    return groups;
  }, [filtered]);

  const renderFrictionCard = (f: any) => (
    <Link key={f.identity.apid} href={`/atlas/${f.identity.apid.toLowerCase()}`} className="block bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors flex flex-col md:flex-row md:items-center justify-between group">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-primary font-mono text-sm font-semibold">{f.identity.apid}</span>
          <span className="text-xs text-muted">
            {f.metadata?.subcategory || "Uncategorized"}
          </span>
        </div>
        <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{f.metadata?.title}</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {f.metadata?.tags?.slice(0, 4).map((tag: string) => (
            <span key={tag} className="text-[10px] uppercase tracking-wider bg-background border border-border px-2 py-1 rounded text-muted-dark">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end space-x-4 md:space-x-0 md:space-y-2">
        <span className="text-xs font-mono text-muted border border-border rounded px-2 py-1 bg-background/50">
          Level {f.evidence?.observation_level ?? 4}
        </span>
        <span className="text-xs font-mono text-muted border border-border rounded px-2 py-1 bg-background/50">
          Conf: {f.evidence?.confidence ?? 'N/A'}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <div className="mb-6">
        <Link href="/atlas" className="inline-flex items-center text-sm text-muted hover:text-foreground">
          <ArrowLeft size={16} className="mr-2" />
          Back to Core Domains
        </Link>
      </div>

      <div className="border-b border-border pb-8 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <span className="bg-primary/10 text-primary border border-primary/20 font-mono px-3 py-1 rounded text-lg">
            {category.code}
          </span>
          <h1 className="text-3xl font-semibold">{category.name}</h1>
        </div>
        <div className="flex items-center space-x-6 text-sm text-muted">
          <span>{category.count} Total Observations</span>
          <span>{category.subcategories.length} Subcategories</span>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-card border border-border rounded-lg p-5 mb-12 space-y-4">
        <div className="flex items-center justify-between text-sm font-medium mb-2 border-b border-border/50 pb-3">
          <div className="flex items-center"><Filter size={16} className="mr-2" /> Filter & Sort</div>
          
          <div className="flex items-center bg-background border border-border rounded-md p-1">
            <button 
              onClick={() => setViewMode("apid")}
              className={`flex items-center px-3 py-1 text-xs rounded transition-colors ${viewMode === "apid" ? "bg-primary/10 text-primary font-medium" : "text-muted hover:text-foreground"}`}
            >
              <List size={14} className="mr-1" /> Default (APID)
            </button>
            <button 
              onClick={() => setViewMode("subcategory")}
              className={`flex items-center px-3 py-1 text-xs rounded transition-colors ${viewMode === "subcategory" ? "bg-primary/10 text-primary font-medium" : "text-muted hover:text-foreground"}`}
            >
              <FolderIcon size={14} className="mr-1" /> By Subcategory
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Search Domain</label>
            <input 
              type="text" 
              placeholder="Search APID, title, tags..." 
              className="bg-background border border-border rounded px-3 py-2 text-sm w-full focus:border-primary outline-none"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Observation Level</label>
            <select 
              className="bg-background border border-border rounded px-3 py-2 text-sm w-full outline-none focus:border-primary"
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="4">Level 4 - Strong</option>
              <option value="3">Level 3 - Moderate</option>
              <option value="2">Level 2 - Weak</option>
              <option value="1">Level 1 - Exploratory</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Status</label>
            <select 
              className="bg-background border border-border rounded px-3 py-2 text-sm w-full outline-none focus:border-primary capitalize"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="accepted">Accepted</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Confidence</label>
            <select 
              className="bg-background border border-border rounded px-3 py-2 text-sm w-full outline-none focus:border-primary"
              value={confidenceFilter}
              onChange={e => setConfidenceFilter(e.target.value)}
            >
              <option value="all">All Confidences</option>
              <option value="0.75-1.00">0.75 – 1.00 (High)</option>
              <option value="0.50-0.75">0.50 – 0.75 (Medium)</option>
              <option value="0.25-0.50">0.25 – 0.50 (Low)</option>
              <option value="0.0-0.25">0.0 – 0.25 (Very Low)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-2 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <label className="text-xs text-muted uppercase tracking-wider">Sort By</label>
            <select 
              className="bg-background border border-border rounded px-3 py-1.5 text-sm w-full md:w-auto outline-none focus:border-primary"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="apid-asc">APID (A-Z)</option>
              <option value="apid-desc">APID (Z-A)</option>
              <option value="alpha">Alphabetical</option>
              <option value="date">Recently Updated</option>
              <option value="level">Observation Level</option>
              <option value="confidence">Confidence Score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === "apid" ? (
          filtered.map(renderFrictionCard)
        ) : (
          <div className="space-y-12">
            {Object.keys(bySubcategory).sort().map(sub => (
              <div key={sub} className="space-y-4">
                <h2 className="text-xl font-medium mb-4 border-b border-border/50 pb-2 flex items-center">
                  <FolderIcon className="mr-2 text-muted" size={20} />
                  {sub} <span className="text-sm text-muted ml-3 font-normal">({bySubcategory[sub].length})</span>
                </h2>
                {bySubcategory[sub].map(renderFrictionCard)}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted border border-dashed border-border rounded-lg">
            <FileText className="mx-auto mb-4 opacity-50" size={32} />
            <p>No frictions found matching your filters.</p>
            <button onClick={() => {
              setQuery("");
              setLevelFilter("all");
              setStatusFilter("all");
              setConfidenceFilter("all");
              setSortOrder("apid-asc");
            }} className="mt-4 text-primary text-sm hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
