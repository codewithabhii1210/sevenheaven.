import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Root level .env load karo (folder ke bahar)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

let isConnecting = null

export async function connectDB() {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }
  if (mongoose.connection.readyState === 2 && isConnecting) {
    await isConnecting
    return mongoose.connection
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI missing — root .env ya Vercel environment variables me connection string daalo')
  }

  try {
    isConnecting = mongoose.connect(uri, {
      bufferCommands: false,
    })
    await isConnecting
    console.log('✅ MongoDB Atlas connected →', mongoose.connection.name)
    return mongoose.connection
  } finally {
    isConnecting = null
  }
}
