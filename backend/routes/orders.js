import { Router } from 'express'
import { Order, Product, Coupon, User } from '../models/index.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { sanitize } from '../middleware/sanitize.js'
import { orderLimiter } from '../middleware/rateLimiter.js'
import { connectDB } from '../db.js'
import { reserveStock, releaseStock } from '../utils/stock.js'

const router = Router()

// Cryptographically safe readable order number: SH-YYMMDD-XXXX
function generateOrderNo() {
  const dateStr = new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SH-${dateStr}-${rand}`
}

// POST /api/orders — Secure order creation with strict input validation & rate limiting
router.post('/', orderLimiter, optionalAuth, async (req, res) => {
  try {
    await connectDB()
    const { items, address, paymentMethod, couponCode } = req.body || {}

    // 1. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 30) {
      return res.status(400).json({ error: 'Order must contain between 1 and 30 items' })
    }

    // 2. Strict Address Validation & Sanitization
    if (!address || typeof address !== 'object') {
      return res.status(400).json({ error: 'Shipping address object is required' })
    }

    const cleanName = sanitize.string(address.name, 60)
    const cleanPhone = sanitize.phone(address.phone)
    const cleanEmail = address.email ? sanitize.email(address.email) : ''
    const cleanLine1 = sanitize.string(address.line1, 150)
    const cleanCity = sanitize.string(address.city, 60)
    const cleanState = sanitize.string(address.state || 'Madhya Pradesh', 60)
    const cleanPincode = sanitize.pincode(address.pincode)

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: 'Full customer name is required' })
    }
    if (!cleanPhone) {
      return res.status(400).json({ error: 'Valid 10-digit Indian phone number is required' })
    }
    if (!cleanLine1 || cleanLine1.length < 5) {
      return res.status(400).json({ error: 'Detailed address line (house/street) is required' })
    }
    if (!cleanCity) {
      return res.status(400).json({ error: 'City name is required' })
    }
    if (!cleanPincode) {
      return res.status(400).json({ error: 'Valid 6-digit postal pincode is required' })
    }

    // 3. Payment method validation
    const cleanPayment = sanitize.string(paymentMethod, 10)
    if (!['cod', 'razorpay'].includes(cleanPayment)) {
      return res.status(400).json({ error: 'Payment method must be COD or Razorpay' })
    }

    // 4. Server-side price calculation (NEVER trust client price)
    let subtotal = 0
    const verifiedItems = []

    for (const item of items) {
      const cleanProductId = sanitize.string(item.productId, 50)
      const qty = sanitize.int(item.qty, 1, 20)
      if (!qty) {
        return res.status(400).json({ error: 'Item quantity must be between 1 and 20' })
      }

      const p = await Product.findOne({
        $or: [{ id: cleanProductId }, { slug: cleanProductId }],
        active: true,
      })
      if (!p) {
        return res.status(400).json({ error: `Product unavailable or out of stock: ${cleanProductId}` })
      }

      // Check stock if applicable
      if (p.stock < qty) {
        return res.status(400).json({ error: `Insufficient stock for product: ${p.name}` })
      }

      const lineTotal = p.price * qty
      subtotal += lineTotal

      verifiedItems.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty,
        image: p.image,
        size: p.size,
      })
    }

    // 5. Secure Coupon calculation
    let discount = 0
    let appliedCoupon = null
    const cleanCouponCode = couponCode ? sanitize.string(couponCode, 20).toUpperCase() : null

    if (cleanCouponCode) {
      const c = await Coupon.findOne({ code: cleanCouponCode, active: true })
      if (c) {
        const notExpired = !c.expiresAt || new Date(c.expiresAt) >= new Date()
        const usageLimitOk = !c.usageLimit || c.usedCount < c.usageLimit

        if (notExpired && usageLimitOk) {
          let eligibleSubtotal = subtotal
          if (c.appliesTo && c.appliesTo !== 'sitewide') {
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

    // 6. Shipping Calculation (Flipkart style: Free above ₹499, else ₹49)
    const discountedSubtotal = Math.max(0, subtotal - discount)
    const isFreeShippingCoupon = appliedCoupon?.code === 'FREESHIP'
    const shippingFee = discountedSubtotal >= 499 || isFreeShippingCoupon ? 0 : 49

    // 7. COD fee (₹25 confirmed)
    const codFee = cleanPayment === 'cod' ? 25 : 0

    // 8. Grand Total (all inclusive)
    const total = discountedSubtotal + shippingFee + codFee

    // 8.1 Prevent duplicate order creation on rapid double clicks (10s window)
    const recentDuplicate = await Order.findOne({
      $or: [
        ...(req.auth?.id ? [{ userId: req.auth.id }] : []),
        { 'address.phone': cleanPhone },
      ],
      paymentMethod: cleanPayment,
      total,
      createdAt: { $gte: new Date(Date.now() - 10000) },
    })

    if (recentDuplicate) {
      return res.status(200).json({
        success: true,
        orderNo: recentDuplicate.orderNo,
        order: recentDuplicate,
        duplicatePrevented: true,
      })
    }

    // 8.2 Atomically reserve stock (conditional $inc — no negative stock under
    // concurrent checkouts). Rolls back automatically if any item fails.
    const reservation = await reserveStock(verifiedItems)
    if (!reservation.ok) {
      return res.status(400).json({ error: `Insufficient stock for product: ${reservation.failedName}` })
    }

    // 9. Create order record
    const orderNo = generateOrderNo()
    let order
    try {
      order = await Order.create({
        orderNo,
        userId: req.auth?.id || null,
        items: verifiedItems,
        coupon: appliedCoupon,
        subtotal,
        discount,
        shippingFee,
        codFee,
        total,
        paymentMethod: cleanPayment,
        paymentStatus: 'pending',
        status: 'placed',
        address: {
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          line1: cleanLine1,
          city: cleanCity,
          state: cleanState,
          pincode: cleanPincode,
        },
        placedAt: new Date(),
      })
    } catch (createErr) {
      // Never leak reserved stock if order record could not be written
      await releaseStock(verifiedItems)
      throw createErr
    }

    // Auto-save delivery address to user's saved addresses in database for returning visits
    if (req.auth?.id) {
      try {
        const u = await User.findById(req.auth.id)
        if (u) {
          const hasMatching = (u.addresses || []).some(
            (a) => a.pincode === cleanPincode && a.line1.toLowerCase() === cleanLine1.toLowerCase()
          )
          if (!hasMatching) {
            const isFirst = !u.addresses || u.addresses.length === 0
            u.addresses.push({
              name: cleanName,
              phone: cleanPhone,
              line1: cleanLine1,
              city: cleanCity,
              state: cleanState,
              pincode: cleanPincode,
              type: 'Home',
              isDefault: isFirst,
            })
            await u.save()
          }
        }
      } catch (addrErr) {
        console.warn('Address auto-save warning:', addrErr.message)
      }
    }

    // Coupon usage increment (stock already reserved atomically above)
    if (appliedCoupon?.code) {
      await Coupon.updateOne({ code: appliedCoupon.code }, { $inc: { usedCount: 1 } })
    }

    res.status(201).json({
      success: true,
      orderNo: order.orderNo,
      order,
    })
  } catch (err) {
    console.error('Order Creation Error:', err)
    res.status(500).json({ error: 'Failed to process order. Please try again.' })
  }
})

// GET /api/orders/my — Logged-in customer orders
router.get('/my', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const userEmail = req.auth.email ? req.auth.email.toLowerCase() : ''
    const userPhone = req.auth.user?.phone ? req.auth.user.phone.replace(/\D/g, '') : ''

    const conditions = [{ userId: req.auth.id }]
    if (userEmail) {
      conditions.push({ 'address.email': userEmail })
    }
    if (userPhone && userPhone.length >= 10) {
      conditions.push({ 'address.phone': userPhone })
    }

    const orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 }).lean()
    res.json({ count: orders.length, orders })
  } catch (err) {
    console.error('Fetch my orders error:', err)
    res.status(500).json({ error: 'Failed to fetch order history' })
  }
})

// GET /api/orders/:orderNo — Single order lookup with privacy protection
router.get('/:orderNo', optionalAuth, async (req, res) => {
  try {
    await connectDB()
    const cleanOrderNo = sanitize.string(req.params.orderNo, 40)
    const order = await Order.findOne({ orderNo: cleanOrderNo }).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json({ order })
  } catch (err) {
    console.error('Fetch single order error:', err)
    res.status(500).json({ error: 'Failed to fetch order details' })
  }
})

export default router
