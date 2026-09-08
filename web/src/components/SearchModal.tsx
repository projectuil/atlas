"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pagefindRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Load Pagefind and Autofocus
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      const initPagefind = async () => {
        try {
          if (!pagefindRef.current) {
            // @ts-ignore
            const pagefind = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js');
            await pagefind.options({ baseUrl: '/' });
            pagefindRef.current = pagefind;
          }
        } catch (err) {
          console.error("Failed to load pagefind", err);
        }
      };
      initPagefind();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        setIsOpen(false);
        const url = results[selectedIndex].url.replace(/\.html$/, '');
        router.push(url);
      }
    };
    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, results, selectedIndex, router]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setSelectedIndex(0);
    
    if (q.trim() && pagefindRef.current) {
      const search = await pagefindRef.current.search(q);
      const topResults = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()));
      setResults(topResults);
    } else {
      setResults([]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-sm text-muted bg-background border border-border px-3 py-1.5 rounded-md hover:border-primary transition-colors"
      >
        <Search size={14} />
        <span>Search ATLAS...</span>
        <span className="font-mono text-xs border border-border rounded px-1 ml-2">⌘K</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-sm text-muted bg-background border border-border px-3 py-1.5 rounded-md hover:border-primary transition-colors"
      >
        <Search size={14} />
        <span>Search ATLAS...</span>
        <span className="font-mono text-xs border border-border rounded px-1 ml-2">⌘K</span>
      </button>

      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-background/80 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      >
        <div 
          className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b border-border px-4 py-4">
            <Search className="text-muted mr-3" size={20} />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search by APID, title, keyword, pattern or document..." 
              className="bg-transparent border-none outline-none w-full text-lg text-foreground placeholder:text-muted"
              value={query}
              onChange={handleSearch}
            />
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground ml-3 border border-border rounded p-1">
              <X size={16} />
            </button>
          </div>
          
          <div className="overflow-y-auto">
            {query.trim() === "" ? (
              <div className="p-8 text-center text-sm text-muted">
                Start typing to search across the entire repository.
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">
                No results found for "{query}".
              </div>
            ) : (
              <div className="p-2 space-y-4 pb-4">
                {['Human Frictions', 'Patterns', 'Documentation', 'Metrics', 'Registries'].map((group) => {
                  const groupResults = results.map((r, i) => ({ ...r, originalIndex: i })).filter((res) => {
                    if (group === 'Human Frictions' && res.url.match(/^\/atlas\/[a-z]{2}-\d{3}/)) return true;
                    if (group === 'Patterns' && res.url.match(/^\/patterns\/pat-\d{3}/)) return true;
                    if (group === 'Documentation' && res.url.includes('/docs/')) return true;
                    if (group === 'Metrics' && res.url.includes('/metrics/')) return true;
                    if (group === 'Registries' && res.url.includes('/registries/')) return true;
                    // Catch-all for landing pages if they don't match strict patterns
                    if (group === 'Human Frictions' && res.url === '/atlas/') return true;
                    if (group === 'Patterns' && res.url === '/patterns/') return true;
                    return false;
                  });

                  if (groupResults.length === 0) return null;

                  return (
                    <div key={group} className="px-2">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 ml-2">{group}</h3>
                      <ul className="space-y-1">
                        {groupResults.map((res) => (
                          <li key={res.url}>
                            <button
                              className={`w-full text-left px-4 py-3 rounded-lg flex flex-col focus:outline-none transition-colors ${
                                selectedIndex === res.originalIndex ? "bg-primary/10 border-primary" : "hover:bg-background/50"
                              } border border-transparent`}
                              onClick={() => {
                                setIsOpen(false);
                                router.push(res.url.replace(/\.html$/, ''));
                              }}
                            >
                              <div className="font-medium text-primary mb-1 flex items-center justify-between">
                                {res.meta?.title || res.url}
                                <span className="text-[10px] text-muted font-mono bg-background px-1.5 py-0.5 rounded border border-border">
                                  {res.url.split('/').pop()?.toUpperCase().replace('.HTML', '')}
                                </span>
                              </div>
                              <div 
                                className="text-sm text-muted line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: res.excerpt || "" }}
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-border bg-background/50 text-[10px] text-muted flex justify-between uppercase tracking-wider">
            <span>↑↓ to navigate</span>
            <span>Enter to select</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </>
  );
}
