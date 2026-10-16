import { Router } from 'express'
import { Order, Product, Coupon } from '../models/index.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()

// Helper to generate readable order number: SH-YYMMDD-XXXX
function generateOrderNo() {
  const dateStr = new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SH-${dateStr}-${rand}`
}

// POST /api/orders — Place a new order (Guest checkout allowed)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, address, paymentMethod, couponCode } = req.body || {}

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' })
    }
    if (!address || !address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      return res.status(400).json({ error: 'Complete delivery address is required' })
    }
    if (!paymentMethod || !['cod', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Valid payment method (cod or razorpay) required' })
    }

    // 1. Calculate subtotal & verify items
    let subtotal = 0
    const verifiedItems = []

    for (const item of items) {
      const p = await Product.findOne({ id: item.productId, active: true })
      if (!p) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` })
      }
      const qty = Math.max(1, parseInt(item.qty, 10) || 1)
      const linePrice = p.price * qty
      subtotal += linePrice

      verifiedItems.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty,
        image: p.image,
        size: p.size,
      })
    }

    // 2. Coupon calculation
    let discount = 0
    let appliedCoupon = null

    if (couponCode) {
      const c = await Coupon.findOne({
        code: String(couponCode).toUpperCase(),
        active: true,
      })

      if (c) {
        // Expiry check
        if (!c.expiresAt || new Date(c.expiresAt) >= new Date()) {
          // Applies to check
          let eligibleSubtotal = subtotal
          if (c.appliesTo !== 'sitewide') {
            const match = verifiedItems.find((i) => i.productId === c.appliesTo)
            eligibleSubtotal = match ? match.price * match.qty : 0
          }

          if (eligibleSubtotal > 0 && subtotal >= (c.minOrder || 0)) {
            if (c.type === 'percent') {
              discount = Math.round((eligibleSubtotal * c.value) / 100)
              if (c.maxDiscount && discount > c.maxDiscount) {
                discount = c.maxDiscount
              }
            } else if (c.type === 'flat') {
              discount = Math.min(eligibleSubtotal, c.value)
            }
            appliedCoupon = { code: c.code, discount }
          }
        }
      }
    }

    // 3. Shipping Calculation (Flipkart style: Free above ₹499, else ₹49)
    const discountedSubtotal = Math.max(0, subtotal - discount)
    const isFreeShippingCoupon = appliedCoupon?.code === 'FREESHIP'
    const shippingFee = discountedSubtotal >= 499 || isFreeShippingCoupon ? 0 : 49

    // 4. COD handling fee (₹25 confirmed)
    const codFee = paymentMethod === 'cod' ? 25 : 0

    // 5. Grand Total (GST already inclusive)
    const total = discountedSubtotal + shippingFee + codFee

    // 6. Create order in MongoDB
    const orderNo = generateOrderNo()
    const order = await Order.create({
      orderNo,
      userId: req.auth?.id || null,
      items: verifiedItems,
      coupon: appliedCoupon,
      subtotal,
      discount,
      shippingFee,
      codFee,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'placed',
      address: {
        name: String(address.name).trim(),
        phone: String(address.phone).trim(),
        email: String(address.email || '').trim(),
        line1: String(address.line1).trim(),
        city: String(address.city).trim(),
        state: String(address.state || '').trim(),
        pincode: String(address.pincode).trim(),
      },
      placedAt: new Date(),
    })

    // Increment coupon usage if used
    if (appliedCoupon?.code) {
      await Coupon.updateOne({ code: appliedCoupon.code }, { $inc: { usedCount: 1 } })
    }

    res.status(201).json({
      success: true,
      orderNo: order.orderNo,
      order,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/orders/my — Logged-in user's order history
router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.auth.id }).sort({ createdAt: -1 }).lean()
    res.json({ count: orders.length, orders })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/orders/:orderNo — Single order lookup by order number
router.get('/:orderNo', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo }).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })

    // Privacy: if order belongs to a user, only that user or admin can view
    if (order.userId && (!req.auth || (req.auth.id !== order.userId.toString() && req.auth.role !== 'admin'))) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ order })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
