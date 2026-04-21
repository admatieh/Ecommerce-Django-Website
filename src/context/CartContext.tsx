import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { discounts, shippingRules } from '../data/mockData';
import { CartItem, CartTotals, Discount } from '../types/product';

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

const calculateDiscountAmount = (discount: Discount, subtotal: number): number => {
  if (discount.type === 'percentage') {
    return (subtotal * discount.value) / 100;
  }
  return discount.value;
};

const getDiscountForSubtotal = (subtotal: number, couponCode: string): Discount | null => {
  const normalizedCode = normalizeCouponCode(couponCode);

  const eligibleDiscounts = discounts.filter((discount) => {
    if (!discount.isActive) return false;
    if ((discount.minOrderAmount ?? 0) > subtotal) return false;
    if (discount.code) {
      return normalizeCouponCode(discount.code) === normalizedCode;
    }
    return true;
  });

  if (eligibleDiscounts.length === 0) return null;

  return eligibleDiscounts.reduce((bestDiscount, currentDiscount) => {
    const bestAmount = calculateDiscountAmount(bestDiscount, subtotal);
    const currentAmount = calculateDiscountAmount(currentDiscount, subtotal);
    return currentAmount > bestAmount ? currentDiscount : bestDiscount;
  });
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
  const [items, setItems] = useState<CartItem[]>(storedState.items);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>(storedState.appliedCouponCode);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
  const activeDiscount = useMemo(
    () => getDiscountForSubtotal(subtotal, appliedCouponCode),
    [subtotal, appliedCouponCode],
  );

  const discountAmount = useMemo(() => {
    if (!activeDiscount) return 0;
    return Math.min(subtotal, calculateDiscountAmount(activeDiscount, subtotal));
  }, [activeDiscount, subtotal]);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const freeShippingThreshold = useMemo(() => {
    const freeRules = shippingRules
      .filter((rule) => rule.isActive && rule.cost === 0 && rule.minOrderAmount > 0)
      .sort((a, b) => a.minOrderAmount - b.minOrderAmount);
    return freeRules.length > 0 ? freeRules[0].minOrderAmount : 0;
  }, []);

  const shippingCost = useMemo(() => {
    const matchingRule = shippingRules
      .filter((rule) => rule.isActive && discountedSubtotal >= rule.minOrderAmount)
      .sort((a, b) => b.minOrderAmount - a.minOrderAmount)[0];
    return matchingRule ? matchingRule.cost : 0;
  }, [discountedSubtotal]);

  const cartTotals = useMemo<CartTotals>(
    () => ({
      subtotal,
      discount: discountAmount,
      shipping: items.length === 0 ? 0 : shippingCost,
      total: items.length === 0 ? 0 : discountedSubtotal + shippingCost,
      freeShippingThreshold,
      amountToFreeShipping:
        freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - discountedSubtotal) : 0,
      hasFreeShipping: items.length > 0 && shippingCost === 0,
    }),
    [subtotal, discountAmount, items.length, shippingCost, discountedSubtotal, freeShippingThreshold],
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
    const normalizedCode = normalizeCouponCode(couponCode);
    if (!normalizedCode) {
      return { success: false, message: 'Enter a coupon code to apply.' };
    }

    const matchingDiscounts = discounts.filter(
      (discount) => discount.isActive && normalizeCouponCode(discount.code ?? '') === normalizedCode,
    );

    if (matchingDiscounts.length === 0) {
      return { success: false, message: 'Coupon not found or inactive.' };
    }

    const eligibleDiscount = matchingDiscounts.find(
      (discount) => (discount.minOrderAmount ?? 0) <= subtotal,
    );

    if (!eligibleDiscount) {
      const minOrder = Math.min(...matchingDiscounts.map((discount) => discount.minOrderAmount ?? 0));
      const amountNeeded = Math.max(0, minOrder - subtotal);
      return {
        success: false,
        message: `Add $${amountNeeded.toFixed(2)} more to use this code.`,
      };
    }

    setAppliedCouponCode(normalizedCode);
    return { success: true, message: `${eligibleDiscount.name} applied.` };
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