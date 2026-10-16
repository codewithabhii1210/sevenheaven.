import { Router } from 'express'
import { ContactMessage, Newsletter } from '../models/index.js'
import { sanitize } from '../middleware/sanitize.js'
import { contactLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// POST /api/contact — Contact form submission with spam protection
router.post('/', contactLimiter, async (req, res) => {
  try {
    const name = sanitize.string(req.body?.name, 80)
    const email = sanitize.email(req.body?.email)
    const subject = sanitize.string(req.body?.subject || 'Customer Inquiry', 120)
    const message = sanitize.string(req.body?.message, 2000)

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Please enter your name' })
    }
    if (!email) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }
    if (!message || message.length < 5) {
      return res.status(400).json({ error: 'Message must be at least 5 characters long' })
    }

    const doc = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'new',
    })

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Seven Heaven. We will reply to your email shortly.',
      id: doc._id,
    })
  } catch (err) {
    console.error('Contact Form Error:', err)
    res.status(500).json({ error: 'Unable to send message at this time' })
  }
})

// POST /api/contact/newsletter — Newsletter subscription with duplicate prevention
router.post('/newsletter', contactLimiter, async (req, res) => {
  try {
    const email = sanitize.email(req.body?.email)
    if (!email) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }

    const existing = await Newsletter.findOne({ email })
    if (existing) {
      return res.json({
        success: true,
        message: 'You are already on the Seven Heaven VIP list!',
      })
    }

    await Newsletter.create({ email, source: 'footer' })

    res.status(201).json({
      success: true,
      message: 'Welcome to Seven Heaven Cosmetics VIP circle!',
    })
  } catch (err) {
    console.error('Newsletter Error:', err)
    res.status(500).json({ error: 'Subscription failed. Please try again.' })
  }
})

export default router
