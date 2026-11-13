import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { filterAndSortProducts, formatEgp } from '../lib/commerce';
import type { CategorySlug } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  initialCategory?: CategorySlug | 'all' | 'new-arrivals';
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory = 'all' }) => {
  const { products, collections, salesRanking, route, navigate } = useStore();

  const urlParams = useMemo(() => {
    const queryStr = route.includes('?') ? route.split('?')[1] : '';
    return new URLSearchParams(queryStr);
  }, [route]);

  const [category, setCategory] = useState<CategorySlug | 'all' | 'new-arrivals'>(initialCategory);
  const [search, setSearch] = useState(() => urlParams.get('q') || '');
  const [priceRange, setPriceRange] = useState<'all' | 'under-10k' | '10k-50k' | '50k-plus'>('all');
  const [sort, setSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestselling'>(
    () => (urlParams.get('sort') as 'bestselling') || 'featured'
  );

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const q = urlParams.get('q');
    if (q !== null) setSearch(q);
    const s = urlParams.get('sort');
    if (s === 'bestselling' || s === 'price-asc' || s === 'price-desc' || s === 'newest') {
      setSort(s);
    }
  }, [urlParams]);

  const { minPrice, maxPrice } = useMemo(() => {
    switch (priceRange) {
      case 'under-10k':
        return { minPrice: undefined, maxPrice: 10000 };
      case '10k-50k':
        return { minPrice: 10000, maxPrice: 50000 };
      case '50k-plus':
        return { minPrice: 50000, maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  }, [priceRange]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        category,
        search,
        minPrice,
        maxPrice,
        sort,
        salesCountMap: salesRanking,
      }),
    [products, category, search, minPrice, maxPrice, sort, salesRanking]
  );

  const activeCollection = collections.find((c) => c.slug === category);
  const pageTitle =
    category === 'new-arrivals'
      ? 'New Arrivals'
      : activeCollection
      ? activeCollection.name
      : 'All Accessories';
  const pageSubtitle =
    category === 'new-arrivals'
      ? 'Recently introduced silhouettes from Drop 001.'
      : activeCollection
      ? activeCollection.description
      : 'Considered watches, bracelets, structured bags, small leather goods, eyewear, and club headwear.';

  return (
    <main className="bg-[#FFFFFF] min-h-[70vh]">
      {/* Editorial Header */}
      <section className="bg-[#F5F3EF] border-b border-[#D8D6D1] py-12 md:py-16 px-6 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
            911.EG · Catalog
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-editorial text-4xl md:text-5xl text-[#242424]">{pageTitle}</h1>
              <p className="mt-2.5 text-sm text-[#242424]/75 max-w-xl">{pageSubtitle}</p>
            </div>
            <p className="text-xs text-[#A8A29A] tabular-nums">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'} · Prices in EGP (Sample catalog pricing)
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Sort Controls */}
      <section className="border-b border-[#D8D6D1]/80 px-6 md:px-10 py-4 bg-[#FFFFFF]">
        <div className="mx-auto max-w-[1440px] flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 xl:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'new-arrivals', label: 'New Arrivals' },
              ...collections.map((c) => ({ id: c.slug, label: c.name })),
            ].map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    const next = tab.id as CategorySlug | 'all' | 'new-arrivals';
                    setCategory(next);
                    if (next === 'all') navigate('/shop');
                    else if (next === 'new-arrivals') navigate('/new-arrivals');
                    else navigate(`/shop/${next}`);
                  }}
                  className={`px-3.5 py-2 text-[11px] font-medium tracking-[0.14em] uppercase whitespace-nowrap shrink-0 transition-colors border ${
                    active
                      ? 'border-[#242424] bg-[#242424] text-[#FFFFFF]'
                      : 'border-transparent text-[#242424] hover:bg-[#F5F3EF]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search, Price Filter, Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <div className="relative flex-1 sm:w-52 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A8A29A]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by keyword..."
                aria-label="Filter products by keyword"
                className="w-full border border-[#D8D6D1] pl-8 pr-7 py-2 text-xs text-[#242424] placeholder:text-[#A8A29A] focus:border-[#242424] focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search filter"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A8A29A] hover:text-[#242424]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#A8A29A] hidden sm:block" />
              <label htmlFor="price-filter" className="sr-only">
                Filter by price range
              </label>
              <select
                id="price-filter"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2 text-xs text-[#242424] focus:border-[#242424] focus:outline-none whitespace-nowrap"
              >
                <option value="all">All Prices (EGP)</option>
                <option value="under-10k">Under {formatEgp(10000)}</option>
                <option value="10k-50k">{formatEgp(10000)} – {formatEgp(50000)}</option>
                <option value="50k-plus">{formatEgp(50000)}+</option>
              </select>
            </div>

            <div className="shrink-0">
              <label htmlFor="sort-products" className="sr-only">
                Sort products
              </label>
              <select
                id="sort-products"
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2 text-xs text-[#242424] focus:border-[#242424] focus:outline-none whitespace-nowrap"
              >
                <option value="featured">Sort: Featured</option>
                <option value="bestselling">Sort: Best Selling</option>
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-10 py-12 md:py-16">
        {filteredProducts.length === 0 ? (
          <div className="border border-[#D8D6D1] bg-[#F5F3EF] p-12 text-center">
            <p className="font-editorial text-2xl text-[#242424]">No pieces matched your filters</p>
            <p className="mt-2 text-sm text-[#A8A29A]">
              Adjust your price range or keyword search to explore the full 911 catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('all');
                setSearch('');
                setPriceRange('all');
                setSort('featured');
                navigate('/shop');
              }}
              className="mt-6 bg-[#242424] text-[#FFFFFF] px-6 py-3 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
