const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const STORAGE_ROOT = path.join(__dirname, '../../../storage');

function resolveLocalImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return { type: 'remote', value: imageUrl };
  }
  let normalized = imageUrl;
  if (normalized.startsWith('/storage/')) {
    normalized = normalized.replace('/storage/', '');
  } else if (normalized.startsWith('/images/')) {
    normalized = `products/${path.basename(normalized)}`;
  } else {
    normalized = normalized.replace(/^\//, '');
  }
  return { type: 'local', value: path.join(STORAGE_ROOT, normalized) };
}

async function validateMerchantProductImages() {
  const products = await Product.find({});
  const issues = [];
  let valid = 0;

  for (const product of products) {
    const productId = product.productId;
    const productName = product.name;
    const imagePath = product.imageUrl || product.image;

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

module.exports = { validateMerchantProductImages };
