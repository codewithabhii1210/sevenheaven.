import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Root level .env load karo (folder ke bahar)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI missing — root .env me connection string daalo')
  }
  await mongoose.connect(uri)
  console.log('✅ MongoDB Atlas connected →', mongoose.connection.name)
}
