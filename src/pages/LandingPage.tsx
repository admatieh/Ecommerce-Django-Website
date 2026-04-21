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

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      setIsLoading(true);
      try {
        const [nextLandingData, nextProducts, nextCategories] = await Promise.all([
          getLandingPageData(),
          getProducts(),
          getCategories(),
        ]);

        if (!isMounted) return;
        setLandingData(nextLandingData);
        setProducts(nextProducts);
        setCategories(nextCategories);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !landingData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

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
