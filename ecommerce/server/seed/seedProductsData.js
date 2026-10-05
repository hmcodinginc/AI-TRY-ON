const catalog = require('../../../scripts/productCatalog.json');

const descriptions = {
  'P-1001': 'A comfortable brown casual shirt perfect for everyday wear.',
  'P-1002': 'Classic white Oxford shirt for a sharp, professional look.',
  'P-1003': 'Sleek black slim fit shirt.',
  'P-2001': 'Trendy white oversized t-shirt for a relaxed fit.',
  'P-2002': 'Essential black t-shirt made from premium cotton.',
  'P-3001': 'Classic blue straight leg jeans.',
  'P-3002': 'Modern black slim fit jeans with stretch.',
  'P-4001': 'Versatile beige chinos suitable for work or weekend.',
  'P-4002': 'Elegant black formal trousers.',
  'P-5001': 'Timeless blue denim jacket.',
  'P-5002': 'Sleek black bomber jacket for a modern streetwear look.',
  'P-6001': 'Lightweight black summer dress.',
  'P-6002': 'Beautiful floral print midi dress.',
};

const sizes = {
  Shirts: ['S', 'M', 'L', 'XL'],
  'T-Shirts': ['XS', 'S', 'M', 'L', 'XL'],
  Jeans: ['28', '30', '32', '34', '36'],
  Pants: ['30', '32', '34', '36'],
  Jackets: ['S', 'M', 'L', 'XL'],
  Dresses: ['XS', 'S', 'M', 'L'],
};

const prices = {
  'P-1001': 39.99, 'P-1002': 49.99, 'P-1003': 45.0, 'P-2001': 24.99, 'P-2002': 19.99,
  'P-3001': 59.99, 'P-3002': 64.99, 'P-4001': 49.99, 'P-4002': 55.0, 'P-5001': 79.99,
  'P-5002': 89.99, 'P-6001': 45.99, 'P-6002': 59.99,
};

const seedProducts = catalog.map((item) => ({
  productId: item.productId,
  name: item.name,
  category: item.category,
  subcategory: item.subcategory,
  gender: item.gender || 'unknown',
  description: descriptions[item.productId] || `${item.name} from our collection.`,
  color: item.color,
  sizes: sizes[item.category] || ['S', 'M', 'L'],
  price: prices[item.productId] || 29.99,
  imageUrl: `/storage/products/${item.imageFile}`,
  image: `/storage/products/${item.imageFile}`,
  stock: 40,
  rating: 4.5,
  reviewCount: 10,
  isAvailable: true,
}));

module.exports = seedProducts;
