"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Hash, Filter, ArrowLeft, Copy, Info, CheckCircle2, ShieldAlert, FileText, Database, Activity } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function ApidRegistryClient({ data }: { data: any }) {
  useScrollRestoration("registry-apid");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("apid-asc");

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    data.entries.forEach((e: any) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [data.entries]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    data.entries.forEach((e: any) => {
      if (e.status) statuses.add(e.status);
    });
    return Array.from(statuses).sort();
  }, [data.entries]);

  const filteredEntries = useMemo(() => {
    let result = [...data.entries];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        (e.id || '').toLowerCase().includes(q) ||
        (e.title || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(e => (e.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    if (categoryFilter !== "all") {
      result = result.filter(e => (e.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    result.sort((a, b) => {
      if (sortOption === 'apid-asc') return (a.id || '').localeCompare(b.id || '');
      if (sortOption === 'apid-desc') return (b.id || '').localeCompare(a.id || '');
      if (sortOption === 'category-asc') return (a.category || '').localeCompare(b.category || '');
      if (sortOption === 'status-asc') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });

    return result;
  }, [data.entries, searchQuery, statusFilter, categoryFilter, sortOption]);

  const getStatusColor = (s_text: string) => {
    const s = s_text?.toLowerCase() || '';
    if (s === 'accepted' || s === 'active') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'candidate' || s === 'planned') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'deprecated' || s === 'archived') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const copyApid = (apid: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(apid);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <nav className="flex items-center text-sm text-muted mb-8 pb-2">
        <Link href="/registries" className="hover:text-foreground transition-colors inline-flex items-center">
          <ArrowLeft size={14} className="mr-1" /> Registries
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">APID Registry</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-semibold mb-4 flex items-center">
          <Hash className="mr-4 text-blue-500" size={36} />
          APID Registry
        </h1>
        {data.intro.length > 0 && (
          <div className="prose prose-invert prose-blue max-w-3xl text-muted text-lg leading-relaxed">
            {data.intro.map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Document Info Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.docInfo).map(([key, val]: any) => (
             <div key={key} className="bg-card border border-border p-5 rounded-xl">
               <div className="text-xs text-muted uppercase tracking-wider mb-2">{key}</div>
               <div className="font-semibold">{val}</div>
             </div>
          ))}
        </div>
        {/* Quick Stats */}
        <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl flex items-center justify-between">
           <div>
             <div className="text-xs text-blue-500/70 uppercase tracking-wider mb-2">Total Entries</div>
             <div className="font-mono text-3xl text-blue-500">{data.entries.length}</div>
           </div>
           <Activity size={48} className="text-blue-500/20" />
        </div>
      </div>

      {/* Two columns: Fields and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Database className="mr-2 text-blue-500" size={20} /> Registry Fields
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {data.fields.map((f: any, i: number) => (
              <div key={i} className="p-4 flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-medium min-w-[120px] text-foreground">{f.field}</span>
                <span className="text-muted text-sm">{f.description}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Activity className="mr-2 text-emerald-500" size={20} /> Registry Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.statistics).map(([key, val]: any) => (
              <div key={key} className="bg-card border border-border p-5 rounded-xl">
                <div className="text-2xl font-mono text-emerald-500 mb-1">{val}</div>
                <div className="text-sm text-muted">{key}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Registry Rules */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <ShieldAlert className="mr-2 text-amber-500" size={20} /> Registry Rules & Governance
        </h2>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 md:p-8">
          <ul className="space-y-4">
            {data.rules.map((rule: string, i: number) => (
              <li key={i} className="flex items-start text-amber-500/90 text-sm md:text-base">
                <span className="font-mono bg-amber-500/10 text-amber-500 rounded px-2 py-0.5 mr-4 text-xs mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modern Interactive Table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <FileText className="mr-2 text-blue-500" size={20} /> APID Registry Entries
        </h2>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-card border border-border p-4 rounded-xl">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Search APID, Title, Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-background border border-border rounded-lg px-3 py-2">
              <Filter size={16} className="text-muted" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none max-w-[150px] truncate"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-background border border-border rounded-lg px-3 py-2">
              <Filter size={16} className="text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="apid-asc">APID (A-Z)</option>
              <option value="apid-desc">APID (Z-A)</option>
              <option value="category-asc">Category</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-background/90 backdrop-blur-sm border-b border-border text-muted sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">APID</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-1/2">Human Friction Title</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((e, i) => (
                <tr key={i} className="hover:bg-background/50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium">
                    <div className="flex items-center gap-2">
                      <Link href={`/atlas/${(e.id || '').toLowerCase()}`} className="text-blue-500 hover:underline">{e.id}</Link>
                      <button onClick={(ev) => copyApid(e.id, ev)} className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{e.title}</td>
                  <td className="px-6 py-4 text-muted">{e.category || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${getStatusColor(e.status)}`}>
                      {e.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="p-12 text-center text-muted">
              No entries found matching your filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
