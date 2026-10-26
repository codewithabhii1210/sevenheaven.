import { Router } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { Order } from '../models/index.js'
import { sanitize } from '../middleware/sanitize.js'
import { orderLimiter } from '../middleware/rateLimiter.js'
import { connectDB } from '../db.js'
import { releaseOrderStock, reReserveOrderStock } from '../utils/stock.js'

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
    order.razorpayPaymentId = razorpay_payment_id
    order.updatedAt = new Date()
    // Paid wins: if stock was released after an earlier failure/cancel, re-reserve it
    if (await reReserveOrderStock(order)) {
      order.stockRestored = false // keep in-memory doc in sync with DB
    }
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

// POST /api/razorpay/payment-failed
// Client reports a failed payment attempt (widget payment.failed event).
// Marks order failed + releases reserved stock exactly once (idempotent).
router.post('/payment-failed', orderLimiter, async (req, res) => {
  try {
    await connectDB()
    const orderNo = sanitize.string(req.body?.orderNo, 40)
    if (!orderNo) return res.status(400).json({ error: 'orderNo is required' })

    const order = await Order.findOne({ orderNo })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    // Never touch an order that already succeeded
    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, ignored: true })
    }

    order.paymentStatus = 'failed'
    await order.save()
    const stockRestored = await releaseOrderStock(order)

    res.json({ success: true, stockRestored })
  } catch (err) {
    console.error('Razorpay payment-failed report error:', err)
    res.status(500).json({ error: 'Failed to record payment failure' })
  }
})

// POST /api/razorpay/webhook — Server-to-server payment reconciliation.
// Signature: HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET) vs x-razorpay-signature.
// Covers the "browser closed after successful charge" gap (verify never called).
router.post('/webhook', async (req, res) => {
  try {
    await connectDB()

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.get('x-razorpay-signature')

    if (!secret) {
      // Never accept unsigned webhooks as truth
      return res.status(503).json({ error: 'Webhook secret not configured' })
    }
    if (!signature || !req.rawBody) {
      return res.status(400).json({ error: 'Missing webhook signature or body' })
    }

    const expected = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex')
    const expectedBuf = Buffer.from(expected, 'utf8')
    const receivedBuf = Buffer.from(String(signature), 'utf8')
    if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      console.warn('[SECURITY WARNING] Invalid Razorpay webhook signature rejected')
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }

    const event = req.body
    const eventType = event?.event
    const paymentEntity = event?.payload?.payment?.entity
    const rzpOrderId = paymentEntity?.order_id

    if (!rzpOrderId) return res.json({ received: true })

    const order = await Order.findOne({ razorpayOrderId: rzpOrderId })
    if (!order) return res.json({ received: true, matched: false })

    if (eventType === 'payment.captured') {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid'
        order.status = 'placed'
        order.razorpayPaymentId = paymentEntity?.id || order.razorpayPaymentId
        order.updatedAt = new Date()
        if (await reReserveOrderStock(order)) order.stockRestored = false
        await order.save()
      }
      return res.json({ received: true, orderNo: order.orderNo, status: 'paid' })
    }

    if (eventType === 'payment.failed') {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed'
        order.updatedAt = new Date()
        await order.save()
        await releaseOrderStock(order)
      }
      return res.json({ received: true, orderNo: order.orderNo, status: 'failed' })
    }

    res.json({ received: true, ignored: eventType })
  } catch (err) {
    console.error('Razorpay Webhook Error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
