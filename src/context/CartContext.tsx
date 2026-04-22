import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, CartTotals, Discount } from '../types/product';
import { calculateCartTotals, getPricingConfig, validateCoupon } from '../services/pricingService';

const CART_STORAGE_KEY = 'velora-cart-state-v2';

type StoredCartState = {
  items: CartItem[];
  appliedCouponCode: string;
};

type CouponApplyResult = {
  success: boolean;
  message: string;
};

const normalizeCouponCode = (code: string): string => code.trim().toUpperCase();

const sanitizeCartItems = (value: unknown): CartItem[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is CartItem =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as CartItem).productId === 'number' &&
      typeof (item as CartItem).name === 'string' &&
      typeof (item as CartItem).price === 'number' &&
      typeof (item as CartItem).image === 'string' &&
      typeof (item as CartItem).quantity === 'number' &&
      (item as CartItem).quantity > 0,
  );
};

const readStoredCartState = (): StoredCartState => {
  if (typeof window === 'undefined') return { items: [], appliedCouponCode: '' };

  try {
    const storedState = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedState) return { items: [], appliedCouponCode: '' };

    const parsed = JSON.parse(storedState) as unknown;
    if (typeof parsed !== 'object' || parsed === null) {
      return { items: [], appliedCouponCode: '' };
    }

    const typedParsed = parsed as Partial<StoredCartState>;
    return {
      items: sanitizeCartItems(typedParsed.items),
      appliedCouponCode: typeof typedParsed.appliedCouponCode === 'string'
        ? normalizeCouponCode(typedParsed.appliedCouponCode)
        : '',
    };
  } catch {
    return { items: [], appliedCouponCode: '' };
  }
};

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  cartCount: number;
  cartTotals: CartTotals;
  activeDiscount: Discount | null;
  appliedCouponCode: string;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (productId: number, size: string | undefined, color: string | undefined, quantity: number) => void;
  applyCoupon: (couponCode: string) => CouponApplyResult;
  clearCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const storedState = useMemo(() => readStoredCartState(), []);
  const pricingConfig = useMemo(() => getPricingConfig(), []);
  const [items, setItems] = useState<CartItem[]>(storedState.items);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>(storedState.appliedCouponCode);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  
  // Use central pricing engine for all calculations
  const { totals: cartTotals, activeDiscount } = useMemo(
    () => calculateCartTotals({
      items,
      couponCode: appliedCouponCode,
      discounts: pricingConfig.discounts,
      shippingRules: pricingConfig.shippingRules,
    }),
    [items, appliedCouponCode, pricingConfig]
  );

  const cartTotal = cartTotals.subtotal;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stateToStore: StoredCartState = { items, appliedCouponCode };
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stateToStore));
    } catch {
      // Ignore storage write errors so cart behavior still works in memory.
    }
  }, [items, appliedCouponCode]);

  const isSameItem = (a: CartItem, b: CartItem) => 
    a.productId === b.productId && a.size === b.size && a.color === b.color;

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(item => isSameItem(item, newItem));
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      return [...prevItems, newItem];
    });
    setIsCartOpen(true); // Open drawer on add
  };

  const removeFromCart = (productId: number, size?: string, color?: string) => {
    setItems((prevItems) => prevItems.filter(item => 
      !(item.productId === productId && item.size === size && item.color === color)
    ));
  };

  const updateQuantity = (productId: number, size: string | undefined, color: string | undefined, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, size, color);
      return;
    }
    setItems((prevItems) => prevItems.map(item => 
      item.productId === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    ));
  };

  const applyCoupon = (couponCode: string): CouponApplyResult => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const result = validateCoupon(couponCode, subtotal, pricingConfig.discounts);
    
    if (result.success) {
      setAppliedCouponCode(normalizeCouponCode(couponCode));
    }
    
    return { success: result.success, message: result.message };
  };

  const clearCoupon = () => {
    setAppliedCouponCode('');
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => {
    setItems([]);
    setAppliedCouponCode('');
  };

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen,
      cartCount,
      cartTotals,
      activeDiscount,
      appliedCouponCode,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      clearCoupon,
      openCart,
      closeCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
