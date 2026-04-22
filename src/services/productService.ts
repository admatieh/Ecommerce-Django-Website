/**
 * src/services/productService.ts
 *
 * Fetches product data from the Django REST API.
 * All functions match the original mock signatures exactly — no
 * call-site changes needed in pages or components.
 *
 * API endpoints consumed:
 *   GET /api/products/                       – list (with filters)
 *   GET /api/products/<id>/                  – detail
 *   GET /api/products/<id>/related/?limit=4  – related
 */

import { Product, Category, ProductFilters, SortOption } from '../types/product';
import { apiFetch } from './api';
import { getCategoryById } from './categoryService';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const SORT_PARAM: Record<NonNullable<SortOption>, string> = {
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  'newest': 'newest',
  '': '',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch all active products */
export const getProducts = async (): Promise<Product[]> => {
  return apiFetch<Product[]>('/products/');
};

/** Fetch a single product by ID. Returns null if not found. */
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    return await apiFetch<Product>(`/products/${id}/`);
  } catch {
    return null;
  }
};

/** Fetch multiple products by their IDs (preserves order) */
export const getProductsByIds = async (productIds: number[]): Promise<Product[]> => {
  if (productIds.length === 0) return [];

  // Fetch all concurrently and filter out nulls
  const results = await Promise.all(productIds.map((id) => getProductById(id)));
  // Preserve the original order
  return productIds
    .map((id) => results.find((p) => p?.id === id))
    .filter((p): p is Product => Boolean(p));
};

/** Fetch products in a given category by category ID */
export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  // We filter by category slug on the backend, so first resolve the ID → slug
  // The simpler path: use the category endpoint to find the slug
  return apiFetch<Product[]>(`/products/?category_id=${categoryId}`);
};

/** Fetch up to `limit` related products for a given product */
export const getRelatedProducts = async (
  productId: number,
  limit = 4
): Promise<Product[]> => {
  try {
    return await apiFetch<Product[]>(`/products/${productId}/related/?limit=${limit}`);
  } catch {
    return [];
  }
};

/** Fetch products marked as featured */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  return apiFetch<Product[]>('/products/?isFeatured=true');
};

/** Search products by text query */
export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query.trim()) return getProducts();
  return apiFetch<Product[]>(`/products/?search=${encodeURIComponent(query)}`);
};

/** Fetch products with full filter + sort support */
export const getFilteredProducts = async (
  filters: ProductFilters,
  sort: SortOption
): Promise<Product[]> => {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  // The backend accepts category by slug; the filter sends category names,
  // but since our slugs == lowercased names we can convert safely.
  if (filters.categories.length > 0) {
    // Send the first selected category slug (backend filter is single-value)
    params.set('category', filters.categories[0].toLowerCase());
  }

  if (filters.priceRange) {
    // Price range filtering is not yet on the API; handled client-side below
  }

  if (filters.inStock) {
    params.set('inStock', 'true');
  }

  const sortKey = sort as keyof typeof SORT_PARAM;
  if (sort && SORT_PARAM[sortKey]) {
    params.set('sort', SORT_PARAM[sortKey]);
  }

  const qs = params.toString();
  let products = await apiFetch<Product[]>(`/products/${qs ? `?${qs}` : ''}`);

  // Client-side price range filter (not yet a backend param)
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    products = products.filter((p) => p.price >= min && p.price <= max);
  }

  // Multi-category client-side filter if more than one category selected
  if (filters.categories.length > 1) {
    // Already sent the first category to the API; now expand to remaining
    const allCategoryProducts = await Promise.all(
      filters.categories.slice(1).map((name) =>
        apiFetch<Product[]>(`/products/?category=${encodeURIComponent(name.toLowerCase())}`)
      )
    );
    const extra = allCategoryProducts.flat();
    const seen = new Set(products.map((p) => p.id));
    for (const p of extra) {
      if (!seen.has(p.id)) {
        products.push(p);
        seen.add(p.id);
      }
    }
  }

  return products;
};

/**
 * Synchronous category lookup for a product.
 *
 * Reads from the module-level category cache in categoryService.
 * No second argument needed — the cache is populated by any page that
 * calls getCategories() before rendering ProductCard (LandingPage,
 * CollectionsPage, ProductPage all do this).
 *
 * Returns null if the category is not found so callers can guard with
 * a simple `if (category)` check.
 */
export const getCategoryForProduct = (product: Product): Category | null =>
  getCategoryById(product.categoryId);
