const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    apiBaseUrl: { type: String, required: true },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Merchant', merchantSchema);
