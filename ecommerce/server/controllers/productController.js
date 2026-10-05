const Product = require('../models/Product');
const { validateMerchantProductImages } = require('../services/productImageValidationService');

function normalizeProduct(product) {
  const obj = product.toObject ? product.toObject() : { ...product };
  if (!obj.imageUrl && obj.image) obj.imageUrl = obj.image;
  if (!obj.image && obj.imageUrl) obj.image = obj.imageUrl;
  return obj;
}

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products.map(normalizeProduct));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (product) {
      res.json(normalizeProduct(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products.map(normalizeProduct));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const validateProductImages = async (req, res) => {
  try {
    const report = await validateMerchantProductImages();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Validation failed' });
  }
};

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  validateProductImages,
};
