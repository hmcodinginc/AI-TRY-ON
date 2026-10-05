/**
 * Generates local e-commerce product images (SVG) matching catalog metadata.
 * Run: node scripts/generateProductImages.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../storage/products');

const COLOR_MAP = {
  Black: '#1a1a1a',
  White: '#f8f8f8',
  Brown: '#6b4423',
  Blue: '#2f5da8',
  Beige: '#d4c4a8',
  Navy: '#1e2a44',
  Multi: '#7b6b8a',
};

const catalog = require('./productCatalog.json');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function garmentType(category, subcategory) {
  const cat = category.toLowerCase();
  if (cat.includes('dress')) return 'dress';
  if (cat.includes('jacket')) return 'jacket';
  if (cat.includes('jeans') || cat.includes('pants') || cat.includes('trouser')) return 'bottom';
  if (cat.includes('shirt') || cat.includes('t-shirt') || cat.includes('top')) return 'top';
  return 'top';
}

function drawGarment(type, fill, stroke) {
  if (type === 'top') {
    return `
      <path d="M180 120 L220 120 L250 160 L270 320 L90 320 L110 160 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <path d="M180 120 L140 150 L110 160 M220 120 L260 150 L270 160" fill="none" stroke="${stroke}" stroke-width="3"/>
      <rect x="165" y="200" width="70" height="8" rx="4" fill="${stroke}" opacity="0.25"/>
    `;
  }
  if (type === 'bottom') {
    return `
      <path d="M110 140 L270 140 L250 330 L210 330 L190 220 L170 330 L130 330 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <path d="M110 140 L190 140 L210 180 L270 140" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.35"/>
    `;
  }
  if (type === 'jacket') {
    return `
      <path d="M170 110 L230 110 L260 150 L275 310 L85 310 L100 150 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <line x1="180" y1="110" x2="180" y2="310" stroke="${stroke}" stroke-width="2"/>
      <line x1="220" y1="110" x2="220" y2="310" stroke="${stroke}" stroke-width="2"/>
    `;
  }
  return `
    <path d="M160 110 L240 110 L255 300 L145 300 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    <path d="M160 110 Q200 170 240 110" fill="none" stroke="${stroke}" stroke-width="2"/>
  `;
}

function buildSvg(product) {
  const fill = COLOR_MAP[product.color] || '#888888';
  const stroke = product.color === 'White' ? '#cccccc' : '#111111';
  const type = garmentType(product.category, product.subcategory);
  const title = escapeXml(product.name);
  const meta = escapeXml(`${product.category} · ${product.color}`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <rect x="20" y="20" width="360" height="360" rx="16" fill="#ffffff" stroke="#e5e7eb"/>
  ${drawGarment(type, fill, stroke)}
  <text x="200" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#374151">${title}</text>
  <text x="200" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#6b7280">${meta}</text>
</svg>`;
}

function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const product of catalog) {
    const filename = product.imageFile;
    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, buildSvg(product), 'utf8');
    console.log('Wrote', outPath);
  }
}

run();
