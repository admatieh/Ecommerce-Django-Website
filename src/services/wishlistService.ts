import { apiFetch } from './api';
import { Product } from '../types/product';

export const wishlistService = {
  getWishlist: async (): Promise<Product[]> => {
    return apiFetch<Product[]>('/wishlist/');
  },

  addToWishlist: async (productId: string | number): Promise<{ success: boolean; created: boolean }> => {
    return apiFetch<{ success: boolean; created: boolean }>('/wishlist/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  removeFromWishlist: async (productId: string | number): Promise<void> => {
    return apiFetch<void>(`/wishlist/${productId}/`, {
      method: 'DELETE',
    });
  },

  checkStatus: async (productId: string | number): Promise<{ isInWishlist: boolean }> => {
    return apiFetch<{ isInWishlist: boolean }>(`/wishlist/status/${productId}/`);
  }
};
