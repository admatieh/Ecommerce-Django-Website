import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, AlertCircle, Check, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, formatEstimatedDelivery } from '../services/orderService';
import { getAddresses } from '../services/authService';
import { Order, ShippingAddress, OrderItem } from '../types/product';
import { Address } from '../types/auth';
import Button from '../components/Button';

type PaymentMethod = 'cod' | 'card';

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentMethod: PaymentMethod;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface CheckoutSuccessState {
  order?: Order;
}

const validateEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);

function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  ...props
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-textMain focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
          error ? 'border-red-300 focus:ring-red-200' : 'border-black/10 focus:ring-brand/40'
        }`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

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
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState<string>(appliedCouponCode);
  const [couponFeedback, setCouponFeedback] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [totalsPulse, setTotalsPulse] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const lastTotalRef = useRef<number>(cartTotals.total);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');

  useEffect(() => {
    getAddresses().then(data => {
      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault) || data[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setForm(prev => ({
          ...prev,
          fullName: defaultAddr.fullName,
          phone: defaultAddr.phone,
          address: defaultAddr.addressLine,
          city: defaultAddr.city,
          country: defaultAddr.country
        }));
      }
    }).catch(console.error);
  }, []);

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      setSelectedAddressId('new');
      setForm(prev => ({
        ...prev,
        fullName: '', phone: '', address: '', city: '', country: ''
      }));
    } else {
      const id = parseInt(val, 10);
      setSelectedAddressId(id);
      const addr = addresses.find(a => a.id === id);
      if (addr) {
        setForm(prev => ({
          ...prev,
          fullName: addr.fullName,
          phone: addr.phone,
          address: addr.addressLine,
          city: addr.city,
          country: addr.country
        }));
      }
    }
  };

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

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.country) newErrors.country = 'Country is required';

    return newErrors;
  };

  const isFormValid = useMemo(() => {
    return Object.keys(validateForm()).length === 0 && form.paymentMethod === 'cod';
  }, [form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    const newErrors = validateForm();
    setErrors(newErrors);
  };

  const handlePlaceOrder = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched(new Set(Object.keys(form)));

    if (Object.keys(formErrors).length > 0 || items.length === 0 || form.paymentMethod !== 'cod') return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const shippingAddress: ShippingAddress = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
      };

      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

      const order = await createOrder({
        items: orderItems,
        shippingAddress,
        paymentMethod: 'cod',
        totals: cartTotals,
      });

      clearCart();
      navigate('/checkout/success', {
        replace: true,
        state: { order } as CheckoutSuccessState,
      });
    } catch {
      setSubmitError('We could not place your order right now. Please try again.');
      setIsSubmitting(false);
    }
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
    const order = successState?.order;
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex flex-col items-center justify-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-8">
          <Check size={40} strokeWidth={2} />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-textMain mb-4 text-center">Order Confirmed</h1>
        <p className="text-textLight mb-3 text-center max-w-md">
          Thank you for your order. Your pieces are now being prepared with care.
        </p>
        {order && (
          <div className="bg-white rounded-2xl p-6 mb-8 max-w-sm w-full border border-black/5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-black/5">
              <span className="text-xs uppercase tracking-widest text-textLight">Order ID</span>
              <span className="text-sm font-medium text-textMain">{order.id}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-textLight">Items</span>
                <span className="text-textMain">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textLight">Total</span>
                <span className="font-medium text-textMain">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textLight">Payment</span>
                <span className="text-textMain">Cash on Delivery</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textLight">Delivery by</span>
                <span className="text-textMain">{formatEstimatedDelivery(order.estimatedDelivery)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/5">
              <p className="text-xs text-textLight">
                Confirmation sent to <span className="text-textMain">{order.shippingAddress.email}</span>
              </p>
            </div>
          </div>
        )}
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
          <div className="flex-1 lg:max-w-2xl">
            <section className="mb-12">
              <h2 className="text-xl font-serif text-textMain mb-6">Shipping Information</h2>
              {addresses.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="savedAddress" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">
                    Saved Addresses
                  </label>
                  <select
                    id="savedAddress"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all appearance-none"
                  >
                    <option value="new">Enter new address...</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.fullName} - {addr.addressLine}, {addr.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField
                    id="fullName"
                    label="Full Name"
                    value={form.fullName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Jane Doe"
                    error={touched.has('fullName') ? errors.fullName : undefined}
                  />
                  <InputField
                    id="phone"
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+1 (555) 000-0000"
                    error={touched.has('phone') ? errors.phone : undefined}
                  />
                </div>

                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="jane@example.com"
                  error={touched.has('email') ? errors.email : undefined}
                />

                <InputField
                  id="address"
                  label="Address"
                  value={form.address}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('address')}
                  placeholder="123 Fashion Ave, Apt 4"
                  error={touched.has('address') ? errors.address : undefined}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField
                    id="city"
                    label="City"
                    value={form.city}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('city')}
                    placeholder="New York"
                    error={touched.has('city') ? errors.city : undefined}
                  />
                  <div>
                    <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-widest text-textMain mb-2">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('country')}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-textMain focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none ${
                        touched.has('country') && errors.country ? 'border-red-300 focus:ring-red-200' : 'border-black/10 focus:ring-brand/40'
                      }`}
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="EU">European Union</option>
                    </select>
                    {touched.has('country') && errors.country && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-serif text-textMain mb-6">Payment Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery Option */}
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    form.paymentMethod === 'cod'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
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
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      form.paymentMethod === 'cod' ? 'bg-brand text-white' : 'bg-black/5 text-textLight'
                    }`}>
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-textMain">Cash on Delivery</p>
                      <p className="text-xs text-textLight mt-1">Pay when your order arrives</p>
                    </div>
                  </div>
                </label>

                {/* Card Payment Option (Coming Soon) */}
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden ${
                    form.paymentMethod === 'card'
                      ? 'border-textMain/30 bg-black/[0.02]'
                      : 'border-black/10 hover:border-black/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={form.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      form.paymentMethod === 'card' ? 'bg-textMain/20 text-textMain' : 'bg-black/5 text-textLight'
                    }`}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-textMain flex items-center gap-2">
                        Pay with Card
                        <span className="text-[10px] font-medium uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      </p>
                      <p className="text-xs text-textLight mt-1">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Card Payment Coming Soon Message */}
              {form.paymentMethod === 'card' && (
                <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200/50">
                  <p className="text-sm text-amber-800 font-medium mb-1">Online payments coming soon</p>
                  <p className="text-xs text-amber-700">
                    We&apos;re working on secure card payments. For now, please select Cash on Delivery to complete your order.
                  </p>
                </div>
              )}
            </section>

            <hr className="border-black/5 mb-12" />
          </div>

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
                <div className="mt-2 min-h-[18px]">
                  {couponFeedback && (
                    <p className={`text-xs transition-all duration-300 ${couponApplied ? 'text-brand' : 'text-red-500'}`} role="status">
                      {couponFeedback}
                    </p>
                  )}
                </div>
                {appliedCouponCode && (
                  <button
                    onClick={handleClearCoupon}
                    className="mt-2 text-[11px] uppercase tracking-widest text-textLight transition-colors hover:text-textMain"
                  >
                    Remove coupon
                  </button>
                )}
              </div>

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
                            {item.color}{item.color && item.size && ' / '}{item.size}
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
                    className={`text-2xl font-serif text-textMain tabular-nums transition-all duration-300 ${totalsPulse ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}
                  >
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="min-h-[20px] mb-6">
                {cartTotals.discount > 0 && (
                  <p className="text-xs text-brand">You are saving ${cartTotals.discount.toFixed(2)} on this order.</p>
                )}
              </div>

              <Button
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                disabled={!isFormValid || items.length === 0}
                className={`w-full py-4 text-sm tracking-widest uppercase font-semibold ${
                  isFormValid && items.length > 0 
                    ? 'bg-brand hover:opacity-90 text-white' 
                    : 'bg-black/10 text-textLight hover:bg-black/10 cursor-not-allowed'
                }`}
              >
                {form.paymentMethod === 'cod' ? 'Place Order' : 'Select Payment Method'}
              </Button>
              {form.paymentMethod === 'card' && (
                <p className="text-center text-[11px] text-amber-600 mt-4 uppercase tracking-widest">
                  Card payments not yet available
                </p>
              )}
              {!isFormValid && form.paymentMethod === 'cod' && items.length > 0 && (
                <p className="text-center text-[11px] text-textLight mt-4 uppercase tracking-widest">
                  Please complete shipping details
                </p>
              )}
              {submitError && (
                <p className="text-center text-xs text-red-500 mt-3" role="status">
                  {submitError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
