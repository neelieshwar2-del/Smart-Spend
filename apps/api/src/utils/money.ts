/**
 * Currency and Money Handling Utilities
 * All financial records in the database are stored in integer minor units (paise).
 * 1 INR = 100 paise.
 */

/**
 * Converts Indian Rupees (INR) to integer paise.
 * Safely rounds to prevent floating point imprecision.
 * Example: 450.50 -> 45050
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(Number(rupees) * 100);
}

/**
 * Converts integer paise to Indian Rupees (INR) as a float with 2 decimal places.
 * Example: 45050 -> 450.5
 */
export function paiseToRupees(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

/**
 * Formats integer paise into standard Indian currency representation.
 * Example: 45050 -> "₹450.50"
 */
export function formatINR(paise: number): string {
  const rupees = paiseToRupees(paise);
  return '₹' + rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
