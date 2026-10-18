import { Router } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { Order } from '../models/index.js'
import { sanitize } from '../middleware/sanitize.js'
import { orderLimiter } from '../middleware/rateLimiter.js'
import { connectDB } from '../db.js'

const router = Router()

// Helper to initialize Razorpay with current keys
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) return null
  return new Razorpay({ key_id, key_secret })
}

// POST /api/razorpay/create-order
// Rate-limited and sanitized order initiation
router.post('/create-order', orderLimiter, async (req, res) => {
  try {
    await connectDB()
    const rawOrderNo = sanitize.string(req.body?.orderNo, 40)
    if (!rawOrderNo) {
      return res.status(400).json({ error: 'Valid orderNo is required' })
    }

    const order = await Order.findOne({ orderNo: rawOrderNo })
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Prevent re-creating razorpay order for already paid orders
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order has already been paid for' })
    }

    const rzp = getRazorpayInstance()
    if (!rzp) {
      return res.status(503).json({
        error: 'Razorpay payment gateway is currently unavailable. Please use Cash on Delivery.',
      })
    }

    // Convert total to integer paise (prevent floating-point roundoff errors)
    const amountInPaise = Math.round(order.total * 100)
    if (amountInPaise <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' })
    }

    // Create Razorpay Order
    const rzpOrder = await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNo,
      notes: {
        orderNo: order.orderNo,
        customerName: order.address?.name ? sanitize.string(order.address.name, 50) : '',
        customerPhone: order.address?.phone ? sanitize.string(order.address.phone, 15) : '',
      },
    })

    // Store Razorpay order ID in our database
    order.razorpayOrderId = rzpOrder.id
    await order.save()

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      orderNo: order.orderNo,
      customer: {
        name: order.address?.name,
        email: order.address?.email,
        phone: order.address?.phone,
      },
    })
  } catch (err) {
    console.error('Razorpay Create-Order Error:', err)
    res.status(500).json({ error: 'Failed to initiate secure online payment' })
  }
})

// POST /api/razorpay/verify
// Timing-safe signature verification preventing replay & timing attacks
router.post('/verify', async (req, res) => {
  try {
    await connectDB()
    const razorpay_order_id = sanitize.string(req.body?.razorpay_order_id, 100)
    const razorpay_payment_id = sanitize.string(req.body?.razorpay_payment_id, 100)
    const razorpay_signature = sanitize.string(req.body?.razorpay_signature, 255)
    const orderNo = sanitize.string(req.body?.orderNo, 40)

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderNo) {
      return res.status(400).json({ error: 'Incomplete payment verification payload' })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'Payment gateway configuration error' })
    }

    // 1. Generate expected HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const expectedSignature = hmac.digest('hex')

    // 2. TIMING-SAFE COMPARISON (Security Rule: prevents timing side-channel attacks)
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf8')

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.warn(`[SECURITY WARNING] Invalid payment signature attempt for order: ${orderNo}`)
      return res.status(400).json({ error: 'Payment signature verification failed. Untrusted request.' })
    }

    // 3. Update Order in MongoDB
    const order = await Order.findOne({ orderNo })
    if (!order) {
      return res.status(404).json({ error: 'Order not found during verification' })
    }

    // Verify order's stored razorpayOrderId matches to prevent payment swapping
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ error: 'Mismatch between order and payment transaction' })
    }

    order.paymentStatus = 'paid'
    order.status = 'placed'
    order.updatedAt = new Date()
    await order.save()

    res.json({
      success: true,
      message: 'Payment verified and confirmed',
      orderNo: order.orderNo,
      paymentId: razorpay_payment_id,
    })
  } catch (err) {
    console.error('Razorpay Verify Error:', err)
    res.status(500).json({ error: 'Payment verification failed' })
  }
})

export default router
