const axios = require('axios');
const SyncedProduct = require('../models/SyncedProduct');
const Merchant = require('../models/Merchant');

const syncProducts = async (merchantId) => {
  try {
    const merchant = await Merchant.findOne({ merchantId });
    if (!merchant) throw new Error('Merchant not found');

    const { data: products } = await axios.get(`${merchant.apiBaseUrl}/api/products`);
    
    let syncedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (const product of products) {
      try {
        const { normalizeGender } = require('../utils/productGenderNormalizer');
        const updateData = {
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          gender: normalizeGender(product.gender),
          description: product.description,
          color: product.color,
          sizes: product.sizes || [],
          price: product.price,
          imageUrl: product.imageUrl || product.image,
          stock: product.stock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          isAvailable: product.stock > 0 && product.isAvailable,
          sourceUpdatedAt: product.updatedAt,
          syncedAt: Date.now()
        };

        const existingProduct = await SyncedProduct.findOne({ 
          merchantId, 
          merchantProductId: product.productId 
        });

        if (existingProduct) {
          Object.assign(existingProduct, updateData);
          await existingProduct.save();
          updatedCount++;
        } else {
          await SyncedProduct.create({
            merchantId,
            merchantProductId: product.productId,
            ...updateData
          });
          syncedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync product ${product.productId}`, err);
        failedCount++;
      }
    }

    let outfitsGenerated = 0;
    if (syncedCount + updatedCount > 0 || products.length > 0) {
      try {
        const { persistRecommendedOutfits } = require('./outfit/outfitEngine');
        const outfits = await persistRecommendedOutfits(merchantId);
        outfitsGenerated = outfits.length;
      } catch (engineErr) {
        console.warn('[Sync] Smart Outfit Engine refresh failed:', engineErr.message);
      }
    }

    return { 
      success: true, 
      synced: syncedCount, 
      updated: updatedCount, 
      failed: failedCount,
      total: products.length,
      outfitsGenerated,
    };
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      message: 'Failed to connect to merchant backend.'
    };
  }
};

module.exports = { syncProducts };
