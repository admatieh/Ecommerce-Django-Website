import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import { categories, products } from '../data/mockData';

type Filters = {
  categories: string[];
  priceRange: [number, number] | null;
  inStock: boolean | null;
};

type SortOption = 'price-asc' | 'price-desc' | 'newest' | '';

const ALL_CATEGORIES = categories.map((category) => category.name);

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: 'Under $50', range: [0, 50] },
  { label: '$50 – $150', range: [50, 150] },
  { label: '$150+', range: [150, 999999] },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function CollectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug && category.isActive),
    [categorySlug],
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceRange: null,
    inStock: null,
  });

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

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      }
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const handlePriceToggle = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: prev.priceRange?.[0] === range[0] && prev.priceRange?.[1] === range[1] ? null : range,
    }));
  };

  const handleInStockToggle = () => {
    setFilters(prev => ({
      ...prev,
      inStock: prev.inStock ? null : true,
    }));
  };

  const clearAllFilters = () => {
    setFilters({ categories: [], priceRange: null, inStock: null });
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

  const hasActiveFilters = filters.categories.length > 0 || filters.priceRange !== null || filters.inStock !== null || searchQuery.trim() !== '';

  const filteredAndSortedProducts = useMemo(() => {
    let result = selectedCategory
      ? products.filter((product) => product.categoryId === selectedCategory.id && product.isActive)
      : products.filter((product) => product.isActive);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }

    if (filters.categories.length > 0) {
      const selectedCategoryIds = categories
        .filter((category) => filters.categories.includes(category.name))
        .map((category) => category.id);
      result = result.filter((product) => selectedCategoryIds.includes(product.categoryId));
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter(p => p.price >= min && p.price <= max);
    }

    if (filters.inStock !== null) {
      result = result.filter(p => p.stock > 0);
    }

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      result.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return result;
  }, [searchQuery, filters, sortOption, selectedCategory]);

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
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 bg-brand rounded-full" />
            )}
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
                  Sort: {sortOption === '' ? 'Recommended' : SORT_OPTIONS.find(opt => opt.value === sortOption)?.label.replace('Price: ', '')}
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
            {filters.categories.map(cat => (
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
                {PRICE_RANGES.find(r => r.range[0] === filters.priceRange![0])?.label}
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
              categories={ALL_CATEGORIES}
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
            {/* Results count */}
            <p className="text-xs text-textLight mb-6 uppercase tracking-wider">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'piece' : 'pieces'}
            </p>

            {filteredAndSortedProducts.length === 0 ? (
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
                {filteredAndSortedProducts.map(product => (
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
              categories={ALL_CATEGORIES}
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
              View {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Result' : 'Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
