// One-off: retarget fragrance-specific coupon docs in DB to makeup products
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import { Coupon } from '../models/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const UPDATES = {
  SH7NOIR15: { appliesTo: 'sh7-matte-lipstick-ruby', description: '15% off on Velvet Suede Lipstick • Royal Ruby' },
  SH7GOLD10: { appliesTo: 'sh7-gold-highlighter-10', description: '10% off on Champagne Gold Baked Highlighter' },
  SH7LUNAR12: { appliesTo: 'sh7-peptide-lip-mask-15', description: '12% off on Overnight Peptide Lip Sleeping Mask' },
  SH7AMBER15: { appliesTo: 'sh7-matte-foundation-30', description: '15% off on Velvet Matte HD Foundation' },
}

async function run() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...')
    await connectDB()

    for (const [code, fields] of Object.entries(UPDATES)) {
      const res = await Coupon.findOneAndUpdate({ code }, { $set: fields }, { new: true })
      if (res) {
        console.log(`✓ ${code} → ${res.appliesTo} | ${res.description}`)
      } else {
        console.log(`⚠ ${code} not found in DB`)
      }
    }

    // Verify: no coupon should reference a deleted fragrance product id anymore
    const stale = await Coupon.find({
      appliesTo: { $nin: ['sitewide', 'sh7-primer-30ml', 'sh7-matte-lipstick-ruby', 'sh7-gold-highlighter-10', 'sh7-peptide-lip-mask-15', 'sh7-matte-foundation-30'] },
    }).select('code appliesTo -_id').lean()
    console.log('VERIFY — stale coupon targets:', stale.length === 0 ? 'NONE (PASS)' : JSON.stringify(stale))

    const total = await Coupon.countDocuments({})
    console.log(`VERIFY — total coupons in DB: ${total}`)
  } catch (err) {
    console.error('ERROR:', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected')
  }
}

run()
