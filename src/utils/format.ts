/**
 * src/utils/format.ts
 *
 * Shared formatting and normalisation utilities.
 * Centralising these here means the rest of the codebase never
 * needs to know whether the API returns strings or numbers.
 */

/**
 * Formats a price value for display.
 *
 * Accepts number OR string (Django DecimalField serialises to string).
 * Always returns a formatted dollar string, e.g. "$120.00".
 * Returns "—" when the value is null, undefined, or unparseable.
 */
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  return `$${n.toFixed(2)}`;
}

/**
 * Coerces a price value (number | string | null | undefined) to a number.
 *
 * Used at the API boundary so that the rest of the app always works
 * with `number`, matching the TypeScript interface.
 * Returns 0 for null / undefined / unparseable values.
 */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}
