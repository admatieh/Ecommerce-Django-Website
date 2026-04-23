/**
 * src/services/categoryService.ts
 *
 * Fetches category data from the Django REST API.
 * Signatures match the original mock service exactly.
 *
 * API endpoints consumed:
 *   GET /api/categories/     – list active categories
 *   GET /api/categories/<id>/ – single category
 *
 * Category cache:
 *   A module-level cache is updated on every successful fetch.
 *   This allows synchronous category lookup by ID/slug from anywhere
 *   in the app (e.g. ProductCard) without threading the categories
 *   array through every component tree.
 */

import { Category } from '../types/product';
import { apiFetch } from './api';

// ---------------------------------------------------------------------------
// Module-level cache — updated on every successful fetch
// ---------------------------------------------------------------------------
let _categoryCache: Category[] = [];

/** Synchronously returns the most recently fetched category list.
 *  Returns [] before the first successful fetch completes. */
export const getCachedCategories = (): Category[] => _categoryCache;

/** Synchronously look up a category by product's categoryId.
 *  Returns null if not found or cache is not yet populated. */
export const getCategoryById = (categoryId: number): Category | null =>
  _categoryCache.find((c) => c.id === categoryId) ?? null;

// ---------------------------------------------------------------------------
// Async data loaders
// ---------------------------------------------------------------------------

/** Fetch all active categories and update the cache. */
export const getCategories = async (): Promise<Category[]> => {
  const data = await apiFetch<Category[]>('/categories/');
  _categoryCache = data;   // keep cache in sync
  return data;
};

/** Fetch multiple categories by their IDs (preserves order). */
export const getCategoriesByIds = async (categoryIds: number[]): Promise<Category[]> => {
  if (categoryIds.length === 0) return [];
  // Ensure the cache is populated first
  const all = _categoryCache.length > 0 ? _categoryCache : await getCategories();
  return categoryIds
    .map((id) => all.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c));
};
