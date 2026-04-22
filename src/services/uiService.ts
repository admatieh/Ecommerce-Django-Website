import { footerLinks, navigationLinks } from '../data/mockData';
import { NavLink } from '../types/product';

export type FooterLinks = typeof footerLinks;

export const getNavigationLinks = (): NavLink[] => {
  return navigationLinks;
};

export const getFooterLinks = (): FooterLinks => {
  return footerLinks;
};
