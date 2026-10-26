import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { requireAuth } from '../middleware/auth.js'
import { sanitize } from '../middleware/sanitize.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { connectDB } from '../db.js'

const router = Router()

// Cookie security options (Secure, HttpOnly, SameSite)
const cookieOptions = {
  httpOnly: true, // Prevents XSS cookie theft
  secure: process.env.NODE_ENV === 'production', // Transmit only over HTTPS in production
  sameSite: 'lax', // Protects against CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  )
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.createdAt,
  }
}

// POST /api/auth/register (Rate-limited, Strong Password Enforced)
router.post('/register', authLimiter, async (req, res) => {
  try {
    const rawName = sanitize.string(req.body?.name, 60)
    const rawEmail = sanitize.email(req.body?.email)
    const rawPhone = req.body?.phone ? sanitize.phone(req.body.phone) : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''

    if (!rawName || rawName.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name' })
    }
    if (!rawEmail) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }
    if (!sanitize.isStrongPassword(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long and contain both letters and numbers for your security.',
      })
    }

    const exists = await User.findOne({ email: rawEmail })
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    // 12 rounds bcrypt salt for military-grade password hashing
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      name: rawName,
      email: rawEmail,
      phone: rawPhone,
      passwordHash,
      role: 'customer',
    })

    const token = signToken(user)
    res.cookie('token', token, cookieOptions)

    res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    })
  } catch (err) {
    console.error('Registration Error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// POST /api/auth/login (Rate-limited against brute-force)
router.post('/login', authLimiter, async (req, res) => {
  try {
    await connectDB()
    const rawEmail = sanitize.email(req.body?.email)
    const password = typeof req.body?.password === 'string' ? req.body.password : ''

    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: rawEmail.toLowerCase() })
    if (!user) {
      // Generic error message to prevent account enumeration
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user)
    res.cookie('token', token, cookieOptions)

    res.json({
      success: true,
      token,
      user: publicUser(user),
    })
  } catch (err) {
    console.error('Login Error:', err)
    res.status(500).json({ error: 'Login service currently unavailable' })
  }
})

// POST /api/auth/logout (Clear HttpOnly cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions)
  res.json({ success: true, message: 'Logged out successfully' })
})

// GET /api/auth/me (Get profile)
router.get('/me', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const user = await User.findById(req.auth.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// ============================================================
// ADDRESS MANAGEMENT (Flipkart-Style Multi-Address System)
// ============================================================

// GET /api/auth/addresses — List all saved addresses
router.get('/addresses', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const user = await User.findById(req.auth.id).select('addresses')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ addresses: user.addresses || [] })
  } catch (err) {
    console.error('Fetch addresses error:', err)
    res.status(500).json({ error: 'Failed to fetch addresses' })
  }
})

// POST /api/auth/addresses — Add a new address
router.post('/addresses', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const { name, phone, line1, city, state, pincode, type, isDefault } = req.body || {}

    const cleanName = sanitize.string(name, 60)
    const cleanPhone = sanitize.phone(phone)
    const cleanLine1 = sanitize.string(line1, 150)
    const cleanCity = sanitize.string(city, 60)
    const cleanState = sanitize.string(state || 'Madhya Pradesh', 60)
    const cleanPincode = sanitize.pincode(pincode)
    const cleanType = ['Home', 'Work', 'Other'].includes(type) ? type : 'Home'

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: 'Full name is required (min 2 characters)' })
    }
    if (!cleanPhone) {
      return res.status(400).json({ error: 'Valid 10-digit Indian phone number is required' })
    }
    if (!cleanLine1 || cleanLine1.length < 5) {
      return res.status(400).json({ error: 'Complete street address is required (min 5 characters)' })
    }
    if (!cleanCity) {
      return res.status(400).json({ error: 'City is required' })
    }
    if (!cleanPincode) {
      return res.status(400).json({ error: 'Valid 6-digit Indian postal pincode is required' })
    }

    const user = await User.findById(req.auth.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isFirstAddress = !user.addresses || user.addresses.length === 0
    const shouldBeDefault = isDefault || isFirstAddress

    if (shouldBeDefault && user.addresses) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false
      })
    }

    const newAddress = {
      name: cleanName,
      phone: cleanPhone,
      line1: cleanLine1,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      type: cleanType,
      isDefault: shouldBeDefault,
    }

    user.addresses.push(newAddress)
    await user.save()

    const added = user.addresses[user.addresses.length - 1]
    res.status(201).json({
      success: true,
      address: added,
      addresses: user.addresses,
    })
  } catch (err) {
    console.error('Add address error:', err)
    res.status(500).json({ error: 'Failed to save address' })
  }
})

// PUT /api/auth/addresses/:addressId — Edit existing address
router.put('/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const { addressId } = req.params
    const { name, phone, line1, city, state, pincode, type, isDefault } = req.body || {}

    const cleanName = sanitize.string(name, 60)
    const cleanPhone = sanitize.phone(phone)
    const cleanLine1 = sanitize.string(line1, 150)
    const cleanCity = sanitize.string(city, 60)
    const cleanState = sanitize.string(state || 'Madhya Pradesh', 60)
    const cleanPincode = sanitize.pincode(pincode)
    const cleanType = ['Home', 'Work', 'Other'].includes(type) ? type : 'Home'

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: 'Full name is required (min 2 characters)' })
    }
    if (!cleanPhone) {
      return res.status(400).json({ error: 'Valid 10-digit Indian phone number is required' })
    }
    if (!cleanLine1 || cleanLine1.length < 5) {
      return res.status(400).json({ error: 'Complete street address is required' })
    }
    if (!cleanCity) {
      return res.status(400).json({ error: 'City is required' })
    }
    if (!cleanPincode) {
      return res.status(400).json({ error: 'Valid 6-digit postal pincode is required' })
    }

    const user = await User.findById(req.auth.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const addr = user.addresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false
      })
    }

    addr.name = cleanName
    addr.phone = cleanPhone
    addr.line1 = cleanLine1
    addr.city = cleanCity
    addr.state = cleanState
    addr.pincode = cleanPincode
    addr.type = cleanType
    if (typeof isDefault === 'boolean') {
      addr.isDefault = isDefault
    }

    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    console.error('Update address error:', err)
    res.status(500).json({ error: 'Failed to update address' })
  }
})

// DELETE /api/auth/addresses/:addressId — Delete address
router.delete('/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const { addressId } = req.params

    const user = await User.findById(req.auth.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const addr = user.addresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    const wasDefault = addr.isDefault
    user.addresses.pull({ _id: addressId })

    // If deleted was default, promote first remaining address to default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    console.error('Delete address error:', err)
    res.status(500).json({ error: 'Failed to delete address' })
  }
})

// PATCH /api/auth/addresses/:addressId/default — Set default address
router.patch('/addresses/:addressId/default', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const { addressId } = req.params

    const user = await User.findById(req.auth.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    let found = false
    user.addresses.forEach((addr) => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true
        found = true
      } else {
        addr.isDefault = false
      }
    })

    if (!found) return res.status(404).json({ error: 'Address not found' })

    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    console.error('Set default address error:', err)
    res.status(500).json({ error: 'Failed to set default address' })
  }
})

export default router
