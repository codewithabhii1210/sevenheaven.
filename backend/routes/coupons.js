import { Router } from 'express'
import { Coupon } from '../models/index.js'

const router = Router()

// GET /api/coupons — active coupons (public — hints dikhane ke liye)
router.get('/', async (req, res) => {
  const coupons = await Coupon.find({ active: true }).lean()
  res.json({ count: coupons.length, coupons })
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
