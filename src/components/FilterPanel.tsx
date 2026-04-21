interface FilterPanelProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  priceRanges: { label: string; range: [number, number] }[];
  selectedPriceRange: [number, number] | null;
  onPriceToggle: (range: [number, number]) => void;
  inStock: boolean | null;
  onInStockToggle: () => void;
}

export default function FilterPanel({
  categories,
  selectedCategories,
  onCategoryToggle,
  priceRanges,
  selectedPriceRange,
  onPriceToggle,
  inStock,
  onInStockToggle,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain mb-4">Category</h3>
        <div className="flex flex-col gap-3">
          {categories.map(category => {
            const isActive = selectedCategories.includes(category);
            return (
              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isActive}
                  onChange={() => onCategoryToggle(category)}
                />
                <div
                  className={`w-4 h-4 border flex items-center justify-center transition-all duration-200 rounded-sm ${
                    isActive ? 'bg-brand border-brand' : 'border-gray-300 group-hover:border-brand/60'
                  }`}
                >
                  {isActive && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                </div>
                <span
                  className={`text-sm transition-colors duration-200 ${
                    isActive ? 'text-textMain font-medium' : 'text-textLight group-hover:text-textMain'
                  }`}
                >
                  {category}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-black/5" />

      {/* Price */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain mb-4">Price</h3>
        <div className="flex flex-col gap-3">
          {priceRanges.map(range => {
            const isActive =
              selectedPriceRange?.[0] === range.range[0] && selectedPriceRange?.[1] === range.range[1];
            return (
              <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isActive}
                  onChange={() => onPriceToggle(range.range)}
                />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    isActive ? 'border-brand' : 'border-gray-300 group-hover:border-brand/60'
                  }`}
                >
                  {isActive && <div className="w-2 h-2 bg-brand rounded-full" />}
                </div>
                <span
                  className={`text-sm transition-colors duration-200 ${
                    isActive ? 'text-textMain font-medium' : 'text-textLight group-hover:text-textMain'
                  }`}
                >
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-black/5" />

      {/* Availability */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMain mb-4">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="hidden"
            checked={!!inStock}
            onChange={onInStockToggle}
          />
          <div
            className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex items-center px-0.5 ${
              inStock ? 'bg-brand' : 'bg-gray-200 group-hover:bg-gray-300'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                inStock ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span
            className={`text-sm transition-colors duration-200 ${
              inStock ? 'text-textMain font-medium' : 'text-textLight group-hover:text-textMain'
            }`}
          >
            In Stock
          </span>
        </label>
      </div>
    </div>
  );
}
