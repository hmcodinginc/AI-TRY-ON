const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  validateProductImages,
} = require('../controllers/productController');

router.route('/').get(getProducts).post(createProduct);
router.get('/validate-images', validateProductImages);
router.route('/category/:category').get(getProductsByCategory);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

module.exports = router;
