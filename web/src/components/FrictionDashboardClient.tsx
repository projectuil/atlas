"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, TrendingUp, Calendar, Target, LayoutGrid, CheckCircle2, Circle, Search, Activity, BookOpen, AlertCircle } from 'lucide-react';
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function FrictionDashboardClient({ tables, rawHtml }: { tables: any[], rawHtml: string }) {
  useScrollRestoration("metrics-frictions-dash");

  // Table Mapping based on the known docx structure
  const progressTable = tables[0];
  const activityTable = tables[1];
  const recordsTable = tables[2];
  const categoryTable = tables[3];
  const registryTable = tables[4];
  const roadmapTable = tables[5];
  const milestoneTable = tables[6];
  const assetTable = tables[7];
  const summaryTable = tables[8];

  // Map to objects for easy rendering
  const progress = Object.fromEntries(progressTable?.rows.map((r: any) => [r[0], r[1]]) || []);
  const activity = Object.fromEntries(activityTable?.rows.map((r: any) => [r[0], r[1]]) || []);
  const records = Object.fromEntries(recordsTable?.rows.map((r: any) => [r[0], r[1]]) || []);
  
  const completionValue = parseFloat(progress['Completion'] || '0');
  
  const [catSearch, setCatSearch] = useState('');

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('active') || s.includes('ready')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s.includes('progress') || s.includes('planned') || s.includes('candidate')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
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
        <span className="text-foreground">Human Friction Metrics</span>
      </nav>

      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center">
          <GitBranch className="mr-3 text-blue-500" size={28} />
          Human Friction Metrics Report
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
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Target</div>
            <div className="text-3xl font-mono">{progress['Target']}</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><GitBranch size={48} /></div>
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Documented</div>
            <div className="text-3xl font-mono text-blue-500">{progress['Documented']}</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Remaining</div>
            <div className="text-3xl font-mono text-amber-500">{progress['Remaining']}</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <div className="text-sm text-muted mb-1 uppercase tracking-wider">Completion</div>
            <div className="text-3xl font-mono text-emerald-500">{progress['Completion']}</div>
          </div>
        </div>
        <div className="w-full bg-background border border-border rounded-full h-4 overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${completionValue}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Today's Activity */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Activity className="mr-2 text-blue-500" size={20} /> Today's Activity
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {Object.entries(activity).map(([key, val]: any) => (
              <div key={key} className="p-4 flex justify-between items-center">
                <span className="text-muted">{key}</span>
                <span className={`font-mono ${key.includes('Added') ? 'text-emerald-500' : ''}`}>{val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Repository Records */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <TrendingUp className="mr-2 text-amber-500" size={20} /> Repository Records
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
             {Object.entries(records).map(([key, val]: any) => (
              <div key={key} className="p-4 flex justify-between items-center">
                <span className="text-muted">{key}</span>
                <span className="font-mono text-blue-500 text-right max-w-[50%]">{val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Category Breakdown (Sortable & Searchable) */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <LayoutGrid className="mr-2 text-blue-500" size={20} /> Category Breakdown
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
            <input
              type="text"
              placeholder="Filter Categories..."
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-border text-muted">
              <tr>
                {categoryTable?.headers.map((h: string, i: number) => (
                  <th key={i} className={`px-6 py-4 font-medium uppercase tracking-wider text-xs ${i > 1 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categoryTable?.rows.filter((r: any) => r[0].toLowerCase().includes(catSearch.toLowerCase()) || r[1].toLowerCase().includes(catSearch.toLowerCase())).map((row: any[], i: number) => (
                <tr key={i} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-500 font-medium">{row[0]}</td>
                  <td className="px-6 py-4 font-medium">{row[1]}</td>
                  <td className="px-6 py-4 font-mono text-right">{row[2]}</td>
                  <td className="px-6 py-4 font-mono text-right">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Milestones & Roadmap */}
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

      {/* Two columns for Asset Status & System Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BookOpen className="mr-2 text-blue-500" size={20} /> Asset Status
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border h-96 overflow-y-auto">
            {assetTable?.rows.map((row: any[], i: number) => (
              <div key={i} className="p-3 px-4 flex justify-between items-center text-sm hover:bg-background/50">
                <span>{row[0]}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${getStatusColor(row[1])}`}>
                  {row[1]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <AlertCircle className="mr-2 text-amber-500" size={20} /> System Summary
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {summaryTable?.rows.map((row: any[], i: number) => (
              <div key={i} className="p-4 flex justify-between items-start md:items-center text-sm flex-col md:flex-row gap-2">
                <span className="text-muted shrink-0 w-1/3">{row[0]}</span>
                <span className="font-medium text-right text-foreground md:w-2/3">{row[1]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
