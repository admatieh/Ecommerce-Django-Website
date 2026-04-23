import { landingPageData } from '../data/mockData';
import { LandingPageData } from '../types/landing';
import { getCategories } from './categoryService';
import { getFeaturedProducts, getProducts } from './productService';

const MOCK_API_DELAY_MS = 80;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const maybeThrowSimulatedError = (): void => {
  if (typeof window !== 'undefined' && window.localStorage.getItem('velora:simulateApiError') === '1') {
    throw new Error('Simulated API failure');
  }
};

export const getLandingPageData = async (): Promise<LandingPageData> => {
  await delay(MOCK_API_DELAY_MS);
  maybeThrowSimulatedError();
  
  try {
    // Fetch dynamic categories and products to populate the landing page
    const [categories, featuredProducts, allProducts] = await Promise.all([
      getCategories(),
      getFeaturedProducts(),
      getProducts(),
    ]);
    
    const categoryIds = categories.slice(0, 4).map(c => c.id);
    const productIds = featuredProducts.slice(0, 4).map(p => p.id);
    
    // Fallback to all products if not enough featured
    const finalProductIds = productIds.length >= 4 
      ? productIds 
      : [...new Set([...productIds, ...allProducts.slice(0, 4).map(p => p.id)])].slice(0, 4);

    const heroTags = finalProductIds.slice(0, 2).map((id, idx) => ({
      id: `hero-tag-${idx + 1}`,
      productId: id,
      position: idx === 0 ? { top: '55%', right: '-10%' } : { bottom: '5%', left: '-15%' }
    }));

    return {
      ...landingPageData,
      hero: {
        ...landingPageData.hero,
        tags: heroTags.length > 0 ? heroTags : landingPageData.hero.tags,
      },
      featuredCategories: {
        ...landingPageData.featuredCategories,
        categoryIds: categoryIds.length > 0 ? categoryIds : landingPageData.featuredCategories.categoryIds,
      },
      featuredProducts: {
        ...landingPageData.featuredProducts,
        productIds: finalProductIds.length > 0 ? finalProductIds : landingPageData.featuredProducts.productIds,
      }
    };
  } catch (error) {
    // Fallback to mock if API fails
    return landingPageData;
  }
};
