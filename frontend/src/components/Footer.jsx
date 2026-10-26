import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo7H from './Logo7H.jsx'
import { api } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { site } from '../data/site.js'
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  Sparkles,
  CreditCard,
  MessageCircle,
} from 'lucide-react'

// Clean Social Icons (SVG)
function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function YoutubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
    </svg>
  )
}

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const { showToast } = useToast()

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address', 'info')
      return
    }

    setSubscribing(true)
    try {
      const res = await api.subscribeNewsletter(newsletterEmail)
      setSubscribed(true)
      showToast(res.message || 'Welcome to the Seven Heaven VIP Circle!', 'gold')
      setNewsletterEmail('')
    } catch (err) {
      showToast(err.message || 'Subscription failed. Please try again.', 'info')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="site-footer">
      {/* Trust Badges Strip */}
      <section className="footer-trust-strip" aria-label="Brand Guarantees">
        <div className="container trust-strip-inner">
          <div className="trust-strip-item">
            <Sparkles size={22} className="gold-text" />
            <div>
              <h4 className="trust-item-title">100% Authentic Luxury</h4>
              <p className="trust-item-desc">Crafted with finest cosmetic & fragrance oils</p>
            </div>
          </div>
          <div className="trust-strip-item">
            <Truck size={22} className="gold-text" />
            <div>
              <h4 className="trust-item-title">Free Shipping on ₹499+</h4>
              <p className="trust-item-desc">Direct delivery across 27,000+ pincodes</p>
            </div>
          </div>
          <div className="trust-strip-item">
            <CreditCard size={22} className="gold-text" />
            <div>
              <h4 className="trust-item-title">COD & Razorpay Secure</h4>
              <p className="trust-item-desc">Cash on Delivery or 256-bit encrypted UPI/Card</p>
            </div>
          </div>
          <div className="trust-strip-item">
            <ShieldCheck size={22} className="gold-text" />
            <div>
              <h4 className="trust-item-title">7-Day Patron Support</h4>
              <p className="trust-item-desc">Dedicated assistance on +91 92019 91418</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main 4-Column Footer */}
      <div className="container footer-main-content">
        <div className="footer-grid">
          {/* Column 1: Brand & Contact */}
          <div className="footer-col brand-col">
            <Logo7H size="default" />
            <p className="footer-tagline">
              &ldquo;Beauty Beyond Imagination&rdquo;
            </p>
            <p className="footer-bio">
              Born in Bhopal, Seven Heaven redefines cosmetic luxury. From pore-perfecting primers to
              enchanting high-sillage perfumes, every creation is an ode to timeless elegance.
            </p>
            <div className="footer-contact-details">
              <a href="tel:+919201991418" className="footer-contact-row">
                <Phone size={15} className="gold-text" />
                <span>+91 92019 91418</span>
              </a>
              <a href={`mailto:${site.email}`} className="footer-contact-row">
                <Mail size={15} className="gold-text" />
                <span>{site.email}</span>
              </a>
              <div className="footer-contact-row">
                <MapPin size={15} className="gold-text" />
                <span>Bhopal, Madhya Pradesh, India</span>
              </div>
            </div>
            {/* Social Icons */}
            <div className="footer-social-row">
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Seven Heaven on Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={site.socials.facebook}
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Seven Heaven on Facebook"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={site.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Seven Heaven on YouTube"
              >
                <YoutubeIcon size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Creations & Collections */}
          <div className="footer-col">
            <h4 className="footer-col-title">Signature Creations</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/product/invisible-blur-primer" className="primer-link-highlight">
                  ✦ Invisible Blur Primer (30ml)
                </Link>
              </li>
              <li>
                <Link to="/product/velvet-suede-lipstick-bhopal-nude">Velvet Suede Lipstick • Bhopal Nude</Link>
              </li>
              <li>
                <Link to="/product/velvet-matte-hd-foundation">Velvet Matte HD Foundation</Link>
              </li>
              <li>
                <Link to="/product/24k-gold-nourishing-lip-oil">24K Gold Nourishing Lip Oil</Link>
              </li>
              <li>
                <Link to="/product/waterproof-gel-kohl-smokey-kajal">Waterproof Gel Kohl Kajal</Link>
              </li>
              <li>
                <Link to="/shop">View Full Catalog (Shop All)</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="footer-col">
            <h4 className="footer-col-title">Patron Concierge</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/about-us">Our Story & Founders</Link>
              </li>
              <li>
                <Link to="/contact-us">Contact Concierge & Bhopal HQ</Link>
              </li>
              <li>
                <Link to="/my-account">My Account & Order History</Link>
              </li>
              <li>
                <Link to="/wishlist">Saved Wishlist</Link>
              </li>
              <li>
                <Link to="/shipping-policy">Shipping & Delivery Policy</Link>
              </li>
              <li>
                <Link to="/cod-policy">Cash on Delivery (COD) Info</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: WhatsApp VIP Club */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-col-title">Join The VIP Circle</h4>
            <p className="newsletter-desc">
              Connect directly with our fragrance masters for private batch releases, member-only discounts, and bespoke privileges on WhatsApp.
            </p>
            <div className="footer-wa-wrap">
              <a
                href="https://wa.me/919201991418?text=join%20me%20to%20the%20whatsapp%20group"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta-btn footer-wa-btn"
                aria-label="Join Seven Heaven VIP WhatsApp Group"
              >
                <MessageCircle size={18} className="wa-icon" />
                <span>Join WhatsApp VIP Group</span>
              </a>
              <span className="footer-wa-subnote">Click to message &ldquo;join me to the whatsapp group&rdquo;</span>
            </div>
          </div>
        </div>

        {/* Most Searched SEO Link Cloud (matching in.ajmal.com) */}
        <div className="footer-seo-cloud">
          <span className="seo-cloud-title">Popular Searches:</span>
          <div className="seo-tags">
            <Link to="/product/invisible-blur-primer">Invisible Blur Primer</Link>
            <span>|</span>
            <Link to="/shop?category=makeup">Luxury Cosmetics India</Link>
            <span>|</span>
            <Link to="/product/velvet-suede-lipstick-bhopal-nude">Velvet Suede Nude Lipstick</Link>
            <span>|</span>
            <Link to="/product/velvet-matte-hd-foundation">Velvet Matte HD Foundation</Link>
            <span>|</span>
            <Link to="/product/24k-gold-nourishing-lip-oil">24K Gold Lip Oil</Link>
            <span>|</span>
            <Link to="/shop?sort=price_asc">Cosmetics Under 1000</Link>
            <span>|</span>
            <Link to="/contact-us">Seven Heaven Bhopal Cosmetics</Link>
            <span>|</span>
            <Link to="/shop">Pore Blurring Primer 30ml</Link>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment icons */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} Seven Heaven Cosmetics. All Rights Reserved. &ldquo;Beauty Beyond Imagination&rdquo;
          </p>
          <div className="payment-badges-row">
            <span className="payment-badge-text">100% SECURE PAYMENTS:</span>
            <span className="payment-pill">UPI</span>
            <span className="payment-pill">Visa / Mastercard</span>
            <span className="payment-pill">RuPay</span>
            <span className="payment-pill">Net Banking</span>
            <span className="payment-pill">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
