const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { syncProducts } = require('../services/productSyncService');
const SyncedProduct = require('../models/SyncedProduct');
const Customer = require('../models/Customer');
const Outfit = require('../models/Outfit');
const TryOnResult = require('../models/TryOnResult');
const Merchant = require('../models/Merchant');
const demoProvider = require('../services/tryon/DemoTryOnProvider');

const router = express.Router();

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:6001';

// ------------------------------------
// 1. SYNC
// ------------------------------------
router.post('/sync/products', async (req, res) => {
  try {
    const merchantId = req.body.merchantId || 'merchant_demo';
    const result = await syncProducts(merchantId);
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sync failed completely' });
  }
});

// ------------------------------------
// 2. PRODUCTS
// ------------------------------------
router.get('/products', async (req, res) => {
  try {
    const products = await SyncedProduct.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});


// ------------------------------------
// 3. IMAGE VALIDATION
// ------------------------------------
router.get('/products/validate-images', async (req, res) => {
  try {
    const SyncedProduct = require('../models/SyncedProduct');
    const products = await SyncedProduct.find({});
    let valid = 0, missing = 0, invalid = 0;
    const errors = [];
    const storageRoot = require('path').join(__dirname, '../../../storage');

    for (const product of products) {
      if (!product.imageUrl) {
        missing++;
        errors.push({ productId: product.merchantProductId, name: product.name, reason: 'Missing imageUrl in DB' });
        console.log('[PRODUCT IMAGE] ' + product.merchantProductId + ' -> (none) -> MISSING');
        continue;
      }
      
      const relativePath = product.imageUrl.replace(/^\/storage\//, '');
      const absPath = require('path').join(storageRoot, relativePath);
      const urlForClient = product.imageUrl.startsWith('http') ? product.imageUrl : 'http://127.0.0.1:6001' + product.imageUrl;
      
      try {
        await require('fs').promises.access(absPath);
        
        const hasWarning = ['pack', 'set', 'multipack'].some(kw => (product.name||'').toLowerCase().includes(kw));
        console.log('[PRODUCT IMAGE] ' + product.merchantProductId + ' -> ' + urlForClient + ' -> VALID' + (hasWarning ? ' (Warning: Multi-garment?)' : ''));
        
        const { isProductValidForDemo } = require('../utils/demoValidator');
        if (!isProductValidForDemo(product)) {
          invalid++;
          errors.push({ productId: product.merchantProductId, name: product.name, reason: 'Invalid for Demo (Women\'s)' });
        } else {
          valid++;
        }
      } catch (err) {
        invalid++;
        console.log('[PRODUCT IMAGE] ' + product.merchantProductId + ' -> ' + urlForClient + ' -> FILE NOT FOUND');
        errors.push({ productId: product.merchantProductId, name: product.name, imageUrl: product.imageUrl, reason: 'File not found on disk' });
      }
    }
    res.json({ success: true, summary: { total: products.length, valid, missing, invalid }, errors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Validation failed: ' + err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await SyncedProduct.findOne({ merchantProductId: req.params.id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// ------------------------------------
// 3. CUSTOMERS & IMAGES
// ------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../storage/users'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `user_${req.params.merchantUserId}_${Date.now()}_${uuidv4().slice(0, 6)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WEBP are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

router.post('/customers/:merchantId/:merchantUserId/photo', (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Please upload an image smaller than 5 MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    
    try {
      const { merchantId, merchantUserId } = req.params;
      if (!req.file) return res.status(400).json({ success: false, message: 'No photo provided.' });

      const imagePath = `/storage/users/${req.file.filename}`;
      const imageId = uuidv4();

      let customer = await Customer.findOne({ merchantId, merchantUserId });
      
      if (customer) {
        // Delete old image if it exists
        if (customer.imagePath) {
          const oldFile = path.join(__dirname, '../../../storage/users', path.basename(customer.imagePath));
          try {
            await fs.unlink(oldFile);
          } catch (e) {
            // File may already be gone; not a critical error
          }
        }
        
        customer.imagePath = imagePath;
        customer.imageId = imageId;
        await customer.save();
      } else {
        customer = await Customer.create({ merchantId, merchantUserId, imageId, imagePath });
      }

      res.json({ success: true, imageUrl: `${BASE_URL}${imagePath}`, customer });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Upload failed internally' });
    }
  });
});

router.get('/customers/:merchantId/:merchantUserId/photo', async (req, res) => {
  try {
    const customer = await Customer.findOne({ merchantId: req.params.merchantId, merchantUserId: req.params.merchantUserId });
    if (!customer || !customer.imagePath) {
      return res.json({ success: true, hasPhoto: false });
    }
    res.json({ success: true, hasPhoto: true, imageUrl: `${BASE_URL}${customer.imagePath}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer photo' });
  }
});

router.delete('/customers/:merchantId/:merchantUserId/photo', async (req, res) => {
  try {
    const customer = await Customer.findOne({ merchantId: req.params.merchantId, merchantUserId: req.params.merchantUserId });
    if (!customer || !customer.imagePath) {
      return res.status(404).json({ success: false, message: 'No photo found' });
    }

    const oldFile = path.join(__dirname, '../../../storage/users', path.basename(customer.imagePath));
    try {
      await fs.unlink(oldFile);
    } catch (e) {
      // not critical
    }
    
    customer.imagePath = '';
    customer.imageId = '';
    await customer.save();

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

const { generateOutfits } = require('../services/outfit/outfitEngine');

const { generateAllCombinations } = require('../services/outfit/allProductPairingService');

// ------------------------------------
// 4. OUTFITS
// ------------------------------------
router.get('/outfits', async (req, res) => {
  try {
    const merchantId = req.query.merchantId || 'merchant_demo';
    const result = await generateAllCombinations(merchantId);
    // Send the dynamic combinations matching the requested format
    res.json({
      success: true,
      total: result.totalCombinations,
      tops: result.topsCount,
      bottoms: result.bottomsCount,
      outfits: result.combinations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate dynamic outfits' });
  }
});

router.get('/outfits/validate', async (req, res) => {
  try {
    const outfits = await Outfit.find({});
    const results = [];

    for (const o of outfits) {
      const issues = [];

      // Check top product
      const top = await SyncedProduct.findOne({ merchantProductId: o.topProductId });
      if (!top) issues.push(`topProductId "${o.topProductId}" not found in synced products`);

      // Check bottom product
      const bottom = await SyncedProduct.findOne({ merchantProductId: o.bottomProductId });
      if (!bottom) issues.push(`bottomProductId "${o.bottomProductId}" not found in synced products`);

      // Check products belong to same merchant
      if (top && bottom && top.merchantId !== bottom.merchantId) {
        issues.push(`top and bottom products belong to different merchants`);
      }

      results.push({
        outfitId: o.outfitId,
        topProductId: o.topProductId,
        bottomProductId: o.bottomProductId,
        topName: top?.name || null,
        bottomName: bottom?.name || null,
        valid: issues.length === 0,
        issues
      });
    }

    const validOutfits = results.filter(r => r.valid).length;
    const invalidOutfits = results.filter(r => !r.valid).length;

    res.json({
      valid: invalidOutfits === 0,
      totalOutfits: results.length,
      validOutfits,
      invalidOutfits,
      outfits: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Validation failed' });
  }
});

router.get('/outfits/for-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const outfit = await Outfit.findOne({
      $or: [{ topProductId: productId }, { bottomProductId: productId }],
      status: 'active',
    });
    if (!outfit) {
      return res.status(404).json({ success: false, message: 'No outfit includes this product yet.' });
    }
    const top = await SyncedProduct.findOne({ merchantProductId: outfit.topProductId });
    const bottom = await SyncedProduct.findOne({ merchantProductId: outfit.bottomProductId });
    res.json({ success: true, outfitId: outfit.outfitId, outfit: { ...outfit.toObject(), top, bottom } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to lookup outfit for product' });
  }
});

router.get('/outfits/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let merchantId = 'merchant_demo';
    let topProductId, bottomProductId;

    // Check if ID is in the format merchantId:topId:bottomId or topId_bottomId
    if (id.includes(':')) {
      [merchantId, topProductId, bottomProductId] = id.split(':');
    } else if (id.includes('_')) {
      [topProductId, bottomProductId] = id.split('_');
    } else {
      // Fallback for old outfit IDs if they exist
      const outfit = await Outfit.findOne({ outfitId: id });
      if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found' });
      const top = await SyncedProduct.findOne({ merchantProductId: outfit.topProductId });
      const bottom = await SyncedProduct.findOne({ merchantProductId: outfit.bottomProductId });
      return res.json({ ...outfit.toObject(), top, bottom });
    }

    const top = await SyncedProduct.findOne({ merchantId, merchantProductId: topProductId });
    const bottom = await SyncedProduct.findOne({ merchantId, merchantProductId: bottomProductId });

    if (!top || !bottom) {
      return res.status(404).json({ success: false, message: 'One or both products not found for this combination.' });
    }

    const outfitId = `${merchantId}:${topProductId}:${bottomProductId}`;

    res.json({
      outfitId,
      merchantId,
      topProductId,
      bottomProductId,
      top,
      bottom
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch outfit combination' });
  }
});

router.post('/outfits/generate', async (req, res) => {
  try {
    const merchantId = req.body.merchantId || 'merchant_demo';
    const outfits = await generateOutfits(merchantId);
    res.json({ success: true, count: outfits.length, outfits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate outfits' });
  }
});

// ------------------------------------
// 5. TRY-ON — STRICT VALIDATION
// ------------------------------------
router.post('/tryon', async (req, res) => {
  try {
    const { merchantId, merchantUserId, topProductId, bottomProductId } = req.body;

    // Validate required fields
    if (!merchantId || !merchantUserId || !topProductId || !bottomProductId) {
      return res.status(400).json({ success: false, message: 'merchantId, merchantUserId, topProductId, and bottomProductId are required.' });
    }

    // 1. Verify customer exists and has a photo
    const customer = await Customer.findOne({ merchantId, merchantUserId });
    if (!customer || !customer.imagePath) {
      return res.status(404).json({ success: false, message: 'Please upload your photo first.' });
    }

    // 2. Verify top product exists
    const topProduct = await SyncedProduct.findOne({ merchantId, merchantProductId: topProductId });
    if (!topProduct) {
      return res.status(422).json({ success: false, message: `Top product "${topProductId}" not found for this merchant. Please sync products.` });
    }

    // 3. Verify bottom product exists
    const bottomProduct = await SyncedProduct.findOne({ merchantId, merchantProductId: bottomProductId });
    if (!bottomProduct) {
      return res.status(422).json({ success: false, message: `Bottom product "${bottomProductId}" not found for this merchant. Please sync products.` });
    }

    // Define deterministic outfitId
    const outfitId = `${merchantId}:${topProductId}:${bottomProductId}`;

    // Construct virtual outfit object
    const outfit = {
      outfitId,
      merchantId,
      topProductId,
      bottomProductId,
      top: topProduct,
      bottom: bottomProduct
    };

    // 4. Check for cached result (tied to merchantId + merchantUserId + top + bottom)
    let tryOnResult = await TryOnResult.findOne({ merchantId, merchantUserId, outfitId, status: 'completed' });
    
    if (tryOnResult) {
      return res.json({
        success: true,
        resultId: tryOnResult.resultId,
        status: tryOnResult.status,
        resultImagePath: tryOnResult.resultImagePath,
        outfitId,
        outfit
      });
    }

    // 5. Create new processing record
    const resultId = `result_${uuidv4().slice(0, 8)}`;
    const outfitKey = `${topProductId}_${bottomProductId}`;
    tryOnResult = await TryOnResult.create({
      resultId, merchantId, merchantUserId, outfitId, outfitKey,
      topProductId, bottomProductId,
      inputImageId: customer.imageId, status: 'processing'
    });

    // 6. Generate result — DemoTryOnProvider returns "outfit://outfitId"
    const resultImagePath = await demoProvider.generateTryOn(customer, outfit);

    tryOnResult.status = 'completed';
    tryOnResult.resultImagePath = resultImagePath;
    await tryOnResult.save();

    res.json({
      success: true,
      resultId: tryOnResult.resultId,
      status: tryOnResult.status,
      resultImagePath,
      outfitId,
      outfit
    });
  } catch (error) {
    console.error('[TRYON ERROR]', error);
    res.status(500).json({ success: false, message: error.message || 'Unable to create the try-on preview. Please try again.' });
  }
});

router.get('/tryon/:resultId', async (req, res) => {
  try {
    const tryon = await TryOnResult.findOne({ resultId: req.params.resultId });
    if (!tryon) return res.status(404).json({ success: false, message: 'Result not found' });
    
    const outfit = await Outfit.findOne({ outfitId: tryon.outfitId });
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit for this result no longer exists' });

    // STRICT: verify result belongs to this outfit
    if (tryon.outfitId !== outfit.outfitId) {
      return res.status(409).json({ success: false, message: 'Result/outfit mismatch detected.' });
    }

    const top = await SyncedProduct.findOne({ merchantProductId: outfit.topProductId });
    const bottom = await SyncedProduct.findOne({ merchantProductId: outfit.bottomProductId });
    
    res.json({ ...tryon.toObject(), outfit: { ...outfit.toObject(), top, bottom } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tryon result' });
  }
});

router.get('/dashboard-stats', async (req, res) => {
  const products = await SyncedProduct.countDocuments();
  const outfits = await Outfit.countDocuments();
  const tryons = await TryOnResult.countDocuments();
  const lastProduct = await SyncedProduct.findOne().sort({ syncedAt: -1 });
  const lastSynced = lastProduct ? lastProduct.syncedAt : null;
  
  res.json({ products, outfits, tryons, lastSynced });
});

module.exports = router;
