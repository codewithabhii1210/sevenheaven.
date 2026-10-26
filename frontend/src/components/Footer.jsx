import { Link } from 'react-router-dom'
import Logo7H from './Logo7H.jsx'
import { site } from '../data/site.js'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

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
  return (
    <footer className="site-footer">
      <div className="container footer-main-content">
        <div className="footer-grid">
          {/* Column 1: Brand & Contact */}
          <div className="footer-col brand-col">
            <Logo7H size="default" />
            <p className="footer-tagline">&ldquo;Beauty Beyond Imagination&rdquo;</p>
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
            <div className="footer-social-row">
              <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Seven Heaven on Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href={site.socials.facebook} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Seven Heaven on Facebook">
                <FacebookIcon size={18} />
              </a>
              <a href={site.socials.youtube} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Seven Heaven on YouTube">
                <YoutubeIcon size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-link-list">
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/my-account">My Account</Link></li>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="footer-col">
            <h4 className="footer-col-title">Policies</h4>
            <ul className="footer-link-list">
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/cod-policy">Cash on Delivery</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Column 4: WhatsApp */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-col-title">WhatsApp</h4>
            <div className="footer-wa-wrap">
              <a
                href="https://wa.me/919201991418?text=join%20me%20to%20the%20whatsapp%20group"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta-btn footer-wa-btn"
                aria-label="Join Seven Heaven WhatsApp Group"
              >
                <MessageCircle size={18} className="wa-icon" />
                <span>Join WhatsApp Group</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} Seven Heaven Cosmetics. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
