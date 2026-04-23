/**
 * src/services/api.ts
 *
 * Central API client — single base URL, shared fetch wrapper with
 * error handling and typed responses.
 *
 * Price normalisation:
 *   Django DecimalField serialises to strings ("120.00").
 *   We coerce all price fields to `number` here, at the network
 *   boundary, so the rest of the app always works with proper numbers
 *   and `.toFixed()` is always safe to call.
 */

import { toNumber } from '../utils/format';

export const API_BASE = 'http://127.0.0.1:8000/api';

// Fields on a raw API product object whose values must be coerced to number.
const PRODUCT_PRICE_FIELDS = ['price', 'discountPrice'] as const;

/**
 * Normalises a single raw product object from the API.
 * Converts all DecimalField strings to JavaScript numbers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseProduct(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const out = { ...raw };
  for (const field of PRODUCT_PRICE_FIELDS) {
    if (field in out) {
      out[field] = toNumber(out[field]);
    }
  }
  // discountPrice: null stays null (optional field)
  if (out.discountPrice === 0 && raw.discountPrice === null) {
    out.discountPrice = undefined;
  }
  return out;
}

/**
 * Thin wrapper around fetch that:
 *  - Prepends the API base URL
 *  - Throws a descriptive Error on non-2xx responses
 *  - Returns parsed JSON typed as T
 *  - Normalises price fields on Product and Product[] responses
 */

export class ApiError extends Error {
  public response?: { data?: any };
  constructor(message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    if (data) {
      this.response = { data };
    }
  }
}
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let errorData = null;
    let text = '';
    try {
      text = await res.text();
      errorData = JSON.parse(text);
    } catch {
      // Ignored
    }
    const errorMessage = errorData?.detail || `API ${res.status} – ${res.statusText}${text ? `: ${text}` : ''}`;
    throw new ApiError(errorMessage, errorData);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  // Normalise prices on any response that looks like Product(s)
  if (Array.isArray(data)) {
    return data.map(normaliseProduct) as T;
  }
  if (data && typeof data === 'object') {
    // Could be a single product, or an envelope like { discounts, shippingRules }
    if ('price' in data) {
      return normaliseProduct(data) as T;
    }
  }

  return data as T;
}
