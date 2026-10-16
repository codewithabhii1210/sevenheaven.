import { Router } from 'express'
import { ContactMessage, Newsletter } from '../models/index.js'

const router = Router()

// POST /api/contact — Save contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {}
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }

    const doc = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      subject: String(subject || 'General Inquiry').trim(),
      message: String(message).trim(),
    })

    res.status(201).json({
      success: true,
      message: 'Message received. We will get back to you shortly.',
      id: doc._id,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/newsletter — Subscribe to newsletter (footer form)
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email || !String(email).includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' })
    }

    const cleanEmail = String(email).toLowerCase().trim()
    const existing = await Newsletter.findOne({ email: cleanEmail })
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed to Seven Heaven updates.' })
    }

    await Newsletter.create({ email: cleanEmail, source: 'footer' })
    res.status(201).json({ success: true, message: 'Welcome to Seven Heaven!' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
