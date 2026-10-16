import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './db.js'

// Route imports
import productsRouter from './routes/products.js'
import couponsRouter from './routes/coupons.js'
import authRouter from './routes/auth.js'
import ordersRouter from './routes/orders.js'
import razorpayRouter from './routes/razorpay.js'
import contactRouter from './routes/contact.js'
import adminRouter from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Root level .env load karo (folder ke bahar)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'https://sevenheaven.co.in',
  'https://www.sevenheaven.co.in',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, true) // dev friendly fallback
    },
    credentials: true,
  })
)

app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Seven Heaven Cosmetics',
    tagline: 'Beauty Beyond Imagination',
    timestamp: new Date().toISOString(),
  })
})

// Mount API routes
app.use('/api/products', productsRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/razorpay', razorpayRouter)
app.use('/api/contact', contactRouter)
app.use('/api/admin', adminRouter)

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
})

// Start server after DB connection
async function startServer() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`🚀 Seven Heaven Backend running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to connect DB and start server:', err)
    process.exit(1)
  }
}

startServer()

export default app
