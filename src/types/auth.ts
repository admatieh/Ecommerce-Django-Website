export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isEmailVerified: boolean;
};

export type AuthResponse = {
  access: string;
  refresh: string;
};

export type LoginCredentials = {
  email: string;
  password?: string;
};

export type RegisterCredentials = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type Address = {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  isDefault: boolean;
};

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

export type Order = {
  id: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string;
  estimatedDelivery: string | null;
};
