const SyncedProduct = require('../../models/SyncedProduct');
const { isGenderCompatible } = require('../../utils/productGenderNormalizer');
const { isProductValidForDemo } = require('../../utils/demoValidator');

const TOP_CATEGORIES = ['t-shirt', 't-shirts', 'shirt', 'shirts', 'top', 'tops', 'jacket', 'jackets', 'hoodie', 'hoodies', 'sweater', 'sweaters'];
const BOTTOM_CATEGORIES = ['pant', 'pants', 'jeans', 'trouser', 'trousers', 'bottom', 'bottoms', 'chinos', 'chino'];

/**
 * Dynamically generates all gender-compatible top × bottom combinations.
 * Men's tops will never pair with women's bottoms (and vice versa).
 */
const generateAllCombinations = async (merchantId) => {
  const allProducts = await SyncedProduct.find({ merchantId, isAvailable: true, stock: { $gt: 0 } });
  const products = allProducts.filter(isProductValidForDemo);

  const tops = [];
  const bottoms = [];

  products.forEach(product => {
    const cat = (product.category || '').toLowerCase();
    const subcat = (product.subcategory || '').toLowerCase();
    const isTop = TOP_CATEGORIES.some(t => t === cat || t === subcat);
    const isBottom = BOTTOM_CATEGORIES.some(b => b === cat || b === subcat);
    if (isTop) tops.push(product);
    else if (isBottom) bottoms.push(product);
  });

  const combinations = [];
  let skippedGender = 0;

  tops.forEach(top => {
    bottoms.forEach(bottom => {
      // STRICT gender compatibility check — never mix men/women
      if (!isGenderCompatible(top.gender, bottom.gender)) {
        skippedGender++;
        return;
      }

      const combinationId = `${top.merchantProductId}_${bottom.merchantProductId}`;
      // Determine the display gender for frontend filtering
      const combinationGender = resolveCombinationGender(top.gender, bottom.gender);

      combinations.push({
        combinationId,
        gender: combinationGender,
        topProduct: top,
        bottomProduct: bottom,
        top,
        bottom
      });
    });
  });

  return {
    totalCombinations: combinations.length,
    topsCount: tops.length,
    bottomsCount: bottoms.length,
    skippedGender,
    combinations
  };
};

/**
 * Resolves what gender label a combination gets for UI filtering.
 * unisex + men  → men
 * unisex + women → women
 * unisex + unisex → unisex
 * men + men → men
 * women + women → women
 */
const resolveCombinationGender = (topGender, bottomGender) => {
  if (topGender === 'unisex' && bottomGender === 'unisex') return 'unisex';
  if (topGender === 'men' || bottomGender === 'men') return 'men';
  if (topGender === 'women' || bottomGender === 'women') return 'women';
  return 'unisex';
};

module.exports = { generateAllCombinations };
