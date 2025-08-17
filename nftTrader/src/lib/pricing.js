// Pure pricing helpers to keep UI/context logic simple and testable
// All values are in euros

/**
 * Compute the current price given a base price and a percentage delta.
 * Returns a number rounded to 2 decimals.
 * @param {number} basePriceEuro
 * @param {number} percentDelta
 * @returns {number}
 */
export function computePrice(basePriceEuro, percentDelta) {
  const base = Number(basePriceEuro) || 0;
  const pct = Number(percentDelta) || 0;
  const price = base * (1 + pct / 100);
  return parseFloat(price.toFixed(2));
}


