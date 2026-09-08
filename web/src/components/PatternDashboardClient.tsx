"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, CheckCircle2, AlertCircle, BarChart2, BookOpen, Target, LayoutGrid, Search } from 'lucide-react';
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function PatternDashboardClient({ tables, rawHtml }: { tables: any[], rawHtml: string }) {
  useScrollRestoration("metrics-patterns-dash");

  // Table Mapping based on pattern-metrics.md
  const progressTable = tables[0];
  const statusTable = tables[1];
  const evidenceTable = tables[2];
  const recordsTable = tables[3];
  const validationTable = tables[4];
  const categoryTable = tables[5];
  const categorySummaryTable = tables[6];
  const milestoneTable = tables[7];
  const roadmapTable = tables[8];
  const assetTable = tables[9];
  const summaryTable = tables[10];

  const progress = Object.fromEntries(progressTable?.rows.map((r: any) => [r[0], r[1]]) || []);
  const status = Object.fromEntries(statusTable?.rows.map((r: any) => [r[0], r[1]]) || []);
  const records = Object.fromEntries(recordsTable?.rows.map((r: any) => [r[0], r[1]]) || []);
  
  const completionValue = parseFloat(progress['Completion'] || '0');
  
  const [evidenceSearch, setEvidenceSearch] = useState('');

  const getStatusColor = (s_text: string) => {
    const s = s_text.toLowerCase();
    if (s.includes('complete') || s.includes('accepted') || s.includes('active') || s.includes('ready')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s.includes('candidate') || s.includes('validation') || s.includes('progress') || s.includes('planned')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s.includes('deprecated') || s.includes('missing')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <nav className="flex items-center text-sm text-muted mb-8 pb-2">
        <Link href="/metrics" className="hover:text-foreground transition-colors inline-flex items-center">
          <ArrowLeft size={14} className="mr-1" /> Metrics
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Pattern Metrics</span>
      </nav>

      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center">
          <Layers className="mr-3 text-emerald-500" size={28} />
          Pattern Metrics Report
        </h1>
        <p className="text-muted">Live repository analytics imported from atlas/atlas/metrics</p>
      </div>

      {/* Repository Progress */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center text-foreground">
          <Target className="mr-2 text-purple-500" size={20} /> Repository Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Target Patterns</div>
            <div className="text-3xl font-mono">{progress['Target Patterns'] || progress['Target']}</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Layers size={48} /></div>
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Documented</div>
            <div className="text-3xl font-mono text-emerald-500">{progress['Documented']}</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Remaining</div>
            <div className="text-3xl font-mono text-amber-500">{progress['Remaining']}</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Completion</div>
            <div className="text-3xl font-mono text-blue-500">{progress['Completion']}</div>
          </div>
        </div>
        <div className="w-full bg-background border border-border rounded-full h-4 overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${completionValue}%` }} />
        </div>
      </section>

      {/* Current Status */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <CheckCircle2 className="mr-2 text-blue-500" size={20} /> Current Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(status).map(([key, val]: any) => (
             <div key={key} className="bg-card border border-border p-6 rounded-xl text-center">
               <div className={`text-3xl font-mono mb-2 ${key.includes('Accepted') ? 'text-emerald-500' : key.includes('Candidate') ? 'text-blue-500' : key.includes('Validation') ? 'text-amber-500' : 'text-rose-500'}`}>{val}</div>
               <div className="text-xs text-muted uppercase tracking-wider">{key}</div>
             </div>
          ))}
        </div>
      </section>

      {/* Pattern Evidence Breakdown (Sortable & Searchable) */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <BarChart2 className="mr-2 text-emerald-500" size={20} /> Pattern Evidence Breakdown
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
            <input
              type="text"
              placeholder="Search Evidence..."
              value={evidenceSearch}
              onChange={(e) => setEvidenceSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl overflow-y-auto max-h-[500px]">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-background/90 backdrop-blur-sm border-b border-border text-muted sticky top-0">
              <tr>
                {evidenceTable?.headers.map((h: string, i: number) => (
                  <th key={i} className={`px-6 py-4 font-medium uppercase tracking-wider text-xs ${i === 2 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {evidenceTable?.rows.filter((r: any) => r[0].toLowerCase().includes(evidenceSearch.toLowerCase()) || r[1].toLowerCase().includes(evidenceSearch.toLowerCase())).map((row: any[], i: number) => (
                <tr key={i} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">
                    <Link href={`/patterns/${row[0].toLowerCase()}`} className="text-emerald-500 hover:underline">{row[0]}</Link>
                  </td>
                  <td className="px-6 py-4 font-medium">{row[1]}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {row[2]} HFs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Category Breakdown & Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <LayoutGrid className="mr-2 text-blue-500" size={20} /> Pattern Distribution
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {categoryTable?.rows.map((row: any[], i: number) => (
              <div key={i} className="p-4 flex justify-between items-center text-sm hover:bg-background/50">
                <div className="flex items-center">
                  <span className="font-mono text-emerald-500 w-10">{row[0]}</span>
                  <span>{row[1]}</span>
                </div>
                <div className="flex gap-4 font-mono">
                  <span className="text-muted w-16 text-right">{row[2]} Vols</span>
                  <span className="text-blue-500 w-16 text-right">{row[3]} Pat</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BookOpen className="mr-2 text-amber-500" size={20} /> Repository Records
          </h2>
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="space-y-6">
              {Object.entries(records).map(([key, val]: any) => (
                <div key={key}>
                  <div className="text-xs text-muted uppercase tracking-wider mb-1">{key}</div>
                  <div className="font-medium text-blue-500 text-lg">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Milestones */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Target className="mr-2 text-purple-500" size={20} /> Next Milestones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestoneTable?.rows.map((row: any[], i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="font-medium">{row[0]}</div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${getStatusColor(row[2])}`}>
                  {row[2]}
                </span>
              </div>
              <div className="font-mono text-sm text-muted">{row[1]}</div>
              {row[1].includes('/') && (
                <div className="mt-3 w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${(parseInt(row[1].split('/')[0]) / parseInt(row[1].split('/')[1])) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
