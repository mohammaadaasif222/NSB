/**
 * User-facing provider branding.
 *
 * Tequity is an aggregator the operator uses to source games; the admin
 * console knows every game by its real source (studio + aggregator) and that
 * is correct for support, reporting and reconciliation. Players never need
 * to see the aggregation layer though — the operator's own brand is the
 * one that sold them the game. This helper maps Tequity's self-named
 * studios ("tequity", "tequity-originals") to the operator's own name on
 * every user-facing surface.
 *
 * Only called from rlk-frontend. The admin console (rlk-admin) and the
 * backend reports stay truthful. The game's `provider` column in the DB
 * is NOT changed.
 */

/** The operator's own brand that replaces Tequity's self-reference. */
const OPERATOR_BRAND = 'Rolluck';

/**
 * Any provider name Tequity returns to label its own games. "tequity",
 * "tequity originals", "rolluck originals" (if ever written by hand in the
 * admin) all collapse to the operator brand.
 */
const TEQUITY_SELF_LABEL = /^(tequity|tequity[\s_-]?originals?|rolluck[\s_-]?originals?)$/i;

/**
 * Returns the provider label to show the player. Real studio names
 * ("4ThePlayer", "Alchemist", "Pragmatic Play") pass through unchanged;
 * Tequity's self-labels become the operator brand.
 *
 * Null / empty is passed through — the caller already handles it.
 */
export const displayProvider = (name: string | null | undefined): string => {
  if (!name) return '';
  return TEQUITY_SELF_LABEL.test(name.trim()) ? OPERATOR_BRAND : name;
};

/** Does this label come from Tequity's self-reference set? */
export const isAggregatorSelfLabel = (name: string | null | undefined): boolean =>
  !!name && TEQUITY_SELF_LABEL.test(name.trim());
