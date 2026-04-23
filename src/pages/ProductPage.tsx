import { useEffect, useState, useCallback } from 'react';
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductById, getRelatedProducts, getCategoryForProduct } from '../services/productService';
import { formatPrice } from '../utils/format';
import { Product, Category } from '../types/product';

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 pb-32 md:pb-24 px-6 lg:px-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="h-4 w-40 bg-black/5 rounded-full mb-8 sm:mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start mb-20">
          <div className="bg-black/[0.03] rounded-3xl aspect-[4/5] animate-pulse" />
          <div className="space-y-6">
            <div className="h-4 w-20 bg-black/5 rounded-full" />
            <div className="h-10 w-3/4 bg-black/5 rounded-lg" />
            <div className="h-8 w-28 bg-black/5 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-black/5 rounded-full" />
              <div className="h-4 w-5/6 bg-black/5 rounded-full" />
              <div className="h-4 w-4/6 bg-black/5 rounded-full" />
            </div>
            <div className="pt-4 space-y-4">
              <div className="h-4 w-16 bg-black/5 rounded-full" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-20 bg-black/5 rounded-full" />
                ))}
              </div>
            </div>
            <div className="pt-4 space-y-4">
              <div className="h-4 w-12 bg-black/5 rounded-full" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-11 w-11 bg-black/5 rounded-full" />
                ))}
              </div>
            </div>
            <div className="pt-6 flex gap-3">
              <div className="h-14 flex-1 bg-black/5 rounded-full" />
              <div className="h-14 w-32 bg-black/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl bg-gray-100 aspect-[4/5] group">
        <div
          className="flex transition-transform duration-500 ease-out h-full w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={img} className="relative w-full h-full shrink-0 bg-gray-100">
              <img
                src={img}
                alt={`Product image ${idx + 1}`}
                onLoad={() => handleImageLoad(idx)}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${
                  loadedImages.has(idx) ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!loadedImages.has(idx) && (
                <div className="absolute inset-0 animate-pulse bg-black/[0.03]" />
              )}
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-textMain hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-textMain hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                currentIndex === idx
                  ? 'ring-2 ring-textMain ring-offset-2 ring-offset-background'
                  : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const [fetchedProduct, fetchedRelated] = await Promise.all([
          getProductById(productId),
          getRelatedProducts(productId, 4),
        ]);

        if (!isMounted) return;

        setProduct(fetchedProduct);
        setRelatedProducts(fetchedRelated);

        if (fetchedProduct) {
          setCategory(getCategoryForProduct(fetchedProduct));
          setSelectedSize(fetchedProduct.sizes?.[0] || null);
          setSelectedColor(fetchedProduct.colors?.[0] || null);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('We could not load this product right now. Please retry.');
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setQuantity(1);
          setIsAdding(false);
          setIsAdded(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center animate-fade-in-up">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-textMain mb-4">Unable to Load Product</h1>
          <p className="text-textLight mb-8">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-textMain text-white text-xs font-semibold uppercase tracking-widest hover:bg-black/80 transition-all duration-200 active:scale-[0.98]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = () => {
    if (!canAddToCart || isAdding || isAdded) return;

    setIsAdding(true);
    window.setTimeout(() => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: product.images[0] || '',
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity,
      });
      setIsAdding(false);
      setIsAdded(true);
      window.setTimeout(() => setIsAdded(false), 1200);
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
          {category && (
            <>
              <Link
                to={`/collections?category=${category.slug}`}
                className="hover:text-textMain transition-colors"
              >
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-textMain truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start mb-20">
          <div className="md:sticky md:top-28">
            <ImageGallery images={product.images} />
          </div>

          <div>
            {category && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-3">
                {category.name}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-serif text-textMain mb-3">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-2xl font-serif text-textMain">{formatPrice(displayPrice)}</p>
              {hasDiscount && (
                <p className="text-lg text-textLight line-through">{formatPrice(product.price)}</p>
              )}
              {hasDiscount && (
                <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                  Save {formatPrice(product.price - product.discountPrice!)}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-textLight leading-relaxed mb-8 max-w-xl">
              {product.description}
            </p>

            {needsColor && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-textMain">
                    Color <span className="text-brand">*</span>
                  </p>
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
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-textMain mb-3">
                  Size <span className="text-brand">*</span>
                </p>
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
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  className="w-10 h-10 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-xs text-brand mt-2">Only {product.stock} left in stock</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:sticky md:top-[calc(100vh-11rem)] gap-3 bg-background/95 backdrop-blur-sm md:border border-black/5 rounded-2xl md:p-3 mt-6 md:mt-0">
              <Button
                onClick={handleAddToCart}
                isLoading={isAdding}
                isSuccess={isAdded}
                disabled={!canAddToCart}
                className={`flex-1 py-4 uppercase tracking-widest text-xs font-semibold w-full ${
                  canAddToCart ? 'bg-brand text-white hover:opacity-90' : 'bg-black/10 text-textLight hover:bg-black/10'
                }`}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </Button>
              <button
                onClick={() => {
                  if (product) {
                    if (isWishlisted) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }
                }}
                className={`px-5 py-4 sm:py-0 rounded-xl sm:rounded-full border text-sm transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
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
            {!canAddToCart && (needsSize || needsColor) && (
              <p className="text-xs text-textLight mt-3">
                Select {needsColor ? 'a color' : ''}{needsColor && needsSize ? ' and ' : ''}{needsSize ? 'a size' : ''} to continue.
              </p>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif text-textMain">You May Also Like</h2>
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

    </div>
  );
}
