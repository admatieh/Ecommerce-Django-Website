import { products } from '../data/mockData';
import { Product } from '../types/product';

const MOCK_API_DELAY_MS = 80;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const getProducts = async (): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  return products;
};

export const getProductsByIds = async (productIds: number[]): Promise<Product[]> => {
  await delay(MOCK_API_DELAY_MS);
  return productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
};
