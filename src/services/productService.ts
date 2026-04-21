import { products, categories } from '../data/mockData';
import { Product, Category, ProductFilters, SortOption } from '../types/product';

const MOCK_API_DELAY_MS = 80;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const getProducts = async (): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  return products.filter((p) => p.isActive);
};

export const getProductById = async (id: number): Promise<Product | null> => {
  await delay(MOCK_API_DELAY_MS);
  return products.find((product) => product.id === id && product.isActive) ?? null;
};

export const getProductsByIds = async (productIds: number[]): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  return productIds
    .map((id) => products.find((product) => product.id === id && product.isActive))
    .filter((product): product is Product => Boolean(product));
};

export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  return products.filter((product) => product.categoryId === categoryId && product.isActive);
};

export const getRelatedProducts = async (
  productId: number,
  limit: number = 4
): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  const sameCategory = products.filter(
    (item) => item.id !== productId && item.categoryId === product.categoryId && item.isActive
  );
  const otherProducts = products.filter(
    (item) => item.id !== productId && item.categoryId !== product.categoryId && item.isActive
  );

  return [...sameCategory, ...otherProducts].slice(0, limit);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  return products.filter((product) => product.isFeatured && product.isActive);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return products.filter((p) => p.isActive);

  return products.filter((product) => {
    if (!product.isActive) return false;
    const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
    const descMatch = product.description.toLowerCase().includes(normalizedQuery);
    const categoryName = categories.find((c) => c.id === product.categoryId)?.name ?? '';
    const categoryMatch = categoryName.toLowerCase().includes(normalizedQuery);
    return nameMatch || descMatch || categoryMatch;
  });
};

export const getFilteredProducts = async (
  filters: ProductFilters,
  sort: SortOption
): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);

  let result = products.filter((product) => product.isActive);

  // Search filter
  if (filters.search.trim()) {
    const lowerQuery = filters.search.toLowerCase();
    result = result.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(lowerQuery);
      const categoryName = categories.find((c) => c.id === p.categoryId)?.name ?? '';
      const categoryMatch = categoryName.toLowerCase().includes(lowerQuery);
      return nameMatch || categoryMatch;
    });
  }

  // Category filter
  if (filters.categories.length > 0) {
    const selectedCategoryIds = categories
      .filter((category) => filters.categories.includes(category.name))
      .map((category) => category.id);
    result = result.filter((product) => selectedCategoryIds.includes(product.categoryId));
  }

  // Price filter
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    result = result.filter((p) => p.price >= min && p.price <= max);
  }

  // Stock filter
  if (filters.inStock) {
    result = result.filter((p) => p.stock > 0);
  }

  // Sorting
  if (sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
};

export const getCategoryForProduct = (product: Product): Category | undefined => {
  return categories.find((c) => c.id === product.categoryId);
};
