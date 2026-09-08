/**
 * Nutrient "amount" strings in the data look like:
 *   "6.3 g / 13% DV"
 *   "~72 kcal / 4% DV"
 *   "9.1 g / 569% DV"
 *   "3.4 mg / 148% DV"
 * Sometimes there's no "% DV" part at all, e.g. just "3.4 mg".
 *
 * This splits that into a display value and an optional %DV badge.
 */
export function parseAmount(amount: string): { value: string; dv: string | null } {
  if (!amount) return { value: "", dv: null };

  const [rawValue, rawDv] = amount.split("/").map((s) => s.trim());
  const dvMatch = rawDv?.match(/(\d+(?:\.\d+)?)\s*%/);

  return {
    value: rawValue ?? amount.trim(),
    dv: dvMatch ? `${dvMatch[1]}%` : null,
  };
}
