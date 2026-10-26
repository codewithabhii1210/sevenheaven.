import { useState } from 'react'
import { api } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { site } from '../data/site.js'
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

export default function Contact() {
  const { showToast } = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'Product Inquiry',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: 'How long does delivery take across India?',
      a: 'Orders are dispatched from our Bhopal atelier within 24 hours. Transit typically takes 3 to 5 business days across 27,000+ serviceable pincodes. You receive SMS & tracking updates upon courier handover.',
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'We offer Cash on Delivery across India with a modest ₹25 handling fee. You may pay in cash or via UPI directly to the delivery executive when the parcel arrives at your doorstep.',
    },
    {
      q: 'Is the Invisible Blur Primer suitable for oily and sensitive skin?',
      a: 'Yes. Our primer is completely non-comedogenic, oil-free, and formulated with sebum-regulating microspheres. It blurs enlarged pores without clogging, making it ideal for tropical Indian climates.',
    },
    {
      q: 'How long does Seven Heaven lipstick stay on?',
      a: 'Our Velvet Suede lipsticks are formulated for 12-hour comfortable wear — a non-drying matte that resists transfer through meals and drinks. Reapply after oily meals for a fresh finish.',
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.name.trim().length < 2) {
      showToast('Please enter your full name', 'info')
      return
    }
    if (!form.email || !form.email.includes('@')) {
      showToast('Please enter a valid email address', 'info')
      return
    }
    if (!form.message.trim() || form.message.trim().length < 5) {
      showToast('Please write a message of at least 5 characters', 'info')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      })
      setSubmitted(true)
      showToast(res.message || 'Your inquiry has been received. Our concierge will reply shortly.', 'gold')
      setForm({ name: '', email: '', subject: 'Product Inquiry', message: '' })
    } catch (err) {
      showToast(err.message || 'Unable to submit message at this time.', 'info')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      {/* Hero Banner */}
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <span className="eyebrow">SEVEN HEAVEN CONCIERGE</span>
          <h1 className="contact-hero-title">Patron Assistance & Inquiries</h1>
          <p className="contact-hero-sub">
            Whether inquiring about order status, formulation ingredients, or bespoke gifting, our Bhopal
            concierge is devoted to your service.
          </p>
          <div className="gold-divider-center" />
        </div>
      </section>

      <div className="container contact-layout-grid">
        {/* Left Column: Direct Contact Info & WhatsApp */}
        <div className="contact-info-col">
          <div className="contact-card">
            <h3 className="contact-card-title">Direct Communication</h3>
            <p className="contact-card-desc">
              Connect directly with our customer concierge for instantaneous order updates and consultations.
            </p>

            <div className="contact-channels">
              {/* Phone Hotline */}
              <a href="tel:+919201991418" className="channel-box">
                <div className="channel-icon-wrap">
                  <Phone size={20} className="gold-text" />
                </div>
                <div>
                  <span className="channel-label">Hotline & COD Support</span>
                  <strong className="channel-val">+91 92019 91418</strong>
                  <span className="channel-note">Mon–Sat • 10:00 AM – 7:00 PM IST</span>
                </div>
              </a>

              {/* WhatsApp Quick Chat */}
              <a
                href={`https://wa.me/919201991418?text=${encodeURIComponent(
                  'Hello Seven Heaven Concierge, I have an inquiry regarding your creations.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="channel-box whatsapp-box"
              >
                <div className="channel-icon-wrap">
                  <MessageSquare size={20} className="gold-text" />
                </div>
                <div>
                  <span className="channel-label">Direct WhatsApp Chat</span>
                  <strong className="channel-val">Chat on WhatsApp</strong>
                  <span className="channel-note">Typical response within 1 hour</span>
                </div>
                <ExternalLink size={16} className="channel-external-icon" />
              </a>

              {/* Email */}
              <a href={`mailto:${site.email}`} className="channel-box">
                <div className="channel-icon-wrap">
                  <Mail size={20} className="gold-text" />
                </div>
                <div>
                  <span className="channel-label">Official Email Inquiries</span>
                  <strong className="channel-val">{site.email}</strong>
                  <span className="channel-note">Replies within 1 business day</span>
                </div>
              </a>

              {/* Headquarters Location */}
              <div className="channel-box no-hover">
                <div className="channel-icon-wrap">
                  <MapPin size={20} className="gold-text" />
                </div>
                <div>
                  <span className="channel-label">Headquarters Atelier</span>
                  <strong className="channel-val">Seven Heaven Cosmetics</strong>
                  <span className="channel-note">Bhopal, Madhya Pradesh – 462001, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patron FAQ Accordion */}
          <div className="contact-faq-block">
            <h3 className="faq-block-heading">Frequently Inquired</h3>
            <div className="faq-items-list">
              {faqs.map((f, i) => (
                <div key={i} className={`faq-card ${openFaq === i ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="faq-question-btn"
                    aria-expanded={openFaq === i}
                  >
                    <span>{f.q}</span>
                    <ChevronDown size={18} className="faq-chevron" />
                  </button>
                  {openFaq === i && <p className="faq-answer-text">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="contact-form-col">
          <div className="form-card">
            <h3 className="form-card-title">Send a Concierge Inquiry</h3>
            <p className="form-card-sub">
              Please share your details below and a beauty advisor will reach out to you directly.
            </p>

            {submitted ? (
              <div className="contact-success-state">
                <CheckCircle2 size={48} className="gold-text" />
                <h3>Thank You for Reaching Out</h3>
                <p>
                  Your message has been safely logged in our concierge system. We will reply to your email
                  at the earliest.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-gold-outline btn-sm"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="inquiry-form">
                <div className="field-group">
                  <label className="field-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Devendra Sharma"
                    className="text-input"
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="patron@example.com"
                    className="text-input"
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Inquiry Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="text-input select-input"
                  >
                    <option value="Product Inquiry">Product Inquiry (Makeup / Skincare)</option>
                    <option value="Order Tracking">Order Status & Tracking</option>
                    <option value="Cash on Delivery">Cash on Delivery (COD) Assistance</option>
                    <option value="Corporate Gifting">Corporate & Bespoke Gifting</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Your Message <span className="req">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Please describe how our concierge may assist you..."
                    className="text-input textarea-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-gold btn-block btn-lg"
                >
                  {submitting ? (
                    <>
                      <Sparkles size={16} className="spinning" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Dispatch Message to Concierge</span>
                    </>
                  )}
                </button>

                <p className="privacy-guarantee">
                  ✦ Seven Heaven respects your privacy. Information is encrypted and never shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
