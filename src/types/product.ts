// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  featured?: boolean;
  order?: number;
  isActive: boolean;
}

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

export type Discount = {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
  minOrderAmount?: number;
  isActive: boolean;
};

export type ShippingRule = {
  id: string;
  minOrderAmount: number;
  cost: number;
  label: string;
  isActive: boolean;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  hasFreeShipping: boolean;
};

export interface NavLink {
  name: string;
  href: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export type Order = {
  id: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'cod';
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
};

export type ProductFilters = {
  categories: string[];
  priceRange: [number, number] | null;
  inStock: boolean | null;
  search: string;
};

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | '';
