import Link from "next/link";
import { BarChart3, Database, GitBranch, Layers } from "lucide-react";

export default function MetricsIndex() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 w-full">
      <div className="border-b border-border pb-8 mb-12">
        <h1 className="text-4xl font-semibold mb-4">Metrics Dashboard</h1>
        <p className="text-muted text-lg">Live analytics and progress tracking for the Project UIL repository.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/metrics/frictions" className="group block bg-card border border-border rounded-xl p-8 hover:border-primary transition-all hover:-translate-y-1">
          <div className="bg-primary/10 text-primary p-4 rounded-xl w-fit mb-6">
            <GitBranch size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">Human Friction Metrics</h2>
          <p className="text-muted mb-6">
            Analytics on repository growth, category distribution, milestone progress, and documentation streaks.
          </p>
          <span className="text-primary font-medium flex items-center">
            View Report →
          </span>
        </Link>

        <Link href="/metrics/patterns" className="group block bg-card border border-border rounded-xl p-8 hover:border-primary transition-all hover:-translate-y-1">
          <div className="bg-primary/10 text-primary p-4 rounded-xl w-fit mb-6">
            <Layers size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">Pattern Metrics</h2>
          <p className="text-muted mb-6">
            Analytics on pattern evidence, validation status, supporting frictions, and discovery progress.
          </p>
          <span className="text-primary font-medium flex items-center">
            View Report →
          </span>
        </Link>
      </div>
    </div>
  );
}
