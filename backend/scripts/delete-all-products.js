// One-off: DELETE ALL products from DB (empty catalog — user will add real products via admin)
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import { Product } from '../models/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

async function run() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...')
    await connectDB()

    const before = await Product.countDocuments({})
    console.log(`Current products in DB: ${before}`)

    const del = await Product.deleteMany({})
    console.log(`Deleted ${del.deletedCount} products`)

    const after = await Product.countDocuments({})
    console.log(`VERIFY — products remaining: ${after} ${after === 0 ? '(PASS — catalog empty)' : '(FAIL)'}`)
  } catch (err) {
    console.error('ERROR:', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected')
  }
}

run()
