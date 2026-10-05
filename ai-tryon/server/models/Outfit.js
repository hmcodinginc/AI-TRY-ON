const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema(
  {
    outfitId: { type: String, required: true, unique: true },
    outfitKey: { type: String, required: true },
    merchantId: { type: String, required: true },
    topProductId: { type: String, required: true },
    bottomProductId: { type: String, required: true },
    previewImage: { type: String, default: '' },
    previewStatus: { type: String, enum: ['ready', 'unavailable'], default: 'unavailable' },
    score: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Outfit', outfitSchema);
