import { Router } from 'express'
import { Coupon } from '../models/index.js'

const router = Router()

// GET /api/coupons — active coupons (public — hints dikhane ke liye)
router.get('/', async (req, res) => {
  const coupons = await Coupon.find({ active: true }).lean()
  res.json({ count: coupons.length, coupons })
})

// GET /api/coupons/validate?code=XYZ&subtotal=999 — frontend cart ke liye
// (iske baad hi `/:code` — warna 'validate' word code samajh liya jayega)
router.get('/validate', async (req, res) => {
  const code = String(req.query.code || '').toUpperCase().trim()
  const subtotal = Number(req.query.subtotal) || 0

  const coupon = await Coupon.findOne({ code, active: true }).lean()
  if (!coupon) return res.status(404).json({ valid: false, error: 'Invalid coupon code' })
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return res.status(410).json({ valid: false, error: 'Coupon expired' })
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return res.status(400).json({
      valid: false,
      error: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
    })
  }

  // Server-side discount calculation
  let discount = 0
  if (coupon.type === 'percent') {
    discount = Math.round((subtotal * coupon.value) / 100)
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  } else if (coupon.type === 'flat') {
    discount = Math.min(subtotal, coupon.value)
  } else if (coupon.type === 'freeShipping') {
    discount = 0 // shipping engine me freeShipping handle hota hai
  }

  res.json({
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      maxDiscount: coupon.maxDiscount ?? null,
      appliesTo: coupon.appliesTo ?? null,
      minOrder: coupon.minOrder ?? 0,
    },
    discount,
    total: Math.max(0, subtotal - discount),
  })
})

// GET /api/coupons/:code — validate one code
router.get('/:code', async (req, res) => {
  const coupon = await Coupon.findOne({
    code: req.params.code.toUpperCase(),
    active: true,
  }).lean()
  if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' })
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return res.status(410).json({ error: 'Coupon expired' })
  }
  res.json({ coupon })
})

export default router
