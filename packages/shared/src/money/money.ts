/**
 * Authoritative Exact Money Utilities
 * 1 INR = 100 paise. All values in storage are integer minor units.
 */

export function rupeesToPaise(rupees: number | string): number {
  return Math.round(Number(rupees) * 100);
}

export function paiseToRupees(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

export function formatINR(paise: number): string {
  const rupees = paiseToRupees(paise);
  return '₹' + rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
