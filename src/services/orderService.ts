import { apiFetch } from './api';
import { Order, OrderItem, ShippingAddress, CartTotals } from '../types/product';

export type CreateOrderParams = {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'cod';
  totals: CartTotals;
};

export const createOrder = async (params: CreateOrderParams): Promise<Order> => {
  const payload = {
    shippingAddress: params.shippingAddress,
    paymentMethod: params.paymentMethod,
    subtotal: params.totals.subtotal,
    discount: params.totals.discount,
    shipping: params.totals.shipping,
    total: params.totals.total,
  };
  return await apiFetch<Order>('/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const formatEstimatedDelivery = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
