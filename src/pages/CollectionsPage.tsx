import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import { getFilteredProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { Product, Category, ProductFilters, SortOption } from '../types/product';

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: 'Under $50', range: [0, 50] },
  { label: '$50 - $150', range: [50, 150] },
  { label: '$150+', range: [150, 999999] },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
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

export default function CollectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: null,
    inStock: null,
    search: '',
  });

  const selectedCategory = categories.find((c) => c.slug === categorySlug && c.isActive);
  const allCategoryNames = categories.filter((c) => c.isActive).map((c) => c.name);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile filters open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // Sync selected category from URL
  useEffect(() => {
    if (!selectedCategory) return;

    setFilters((prev) => {
      if (prev.categories.includes(selectedCategory.name)) return prev;
      return {
        ...prev,
        categories: [selectedCategory.name],
      };
    });
  }, [selectedCategory]);

  // Fetch products when filters or sort change
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getFilteredProducts(filters, sortOption);
      setProducts(result);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => {
      if (prev.categories.includes(category)) {
        return { ...prev, categories: prev.categories.filter((c) => c !== category) };
      }
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const handlePriceToggle = (range: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange?.[0] === range[0] && prev.priceRange?.[1] === range[1] ? null : range,
    }));
  };

  const handleInStockToggle = () => {
    setFilters((prev) => ({
      ...prev,
      inStock: prev.inStock ? null : true,
    }));
  };

  const clearAllFilters = () => {
    setFilters({ categories: [], priceRange: null, inStock: null, search: '' });
    setSearchQuery('');

    if (searchParams.has('category')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const clearCategoryFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    setSearchParams(nextParams, { replace: true });
    setFilters((prev) => ({
      ...prev,
      categories: selectedCategory ? prev.categories.filter((item) => item !== selectedCategory.name) : prev.categories,
    }));
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange !== null ||
    filters.inStock !== null ||
    searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow pt-32 pb-24 px-6 lg:px-12 max-w-[1440px] mx-auto w-full">
        {/* Header */}
        <div className="mb-12 md:mb-16 pb-8 border-b border-black/5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-textMain mb-3 sm:mb-4">All Collections</h1>
          <p className="text-base sm:text-lg text-textLight max-w-2xl">
            Explore our curated selection of timeless fashion pieces designed for effortless elegance.
          </p>
          {selectedCategory && (
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-widest text-textLight">Active Collection</span>
              <span className="text-xs font-medium bg-brand/10 text-brand px-3 py-1.5 rounded-full">
                {selectedCategory.name}
              </span>
              <button
                onClick={clearCategoryFilter}
                className="text-xs text-textLight hover:text-textMain transition-colors underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Top Bar Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm font-medium px-4 py-2.5 border border-black/10 rounded-full hover:bg-black/[0.03] transition-colors active:scale-95"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={16} /> Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 sm:ml-auto">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const query = searchQuery.trim();
                navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
              }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight" size={16} />
              <input
                type="text"
                placeholder="Search pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-20 py-2.5 bg-white border border-black/5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200 font-sans text-textMain placeholder:text-textLight"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-black/5 text-textMain hover:bg-black/10 transition-colors"
              >
                Go
              </button>
            </form>

            <div className="relative min-w-[200px] sm:min-w-[220px]" ref={sortRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border border-black/5 px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium text-textMain focus:outline-none hover:bg-black/[0.03] transition-colors cursor-pointer"
                aria-expanded={sortDropdownOpen}
                aria-haspopup="listbox"
              >
                <span className="truncate mr-2">
                  Sort: {sortOption === '' ? 'Recommended' : SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label.replace('Price: ', '')}
                </span>
                <ChevronDown
                  className={`text-textLight shrink-0 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`}
                  size={16}
                />
              </button>

              <div
                className={`absolute z-50 top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 border border-black/5 transition-all duration-200 origin-top ${
                  sortDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
                role="listbox"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-5 sm:px-6 py-2.5 text-sm transition-colors ${
                      sortOption === option.value
                        ? 'bg-black/[0.03] text-textMain font-medium'
                        : 'text-textLight hover:bg-black/[0.03] hover:text-textMain'
                    }`}
                    role="option"
                    aria-selected={sortOption === option.value}
                  >
                    <span>{option.label}</span>
                    {sortOption === option.value && <Check size={16} className="text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {filters.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  selectedCategory?.name === cat
                    ? 'bg-brand text-white hover:opacity-90'
                    : 'bg-brand/10 text-brand hover:bg-brand/20'
                }`}
              >
                {cat}
                <X size={12} />
              </button>
            ))}
            {filters.priceRange && (
              <button
                onClick={() => handlePriceToggle(filters.priceRange!)}
                className="flex items-center gap-1.5 text-xs font-medium bg-brand/10 text-brand px-3 py-1.5 rounded-full hover:bg-brand/20 transition-colors"
              >
                {PRICE_RANGES.find((r) => r.range[0] === filters.priceRange![0])?.label}
                <X size={12} />
              </button>
            )}
            {filters.inStock && (
              <button
                onClick={handleInStockToggle}
                className="flex items-center gap-1.5 text-xs font-medium bg-brand/10 text-brand px-3 py-1.5 rounded-full hover:bg-brand/20 transition-colors"
              >
                In Stock
                <X size={12} />
              </button>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-textLight hover:text-textMain transition-colors underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="flex items-start gap-10 lg:gap-14">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 lg:w-64 shrink-0 top-32 sticky h-fit max-h-[80vh] overflow-y-auto pb-8 hide-scrollbar">
            <h2 className="text-lg font-serif text-textMain mb-6">Refine</h2>
            <FilterPanel
              categories={allCategoryNames}
              selectedCategories={filters.categories}
              onCategoryToggle={handleCategoryToggle}
              priceRanges={PRICE_RANGES}
              selectedPriceRange={filters.priceRange}
              onPriceToggle={handlePriceToggle}
              inStock={filters.inStock}
              onInStockToggle={handleInStockToggle}
            />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 w-full min-w-0">
            <p className="text-xs text-textLight mb-6 uppercase tracking-wider">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  {products.length} {products.length === 1 ? 'piece' : 'pieces'}
                </>
              )}
            </p>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <div className="text-center py-24 sm:py-32 bg-white/50 rounded-3xl border border-black/5">
                <div className="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mx-auto mb-6">
                  <Search size={24} strokeWidth={1.5} className="text-textLight" />
                </div>
                <p className="text-xl font-serif text-textMain mb-2">No pieces found</p>
                <p className="text-sm text-textLight mb-6">Try adjusting your filters or search term.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-brand underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Slide-out */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileFiltersOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[85vw] max-w-[360px] bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            mobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-black/5 shrink-0">
            <h2 className="text-lg font-serif text-textMain">Refine</h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 -mr-2 text-textMain hover:opacity-70 transition-opacity active:scale-95 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              aria-label="Close filters"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-grow hide-scrollbar">
            <FilterPanel
              categories={allCategoryNames}
              selectedCategories={filters.categories}
              onCategoryToggle={handleCategoryToggle}
              priceRanges={PRICE_RANGES}
              selectedPriceRange={filters.priceRange}
              onPriceToggle={handlePriceToggle}
              inStock={filters.inStock}
              onInStockToggle={handleInStockToggle}
            />
          </div>
          <div className="p-6 border-t border-black/5 bg-white shrink-0">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-brand text-white py-3.5 rounded-full text-sm font-semibold uppercase tracking-widest hover:bg-brand/90 transition-colors active:scale-[0.98]"
            >
              View {products.length} {products.length === 1 ? 'Result' : 'Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
