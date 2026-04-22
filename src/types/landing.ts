export type LandingTagPosition = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export type HeroSection = {
  title: string;
  subtitle: string;
  backgroundWord: string;
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
  ctaText: string;
};

export type FeaturedProductsSection = {
  title: string;
  productIds: number[];
  viewAllText: string;
  viewAllLink: string;
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
  submitText: string;
  submittingText: string;
  successMessage: string;
};

export type LandingPageData = {
  hero: HeroSection;
  featuredCategories: FeaturedCategoriesSection;
  featuredProducts: FeaturedProductsSection;
  banner: BannerSection;
  newsletter: NewsletterSection;
};