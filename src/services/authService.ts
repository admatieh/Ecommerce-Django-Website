import { apiFetch } from './api';
import { User, LoginCredentials, RegisterCredentials, AuthResponse, Address, Order } from '../types/auth';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const data = await apiFetch<any>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return {
    access: data.access,
    refresh: data.refresh,
  };
};

export const register = async (credentials: RegisterCredentials): Promise<{ message: string }> => {
  return await apiFetch<{ message: string }>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  return await apiFetch<{ message: string }>(`/auth/verify-email/?token=${token}`);
};

export const getCurrentUser = async (): Promise<User> => {
  return await apiFetch<User>('/user/me/');
};

export const getAddresses = async (): Promise<Address[]> => {
  return await apiFetch<Address[]>('/addresses/');
};

export const createAddress = async (address: Partial<Address>): Promise<Address> => {
  return await apiFetch<Address>('/addresses/', {
    method: 'POST',
    body: JSON.stringify(address),
  });
};

export const updateAddress = async (id: number, address: Partial<Address>): Promise<Address> => {
  return await apiFetch<Address>(`/addresses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(address),
  });
};

export const deleteAddress = async (id: number): Promise<void> => {
  await apiFetch<void>(`/addresses/${id}/`, {
    method: 'DELETE',
  });
};

export const getOrders = async (): Promise<Order[]> => {
  return await apiFetch<Order[]>('/orders/');
};

export const getOrder = async (id: number): Promise<Order> => {
  return await apiFetch<Order>(`/orders/${id}/`);
};

export const submitContactMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string }> => {
  return await apiFetch<{ message: string }>('/contact/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
