import { categories } from '../data/mockData';
import { Category } from '../types/product';

const MOCK_API_DELAY_MS = 80;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const getCategories = async (): Promise<Category[]> => {
  await delay(MOCK_API_DELAY_MS);
  return categories;
};

export const getCategoriesByIds = async (categoryIds: number[]): Promise<Category[]> => {
  await delay(MOCK_API_DELAY_MS);
  return categoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));
};
