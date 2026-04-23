import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types/product';
import { getCategoryForProduct } from '../services/productService';
import { formatPrice } from '../utils/format';
import ImageCarousel from './ImageCarousel';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  // Reads from the category cache — never crashes even if cache is cold
  const category = getCategoryForProduct(product);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const navigateToProduct = useCallback(() => {
    navigate(`/product/${product.id}`);
  }, [navigate, product.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToProduct();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 4;
    const rotateX = (0.5 - y / rect.height) * 3;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  // discountPrice is always a number (or undefined) after API normalisation
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;

  const cardContent = (
    <>
      <div className="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 aspect-[3/4] shadow-sm group-hover:shadow-lg transition-shadow duration-500">
        <ImageCarousel images={product.images} />
        {/* Category badge — only shown when the cache has the category */}
        {category && (
          <span className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-md text-[11px] font-medium uppercase tracking-wider text-textMain px-3 py-1 rounded-full opacity-100 transition-opacity duration-300">
            {category.name}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 z-10 bg-brand text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Sale
          </span>
        )}
      </div>
      <div className="flex justify-between items-baseline px-1 gap-2">
        <h3 className="text-sm font-medium text-textMain transition-colors duration-200 truncate">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          {/* formatPrice handles number | string | null safely */}
          <p className="text-sm text-textMain font-medium">
            {formatPrice(displayPrice)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-textLight line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
      onClick={navigateToProduct}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}, ${formatPrice(displayPrice)}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {cardContent}
    </div>
  );
}
