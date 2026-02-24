/**
 * Formatting helpers for consistent display (currency, etc.).
 */

export const CURRENCY_SYMBOL = '₹';

/**
 * Formats a number as Indian Rupees (e.g. ₹1,234.56).
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${typeof amount === 'number' ? amount.toFixed(2) : '0.00'}`;
}

/** Placeholder image path for products when none or load fails. */
export const PRODUCT_PLACEHOLDER_IMAGE = '/product-placeholder.svg';
