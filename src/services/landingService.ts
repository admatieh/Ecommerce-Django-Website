import { landingPageData } from '../data/mockData';
import { LandingPageData } from '../types/landing';

const MOCK_API_DELAY_MS = 80;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const getLandingPageData = async (): Promise<LandingPageData> => {
  await delay(MOCK_API_DELAY_MS);
  return landingPageData;
};
