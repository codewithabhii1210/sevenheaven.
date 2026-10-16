import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

// Extract token from Bearer header OR HttpOnly cookie
function extractToken(req) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim()
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }
  return null
}

// 1. Enforce Authentication (RBAC Base)
export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Access denied: Authentication required' })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub).select('-passwordHash')
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists' })
    }

    req.auth = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      user,
    }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' })
    }
    return res.status(401).json({ error: 'Invalid or forged token' })
  }
}

// 2. Role-Based Access Control (RBAC Enforcement)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges for this resource',
      })
    }
    next()
  }
}

// Shortcut for admin-only endpoints
export const adminOnly = requireRole('admin')

// 3. Optional Authentication (allows guest or logged-in user)
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(payload.sub).select('-passwordHash')
      if (user) {
        req.auth = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          user,
        }
      }
    }
  } catch {
    // Silently continue for guests
  }
  next()
}
