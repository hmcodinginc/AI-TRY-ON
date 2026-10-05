const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true },
    merchantUserId: { type: String, required: true },
    imageId: { type: String, required: true, unique: true },
    imagePath: { type: String, required: true },
    imageStatus: { type: String, default: 'active' },
  },
  { timestamps: true }
);

// Compound index
customerSchema.index({ merchantId: 1, merchantUserId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
