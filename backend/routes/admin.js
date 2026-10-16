import { Router } from 'express'
import { requireAuth, adminOnly } from '../middleware/auth.js'
import { Order, Product, Coupon, ContactMessage, Newsletter, User } from '../models/index.js'

const router = Router()

// All routes here require login + admin role
router.use(requireAuth, adminOnly)

// GET /api/admin/stats — Dashboard summary
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

    // Total revenue from paid orders or placed orders
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ])
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0

    // Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean()

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
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/admin/orders — List orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status
    if (paymentStatus) query.paymentStatus = paymentStatus

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
    ])

    res.json({ total, page: parseInt(page, 10), orders })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/admin/orders/:id/status — Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body || {}
    const update = {}
    if (status) update.status = status
    if (paymentStatus) update.paymentStatus = paymentStatus

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json({ success: true, order })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/admin/products — Add new product
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, product })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/admin/products/:id — Edit product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true, product })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/admin/products/:id — Soft-delete / Toggle product active
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    product.active = !product.active
    await product.save()
    res.json({ success: true, active: product.active })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/admin/messages — Contact messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean()
    res.json({ count: messages.length, messages })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/admin/newsletter — Subscriber emails
router.get('/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 }).lean()
    res.json({ count: subscribers.length, subscribers })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
