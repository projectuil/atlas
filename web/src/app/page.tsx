import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, FileText, BarChart3, ArrowDown, Eye, PenLine, Layers, Lightbulb, Rocket } from "lucide-react";
import { getCategories, getFrictions, getPatterns, getDocs } from "@/lib/api";

export default function Home() {
  const categories = getCategories();
  const frictions = getFrictions();
  const patterns = getPatterns();
  const docs = getDocs();

  // Featured frictions: first 3 sorted by APID
  const featuredFrictions = frictions
    .filter(f => f.identity?.apid)
    .slice(0, 3);

  // Featured patterns: first 3
  const featuredPatterns = patterns.slice(0, 3);

  return (
    <div className="w-full">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-block border border-border rounded-full px-3 py-1 text-xs text-primary font-mono tracking-widest uppercase mb-6">
          Project UIL — Research Repository
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-6 max-w-4xl mx-auto">
          Understanding Human Problems Before Building Technology.
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
          An open, evidence-based repository documenting recurring Human Frictions, Behavioural Patterns, and Research Insights across digital systems.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/atlas" className="bg-primary text-black font-semibold px-6 py-3 rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2">
            Explore ATLAS <ArrowRight size={16} />
          </Link>
          <Link href="/patterns" className="bg-card border border-border text-foreground font-medium px-6 py-3 rounded-lg hover:border-primary transition-colors flex items-center gap-2">
            Browse Patterns <ArrowRight size={16} />
          </Link>
          <Link href="/docs" className="bg-transparent border border-border text-muted font-medium px-6 py-3 rounded-lg hover:border-muted transition-colors">
            Read Documentation
          </Link>
        </div>
      </section>

      {/* ─── REPOSITORY STATS ─────────────────────────────────── */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-mono font-semibold text-primary mb-1">{frictions.length}</div>
            <div className="text-xs text-muted uppercase tracking-wider">Human Frictions</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-semibold mb-1">{patterns.length}</div>
            <div className="text-xs text-muted uppercase tracking-wider">Behavioural Patterns</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-semibold mb-1">{categories.length}</div>
            <div className="text-xs text-muted uppercase tracking-wider">Core Domains</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-semibold mb-1">{docs.length}</div>
            <div className="text-xs text-muted uppercase tracking-wider">Governance Docs</div>
          </div>
        </div>
      </section>

      {/* ─── REPOSITORY MODULES ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-3">The Research Platform</h2>
          <p className="text-muted">Four interconnected modules that form the Project UIL research ecosystem.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <GitBranch size={28} />,
              title: "ATLAS Explorer",
              desc: "The complete catalogue of documented Human Frictions across all digital domains.",
              stat: `${frictions.length} Frictions · ${categories.length} Domains`,
              href: "/atlas",
              cta: "Open ATLAS",
            },
            {
              icon: <Layers size={28} />,
              title: "Patterns",
              desc: "Research insights mapping interconnected systemic problems into behavioural patterns.",
              stat: `${patterns.length} Patterns · 5 Volumes`,
              href: "/patterns",
              cta: "Browse Patterns",
            },
            {
              icon: <BookOpen size={28} />,
              title: "Documentation",
              desc: "Governance documents, research standards, templates, and publishing guides.",
              stat: `${docs.length} Documents`,
              href: "/docs",
              cta: "Read Docs",
            },
            {
              icon: <BarChart3 size={28} />,
              title: "Metrics",
              desc: "Research coverage statistics, progress tracking, and repository health.",
              stat: "Coverage & Progress",
              href: "/registries",
              cta: "View Registries",
            },
          ].map(m => (
            <Link key={m.title} href={m.href} className="group flex flex-col bg-card border border-border rounded-xl p-6 hover:border-primary transition-all hover:-translate-y-1">
              <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit mb-5">{m.icon}</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{m.title}</h3>
              <p className="text-sm text-muted flex-1 mb-4">{m.desc}</p>
              <div className="text-xs text-muted border-t border-border pt-4 mb-4">{m.stat}</div>
              <span className="text-sm text-primary flex items-center gap-1">{m.cta} <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── RESEARCH WORKFLOW ────────────────────────────────── */}
      <section className="border-t border-border bg-card/20">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold mb-3">The Research Workflow</h2>
            <p className="text-muted">How evidence turns into better products.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {[
              { icon: <Eye size={20} />, label: "Observe", desc: "Field research &\nuser observation", step: "01" },
              { icon: <PenLine size={20} />, label: "Document Friction", desc: "Record recurring problems with evidence", step: "02", highlight: true },
              { icon: <Layers size={20} />, label: "Identify Patterns", desc: "Map frictions to systemic behaviours", step: "03" },
              { icon: <Lightbulb size={20} />, label: "Generate Insights", desc: "Derive research conclusions", step: "04" },
              { icon: <Rocket size={20} />, label: "Build Products", desc: "Evidence-based design decisions", step: "05" },
            ].map((step, i) => (
              <div key={i} className="flex md:flex-col items-center gap-4 md:gap-0">
                <div className={`flex-shrink-0 rounded-xl p-4 border text-center w-full ${step.highlight ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border'}`}>
                  <div className="text-xs font-mono text-muted mb-2">{step.step}</div>
                  <div className="flex justify-center mb-2">{step.icon}</div>
                  <div className="font-semibold text-sm mb-1">{step.label}</div>
                  <div className="text-xs text-muted whitespace-pre-line leading-relaxed">{step.desc}</div>
                </div>
                {i < 4 && <ArrowRight className="hidden md:block text-muted flex-shrink-0 mt-0" size={16} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED RESEARCH ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-3">Featured Research</h2>
          <p className="text-muted">Representative entries from each repository module.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Featured Frictions */}
          <div>
            <h3 className="flex items-center text-base font-semibold mb-5 text-muted uppercase tracking-wider">
              <GitBranch size={16} className="mr-2 text-primary" /> Human Frictions
            </h3>
            <div className="space-y-3">
              {featuredFrictions.map(f => (
                <Link key={f.identity.apid} href={`/atlas/${f.identity.apid.toLowerCase()}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
                >
                  <div>
                    <span className="font-mono text-xs text-primary mr-3">{f.identity.apid}</span>
                    <span className="text-sm group-hover:text-primary transition-colors">{f.metadata?.title}</span>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
              <Link href="/atlas" className="block text-center text-sm text-primary hover:underline pt-2">
                View all {frictions.length} frictions →
              </Link>
            </div>
          </div>

          {/* Featured Patterns */}
          <div>
            <h3 className="flex items-center text-base font-semibold mb-5 text-muted uppercase tracking-wider">
              <Layers size={16} className="mr-2 text-primary" /> Patterns
            </h3>
            <div className="space-y-3">
              {featuredPatterns.map(p => (
                <Link key={p.identity.apid} href={`/patterns/${p.identity.apid.toLowerCase()}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
                >
                  <div>
                    <span className="font-mono text-xs text-primary mr-3">{p.identity.apid}</span>
                    <span className="text-sm group-hover:text-primary transition-colors">{p.metadata?.title}</span>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
              <Link href="/patterns" className="block text-center text-sm text-primary hover:underline pt-2">
                View all {patterns.length} patterns →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RESEARCH PRINCIPLES ──────────────────────────────── */}
      <section className="border-t border-border bg-card/20">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold mb-3">Research Principles</h2>
            <p className="text-muted">The philosophy that drives Project UIL.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Evidence Before Assumptions", desc: "Every friction must be observed and documented with real evidence before any design decision is made." },
              { n: "02", title: "Observe Before Building", desc: "Understanding human behaviour in existing systems before introducing new technology." },
              { n: "03", title: "Research Before Solutions", desc: "Systematic research precedes any proposed solution, pattern, or design recommendation." },
              { n: "04", title: "Human-Centred Systems", desc: "The human experience is the primary metric. Technology serves people, not the other way around." },
            ].map(p => (
              <div key={p.n} className="p-6 bg-card border border-border rounded-xl">
                <div className="font-mono text-xs text-primary mb-3">{p.n}</div>
                <h3 className="font-semibold mb-3">{p.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
 