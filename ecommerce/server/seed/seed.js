const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const seedProducts = require('./seedProductsData');

dotenv.config({ path: '../.env' });

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashion-ai-demo');
    console.log('MongoDB Connected for Seeding');

    await Product.deleteMany();
    console.log('Existing products removed');

    await Product.insertMany(seedProducts);
    console.log('Demo products seeded successfully!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
