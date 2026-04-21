import { useEffect, useMemo, useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ImageCarousel from '../components/ImageCarousel';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { categories, products } from '../data/mockData';

export default function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const product = products.find((item) => item.id === productId);
  const productCategory = product ? categories.find((category) => category.id === product.categoryId) : undefined;
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes?.[0] || null);
    setSelectedColor(product.colors?.[0] || null);
    setQuantity(1);
    setIsAdding(false);
    setIsAdded(false);
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const sameCategory = products.filter(
      (item) => item.id !== product.id && item.categoryId === product.categoryId,
    );
    const fallback = products.filter((item) => item.id !== product.id);

    return [...sameCategory, ...fallback].slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center animate-fade-in-up">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-textMain mb-4">Product Not Found</h1>
          <p className="text-textLight mb-8">
            The product you are looking for is no longer available or has moved.
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-textMain text-white text-xs font-semibold uppercase tracking-widest hover:bg-black/80 transition-all duration-200 active:scale-[0.98]"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const needsSize = !!product.sizes?.length;
  const needsColor = !!product.colors?.length;
  const canAddToCart = (!needsSize || !!selectedSize) && (!needsColor || !!selectedColor) && quantity > 0;

  const handleAddToCart = () => {
    if (!canAddToCart || isAdding || isAdded) return;

    setIsAdding(true);
    window.setTimeout(() => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity,
      });
      setIsAdding(false);
      setIsAdded(true);
      window.setTimeout(() => setIsAdded(false), 1000);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 pb-32 md:pb-24 px-6 lg:px-12 animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <nav className="text-xs uppercase tracking-wider text-textLight mb-8 sm:mb-10 flex items-center gap-2">
          <Link to="/collections" className="hover:text-textMain transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-textMain">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start mb-20">
          <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-[4/5] md:sticky md:top-28">
            <ImageCarousel images={product.images} />
          </div>

          <div>
            {productCategory && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-3">{productCategory.name}</p>
            )}
            <h1 className="text-3xl sm:text-4xl font-serif text-textMain mb-3">{product.name}</h1>
            <p className="text-2xl font-serif text-textMain mb-6">${product.price.toFixed(2)}</p>
            <p className="text-sm sm:text-base text-textLight leading-relaxed mb-8 max-w-xl">
              {product.description ||
                'Tailored for modern wardrobes, this piece blends premium fabric, clean structure, and timeless styling for day-to-evening wear.'}
            </p>

            {needsColor && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-textMain">Color</p>
                  <p className="text-xs text-textLight">{selectedColor}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors?.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                        selectedColor === color
                          ? 'border-textMain bg-textMain text-white'
                          : 'border-black/10 text-textMain hover:border-black/25'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsSize && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-textMain mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-full border text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                        selectedSize === size
                          ? 'border-textMain bg-textMain text-white'
                          : 'border-black/10 text-textMain hover:border-black/25'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 w-36">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-textMain mb-3">Quantity</p>
              <div className="flex items-center justify-between border border-black/10 rounded-full">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm font-medium text-textMain w-8 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="hidden md:flex gap-3">
              <Button
                onClick={handleAddToCart}
                isLoading={isAdding}
                isSuccess={isAdded}
                disabled={!canAddToCart}
                className={`flex-1 py-4 uppercase tracking-widest text-xs font-semibold ${
                  canAddToCart ? 'bg-brand text-white hover:opacity-90' : 'bg-black/10 text-textLight hover:bg-black/10'
                }`}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </Button>
              <button
                onClick={() => setIsWishlisted((prev) => !prev)}
                className={`px-5 rounded-full border text-sm transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  isWishlisted
                    ? 'border-textMain bg-textMain text-white'
                    : 'border-black/10 text-textMain hover:border-black/25'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                Wishlist
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif text-textMain">Related Pieces</h2>
              <Link to="/collections" className="text-sm text-brand font-medium hover:opacity-70 transition-opacity">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 md:hidden bg-white/95 backdrop-blur-md border-t border-black/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-textLight">{product.name}</p>
            <p className="text-lg font-serif text-textMain">${product.price.toFixed(2)}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            isLoading={isAdding}
            isSuccess={isAdded}
            disabled={!canAddToCart}
            className={`ml-auto px-6 py-3 text-xs uppercase tracking-widest font-semibold ${
              canAddToCart ? 'bg-brand text-white hover:opacity-90' : 'bg-black/10 text-textLight hover:bg-black/10'
            }`}
          >
            <ShoppingBag size={16} />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
