const { TOP_CATEGORIES, BOTTOM_CATEGORIES } = require('./productGroupingService');

const NEUTRAL_COLORS = new Set(['White', 'Black', 'Beige', 'Grey', 'Gray', 'Navy', 'Multi']);

const COLOR_HARMONY = {
  Black: ['White', 'Beige', 'Grey', 'Gray', 'Blue', 'Multi'],
  White: ['Black', 'Blue', 'Beige', 'Grey', 'Gray', 'Multi'],
  Brown: ['Beige', 'White', 'Blue', 'Black'],
  Blue: ['White', 'Beige', 'Black', 'Grey', 'Gray'],
  Beige: ['White', 'Brown', 'Black', 'Blue', 'Navy'],
  Navy: ['White', 'Beige', 'Grey', 'Gray'],
  Multi: ['Black', 'White', 'Beige', 'Blue'],
};

function categoryPairValid(top, bottom) {
  if (!TOP_CATEGORIES.has(top.category)) return false;
  if (!BOTTOM_CATEGORIES.has(bottom.category)) return false;
  return true;
}

function colorCompatibilityScore(topColor, bottomColor) {
  if (!topColor || !bottomColor) return 0;
  if (topColor === bottomColor && !NEUTRAL_COLORS.has(topColor)) return -2;
  if (NEUTRAL_COLORS.has(topColor) || NEUTRAL_COLORS.has(bottomColor)) return 3;
  const allowed = COLOR_HARMONY[topColor] || [];
  if (allowed.includes(bottomColor)) return 4;
  return 1;
}

function styleCompatibilityScore(top, bottom) {
  const formal = new Set(['Formal']);
  const casual = new Set(['Casual', 'Basics', 'Straight', 'Slim', 'Chinos', 'Denim', 'Bomber']);
  const topFormal = formal.has(top.subcategory);
  const bottomFormal = formal.has(bottom.subcategory);
  const topCasual = casual.has(top.subcategory);
  const bottomCasual = casual.has(bottom.subcategory);
  if (topFormal && bottomFormal) return 3;
  if (topCasual && bottomCasual) return 3;
  if ((topFormal && bottomCasual) || (topCasual && bottomFormal)) return 1;
  return 2;
}

function fitCompatibilityScore(top, bottom) {
  const slimFit = /slim|oversized/i;
  const topSlim = slimFit.test(top.subcategory || '') || slimFit.test(top.name || '');
  const bottomSlim = slimFit.test(bottom.subcategory || '') || slimFit.test(bottom.name || '');
  if (topSlim && bottomSlim) return 2;
  return 1;
}

/**
 * Score a top + bottom pair (higher = better). Returns null if invalid.
 */
function scoreOutfitPair(top, bottom) {
  if (!categoryPairValid(top, bottom)) return null;

  const availabilityScore = 4;
  const categoryScore = 5;
  const colorScore = colorCompatibilityScore(top.color, bottom.color);
  const styleScore = styleCompatibilityScore(top, bottom);
  const fitScore = fitCompatibilityScore(top, bottom);

  const total = availabilityScore + categoryScore + colorScore + styleScore + fitScore;
  if (total < 8) return null;

  return {
    total,
    breakdown: {
      availability: availabilityScore,
      category: categoryScore,
      color: colorScore,
      style: styleScore,
      fit: fitScore,
    },
  };
}

module.exports = {
  scoreOutfitPair,
  categoryPairValid,
};
