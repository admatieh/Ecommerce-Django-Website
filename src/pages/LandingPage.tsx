import Hero from '../sections/LandingSection/Hero';
import FeaturedCategories from '../sections/LandingSection/FeaturedCategories';
import FeaturedProducts from '../sections/LandingSection/FeaturedProducts';
import FeaturedBanner from '../sections/LandingSection/FeaturedBanner';
import Newsletter from '../sections/LandingSection/Newsletter';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <FeaturedBanner />
      <Newsletter />
    </>
  );
}
