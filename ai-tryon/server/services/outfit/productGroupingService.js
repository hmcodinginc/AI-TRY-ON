const TOP_CATEGORIES = new Set(['Shirts', 'T-Shirts', 'Tops']);
const BOTTOM_CATEGORIES = new Set(['Pants', 'Jeans', 'Trousers']);
const OUTERWEAR_CATEGORIES = new Set(['Jackets']);
const ONE_PIECE_CATEGORIES = new Set(['Dresses']);

function isAvailable(product) {
  if (!product) return false;
  if (product.isAvailable === false) return false;
  if (typeof product.stock === 'number' && product.stock <= 0) return false;
  return true;
}

/**
 * Group synced merchant products for the Smart Outfit Engine.
 */
function groupProducts(products) {
  const available = products.filter(isAvailable);

  const tops = available.filter((p) => TOP_CATEGORIES.has(p.category));
  const bottoms = available.filter((p) => BOTTOM_CATEGORIES.has(p.category));
  const outerwear = available.filter((p) => OUTERWEAR_CATEGORIES.has(p.category));
  const onePiece = available.filter((p) => ONE_PIECE_CATEGORIES.has(p.category));

  return {
    tops,
    bottoms,
    outerwear,
    onePiece,
    allAvailable: available,
  };
}

module.exports = {
  groupProducts,
  isAvailable,
  TOP_CATEGORIES,
  BOTTOM_CATEGORIES,
  OUTERWEAR_CATEGORIES,
  ONE_PIECE_CATEGORIES,
};
