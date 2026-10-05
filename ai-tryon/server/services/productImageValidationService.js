const fs = require('fs');
const path = require('path');
const SyncedProduct = require('../models/SyncedProduct');

const STORAGE_ROOT = path.join(__dirname, '../../../storage');

function resolveLocalImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return { type: 'remote', value: imageUrl };
  }
  const normalized = imageUrl.startsWith('/storage/')
    ? imageUrl.replace('/storage/', '')
    : imageUrl.replace(/^\//, '');
  return { type: 'local', value: path.join(STORAGE_ROOT, normalized) };
}

async function validateSyncedProductImages() {
  const products = await SyncedProduct.find({});
  const issues = [];
  let valid = 0;

  for (const product of products) {
    const productId = product.merchantProductId;
    const productName = product.name;
    const imagePath = product.imageUrl;

    if (!imagePath || !String(imagePath).trim()) {
      issues.push({ productId, productName, imagePath: imagePath || '', reason: 'empty_image_url' });
      continue;
    }

    const resolved = resolveLocalImagePath(imagePath);
    if (resolved.type === 'remote') {
      issues.push({ productId, productName, imagePath, reason: 'remote_url_not_allowed_for_demo' });
      continue;
    }

    if (!fs.existsSync(resolved.value)) {
      issues.push({ productId, productName, imagePath, reason: 'file_missing' });
      continue;
    }

    valid += 1;
  }

  return {
    total: products.length,
    valid,
    missing: issues.filter((i) => i.reason === 'file_missing' || i.reason === 'empty_image_url').length,
    invalid: issues.length,
    issues,
  };
}

module.exports = {
  validateSyncedProductImages,
  resolveLocalImagePath,
};
