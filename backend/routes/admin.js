import { Router } from 'express'
import { requireAuth, adminOnly } from '../middleware/auth.js'
import { Order, Product, Coupon, ContactMessage, Newsletter, User } from '../models/index.js'
import { sanitize } from '../middleware/sanitize.js'
import { releaseOrderStock, reReserveOrderStock } from '../utils/stock.js'

const router = Router()

// Enforce authentication & strict admin RBAC on all routes in this file
router.use(requireAuth, adminOnly)

// GET /api/admin/stats — Dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, pendingOrders, totalProducts, totalUsers, messagesCount, subscribersCount] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['placed', 'packed'] } }),
        Product.countDocuments({ active: true }),
        User.countDocuments({ role: 'customer' }),
        ContactMessage.countDocuments({ status: 'new' }),
        Newsletter.countDocuments(),
      ])

    // Total revenue from paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ])
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0

    // Recent 10 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).lean()

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
        messagesCount,
        subscribersCount,
      },
      recentOrders,
    })
  } catch (err) {
    console.error('Admin Stats Error:', err)
    res.status(500).json({ error: 'Failed to compute dashboard metrics' })
  }
})

// GET /api/admin/orders — Filtered order list with pagination
router.get('/orders', async (req, res) => {
  try {
    const status = req.query.status ? sanitize.string(req.query.status, 20) : null
    const paymentStatus = req.query.paymentStatus ? sanitize.string(req.query.paymentStatus, 20) : null
    const page = sanitize.int(req.query.page, 1, 1000) || 1
    const limit = sanitize.int(req.query.limit, 1, 100) || 20

    const query = {}
    if (status) query.status = status
    if (paymentStatus) query.paymentStatus = paymentStatus

    const skip = (page - 1) * limit
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ])

    res.json({ total, page, limit, orders })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders list' })
  }
})

// PATCH /api/admin/orders/:id/status — Order status transitions
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const rawStatus = req.body?.status ? sanitize.string(req.body.status, 20) : null
    const rawPaymentStatus = req.body?.paymentStatus ? sanitize.string(req.body.paymentStatus, 20) : null

    const validStatuses = ['placed', 'packed', 'shipped', 'delivered', 'cancelled']
    const validPaymentStatuses = ['pending', 'paid', 'failed']

    const update = {}
    if (rawStatus && validStatuses.includes(rawStatus)) {
      update.status = rawStatus
    }
    if (rawPaymentStatus && validPaymentStatuses.includes(rawPaymentStatus)) {
      update.paymentStatus = rawPaymentStatus
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'Valid status or paymentStatus is required' })
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    // Release reserved stock exactly once when order is cancelled or payment failed
    const shouldRelease = order.status === 'cancelled' || order.paymentStatus === 'failed'
    let stockRestored = false
    if (shouldRelease) {
      stockRestored = await releaseOrderStock(order)
    } else if (order.paymentStatus === 'paid') {
      // Revived after a previous release (e.g. failed → paid) — re-reserve stock
      await reReserveOrderStock(order)
    }

    res.json({ success: true, order, stockRestored })
  } catch (err) {
    console.error('Admin order status update error:', err)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// POST /api/admin/products — Add new product to catalog
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, product })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Product creation failed' })
  }
})

// PUT /api/admin/products/:id — Edit product in catalog
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(400).json({ error: 'Product update failed' })
  }
})

// DELETE /api/admin/products/:id — Toggle active state of product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    product.active = !product.active
    await product.save()
    res.json({ success: true, active: product.active })
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle product status' })
  }
})

// GET /api/admin/messages — Customer messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean()
    res.json({ count: messages.length, messages })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact messages' })
  }
})

// GET /api/admin/newsletter — VIP subscribers
router.get('/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 }).lean()
    res.json({ count: subscribers.length, subscribers })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch newsletter subscribers' })
  }
})

export default router
