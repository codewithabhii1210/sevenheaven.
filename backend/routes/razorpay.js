import { Router } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { Order } from '../models/index.js'

const router = Router()

// Helper: initialize Razorpay instance if keys are configured
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) return null
  return new Razorpay({ key_id, key_secret })
}

// POST /api/razorpay/create-order
// Takes orderNo from database, creates a corresponding Razorpay order (in paise)
router.post('/create-order', async (req, res) => {
  try {
    const { orderNo } = req.body || {}
    if (!orderNo) return res.status(400).json({ error: 'orderNo is required' })

    const order = await Order.findOne({ orderNo })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const rzp = getRazorpayInstance()
    if (!rzp) {
      return res.status(503).json({
        error: 'Razorpay keys not yet configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in root .env',
      })
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.total * 100)

    const rzpOrder = await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNo,
      notes: {
        orderNo: order.orderNo,
        customerName: order.address?.name || '',
        customerPhone: order.address?.phone || '',
      },
    })

    // Save Razorpay order ID in our order doc
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
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/razorpay/verify
// Verifies HMAC-SHA256 signature returned by Razorpay checkout
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNo } = req.body || {}

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderNo) {
      return res.status(400).json({ error: 'Incomplete verification payload' })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'Razorpay secret not configured on server' })
    }

    // Generate expected signature using HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' })
    }

    // Update order status in MongoDB
    const order = await Order.findOne({ orderNo })
    if (order) {
      order.paymentStatus = 'paid'
      order.status = 'placed'
      await order.save()
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderNo,
      paymentId: razorpay_payment_id,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
