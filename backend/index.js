import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import { mongoSanitize } from './middleware/mongoSanitize.js'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { connectDB } from './db.js'

// Security Rate Limiters
import { apiLimiter } from './middleware/rateLimiter.js'

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
const isProd = process.env.NODE_ENV === 'production'

// ============================================================
// 1. TRUST PROXY & HTTPS REDIRECT (Production Security)
// ============================================================
app.set('trust proxy', 1)

if (isProd) {
  app.use((req, res, next) => {
    // Check if connection is TLS/HTTPS via reverse proxy (Hostinger, Render, Nginx, Cloudflare)
    const proto = req.headers['x-forwarded-proto']
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.hostname}${req.originalUrl}`)
    }
    next()
  })
}

// ============================================================
// 2. HELMET & HSTS (Strict Security Headers)
// ============================================================
app.disable('x-powered-by') // Hide Express identifier

app.use(
  helmet({
    // Enable HTTP Strict Transport Security (HSTS) - forces browsers to use HTTPS for 1 year
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Frameguard - prevent clickjacking attacks
    frameguard: { action: 'deny' },
    // Prevent MIME-type sniffing
    noSniff: true,
    // Referrer policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // Cross-origin resource policy
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// ============================================================
// 3. LOGGING & AUDIT TRAIL (Monitoring)
// ============================================================
if (isProd) {
  app.use(morgan('combined')) // Standard Apache combined log
} else {
  app.use(morgan('dev')) // Concise color-coded dev log
}

// ============================================================
// 4. CORS (Origin Restriction)
// ============================================================
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'https://sevenheaven.co.in',
  'https://www.sevenheaven.co.in',
]

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    if (/^https:\/\/sevenheaven[a-z0-9-]*\.vercel\.app$/.test(origin)) return callback(null, true)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true)
    // Reject unknown origins in production; allow-all fallback only for local dev
    if (process.env.NODE_ENV !== 'production') return callback(null, true)
    return callback(null, false)
  },
  credentials: true, // Allow cookies over CORS
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))

// ============================================================
// 5. BODY PARSERS & SANITIZATION (DOS & Injection Prevention)
// ============================================================
// Limit JSON payload to 50KB to block large memory allocation DDoS attacks
// verify hook preserves the raw body for Razorpay webhook HMAC signature checks
app.use(
  express.json({
    limit: '50kb',
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(express.urlencoded({ extended: true, limit: '50kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection (strips `$` and `.`)
app.use(mongoSanitize)

// Prevent HTTP Parameter Pollution (HPP)
app.use(hpp())

// Ensure DB connected on incoming requests (serverless / traditional)
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('[DB CONNECT ERROR]:', err.message)
    res.status(500).json({ error: 'Database service unavailable' })
  }
})

// Apply general API rate limiting to all endpoints
app.use('/api', apiLimiter)

// ============================================================
// 6. HEALTH CHECK (Monitoring & Uptime)
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Seven Heaven Cosmetics',
    tagline: 'Beauty Beyond Imagination',
    timestamp: new Date().toISOString(),
    environment: isProd ? 'production' : 'development',
  })
})

// ============================================================
// 7. ROUTE MOUNTING (with Admin Obscurity Support)
// ============================================================
app.use('/api/products', productsRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/razorpay', razorpayRouter)
app.use('/api/contact', contactRouter)

// Admin Route: mounted both at configured secret prefix and standard /api/admin
const adminPrefix = process.env.ADMIN_ROUTE_PREFIX || '/api/v1/sh7-control-panel'
app.use(adminPrefix, adminRouter)
app.use('/api/admin', adminRouter) // alias for dashboard compatibility

// ============================================================
// 8. 404 & ERROR HANDLING (Information Disclosure Prevention)
// ============================================================
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found or method not allowed' })
  }
  next()
})

// Global Error Handler — never leaks stack traces or system paths to clients
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]:', err)
  res.status(err.status || 500).json({
    error: isProd ? 'An internal error occurred. Please try again.' : err.message || 'Internal Server Error',
  })
})

// ============================================================
// 9. SERVER BOOTSTRAP
// ============================================================
async function startServer() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`🛡️  Seven Heaven Secure API running on port ${PORT}`)
      console.log(`   HSTS & Helmet: Active`)
      console.log(`   DDoS Rate Limiting: Active`)
      console.log(`   NoSQL Injection Filter: Active`)
      console.log(`   Admin Endpoint: ${adminPrefix}`)
    })
  } catch (err) {
    console.error('❌ Failed to connect database:', err)
    process.exit(1)
  }
}

// Only listen on port if not in serverless environment (Vercel handles HTTP server)
if (!process.env.VERCEL) {
  startServer()
}

export default app
