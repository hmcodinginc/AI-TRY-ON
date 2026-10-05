/** outfitKey: merchant_demo:P-2002:P-4001 */
function buildOutfitKey(merchantId, topProductId, bottomProductId) {
  return `${merchantId}:${topProductId}:${bottomProductId}`;
}

/** URL-safe outfit id: merchant_demo__P-2002__P-4001 */
function buildOutfitId(merchantId, topProductId, bottomProductId) {
  return buildOutfitKey(merchantId, topProductId, bottomProductId).replace(/:/g, '__');
}

function parseOutfitId(outfitId) {
  if (!outfitId || typeof outfitId !== 'string') return null;
  const parts = outfitId.split('__');
  if (parts.length !== 3) return null;
  const [merchantId, topProductId, bottomProductId] = parts;
  if (!merchantId || !topProductId || !bottomProductId) return null;
  return {
    merchantId,
    topProductId,
    bottomProductId,
    outfitKey: buildOutfitKey(merchantId, topProductId, bottomProductId),
  };
}

module.exports = { buildOutfitKey, buildOutfitId, parseOutfitId };
