import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { filterAndSortProducts, formatEgp } from '../lib/commerce';

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, collections, navigate } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return products.slice(0, 4);
    return filterAndSortProducts(products, { search: query, sort: 'featured' }).slice(0, 8);
  }, [products, query]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#FFFFFF]/98 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Search 911 Catalog"
    >
      <div className="mx-auto w-full max-w-[1100px] px-6 py-8">
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <div className="flex flex-1 items-center gap-4">
            <Search className="h-5 w-5 text-[#A8A29A] stroke-[1.5]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsSearchOpen(false);
                if (e.key === 'Enter' && query.trim()) {
                  setIsSearchOpen(false);
                  navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              placeholder="Search watches, clutches, briefcases, caps..."
              aria-label="Search products by name or category"
              className="w-full bg-transparent text-lg md:text-2xl font-editorial text-[#242424] placeholder:text-[#A8A29A] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="p-2 text-[#242424] hover:text-[#A8A29A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
          <span className="tracking-[0.16em] uppercase text-[#A8A29A]">Collections:</span>
          {collections.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                navigate(`/shop/${c.slug}`);
              }}
              className="border border-[#D8D6D1] px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-[#242424] hover:bg-[#F5F3EF] transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-4">
            {query.trim() ? `Results (${results.length})` : 'Curated Highlights'}
          </p>
          {results.length === 0 ? (
            <p className="text-sm text-[#A8A29A] py-8">
              No pieces matched &ldquo;{query}&rdquo;. Try searching for watches, leather, or caps.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/product/${p.slug}`);
                  }}
                  className="group text-left"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[#F5F3EF] border border-[#D8D6D1]/60 mb-2.5">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#A8A29A]">{p.category}</p>
                  <p className="text-sm font-medium text-[#242424] mt-0.5">{p.name}</p>
                  <p className="text-xs text-[#242424] tabular-nums mt-0.5">{formatEgp(p.priceEgp)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
