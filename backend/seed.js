import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import { Product, Coupon, User } from './models/index.js'

// Import data from frontend data files
import { products } from '../frontend/src/data/products.js'
import { coupons } from '../frontend/src/data/coupons.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Root level .env load karo (folder ke bahar)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...')
    await connectDB()

    // 1. Seed Products
    console.log(`📦 Seeding ${products.length} products...`)
    for (const p of products) {
      await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true })
      console.log(`   ✓ Product: ${p.name} (${p.category}) - ₹${p.price}`)
    }

    // 2. Seed Coupons
    console.log(`🎟️ Seeding ${coupons.length} coupons...`)
    for (const c of coupons) {
      await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true })
      console.log(`   ✓ Coupon: ${c.code} (${c.type}: ${c.value}${c.type === 'percent' ? '%' : ''})`)
    }

    // 3. Seed Default Admin (only when ADMIN_PASSWORD is provided — no hardcoded fallback)
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.log('⚠️  Skipping admin seed: ADMIN_EMAIL / ADMIN_PASSWORD not set in environment')
    } else {
      console.log(`👑 Creating/Updating Admin (${adminEmail})...`)
      const passwordHash = await bcrypt.hash(adminPassword, 12)

      await User.findOneAndUpdate(
        { email: adminEmail.toLowerCase() },
        {
          name: 'Seven Heaven Admin',
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'admin',
          phone: '9201991418',
        },
        { upsert: true, new: true }
      )
      console.log(`   ✓ Admin ready: ${adminEmail}`)
    }

    console.log('\n🎉 Database Seeded Successfully!')
  } catch (err) {
    console.error('❌ Seeding error:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from DB')
  }
}

seed()
