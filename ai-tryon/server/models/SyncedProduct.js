const mongoose = require('mongoose');

const syncedProductSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true },
    merchantProductId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'unknown'], default: 'unknown' },
    description: { type: String },
    color: { type: String, required: true },
    sizes: { type: [String], default: [] },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, required: true },
    sourceUpdatedAt: { type: Date },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

syncedProductSchema.index({ merchantId: 1, merchantProductId: 1 }, { unique: true });

module.exports = mongoose.model('SyncedProduct', syncedProductSchema);
