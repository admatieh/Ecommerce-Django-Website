import { Order, OrderItem, ShippingAddress, CartTotals } from '../types/product';

const MOCK_API_DELAY_MS = 1200;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VEL-${timestamp}-${random}`;
};

const calculateEstimatedDelivery = (): string => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  return deliveryDate.toISOString();
};

export type CreateOrderParams = {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'cod';
  totals: CartTotals;
};

export const createOrder = async (params: CreateOrderParams): Promise<Order> => {
  await delay(MOCK_API_DELAY_MS);

  const order: Order = {
    id: generateOrderId(),
    items: params.items,
    shippingAddress: params.shippingAddress,
    paymentMethod: params.paymentMethod,
    subtotal: params.totals.subtotal,
    discount: params.totals.discount,
    shipping: params.totals.shipping,
    total: params.totals.total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    estimatedDelivery: calculateEstimatedDelivery(),
  };

  return order;
};

export const formatEstimatedDelivery = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
