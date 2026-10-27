import { Router } from 'express'
import { requireAuth, adminOnly } from '../middleware/auth.js'
import { Order, Product, ContactMessage, Newsletter, User } from '../models/index.js'
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

// ---------- PRODUCT MANAGEMENT (whitelisted fields, auto id/slug) ----------
const PRODUCT_STR_FIELDS = [
  'name', 'subname', 'brand', 'category', 'subcategory', 'size',
  'badge', 'image', 'shortDesc', 'description', 'howToUse', 'ingredients', 'couponCode',
]
const PRODUCT_NUM_FIELDS = ['price', 'mrp', 'stock']
const PRODUCT_ARR_FIELDS = ['gallery', 'benefits', 'features']
const VALID_CATEGORIES = ['makeup', 'skincare', 'fragrance']
const VALID_BADGES = ['bestseller', 'new', 'sale']

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Extract and validate only allowed product fields from a request body
function pickProductFields(body, { partial = false } = {}) {
  const out = {}
  const errors = []

  for (const f of PRODUCT_STR_FIELDS) {
    if (body[f] !== undefined) {
      const val = sanitize.string(body[f], f === 'description' ? 5000 : 600)
      if (partial || val) out[f] = val
    }
  }
  if (body.name !== undefined && !partial && !out.name) errors.push('Product name is required')

  for (const f of PRODUCT_NUM_FIELDS) {
    if (body[f] !== undefined) {
      const max = f === 'price' || f === 'mrp' ? 1000000 : 100000
      const val = sanitize.number(body[f], 0, max)
      if (val === null) errors.push(`Invalid value for ${f}`)
      else out[f] = val
    }
  }
  if (!partial) {
    if (out.price === undefined) errors.push('Price is required')
    if (out.mrp === undefined) errors.push('MRP is required')
  }
  if (out.price !== undefined && out.mrp !== undefined && out.mrp < out.price) {
    errors.push('MRP cannot be lower than the sale price')
  }

  for (const f of PRODUCT_ARR_FIELDS) {
    if (body[f] !== undefined) {
      if (!Array.isArray(body[f])) {
        errors.push(`${f} must be a list`)
      } else {
        out[f] = body[f]
          .map((v) => (typeof v === 'string' ? sanitize.string(v, 300) : ''))
          .filter(Boolean)
          .slice(0, 20)
      }
    }
  }

  if (body.category !== undefined && !VALID_CATEGORIES.includes(out.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`)
  }
  if (body.badge !== undefined && out.badge && !VALID_BADGES.includes(out.badge)) {
    errors.push(`Badge must be one of: ${VALID_BADGES.join(', ')}`)
  }
  if (body.featured !== undefined) out.featured = body.featured === true || body.featured === 'true'
  if (body.active !== undefined) out.active = body.active === true || body.active === 'true'

  return { fields: out, errors }
}

// GET /api/admin/products — Full catalog list (includes inactive items)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    res.json({ count: products.length, products })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product list' })
  }
})

// POST /api/admin/products — Add new product (auto-generates unique id + slug)
router.post('/products', async (req, res) => {
  try {
    const { fields, errors } = pickProductFields(req.body || {})
    if (errors.length) return res.status(400).json({ error: errors.join('. ') })

    // Auto slug from name (or provided slug), guaranteed unique
    let slug = slugify(sanitize.string(req.body.slug, 80)) || slugify(fields.name)
    if (!slug) return res.status(400).json({ error: 'Could not generate a slug from the product name' })
    if (await Product.exists({ slug })) {
      const suffix = Date.now().toString(36).slice(-4)
      slug = `${slug}-${suffix}`
    }

    // Auto unique id (sh7-<slug>)
    let productId = `sh7-${slug}`
    if (await Product.exists({ id: productId })) {
      productId = `${productId}-${Date.now().toString(36).slice(-4)}`
    }

    const product = await Product.create({
      ...fields,
      slug,
      id: productId,
      brand: fields.brand || 'Seven Heaven',
      active: fields.active !== undefined ? fields.active : true,
    })
    res.status(201).json({ success: true, product })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Product creation failed' })
  }
})

// Resolve product by Mongo _id (only if valid ObjectId) or custom product id
function productFilter(paramId) {
  const clauses = [{ id: paramId }]
  if (/^[0-9a-fA-F]{24}$/.test(paramId)) clauses.unshift({ _id: paramId })
  return { $or: clauses }
}

// PUT /api/admin/products/:id — Edit product (accepts Mongo _id or custom product id)
router.put('/products/:id', async (req, res) => {
  try {
    const { fields, errors } = pickProductFields(req.body || {}, { partial: true })
    if (errors.length) return res.status(400).json({ error: errors.join('. ') })
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const product = await Product.findOneAndUpdate(productFilter(req.params.id), { $set: fields }, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(400).json({ error: 'Product update failed' })
  }
})

// DELETE /api/admin/products/:id — Toggle active state of product (accepts _id or custom id)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne(productFilter(req.params.id))
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
