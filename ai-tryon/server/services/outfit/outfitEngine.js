const SyncedProduct = require('../../models/SyncedProduct');
const Outfit = require('../../models/Outfit');
const { groupProducts } = require('./productGroupingService');
const { scoreOutfitPair } = require('./outfitCompatibility');
const { buildOutfitKey, buildOutfitId } = require('./outfitIdentity');
const { getOutfitPreview } = require('./outfitPreviewService');

const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 6;
const MAX_LIMIT = 12;

/**
 * Smart Outfit Engine — combinations from synced catalog only.
 */
async function computeOutfitRecommendations(merchantId, limit = DEFAULT_LIMIT) {
  const cappedLimit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limit));
  const products = await SyncedProduct.find({ merchantId });
  const groups = groupProducts(products);

  const candidates = [];

  for (const top of groups.tops) {
    for (const bottom of groups.bottoms) {
      const score = scoreOutfitPair(top, bottom);
      if (!score) continue;

      const outfitKey = buildOutfitKey(merchantId, top.merchantProductId, bottom.merchantProductId);
      const outfitId = buildOutfitId(merchantId, top.merchantProductId, bottom.merchantProductId);
      const preview = getOutfitPreview(top.merchantProductId, bottom.merchantProductId);

      candidates.push({
        outfitKey,
        outfitId,
        merchantId,
        topProductId: top.merchantProductId,
        bottomProductId: bottom.merchantProductId,
        score: score.total,
        scoreBreakdown: score.breakdown,
        previewStatus: preview.previewStatus,
        previewImage: preview.previewImage,
        top,
        bottom,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const seenTops = new Set();
  const seenBottoms = new Set();
  const selected = [];

  for (const combo of candidates) {
    if (selected.length >= cappedLimit) break;
    const topKey = combo.topProductId;
    const bottomKey = combo.bottomProductId;
    if (seenTops.has(topKey) && seenBottoms.has(bottomKey)) continue;
    selected.push(combo);
    seenTops.add(topKey);
    seenBottoms.add(bottomKey);
  }

  if (selected.length < cappedLimit) {
    for (const combo of candidates) {
      if (selected.length >= cappedLimit) break;
      if (selected.some((s) => s.outfitKey === combo.outfitKey)) continue;
      selected.push(combo);
    }
  }

  return selected;
}

async function resolveOutfitById(outfitId) {
  const { parseOutfitId } = require('./outfitIdentity');
  const parsed = parseOutfitId(outfitId);
  if (!parsed) return null;

  const { merchantId, topProductId, bottomProductId, outfitKey } = parsed;
  const top = await SyncedProduct.findOne({ merchantId, merchantProductId: topProductId });
  const bottom = await SyncedProduct.findOne({ merchantId, merchantProductId: bottomProductId });
  if (!top || !bottom) return null;

  const { isAvailable } = require('./productGroupingService');
  if (!isAvailable(top) || !isAvailable(bottom)) return null;

  const score = scoreOutfitPair(top, bottom);
  if (!score) return null;

  const preview = getOutfitPreview(topProductId, bottomProductId);

  return {
    outfitKey,
    outfitId,
    merchantId,
    topProductId,
    bottomProductId,
    score: score.total,
    scoreBreakdown: score.breakdown,
    previewStatus: preview.previewStatus,
    previewImage: preview.previewImage,
    top,
    bottom,
  };
}

/** Persist current recommendations (optional cache after sync). */
async function persistRecommendedOutfits(merchantId, limit = DEFAULT_LIMIT) {
  const recommendations = await computeOutfitRecommendations(merchantId, limit);
  await Outfit.deleteMany({ merchantId });

  const docs = recommendations.map((r) => ({
    outfitId: r.outfitId,
    outfitKey: r.outfitKey,
    merchantId: r.merchantId,
    topProductId: r.topProductId,
    bottomProductId: r.bottomProductId,
    previewImage: r.previewImage || '',
    previewStatus: r.previewStatus,
    score: r.score,
    status: 'active',
  }));

  if (docs.length > 0) {
    await Outfit.insertMany(docs);
  }

  return recommendations;
}

/** @deprecated name kept for API route — runs Smart Outfit Engine */
async function generateOutfits(merchantId) {
  return persistRecommendedOutfits(merchantId);
}

module.exports = {
  computeOutfitRecommendations,
  resolveOutfitById,
  persistRecommendedOutfits,
  generateOutfits,
};
