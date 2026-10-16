import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { Sparkles, Phone, ShieldCheck, Truck } from 'lucide-react'

export default function AnnouncementBar() {
  const { lang, toggleLanguage, t } = useLanguage()

  const messages = [
    { text: t('tickerFreeShipping'), icon: Truck },
    { text: t('tickerCod'), icon: ShieldCheck },
    { text: t('tickerLuxury'), icon: Sparkles },
    { text: t('tickerCoupon'), icon: Sparkles },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % messages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [messages.length])

  const CurrentIcon = messages[activeIndex].icon

  return (
    <aside className="announcement-bar" aria-label="Special announcements">
      <div className="container announcement-inner">
        {/* Left: Contact Hotline */}
        <div className="announcement-left">
          <a href="tel:+919201991418" className="announcement-link hotline">
            <Phone size={13} className="announcement-icon" />
            <span>+91 92019 91418</span>
          </a>
          <span className="announcement-sep">•</span>
          <span className="announcement-tagline">Bhopal, MP</span>
        </div>

        {/* Center: Rotating Urgency Message */}
        <div className="announcement-center">
          <div className="ticker-item active">
            <CurrentIcon size={13} className="ticker-icon gold-glow" />
            <span className="ticker-text">{messages[activeIndex].text}</span>
          </div>
        </div>

        {/* Right: Language switch & VIP link */}
        <div className="announcement-right">
          <Link to="/contact-us" className="announcement-link">
            Help & FAQ
          </Link>
          <span className="announcement-sep">•</span>
          <button
            onClick={toggleLanguage}
            className="lang-switcher-btn"
            title="Toggle English / Hindi"
            aria-label="Toggle language"
          >
            <span className={lang === 'en' ? 'active-lang' : ''}>EN</span>
            <span className="lang-divider">/</span>
            <span className={lang === 'hi' ? 'active-lang' : ''}>हिन्दी</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
