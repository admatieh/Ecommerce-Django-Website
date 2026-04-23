import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types/product';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string | number) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const items = await wishlistService.getWishlist();
      setWishlist(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = useCallback(async (product: Product) => {
    if (!isAuthenticated) return;
    
    const numericId = Number(product.id);
    // Optimistic update
    setWishlist(prev => {
      if (prev.some(p => Number(p.id) === numericId)) return prev;
      return [...prev, { ...product, id: numericId }];
    });

    try {
      await wishlistService.addToWishlist(numericId);
    } catch (err) {
      // Revert on error
      setWishlist(prev => prev.filter(p => Number(p.id) !== numericId));
      throw err;
    }
  }, [isAuthenticated]);

  const removeFromWishlist = useCallback(async (productId: string | number) => {
    if (!isAuthenticated) return;

    const numericId = Number(productId);
    const removedItem = wishlist.find(p => Number(p.id) === numericId);
    
    // Optimistic update
    setWishlist(prev => prev.filter(p => Number(p.id) !== numericId));

    try {
      await wishlistService.removeFromWishlist(numericId);
    } catch (err) {
      // Revert on error
      if (removedItem) {
        setWishlist(prev => [...prev, removedItem]);
      }
      console.error('Failed to remove from wishlist:', err);
      throw err;
    }
  }, [isAuthenticated, wishlist]);

  const isInWishlist = useCallback((productId: string | number) => {
    const numericId = Number(productId);
    return wishlist.some(p => Number(p.id) === numericId);
  }, [wishlist]);

  const value = useMemo(() => ({
    wishlist,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }), [wishlist, isLoading, error, addToWishlist, removeFromWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
