import { useEffect, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '../services/productService';
import { Product } from '../types/product';

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          <div className="bg-black/[0.04] rounded-2xl aspect-[3/4] mb-4" />
          <div className="flex justify-between items-baseline px-1 gap-2">
            <div className="h-4 bg-black/[0.04] rounded-full w-2/3" />
            <div className="h-4 bg-black/[0.04] rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQuery = searchInput.trim();
      setDebouncedQuery(nextQuery);
      if (nextQuery) {
        setSearchParams({ q: nextQuery }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  // Sync with external URL changes
  useEffect(() => {
    const externalQuery = searchParams.get('q') || '';
    if (externalQuery !== searchInput) {
      setSearchInput(externalQuery);
      setDebouncedQuery(externalQuery);
    }
  }, [searchParams]);

  // Fetch products
  const fetchProducts = useCallback(async (query: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const results = await searchProducts(query);
      setProducts(results);
    } catch {
      setErrorMessage('Search is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedQuery);
  }, [debouncedQuery, fetchProducts]);

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 pb-24 px-6 lg:px-12 animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-textMain mb-4">Search</h1>
          <p className="text-textLight text-sm sm:text-base max-w-2xl">
            Find products across collections by name or category.
          </p>
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight" size={18} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search dresses, outerwear, trousers..."
              className="w-full bg-white border border-black/10 rounded-full py-3.5 pl-11 pr-12 text-sm sm:text-base text-textMain placeholder:text-textLight focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all duration-200"
              aria-label="Search products"
            />
            {searchInput.trim() && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-textLight hover:text-textMain hover:bg-black/5 transition-all duration-200"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-textLight mb-6 sm:mb-8">
          {isLoading ? (
            <span className="animate-pulse">Searching...</span>
          ) : (
            <>
              {products.length} {products.length === 1 ? 'result' : 'results'}
              {debouncedQuery ? ` for "${debouncedQuery}"` : ''}
            </>
          )}
        </p>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : errorMessage ? (
          <div className="text-center py-20 sm:py-24 bg-white/60 border border-black/5 rounded-3xl animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-serif text-textMain mb-3">Search Unavailable</h2>
            <p className="text-textLight text-sm sm:text-base mb-8 max-w-md mx-auto">
              {errorMessage}
            </p>
            <button
              onClick={() => fetchProducts(debouncedQuery)}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-textMain text-white text-xs font-semibold uppercase tracking-widest hover:bg-black/80 transition-all duration-200 active:scale-[0.98]"
            >
              Retry Search
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 sm:py-24 bg-white/60 border border-black/5 rounded-3xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mx-auto mb-6">
              <Search size={24} strokeWidth={1.5} className="text-textLight" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-textMain mb-3">No Results Found</h2>
            <p className="text-textLight text-sm sm:text-base mb-8 max-w-md mx-auto">
              Try another keyword or browse all pieces in collections.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-textMain text-white text-xs font-semibold uppercase tracking-widest hover:bg-black/80 transition-all duration-200 active:scale-[0.98]"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-fade-in">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
