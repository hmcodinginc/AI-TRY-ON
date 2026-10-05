/**
 * productGenderNormalizer.js
 * Normalizes any gender string to a canonical value: men | women | unisex | unknown
 */

const MEN_ALIASES = ['men', 'man', 'male', 'mens', "men's", 'boy', 'boys', 'gents'];
const WOMEN_ALIASES = ['women', 'woman', 'female', 'womens', "women's", 'ladies', 'lady', 'girl', 'girls'];
const UNISEX_ALIASES = ['unisex', 'neutral', 'gender-neutral', 'gender neutral', 'all', 'both'];

const normalizeGender = (raw) => {
  if (!raw || typeof raw !== 'string') return 'unknown';
  const val = raw.trim().toLowerCase();
  if (MEN_ALIASES.includes(val)) return 'men';
  if (WOMEN_ALIASES.includes(val)) return 'women';
  if (UNISEX_ALIASES.includes(val)) return 'unisex';
  return 'unknown';
};

/**
 * Returns true if top + bottom gender combination is valid.
 * Rules:
 *   men   + men    ✅
 *   women + women  ✅
 *   unisex + men    ✅
 *   unisex + women  ✅
 *   men   + unisex  ✅
 *   women + unisex  ✅
 *   unisex + unisex ✅
 *   men   + women   ❌
 *   women + men     ❌
 *   unknown + *     ❌  (skip unknowns to be safe)
 */
const isGenderCompatible = (topGender, bottomGender) => {
  const t = normalizeGender(topGender);
  const b = normalizeGender(bottomGender);

  if (t === 'unknown' || b === 'unknown') return false;
  if (t === 'unisex' || b === 'unisex') return true;
  return t === b;
};

module.exports = { normalizeGender, isGenderCompatible };
