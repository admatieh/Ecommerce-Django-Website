import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FeaturedCategoriesSection } from '../../types/landing';
import { Category } from '../../types/product';

type FeaturedCategoriesProps = {
  data: FeaturedCategoriesSection;
  categories: Category[];
};

export default function FeaturedCategories({ data, categories }: FeaturedCategoriesProps) {
  const navigate = useNavigate();

  const featuredCategories = data.categoryIds
    .map((categoryId) => categories.find((category) => category.id === categoryId && category.isActive))
    .filter((category): category is Category => Boolean(category));

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl sm:text-4xl font-serif text-textMain mb-12 sm:mb-16">
          {data.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {featuredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => navigate(`/collections?category=${category.slug}`)}
              className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer block text-left w-full"
              aria-label={`Browse ${category.name}`}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent group-hover:from-black/60 group-hover:via-black/25 transition-all duration-300" />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
                <h3 className="text-xl sm:text-2xl font-serif text-white mb-2">{category.name}</h3>
                <span className="text-xs sm:text-sm font-medium text-white/90 uppercase tracking-widest flex items-center gap-2 transition-all duration-300 group-hover:gap-3">
                  {data.ctaText}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
