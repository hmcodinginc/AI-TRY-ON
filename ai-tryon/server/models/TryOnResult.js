const mongoose = require('mongoose');

const tryOnResultSchema = new mongoose.Schema(
  {
    resultId: { type: String, required: true, unique: true },
    merchantId: { type: String, required: true },
    merchantUserId: { type: String, required: true },
    outfitId: { type: String, required: true },
    outfitKey: { type: String, required: true },
    topProductId: { type: String, required: true },
    bottomProductId: { type: String, required: true },
    inputImageId: { type: String, required: true },
    resultImagePath: { type: String }, // Legacy, keep for backward compatibility
    shirtPreview: { type: String }, // NEW: independent shirt preview
    pantsPreview: { type: String }, // NEW: independent pants preview
    provider: { type: String },
    providerJobId: { type: String },
    errorMessage: { type: String },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TryOnResult', tryOnResultSchema);
