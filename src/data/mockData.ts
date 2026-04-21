import { Product, Category, HeroTag, NavLink, Discount, ShippingRule } from '../types/product';

export const navigationLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Collections', href: '/collections' },
  { name: 'About', href: '/about' },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Silk Blend Midi Dress',
    price: 120.00,
    categoryId: 1,
    description: 'A fluid silhouette with a softly draped waist, crafted in a lustrous silk blend for elegant movement from day to evening.',
    image: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000',
    images: [
      'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Champagne', 'Olive'],
  },
  {
    id: 5,
    name: 'Midi Dress',
    price: 220.00,
    categoryId: 1,
    description: 'Cut with structured seams and a refined neckline, this elevated midi dress offers polished styling for modern occasions.',
    image: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000',
    images: [
      'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Champagne', 'Olive'],
  },
  {
    id: 2,
    name: 'Tailored Wide-Leg Trousers',
    price: 95.00,
    categoryId: 2,
    description: 'High-rise and expertly tailored with a clean drape, these trousers balance comfort and precision for everyday sophistication.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: ['0', '2', '4', '6', '8', '10'],
    colors: ['Beige', 'Navy', 'Black'],
  },

  {
    id: 3,
    name: 'Minimalist Overcoat',
    price: 210.00,
    categoryId: 3,
    description: 'A modern overcoat with a streamlined profile and premium construction, designed to layer effortlessly through changing seasons.',
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1000',
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000'
    ],
    sizes: ['S', 'M', 'L'],
  },

  {
    id: 4,
    name: 'Essentials Cotton Tee',
    price: 45.00,
    categoryId: 4,
    description: 'A breathable cotton essential with a flattering, minimal fit that pairs naturally with tailoring, denim, and layered looks.',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000',
    images: [
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/1007013/pexels-photo-1007013.jpeg?auto=compress&cs=tinysrgb&w=1000',
      'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1000'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Grey'],
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
  },
  {
    id: 2,
    name: 'Trousers',
    slug: 'trousers',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 2,
  },
  {
    id: 3,
    name: 'Outerwear',
    slug: 'outerwear',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 3,
  },
  {
    id: 4,
    name: 'Tops',
    slug: 'tops',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    order: 4,
  },
];

export const heroTags: HeroTag[] = [
  {
    id: 't1',
    name: 'Beige Blazer',
    price: '80 USD',
    position: { top: '55%', right: '-10%' },
  },
  {
    id: 't2',
    name: 'Beige Trousers',
    price: '65 USD',
    position: { bottom: '5%', left: '-15%' },
  }
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
    minOrderValue: 150,
    active: true,
  },
  {
    id: 'disc-vip50',
    name: 'VIP 50',
    type: 'fixed',
    value: 50,
    couponCode: 'VIP50',
    minOrderValue: 250,
    active: true,
  },
  {
    id: 'disc-runway15',
    name: 'Runway 15%',
    type: 'percentage',
    value: 15,
    couponCode: 'RUNWAY15',
    minOrderValue: 180,
    active: true,
  },
];

export const shippingRules: ShippingRule[] = [
  {
    id: 'ship-standard',
    minOrderValue: 0,
    cost: 12,
    active: true,
    label: 'Standard Shipping',
  },
  {
    id: 'ship-free',
    minOrderValue: 150,
    cost: 0,
    active: true,
    label: 'Free Shipping',
  },
];
