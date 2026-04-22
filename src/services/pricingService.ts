import { CartItem, CartTotals, Discount, ShippingRule } from '../types/product';
import { discounts, shippingRules } from '../data/mockData';

/**
 * Central Pricing Engine
 * Single source of truth for all cart calculations
 * Used by CartContext, CartDrawer, and CheckoutPage
 */

export type PricingInput = {
  items: CartItem[];
  couponCode: string;
  discounts: Discount[];
  shippingRules: ShippingRule[];
};

export type PricingConfig = {
  discounts: Discount[];
  shippingRules: ShippingRule[];
};

export const getPricingConfig = (): PricingConfig => {
  return { discounts, shippingRules };
};

const normalizeCouponCode = (code: string): string => code.trim().toUpperCase();

/**
 * Calculate the discount amount based on discount type
 */
const calculateDiscountAmount = (discount: Discount, subtotal: number): number => {
  if (discount.type === 'percentage') {
    return (subtotal * discount.value) / 100;
  }
  return discount.value;
};

/**
 * Find the best applicable discount for the given subtotal and coupon code
 */
export const getApplicableDiscount = (
  subtotal: number,
  couponCode: string,
  discounts: Discount[]
): Discount | null => {
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

  // Return the discount that gives the best value
  return eligibleDiscounts.reduce((bestDiscount, currentDiscount) => {
    const bestAmount = calculateDiscountAmount(bestDiscount, subtotal);
    const currentAmount = calculateDiscountAmount(currentDiscount, subtotal);
    return currentAmount > bestAmount ? currentDiscount : bestDiscount;
  });
};

/**
 * Get the free shipping threshold from shipping rules
 */
export const getFreeShippingThreshold = (shippingRules: ShippingRule[]): number => {
  const freeRules = shippingRules
    .filter((rule) => rule.isActive && rule.cost === 0 && rule.minOrderAmount > 0)
    .sort((a, b) => a.minOrderAmount - b.minOrderAmount);
  return freeRules.length > 0 ? freeRules[0].minOrderAmount : 0;
};

/**
 * Calculate shipping cost based on discounted subtotal
 */
export const calculateShippingCost = (
  discountedSubtotal: number,
  shippingRules: ShippingRule[]
): number => {
  const matchingRule = shippingRules
    .filter((rule) => rule.isActive && discountedSubtotal >= rule.minOrderAmount)
    .sort((a, b) => b.minOrderAmount - a.minOrderAmount)[0];
  return matchingRule ? matchingRule.cost : 0;
};

/**
 * Central function to calculate all cart totals
 * This is the single source of truth for pricing
 */
export const calculateCartTotals = ({
  items,
  couponCode,
  discounts,
  shippingRules,
}: PricingInput): { totals: CartTotals; activeDiscount: Discount | null } => {
  // Calculate subtotal from items
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Get applicable discount
  const activeDiscount = getApplicableDiscount(subtotal, couponCode, discounts);

  // Calculate discount amount
  const discountAmount = activeDiscount
    ? Math.min(subtotal, calculateDiscountAmount(activeDiscount, subtotal))
    : 0;

  // Calculate discounted subtotal
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Get free shipping threshold
  const freeShippingThreshold = getFreeShippingThreshold(shippingRules);

  // Calculate shipping cost
  const shippingCost = items.length === 0 ? 0 : calculateShippingCost(discountedSubtotal, shippingRules);

  // Calculate amount to free shipping
  const amountToFreeShipping =
    freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - discountedSubtotal) : 0;

  // Build totals object
  const totals: CartTotals = {
    subtotal,
    discount: discountAmount,
    shipping: shippingCost,
    total: items.length === 0 ? 0 : discountedSubtotal + shippingCost,
    freeShippingThreshold,
    amountToFreeShipping,
    hasFreeShipping: items.length > 0 && shippingCost === 0,
  };

  return { totals, activeDiscount };
};

/**
 * Validate a coupon code and return result
 */
export type CouponValidationResult = {
  success: boolean;
  message: string;
  discount?: Discount;
};

export const validateCoupon = (
  couponCode: string,
  subtotal: number,
  discounts: Discount[]
): CouponValidationResult => {
  const normalizedCode = normalizeCouponCode(couponCode);

  if (!normalizedCode) {
    return { success: false, message: 'Enter a coupon code to apply.' };
  }

  const matchingDiscounts = discounts.filter(
    (discount) => discount.isActive && normalizeCouponCode(discount.code ?? '') === normalizedCode
  );

  if (matchingDiscounts.length === 0) {
    return { success: false, message: 'Coupon not found or inactive.' };
  }

  const eligibleDiscount = matchingDiscounts.find(
    (discount) => (discount.minOrderAmount ?? 0) <= subtotal
  );

  if (!eligibleDiscount) {
    const minOrder = Math.min(...matchingDiscounts.map((discount) => discount.minOrderAmount ?? 0));
    const amountNeeded = Math.max(0, minOrder - subtotal);
    return {
      success: false,
      message: `Add $${amountNeeded.toFixed(2)} more to use this code.`,
    };
  }

  return {
    success: true,
    message: `${eligibleDiscount.name} applied.`,
    discount: eligibleDiscount,
  };
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Calculate savings from discount
 */
export const calculateSavings = (discount: Discount, subtotal: number): number => {
  return Math.min(subtotal, calculateDiscountAmount(discount, subtotal));
};
