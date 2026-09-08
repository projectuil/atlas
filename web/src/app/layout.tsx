import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import SearchModal from "@/components/SearchModal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Project UIL | ATLAS Research Repository",
  description: "Understanding Human Problems Before Building Technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexMono.variable} font-sans min-h-screen bg-background text-foreground flex flex-col`}>
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-semibold tracking-widest text-lg">PROJECT UIL</Link>
              <nav className="hidden md:flex space-x-6 text-sm text-muted">
                <Link href="/atlas" className="hover:text-foreground transition-colors">ATLAS Explorer</Link>
                <Link href="/patterns" className="hover:text-foreground transition-colors">Patterns</Link>
                <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
                <Link href="/metrics" className="hover:text-foreground transition-colors">Metrics</Link>
                <Link href="/registries" className="hover:text-foreground transition-colors">Registries</Link>
              </nav>
            </div>
            <div>
              <SearchModal />
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col" data-pagefind-body>
          {children}
        </main>
        <footer className="border-t border-border py-12 mt-auto bg-card/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <div className="font-semibold tracking-widest text-sm mb-3">PROJECT UIL</div>
                <p className="text-xs text-muted leading-relaxed">Observe deeply. Think clearly. Build responsibly.</p>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Research</div>
                <nav className="space-y-2">
                  <Link href="/atlas" className="block text-xs text-muted hover:text-foreground transition-colors">ATLAS Explorer</Link>
                  <Link href="/patterns" className="block text-xs text-muted hover:text-foreground transition-colors">Patterns</Link>
                </nav>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Reference</div>
                <nav className="space-y-2">
                  <Link href="/docs" className="block text-xs text-muted hover:text-foreground transition-colors">Documentation</Link>
                  <Link href="/registries" className="block text-xs text-muted hover:text-foreground transition-colors">Registries</Link>
                </nav>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Analytics</div>
                <nav className="space-y-2">
                  <Link href="/metrics" className="block text-xs text-muted hover:text-foreground transition-colors">Metrics</Link>
                  <Link href="/metrics/frictions" className="block text-xs text-muted hover:text-foreground transition-colors">Friction Metrics</Link>
                  <Link href="/metrics/patterns" className="block text-xs text-muted hover:text-foreground transition-colors">Pattern Metrics</Link>
                </nav>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Governance</div>
                <nav className="space-y-2">
                  <Link href="/docs/research-methodology" className="block text-xs text-muted hover:text-foreground transition-colors">Research Methodology</Link>
                </nav>
              </div>
            </div>
            <div className="border-t border-border pt-6 text-center">
              <p className="text-xs text-muted">© 2026 Project UIL. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
