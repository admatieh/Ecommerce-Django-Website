import { landingPageData } from '../data/mockData';
import { LandingPageData } from '../types/landing';

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

export const getLandingPageData = async (): Promise<LandingPageData> => {
  await delay(MOCK_API_DELAY_MS);
  maybeThrowSimulatedError();
  return landingPageData;
};
