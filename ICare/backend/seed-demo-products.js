import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/productModel.js';

dotenv.config();

const products = [
  {
    name: 'Classic Black Optical Frame',
    slug: 'classic-black-optical-frame',
    image: '/images/demo-classic.svg',
    brand: 'ICare',
    category: 'Optical Frames',
    description: 'Lightweight black rectangular frame for everyday prescription glasses. Demo product; lenses sold separately.',
    price: 4500,
    countInStock: 15,
  },
  {
    name: 'Round Gold Optical Frame',
    slug: 'round-gold-optical-frame',
    image: '/images/demo-round.svg',
    brand: 'ICare',
    category: 'Optical Frames',
    description: 'Slim gold-tone round frame with adjustable nose pads. Demo product; lenses sold separately.',
    price: 6200,
    countInStock: 10,
  },
  {
    name: 'Aviator Sunglasses',
    slug: 'aviator-sunglasses',
    image: '/images/demo-aviator.svg',
    brand: 'ICare',
    category: 'Sunglasses',
    description: 'Classic aviator-style sunglasses with a lightweight metal frame and dark lenses. Sample item for the store demo.',
    price: 5800,
    countInStock: 12,
  },
  {
    name: 'Tortoiseshell Reading Glasses +1.50',
    slug: 'tortoiseshell-reading-glasses-150',
    image: '/images/demo-reading.svg',
    brand: 'ICare',
    category: 'Reading Glasses',
    description: 'Brown tortoiseshell-style reading glasses with +1.50 lenses. Sample item for the store demo.',
    price: 2800,
    countInStock: 20,
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  for (const product of products) {
    await Product.updateOne(
      { slug: product.slug },
      { $setOnInsert: { ...product, rating: 0, numReviews: 0, reviews: [] } },
      { upsert: true, runValidators: true }
    );
  }
  console.log('Demo products ready. Existing products and accounts were preserved.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
