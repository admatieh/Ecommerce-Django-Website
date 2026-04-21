export type LandingTagPosition = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export type HeroSection = {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  tags: {
    id: string;
    productId: number;
    position: LandingTagPosition;
  }[];
};

export type FeaturedCategoriesSection = {
  title: string;
  categoryIds: number[];
};

export type FeaturedProductsSection = {
  title: string;
  productIds: number[];
};

export type BannerSection = {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
};

export type NewsletterSection = {
  title: string;
  subtitle: string;
  placeholder: string;
};

export type LandingPageData = {
  hero: HeroSection;
  featuredCategories: FeaturedCategoriesSection;
  featuredProducts: FeaturedProductsSection;
  banner: BannerSection;
  newsletter: NewsletterSection;
};