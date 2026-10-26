// One-off: DELETE all 50 products from DB, re-list ONLY the 24 makeup/cosmetics products
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import { Product } from '../models/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') }) // repo root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') }) // backend/.env (override)
dotenv.config()

// Top-rated makeup picks to carry the "featured" flag after fragrance removal
const NEW_FEATURED = new Set([
  'invisible-blur-primer',
  'overnight-peptide-lip-sleeping-mask',
  'velvet-suede-lipstick-bhopal-nude',
  'waterproof-gel-kohl-smokey-kajal',
  '24k-gold-nourishing-lip-oil',
])

async function run() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...')
    await connectDB()

    const makeup = await Product.find({ category: 'makeup' }).lean()
    console.log(`Found ${makeup.length} makeup products to keep`)
    if (makeup.length !== 24) {
      console.log('WARN: expected 24 makeup products')
    }

    const fragranceCount = await Product.countDocuments({ category: 'fragrance' })
    const totalCount = await Product.countDocuments({})
    console.log(`Current DB: ${totalCount} products (${fragranceCount} fragrance to delete)`)

    // 1. Wipe catalog
    const del = await Product.deleteMany({})
    console.log(`Deleted ${del.deletedCount} products`)

    // 2. Re-list only makeup (strip Mongo _id so fresh ids are generated; keep custom id/slug)
    const docs = makeup.map(({ _id, __v, ...rest }) => ({
      ...rest,
      featured: NEW_FEATURED.has(rest.slug),
    }))
    await Product.insertMany(docs)
    console.log(`Inserted ${docs.length} cosmetics products`)

    // 3. Verify
    const total = await Product.countDocuments({})
    const byCat = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])
    const featured = await Product.find({ featured: true }).select('slug -_id').lean()
    const unsplash = await Product.countDocuments({ image: /unsplash/ })
    console.log(`VERIFY — total: ${total} | byCat: ${JSON.stringify(byCat)}`)
    console.log(`VERIFY — featured: ${featured.map((f) => f.slug).join(', ')}`)
    console.log(`VERIFY — unsplash images: ${unsplash}`)
  } catch (err) {
    console.error('ERROR:', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected')
  }
}

run()
