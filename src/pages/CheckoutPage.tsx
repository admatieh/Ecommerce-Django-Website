import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentMethod: 'credit_card' | 'cod';
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface CheckoutSuccessState {
  email?: string;
  total?: number;
  itemCount?: number;
}

const formatCardNumber = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length <= 2) return digitsOnly;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
};

const isValidExpiry = (expiry: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

  const [monthText, yearText] = expiry.split('/');
  const month = Number(monthText);
  const year = Number(yearText);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
};

export default function CheckoutPage() {
  const {
    items,
    cartTotals,
    activeDiscount,
    appliedCouponCode,
    applyCoupon,
    clearCoupon,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isConfirmationRoute = location.pathname === '/checkout/success';
  const successState = (location.state as CheckoutSuccessState | null) || null;

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState<string>(appliedCouponCode);
  const [couponFeedback, setCouponFeedback] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [totalsPulse, setTotalsPulse] = useState<boolean>(false);
  const lastTotalRef = useRef<number>(cartTotals.total);

  const finalTotal = cartTotals.total;
  const estimatedDelivery = useMemo(() => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      setForm((prev) => ({ ...prev, cardNumber: formatCardNumber(value) }));
      return;
    }

    if (name === 'expiry') {
      setForm((prev) => ({ ...prev, expiry: formatExpiry(value) }));
      return;
    }

    if (name === 'cvv') {
      setForm((prev) => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 4) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    const { fullName, email, phone, address, city, country, paymentMethod, cardNumber, expiry, cvv } = form;

    // Basic required fields
    if (!fullName || !email || !phone || !address || !city || !country) return false;

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) return false;

    if (paymentMethod === 'credit_card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) return false;
      if (!isValidExpiry(expiry)) return false;
      if (cvv.length < 3) return false;
    }

    return true;
  }, [form]);

  const handlePlaceOrder = () => {
    if (!isFormValid || items.length === 0) return;

    setIsSubmitting(true);

    window.setTimeout(() => {
      const orderSnapshot: CheckoutSuccessState = {
        email: form.email,
        total: finalTotal,
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      };

      setIsSubmitting(false);
      clearCart();
      navigate('/checkout/success', {
        replace: true,
        state: orderSnapshot,
      });
    }, 1500);
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

  if (isConfirmationRoute) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex flex-col items-center justify-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-8">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif text-textMain mb-4">Order Confirmed</h1>
        <p className="text-textLight mb-3 text-center max-w-md">
          Thank you for your order. Your pieces are now being prepared with care.
        </p>
        <p className="text-xs uppercase tracking-wider text-textLight mb-8 text-center">
          {successState?.itemCount || 0} {successState?.itemCount === 1 ? 'item' : 'items'}
          {typeof successState?.total === 'number' ? ` · $${successState.total.toFixed(2)}` : ''}
          {successState?.email ? ` · ${successState.email}` : ''}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/collections">
            <Button className="px-8 py-3.5 uppercase tracking-widest text-xs font-semibold bg-textMain text-white">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button className="px-8 py-3.5 uppercase tracking-widest text-xs font-semibold bg-white text-textMain border border-black/10 hover:bg-black/[0.03]">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex flex-col items-center justify-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-black/[0.03] flex items-center justify-center mb-8">
          <ShoppingBag size={32} strokeWidth={1.5} className="text-textLight" />
        </div>
        <h1 className="text-3xl font-serif text-textMain mb-4">Your cart is empty</h1>
        <p className="text-textLight mb-8 text-center max-w-md">
          You need items in your cart to proceed to checkout. Explore our collections and find something you love.
        </p>
        <Link to="/collections">
          <Button className="px-8 py-3.5 uppercase tracking-widest text-xs font-semibold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-24 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-textLight hover:text-textMain transition-colors mb-6 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm"
          >
            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <h1 className="text-4xl font-serif text-textMain">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Left Column: Form */}
          <div className="flex-1 lg:max-w-2xl">

            {/* Section 1: Contact & Shipping */}
            <section className="mb-12">
              <h2 className="text-xl font-serif text-textMain mb-6">Shipping Information</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                    placeholder="123 Fashion Ave, Apt 4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">Country</label>
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="EU">European Union</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-serif text-textMain mb-6">Payment</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <label
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    form.paymentMethod === 'credit_card'
                      ? 'border-textMain bg-black/[0.02]'
                      : 'border-black/10 hover:border-black/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={form.paymentMethod === 'credit_card'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-textMain uppercase tracking-wider">Card</p>
                  <p className="text-xs text-textLight mt-1">Visa, Mastercard, American Express</p>
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    form.paymentMethod === 'cod'
                      ? 'border-textMain bg-black/[0.02]'
                      : 'border-black/10 hover:border-black/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-textMain uppercase tracking-wider">Cash on Delivery</p>
                  <p className="text-xs text-textLight mt-1">Pay when your order arrives</p>
                </label>
              </div>

              {form.paymentMethod === 'credit_card' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="cardNumber" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={form.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="expiry" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">
                        Expiry
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        name="expiry"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={form.expiry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        id="cvv"
                        name="cvv"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={form.cvv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>


            <hr className="border-black/5 mb-12" />
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[420px] shrink-0">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 sticky top-28">
              <h2 className="text-xl font-serif text-textMain mb-6">Order Summary</h2>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3 mb-6">
                <p className="text-xs uppercase tracking-widest text-textMain font-semibold">Secure Checkout</p>
                <p className="text-xs text-textLight mt-1">Estimated delivery by {estimatedDelivery}</p>
                <p className="text-xs text-textLight mt-1">
                  {cartTotals.amountToFreeShipping > 0
                    ? `You're $${cartTotals.amountToFreeShipping.toFixed(2)} away from free shipping.`
                    : 'Free shipping applied.'}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 p-4 mb-6">
                <label htmlFor="checkout-coupon" className="block text-[11px] uppercase tracking-widest text-textLight mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="checkout-coupon"
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
                  <p className={`mt-2 text-xs transition-all duration-300 ${couponApplied ? 'text-brand' : 'text-red-500'}`} role="status">
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

              {/* Items */}
              <div className="max-h-[40vh] overflow-y-auto hide-scrollbar mb-6 pr-2">
                <ul className="flex flex-col gap-5">
                  {items.map((item, index) => (
                    <li key={`${item.productId}-${item.size}-${item.color}-${index}`} className="flex gap-4">
                      <Link
                        to={`/product/${item.productId}`}
                        className="w-16 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.productId}`} className="text-sm font-medium text-textMain truncate mb-1 block">
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="text-[11px] text-textLight uppercase tracking-wide mb-1">
                            {item.color}{item.color && item.size && ' · '}{item.size}
                          </p>
                        )}
                        <p className="text-xs text-textLight">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-textMain whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-black/5 mb-6" />

              {/* Totals */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textLight">Subtotal</span>
                  <span className="font-medium text-textMain">${cartTotals.subtotal.toFixed(2)}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-brand">Discount {activeDiscount ? `(${activeDiscount.name})` : ''}</span>
                    <span className="font-medium text-brand">-${cartTotals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textLight">Shipping</span>
                  <span className="font-medium text-textMain">
                    {cartTotals.shipping === 0 ? 'Free' : `$${cartTotals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                  <span className="text-base font-semibold uppercase tracking-widest text-textMain">Total</span>
                  <span
                    className={`text-2xl font-serif text-textMain transition-all duration-300 ${totalsPulse ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}
                  >
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              {cartTotals.discount > 0 && (
                <p className="text-xs text-brand mb-6">You are saving ${cartTotals.discount.toFixed(2)} on this order.</p>
              )}

              {/* Action */}
              <Button
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                disabled={!isFormValid || items.length === 0}
                className={`w-full py-4 text-sm tracking-widest uppercase font-semibold ${isFormValid && items.length > 0 ? 'bg-brand hover:opacity-90 text-white' : 'bg-black/10 text-textLight hover:bg-black/10 cursor-not-allowed'
                  }`}
              >
                Place Order
              </Button>
              {!isFormValid && items.length > 0 && (
                <p className="text-center text-[11px] text-textLight mt-4 uppercase tracking-widest">
                  Please complete shipping and payment details
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}