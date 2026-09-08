import Link from "next/link";
import { Database, Hash, ListTree, Map } from "lucide-react";

export default function RegistriesIndex() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 w-full">
      <div className="border-b border-border pb-8 mb-12">
        <h1 className="text-4xl font-semibold mb-4">Registries</h1>
        <p className="text-muted text-lg">Browse the canonical indexes that power the ATLAS Repository.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/registries/apid" className="group block bg-card border border-border rounded-xl p-8 hover:border-blue-500 transition-all hover:-translate-y-1">
          <div className="bg-blue-500/10 text-blue-500 p-4 rounded-xl w-fit mb-6">
            <Hash size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-500 transition-colors">APID Registry</h2>
          <p className="text-muted mb-6">
            Browse every Human Friction identifier and its status.
          </p>
          <span className="text-blue-500 font-medium flex items-center">
            View Registry →
          </span>
        </Link>

        <Link href="/registries/category" className="group block bg-card border border-border rounded-xl p-8 hover:border-amber-500 transition-all hover:-translate-y-1">
          <div className="bg-amber-500/10 text-amber-500 p-4 rounded-xl w-fit mb-6">
            <ListTree size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-amber-500 transition-colors">Category Registry</h2>
          <p className="text-muted mb-6">
            Browse all research categories and taxonomy.
          </p>
          <span className="text-amber-500 font-medium flex items-center">
            View Registry →
          </span>
        </Link>

        <Link href="/registries/pattern" className="group block bg-card border border-border rounded-xl p-8 hover:border-emerald-500 transition-all hover:-translate-y-1">
          <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl w-fit mb-6">
            <Map size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-3 group-hover:text-emerald-500 transition-colors">Pattern Registry</h2>
          <p className="text-muted mb-6">
            Browse every documented Pattern identifier.
          </p>
          <span className="text-emerald-500 font-medium flex items-center">
            View Registry →
          </span>
        </Link>
      </div>
    </div>
  );
}
