import { useState, useEffect, useCallback } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, CartItem } from '../types/product';
import { categories } from '../data/mockData';
import Button from './Button';
import ImageCarousel from './ImageCarousel';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const categoryName = categories.find((category) => category.id === product.categoryId)?.name;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
      setIsClosing(false);
      setIsAdding(false);
      setIsAdded(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  const needsSize = product.sizes && product.sizes.length > 0;
  const needsColor = product.colors && product.colors.length > 0;
  const canAddToCart = (!needsSize || selectedSize) && (!needsColor || selectedColor) && quantity > 0;

  const handleAddToCart = () => {
    if (!canAddToCart || isAdding || isAdded) return;

    setIsAdding(true);

    setTimeout(() => {
      const item: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity,
      };

      addToCart(item);
      setIsAdding(false);
      setIsAdded(true);

      setTimeout(() => {
        handleClose();
      }, 600);
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-400 ease-out transform max-h-[90vh] ${isOpen && !isClosing ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-textMain hover:bg-black/5 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Scrollable container for mobile; side-by-side for desktop */}
        <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden hide-scrollbar">
          {/* Image Side */}
          <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:h-[600px] bg-gray-100 relative shrink-0">
            <ImageCarousel images={product.images?.length ? product.images : [product.image]} />
          </div>

          {/* Details Side */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center md:overflow-y-auto hide-scrollbar">
            {categoryName && (
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand mb-2 sm:mb-3 block">
                {categoryName}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-textMain mb-1 sm:mb-2">{product.name}</h2>
            <p className="text-lg sm:text-xl text-textLight mb-5 sm:mb-8 font-medium">
              ${product.price.toFixed(2)}
            </p>

            {/* Colors */}
            {needsColor && (
              <div className="mb-5 sm:mb-6">
                <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-textMain">Color</span>
                  <span className="text-[11px] sm:text-xs text-textLight">{selectedColor || 'Select'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors?.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-sm transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${selectedColor === color
                          ? 'border-textMain bg-textMain text-white scale-[1.02]'
                          : 'border-black/10 bg-white text-textMain hover:border-black/25 active:scale-95'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {needsSize && (
              <div className="mb-5 sm:mb-8">
                <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-textMain">Size</span>
                  <button className="text-[11px] sm:text-xs text-textLight underline underline-offset-4 tracking-wide hover:text-textMain transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 sm:w-12 h-11 sm:h-12 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${selectedSize === size
                          ? 'border-textMain bg-textMain text-white scale-[1.05]'
                          : 'border-black/10 bg-white text-textMain hover:border-black/25 active:scale-95'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6 sm:mb-8 w-full sm:w-36">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-textMain block mb-2.5 sm:mb-3">Quantity</span>
              <div className="flex items-center justify-between border border-black/10 rounded-full w-32 sm:w-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90 rounded-full"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} className="sm:w-4 sm:h-4" />
                </button>
                <span className="text-sm font-medium text-textMain w-6 sm:w-8 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90 rounded-full"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Action */}
            <Button
              onClick={handleAddToCart}
              isLoading={isAdding}
              isSuccess={isAdded}
              disabled={!canAddToCart}
              className={`w-full py-3.5 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold ${canAddToCart
                  ? 'bg-brand hover:opacity-90'
                  : 'bg-black/10 text-textLight hover:bg-black/10'
                }`}
            >
              <ShoppingBag size={16} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
              {canAddToCart ? 'Add to Cart' : 'Select Options'}
            </Button>
            <Link
              to={`/product/${product.id}`}
              onClick={handleClose}
              className="mt-3 inline-flex justify-center text-xs sm:text-sm text-textLight hover:text-textMain underline underline-offset-4 transition-colors"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}