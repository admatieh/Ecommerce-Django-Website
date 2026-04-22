import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, CartTotals, Discount } from '../types/product';
import { calculateCartTotals, fetchPricingConfig, getPricingConfig, validateCoupon } from '../services/pricingService';
import type { PricingConfig } from '../services/pricingService';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

type CouponApplyResult = {
  success: boolean;
  message: string;
};

const normalizeCouponCode = (code: string): string => code.trim().toUpperCase();

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
  const { isAuthenticated } = useAuth();
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => getPricingConfig());
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Fetch live pricing config from the API once on mount
  useEffect(() => {
    fetchPricingConfig().then(setPricingConfig).catch(() => {/* keep default */});
  }, []);

  // Fetch cart items when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      apiFetch<CartItem[]>('/cart/')
        .then(setItems)
        .catch(err => console.error("Failed to load cart:", err));
    } else {
      setItems([]);
      setAppliedCouponCode('');
    }
  }, [isAuthenticated]);

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

  const isSameItem = (a: CartItem, b: CartItem) => 
    a.productId === b.productId && a.size === b.size && a.color === b.color;

  const addToCart = async (newItem: CartItem) => {
    if (!isAuthenticated) {
      alert("Please log in to add items to your cart.");
      return;
    }
    
    // Optimistic UI update
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(item => isSameItem(item, newItem));
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      return [...prevItems, newItem];
    });
    setIsCartOpen(true);

    try {
      await apiFetch('/cart/', {
        method: 'POST',
        body: JSON.stringify({
          productId: newItem.productId,
          size: newItem.size || '',
          color: newItem.color || '',
          quantity: newItem.quantity
        })
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      // Re-fetch to sync with server
      apiFetch<CartItem[]>('/cart/').then(setItems);
    }
  };

  const removeFromCart = async (productId: number, size?: string, color?: string) => {
    if (!isAuthenticated) return;

    setItems((prevItems) => prevItems.filter(item => 
      !(item.productId === productId && item.size === size && item.color === color)
    ));

    try {
      await apiFetch('/cart/', {
        method: 'DELETE',
        body: JSON.stringify({ productId, size: size || '', color: color || '' })
      });
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      apiFetch<CartItem[]>('/cart/').then(setItems);
    }
  };

  const updateQuantity = async (productId: number, size: string | undefined, color: string | undefined, quantity: number) => {
    if (!isAuthenticated) return;

    if (quantity < 1) {
      removeFromCart(productId, size, color);
      return;
    }
    setItems((prevItems) => prevItems.map(item => 
      item.productId === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    ));

    try {
      await apiFetch('/cart/', {
        method: 'PUT',
        body: JSON.stringify({ productId, size: size || '', color: color || '', quantity })
      });
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      apiFetch<CartItem[]>('/cart/').then(setItems);
    }
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
  const clearCart = async () => {
    setItems([]);
    setAppliedCouponCode('');
    if (isAuthenticated) {
      try {
        await apiFetch('/cart/', { method: 'DELETE', body: JSON.stringify({}) });
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
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
