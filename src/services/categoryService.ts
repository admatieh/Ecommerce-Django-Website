import { categories } from '../data/mockData';
import { Category } from '../types/product';

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

export const getCategories = async (): Promise<Category[]> => {
  await delay(MOCK_API_DELAY_MS);
  maybeThrowSimulatedError();
  return categories.filter((category) => category.isActive);
};

export const getCategoriesByIds = async (categoryIds: number[]): Promise<Category[]> => {
  await delay(MOCK_API_DELAY_MS);
  maybeThrowSimulatedError();
  return categoryIds
    .map((id) => categories.find((category) => category.id === id && category.isActive))
    .filter((category): category is Category => Boolean(category));
};
