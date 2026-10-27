import rateLimit from 'express-rate-limit'
import { MongoRateLimitStore } from './mongoRateLimitStore.js'

// Helper for standardized rate-limit responses
const rateLimitResponse = (message) => ({
  error: message,
  retryAfter: 'Please wait before trying again.',
})

// Persistent (MongoDB-backed) counters — shared across all Vercel serverless
// instances, so limits are GLOBAL instead of per-instance. Each limiter gets
// its own store instance with a unique prefix so budgets never collide.
// Stores fail open on database errors (see mongoRateLimitStore.js).
const store = (windowMs, prefix) => new MongoRateLimitStore({ windowMs, prefix })

// 1. General API rate limiter (DDoS protection)
const API_WINDOW = 15 * 60 * 1000 // 15 minutes
export const apiLimiter = rateLimit({
  windowMs: API_WINDOW,
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: store(API_WINDOW, 'api'),
  message: rateLimitResponse('Too many requests from this IP, please try again after 15 minutes.'),
})

// 2. Strict Auth limiter (Brute-force password guessing protection)
// skipSuccessfulRequests: only FAILED attempts consume the budget, so a
// legitimate customer logging in repeatedly is never locked out by mistake.
const AUTH_WINDOW = 15 * 60 * 1000 // 15 minutes
export const authLimiter = rateLimit({
  windowMs: AUTH_WINDOW,
  max: 10, // Max 10 failed attempts per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: store(AUTH_WINDOW, 'auth'),
  message: rateLimitResponse('Too many login attempts. For security, please wait 15 minutes.'),
})

// 3. Order creation limiter (Spam / Fake order bot protection)
const ORDER_WINDOW = 60 * 60 * 1000 // 1 hour
export const orderLimiter = rateLimit({
  windowMs: ORDER_WINDOW,
  max: 15, // Max 15 orders per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: store(ORDER_WINDOW, 'order'),
  message: rateLimitResponse('Order rate limit reached. Please contact support if you need assistance.'),
})

// 4. Contact form & Newsletter limiter (Email inbox spam protection)
const CONTACT_WINDOW = 60 * 60 * 1000 // 1 hour
export const contactLimiter = rateLimit({
  windowMs: CONTACT_WINDOW,
  max: 10, // Max 10 messages per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: store(CONTACT_WINDOW, 'contact'),
  message: rateLimitResponse('Message limit reached. Please try again later.'),
})
