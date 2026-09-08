"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Map, Filter, ArrowLeft, Copy, Activity, ShieldAlert, FileText, Database } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function PatternRegistryClient({ data }: { data: any }) {
  useScrollRestoration("registry-pattern");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [volumeFilter, setVolumeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("pat-asc");

  const uniqueVolumes = useMemo(() => {
    const vols = new Set<string>();
    data.entries.forEach((e: any) => {
      const vol = e.volume || 'Uncategorized';
      vols.add(vol.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, ' ').trim());
    });
    return Array.from(vols).sort();
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
        (e.title || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(e => (e.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    if (volumeFilter !== "all") {
      result = result.filter(e => {
        const vol = (e.volume || 'Uncategorized').replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, ' ').trim();
        return vol === volumeFilter;
      });
    }

    result.sort((a, b) => {
      if (sortOption === 'pat-asc') return (a.id || '').localeCompare(b.id || '');
      if (sortOption === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
      if (sortOption === 'volume-asc') return (a.volume || '').localeCompare(b.volume || '');
      return 0;
    });

    return result;
  }, [data.entries, searchQuery, statusFilter, volumeFilter, sortOption]);

  const getStatusColor = (s_text: string) => {
    const s = s_text?.toLowerCase() || '';
    if (s === 'accepted' || s === 'active') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'candidate' || s === 'planned') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'deprecated' || s === 'archived') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const copyId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <nav className="flex items-center text-sm text-muted mb-8 pb-2">
        <Link href="/registries" className="hover:text-foreground transition-colors inline-flex items-center">
          <ArrowLeft size={14} className="mr-1" /> Registries
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Pattern Registry</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-semibold mb-4 flex items-center">
          <Map className="mr-4 text-emerald-500" size={36} />
          Pattern Registry
        </h1>
        {data.intro.length > 0 && (
          <div className="prose prose-invert prose-emerald max-w-3xl text-muted text-lg leading-relaxed">
            {data.intro.map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.docInfo).map(([key, val]: any) => (
             <div key={key} className="bg-card border border-border p-5 rounded-xl">
               <div className="text-xs text-muted uppercase tracking-wider mb-2">{key}</div>
               <div className="font-semibold">{val}</div>
             </div>
          ))}
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl flex items-center justify-between">
           <div>
             <div className="text-xs text-emerald-500/70 uppercase tracking-wider mb-2">Total Patterns</div>
             <div className="font-mono text-3xl text-emerald-500">{data.entries.length}</div>
           </div>
           <Map size={48} className="text-emerald-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Database className="mr-2 text-emerald-500" size={20} /> Registry Fields
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

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <ShieldAlert className="mr-2 text-purple-500" size={20} /> Registry Rules & Governance
        </h2>
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6 md:p-8">
          <ul className="space-y-4">
            {data.rules.map((rule: string, i: number) => (
              <li key={i} className="flex items-start text-purple-500/90 text-sm md:text-base">
                <span className="font-mono bg-purple-500/10 text-purple-500 rounded px-2 py-0.5 mr-4 text-xs mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <FileText className="mr-2 text-emerald-500" size={20} /> Pattern Registry Entries
        </h2>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-card border border-border p-4 rounded-xl">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Search PAT ID or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-background border border-border rounded-lg px-3 py-2">
              <Filter size={16} className="text-muted" />
              <select
                value={volumeFilter}
                onChange={(e) => setVolumeFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none max-w-[200px] truncate"
              >
                <option value="all">All Volumes</option>
                {uniqueVolumes.map(v => <option key={v} value={v}>{v}</option>)}
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
              className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="pat-asc">PAT ID</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="volume-asc">Volume</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-background/90 backdrop-blur-sm border-b border-border text-muted sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">PAT ID</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-1/3">Pattern Title</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Volume</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((e, i) => {
                const patId = e.id || '';
                const vol = (e.volume || 'Uncategorized').replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, ' ').trim();
                return (
                  <tr key={i} className="hover:bg-background/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <Link href={`/patterns/${patId.toLowerCase()}`} className="text-emerald-500 hover:underline">{patId}</Link>
                        <button onClick={(ev) => copyId(patId, ev)} className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{e.title}</td>
                    <td className="px-6 py-4 text-muted">{vol}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${getStatusColor(e.status)}`}>
                        {e.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
