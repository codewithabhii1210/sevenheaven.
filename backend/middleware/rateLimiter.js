import rateLimit from 'express-rate-limit'

// Helper for standardized rate-limit responses
const rateLimitResponse = (message) => ({
  error: message,
  retryAfter: 'Please wait before trying again.',
})

// 1. General API rate limiter (DDoS protection)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: rateLimitResponse('Too many requests from this IP, please try again after 15 minutes.'),
})

// 2. Strict Auth limiter (Brute-force password guessing protection)
// skipSuccessfulRequests: only FAILED attempts consume the budget, so a
// legitimate customer logging in repeatedly is never locked out by mistake.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed attempts per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: rateLimitResponse('Too many login attempts. For security, please wait 15 minutes.'),
})

// 3. Order creation limiter (Spam / Fake order bot protection)
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Max 15 orders per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Order rate limit reached. Please contact support if you need assistance.'),
})

// 4. Contact form & Newsletter limiter (Email inbox spam protection)
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 messages per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Message limit reached. Please try again later.'),
})
