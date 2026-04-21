import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Button from './Button';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    items,
    updateQuantity,
    removeFromCart,
    cartTotals,
    activeDiscount,
    appliedCouponCode,
    applyCoupon,
    clearCoupon,
  } = useCart();
  const [visible, setVisible] = useState<boolean>(isCartOpen);
  const [updatedItemKey, setUpdatedItemKey] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState<string>(appliedCouponCode);
  const [couponFeedback, setCouponFeedback] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [totalsPulse, setTotalsPulse] = useState<boolean>(false);
  const lastTotalRef = useRef<number>(cartTotals.total);
  const navigate = useNavigate();
  const shippingProgress = cartTotals.freeShippingThreshold > 0
    ? Math.min(
      100,
      Math.round(
        ((cartTotals.freeShippingThreshold - cartTotals.amountToFreeShipping) / cartTotals.freeShippingThreshold) * 100,
      ),
    )
    : 100;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isCartOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  useEffect(() => {
    if (!isCartOpen) {
      const timer = window.setTimeout(() => setVisible(false), 300);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isCartOpen]);

  useEffect(() => {
    setCouponInput(appliedCouponCode);
  }, [appliedCouponCode]);

  useEffect(() => {
    if (lastTotalRef.current === cartTotals.total) return;

    setTotalsPulse(true);
    const timer = window.setTimeout(() => setTotalsPulse(false), 320);
    lastTotalRef.current = cartTotals.total;
    return () => window.clearTimeout(timer);
  }, [cartTotals.total]);

  const shouldRender = isCartOpen || visible;

  const highlightUpdatedItem = (itemKey: string) => {
    setUpdatedItemKey(itemKey);
    window.setTimeout(() => {
      setUpdatedItemKey((prev) => (prev === itemKey ? null : prev));
    }, 220);
  };

  const handleQuantityChange = (
    productId: number,
    size: string | undefined,
    color: string | undefined,
    quantity: number,
  ) => {
    highlightUpdatedItem(`${productId}-${size}-${color}`);
    updateQuantity(productId, size, color, quantity);
  };

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput);
    setCouponFeedback(result.message);
    setCouponApplied(result.success);
  };

  const handleClearCoupon = () => {
    clearCoupon();
    setCouponInput('');
    setCouponApplied(false);
    setCouponFeedback('Coupon removed.');
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex justify-end ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 sm:px-6 py-5 sm:py-6 shrink-0">
          <h2 className="text-2xl font-serif text-textMain tracking-wide">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-black/5 rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            aria-label="Close cart"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 sm:px-6 py-5 sm:py-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mb-6">
                <ShoppingBag size={24} strokeWidth={1.5} className="text-textLight" />
              </div>
              <p className="text-textMain font-serif text-lg mb-2">Your cart is empty</p>
              <p className="text-textLight text-sm mb-8">Discover our collections and find something you love.</p>
              <Button
                onClick={() => {
                  closeCart();
                  navigate('/collections');
                }}
                className="bg-textMain text-white px-8 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-black/80"
              >
                Continue Shopping
              </Button>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/search');
                }}
                className="text-xs text-textLight uppercase tracking-widest mt-4 hover:text-textMain transition-colors"
              >
                Search Products
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {items.map((item, index) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className={`flex gap-4 group opacity-0 animate-fade-in-up transition-colors duration-200 rounded-xl ${
                    updatedItemKey === `${item.productId}-${item.size}-${item.color}` ? 'bg-black/[0.03]' : ''
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Link
                    to={`/product/${item.productId}`}
                    className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 bg-gray-100 overflow-hidden relative rounded-xl"
                    onClick={closeCart}
                    aria-label={`View ${item.name}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-textMain leading-tight transition-colors group-hover:text-brand truncate block"
                        >
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="text-xs text-textLight mt-1 uppercase tracking-wide">
                            {item.color}{item.color && item.size && ' · '}{item.size}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-textMain whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-black/10 rounded-full bg-white">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90 rounded-full"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium text-textMain w-6 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-textLight hover:text-textMain transition-colors active:scale-90 rounded-full"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-xs text-textLight hover:text-red-500 transition-all duration-200 flex items-center tracking-wide uppercase active:scale-95 p-1"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={14} className="mr-1" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 sm:px-6 pt-5 pb-6 border-t border-black/5 shrink-0 bg-white">
            <div className="mb-5 rounded-2xl bg-black/[0.03] px-4 py-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest mb-2">
                <span className="text-textLight">Free Shipping</span>
                <span className="text-textMain font-semibold">{shippingProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-textLight">
                {cartTotals.amountToFreeShipping > 0
                  ? `You're $${cartTotals.amountToFreeShipping.toFixed(2)} away from free shipping.`
                  : 'Free shipping applied.'}
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-black/10 p-3.5">
              <label htmlFor="drawer-coupon" className="block text-[11px] uppercase tracking-widest text-textLight mb-2">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  id="drawer-coupon"
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="RUNWAY15"
                  className="min-w-0 flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="rounded-full bg-textMain px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                >
                  Apply
                </button>
              </div>
              {couponFeedback && (
                <p
                  className={`mt-2 text-xs transition-all duration-300 ${couponApplied ? 'text-brand' : 'text-red-500'}`}
                  role="status"
                >
                  {couponFeedback}
                </p>
              )}
              {appliedCouponCode && (
                <button
                  onClick={handleClearCoupon}
                  className="mt-2 text-[11px] uppercase tracking-widest text-textLight transition-colors hover:text-textMain"
                >
                  Remove coupon
                </button>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-textLight">Subtotal</span>
                <span className="font-medium text-textMain">${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand">
                    Discount {activeDiscount ? `(${activeDiscount.name})` : ''}
                  </span>
                  <span className="font-medium text-brand">-${cartTotals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-textLight">Shipping</span>
                <span className="font-medium text-textMain">
                  {cartTotals.shipping === 0 ? 'Free' : `$${cartTotals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-black/5">
                <span className="text-sm font-semibold uppercase tracking-widest text-textMain">Total</span>
                <span
                  className={`text-xl font-serif text-textMain transition-all duration-300 ${totalsPulse ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}
                >
                  ${cartTotals.total.toFixed(2)}
                </span>
              </div>
            </div>
            {cartTotals.discount > 0 && (
              <p className="text-xs text-brand mb-5">You are saving ${cartTotals.discount.toFixed(2)} on this order.</p>
            )}
            {cartTotals.discount === 0 && (
              <p className="text-xs text-textLight mb-5">Shipping and taxes calculated at checkout.</p>
            )}
            <Button
              onClick={() => {
                closeCart();
                navigate('/checkout');
              }}
              className="w-full py-4 text-sm tracking-widest uppercase font-semibold bg-textMain text-white hover:bg-black/80 transition-all duration-200 active:scale-[0.98]"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}