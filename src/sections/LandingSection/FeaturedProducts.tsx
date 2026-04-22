import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { FeaturedProductsSection } from '../../types/landing';
import { Product } from '../../types/product';

type FeaturedProductsProps = {
  data: FeaturedProductsSection;
  products: Product[];
};

export default function FeaturedProducts({ data, products }: FeaturedProductsProps) {
  const featuredProducts = data.productIds
    .map((productId) => products.find((product) => product.id === productId && product.isActive))
    .filter((product): product is Product => Boolean(product));

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-3xl sm:text-4xl font-serif text-textMain">{data.title}</h2>
        <Link
          to={data.viewAllLink}
          className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-brand hover:opacity-70 transition-opacity duration-200 group"
        >
          {data.viewAllText}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center md:hidden">
        <Link
          to={data.viewAllLink}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:opacity-70 transition-opacity duration-200 group"
        >
          {data.viewAllText}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
