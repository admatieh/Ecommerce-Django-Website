import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import Hero from '../sections/LandingSection/Hero';
import FeaturedCategories from '../sections/LandingSection/FeaturedCategories';
import FeaturedProducts from '../sections/LandingSection/FeaturedProducts';
import FeaturedBanner from '../sections/LandingSection/FeaturedBanner';
import Newsletter from '../sections/LandingSection/Newsletter';
import { getCategories } from '../services/categoryService';
import { getLandingPageData } from '../services/landingService';
import { getProducts } from '../services/productService';
import { LandingPageData } from '../types/landing';
import { Category, Product } from '../types/product';

export default function LandingPage() {
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadPageData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [nextLandingData, nextProducts, nextCategories] = await Promise.all([
        getLandingPageData(),
        getProducts(),
        getCategories(),
      ]);

      setLandingData(nextLandingData);
      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch {
      setErrorMessage('We could not load the landing experience. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadPageData();
    };

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-serif text-textMain mb-3">Unable to Load Landing Page</h1>
          <p className="text-sm text-textLight mb-6">{errorMessage}</p>
          <button
            onClick={loadPageData}
            className="px-6 py-3 rounded-full bg-textMain text-white text-xs font-semibold uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!landingData) return null;

  return (
    <>
      <Hero data={landingData.hero} products={products} />
      <FeaturedCategories data={landingData.featuredCategories} categories={categories} />
      <FeaturedProducts data={landingData.featuredProducts} products={products} />
      <FeaturedBanner data={landingData.banner} />
      <Newsletter data={landingData.newsletter} />
    </>
  );
}
