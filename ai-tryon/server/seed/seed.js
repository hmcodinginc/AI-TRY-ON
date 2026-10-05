const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Merchant = require('../models/Merchant');
const Outfit = require('../models/Outfit');

dotenv.config({ path: '../.env' });

const seedAI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_tryon_db');
    console.log('AI DB Connected for Seeding');

    await Merchant.deleteMany();
    await Outfit.deleteMany();

    await Merchant.create({
      merchantId: 'merchant_demo',
      name: 'Demo Fashion Store',
      websiteUrl: 'http://localhost:5173',
      apiBaseUrl: 'http://localhost:5000',
      status: 'active'
    });
    
    // We'll create generic outfits (assumes Phase 1 products are synced soon)
    const outfits = [
      { topProductId: 'P-1001', bottomProductId: 'P-4001', merchantId: 'merchant_demo', outfitId: 'outfit_001', previewImage: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=500&q=60' },
      { topProductId: 'P-1001', bottomProductId: 'P-4002', merchantId: 'merchant_demo', outfitId: 'outfit_002', previewImage: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=500&q=60' },
      { topProductId: 'P-1002', bottomProductId: 'P-3001', merchantId: 'merchant_demo', outfitId: 'outfit_003', previewImage: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=500&q=60' },
      { topProductId: 'P-2002', bottomProductId: 'P-3001', merchantId: 'merchant_demo', outfitId: 'outfit_004', previewImage: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=500&q=60' },
      { topProductId: 'P-1003', bottomProductId: 'P-4001', merchantId: 'merchant_demo', outfitId: 'outfit_005', previewImage: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=500&q=60' },
      { topProductId: 'P-1002', bottomProductId: 'P-4002', merchantId: 'merchant_demo', outfitId: 'outfit_006', previewImage: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=500&q=60' }
    ];
    await Outfit.insertMany(outfits);
    console.log('Merchant and Outfits seeded.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seedAI();
