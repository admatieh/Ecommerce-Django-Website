import { Product, Category, NavLink, Discount, ShippingRule } from '../types/product';
import { LandingPageData } from '../types/landing';

export const navigationLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Collections', href: '/collections' },
  { name: 'About', href: '/about' },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Silk Blend Midi Dress',
    description: 'A fluid silhouette with a softly draped waist, crafted in a lustrous silk blend for elegant movement from day to evening.',
    price: 120.00,
    discountPrice: 99.00,
    categoryId: 1,
    images: [
      'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Champagne', 'Olive'],
    stock: 28,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 5,
    name: 'Midi Dress',
    description: 'Cut with structured seams and a refined neckline, this elevated midi dress offers polished styling for modern occasions.',
    price: 220.00,
    categoryId: 1,
    images: [
      'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Champagne', 'Olive'],
    stock: 9,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-02-18T09:00:00Z',
  },
  {
    id: 2,
    name: 'Tailored Wide-Leg Trousers',
    description: 'High-rise and expertly tailored with a clean drape, these trousers balance comfort and precision for everyday sophistication.',
    price: 95.00,
    categoryId: 2,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['0', '2', '4', '6', '8', '10'],
    colors: ['Beige', 'Navy', 'Black'],
    stock: 34,
    isActive: true,
    createdAt: '2026-03-30T09:00:00Z',
  },

  {
    id: 3,
    name: 'Minimalist Overcoat',
    description: 'A modern overcoat with a streamlined profile and premium construction, designed to layer effortlessly through changing seasons.',
    price: 210.00,
    categoryId: 3,
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000'
    ],
    sizes: ['S', 'M', 'L'],
    stock: 11,
    isActive: true,
    createdAt: '2026-01-12T09:00:00Z',
  },

  {
    id: 4,
    name: 'Essentials Cotton Tee',
    description: 'A breathable cotton essential with a flattering, minimal fit that pairs naturally with tailoring, denim, and layered looks.',
    price: 45.00,
    categoryId: 4,
    images: [
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/1007013/pexels-photo-1007013.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1000'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Grey'],
    stock: 45,
    isActive: true,
    createdAt: '2026-04-06T09:00:00Z',
  }
];

export const categories: Category[] = [
  {
    id: 1,
    name: 'Dresses',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    name: 'Trousers',
    slug: 'trousers',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 2,
    isActive: true,
  },
  {
    id: 3,
    name: 'Outerwear',
    slug: 'outerwear',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 3,
    isActive: true,
  },
  {
    id: 4,
    name: 'Tops',
    slug: 'tops',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 4,
    isActive: true,
  },
];

export const footerLinks = {
  brand: [
    { name: 'About Us', href: '/about' },
  ],
  customerService: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/about#faq' },
  ],
  socials: [
    { name: 'Instagram', href: '#' },
  ],
};

export const discounts: Discount[] = [
  {
    id: 'disc-auto-studio',
    name: 'Studio Welcome Offer',
    type: 'percentage',
    value: 10,
    minOrderAmount: 150,
    isActive: true,
  },
  {
    id: 'disc-vip50',
    name: 'VIP 50',
    type: 'fixed',
    value: 50,
    code: 'VIP50',
    minOrderAmount: 250,
    isActive: true,
  },
  {
    id: 'disc-runway15',
    name: 'Runway 15%',
    type: 'percentage',
    value: 15,
    code: 'RUNWAY15',
    minOrderAmount: 180,
    isActive: true,
  },
];

export const shippingRules: ShippingRule[] = [
  {
    id: 'ship-standard',
    minOrderAmount: 0,
    cost: 12,
    label: 'Standard Shipping',
    isActive: true,
  },
  {
    id: 'ship-free',
    minOrderAmount: 150,
    cost: 0,
    label: 'Free Shipping',
    isActive: true,
  },
];

export const landingPageData: LandingPageData = {
  hero: {
    title: 'Clean Lines. Conscious Living.',
    subtitle: 'Timeless essentials for the modern minimalist. Designed to simplify your wardrobe and elevate your everyday.',
    backgroundImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'Explore the Collection',
    ctaLink: '/collections',
    tags: [
      {
        id: 'hero-tag-1',
        productId: 5,
        position: { top: '55%', right: '-10%' },
      },
      {
        id: 'hero-tag-2',
        productId: 2,
        position: { bottom: '5%', left: '-15%' },
      },
    ],
  },
  featuredCategories: {
    title: 'Curated Categories',
    categoryIds: [1, 2, 3, 4],
  },
  featuredProducts: {
    title: 'Featured Collection',
    productIds: [1, 5, 2, 4],
  },
  banner: {
    title: 'Effortless Elegance for the Modern Woman',
    subtitle: 'Discover pieces crafted from premium sustainable fabrics. Our latest collection brings versatile silhouettes from day to evening.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'Discover the Campaign',
    ctaLink: '/collections',
  },
  newsletter: {
    title: 'Join the Community',
    subtitle: 'Subscribe to receive exclusive access to new collections, special offers, and styling tips.',
    placeholder: 'Your email address',
  },
};
