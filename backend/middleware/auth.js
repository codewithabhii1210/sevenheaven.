import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

// Bearer token verify → req.auth = { id, email, role }
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Login required' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.auth = { id: payload.sub, email: payload.email, role: payload.role }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Sirf admin access
export function adminOnly(req, res, next) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Optional auth — token ho to user info laga do, warna chalta reh
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.auth = { id: payload.sub, email: payload.email, role: payload.role }
    } catch {
      /* ignore */
    }
  }
  next()
}

export async function getUserById(id) {
  return User.findById(id).select('-passwordHash')
}
