import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { api } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Check,
  Copy,
  Star,
  Quote,
  Flame,
  Award,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'

export default function Home() {
  const [productsList, setProductsList] = useState([])
  const [activeCategoryTab, setActiveCategoryTab] = useState('all')
  const [copiedCode, setCopiedCode] = useState('')
  const { addItem } = useCart()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    api.getProducts().then((data) => {
      setProductsList(data || [])
    })
  }, [])

  const primerProduct = productsList.find((p) => p.slug === 'invisible-blur-primer' || p.id === 'sh7-primer-30ml')

  const filteredProducts =
    activeCategoryTab === 'all'
      ? productsList
      : productsList.filter((p) => p.category === activeCategoryTab)

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    showToast(`Coupon code "${code}" copied to clipboard!`, 'gold')
    setTimeout(() => setCopiedCode(''), 3000)
  }

  return (
    <div className="home-page">
      {/* 1. Cinematic Luxury Hero Banner */}
      <section className="hero-section" aria-label="Seven Heaven Hero">
        <div className="hero-backdrop" />
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <Sparkles size={14} className="gold-text" />
              <span>HAUTE PARFUMERIE & LUXURY COSMETICS</span>
            </div>

            <h1 className="hero-title">
              Beauty Beyond <br />
              <span className="gold-gradient-text">Imagination</span>
            </h1>

            <p className="hero-description">
              Step into the realm of Seven Heaven. Artisanal Indian fragrances formulated with rare
              resins, and our acclaimed Invisible Blur Primer designed for high-definition radiance.
            </p>

            {/* Trending Product Highlight Card */}
            <Link
              to="/product/invisible-blur-primer"
              className="hero-trending-card"
              aria-label="Trending Product: Invisible Blur Primer"
            >
              <div className="trending-pill">
                <Flame size={12} className="flame-icon" />
                <span>TRENDING NOW</span>
              </div>
              <div className="trending-body">
                <div className="trending-img-wrap">
                  <img
                    src="/images/products/invisible-blur-primer.png"
                    alt="Invisible Blur Primer"
                    className="trending-thumb"
                  />
                </div>
                <div className="trending-details">
                  <div className="trending-meta">
                    <span className="trending-cat">Flagship Cosmetic</span>
                    <span className="trending-rating">★ 4.8 (126)</span>
                  </div>
                  <h3 className="trending-title">Invisible Blur Primer</h3>
                  <p className="trending-sub">Smooth Blur Perfect • 30 ml</p>
                  <div className="trending-price-row">
                    <span className="trending-price">₹499</span>
                    <span className="trending-mrp">₹699</span>
                    <span className="trending-save">29% OFF</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold btn-lg">
                <span>Shop All Products</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/product/invisible-blur-primer" className="btn btn-gold-outline btn-lg">
                <ShoppingBag size={15} />
                <span>Buy Primer (₹499)</span>
              </Link>
            </div>

            {/* Quick Hero Highlights */}
            <div className="hero-perks-row">
              <div className="hero-perk">
                <Truck size={15} className="gold-text" />
                <span>Free Shipping ₹499+</span>
              </div>
              <span className="hero-perk-sep">•</span>
              <div className="hero-perk">
                <ShieldCheck size={15} className="gold-text" />
                <span>Cash on Delivery</span>
              </div>
              <span className="hero-perk-sep">•</span>
              <div className="hero-perk">
                <Award size={15} className="gold-text" />
                <span>100% Genuine</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="hero-showcase-card">
            <div className="showcase-glow" />
            <div className="showcase-badge">
              <Flame size={14} className="flame-icon" />
              <span>Bhopal Flagship Formulation</span>
            </div>
            <img
              src="/images/hero-banner.jpg"
              alt="Seven Heaven Luxury Perfumes & Primer"
              className="showcase-img"
              loading="eager"
            />
            <div className="showcase-footer">
              <div>
                <span className="showcase-label">FEATURED CREATION</span>
                <h3 className="showcase-name">Invisible Blur Primer</h3>
              </div>
              <div className="showcase-price-tag">
                <span className="mrp">₹699</span>
                <span className="price">₹499</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Infinite Marquee Strip */}
      <section className="marquee-strip" aria-label="Brand Pillars Marquee">
        <div className="marquee-track">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="marquee-content">
              <span>✦ FREE SHIPPING ABOVE ₹499</span>
              <span className="marquee-bullet">•</span>
              <span>✦ PORELESS BLUR TECHNOLOGY</span>
              <span className="marquee-bullet">•</span>
              <span>✦ 10-12 HOUR SILLAGE OUD</span>
              <span className="marquee-bullet">•</span>
              <span>✦ CASH ON DELIVERY AVAILABLE</span>
              <span className="marquee-bullet">•</span>
              <span>✦ CRUELTY FREE & DERM TESTED</span>
              <span className="marquee-bullet">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Curated Bestsellers Collection Grid */}
      <section className="section-curated" id="bestsellers">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">{t('featuredCollection')}</span>
            <h2 className="section-heading-curated">{t('featuredMainHeading')}</h2>
            <p className="section-subtext">{t('featuredSubtitle')}</p>
            <div className="gold-divider-center" />

            {/* Category Filter Tabs */}
            <div className="category-tabs-bar" role="tablist">
              <button
                role="tab"
                aria-selected={activeCategoryTab === 'all'}
                onClick={() => setActiveCategoryTab('all')}
                className={`tab-btn ${activeCategoryTab === 'all' ? 'active' : ''}`}
              >
                All Creations ({productsList.length})
              </button>
              <button
                role="tab"
                aria-selected={activeCategoryTab === 'fragrance'}
                onClick={() => setActiveCategoryTab('fragrance')}
                className={`tab-btn ${activeCategoryTab === 'fragrance' ? 'active' : ''}`}
              >
                Haute Fragrances (4)
              </button>
              <button
                role="tab"
                aria-selected={activeCategoryTab === 'makeup'}
                onClick={() => setActiveCategoryTab('makeup')}
                className={`tab-btn ${activeCategoryTab === 'makeup' ? 'active' : ''}`}
              >
                Cosmetics & Primer (1)
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="catalog-cta-wrap">
            <Link to="/shop" className="btn btn-gold-outline btn-lg">
              <span>View Full 2026 Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Patron Testimonials & Reviews (Compact 2-Column Grid) */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">{t('reviewsTitle')}</span>
            <h2 className="section-heading-curated">{t('reviewsSubtitle')}</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="testimonials-grid">
            {/* Review 1 */}
            <div className="testimonial-card-compact">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;The Invisible Blur Primer is truly holy grail. It creates a poreless, matte velvet finish that held my makeup intact for 14 hours during a Bhopal wedding.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Ananya Sharma</span>
                <span className="author-location">Bhopal • Verified Patron</span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="testimonial-card-compact">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;Golden Oud smells indistinguishable from a ₹15,000 niche Dubai house. The projection is phenomenal, easily 10+ hours. The bottle is pure luxury.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Devansh Kothari</span>
                <span className="author-location">Mumbai • Verified Patron</span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="testimonial-card-compact">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;Seven Heaven represents authentic luxury at Indian prices. Ordering on COD was seamless and delivery reached Indore in 3 days. Noir Essence is signature.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Pooja Rathore</span>
                <span className="author-location">Indore • Verified Patron</span>
              </div>
            </div>

            {/* Review 4 */}
            <div className="testimonial-card-compact">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;Lunar Nights is enchanting. Velvet night-blooming jasmine that lasts all evening without overwhelming. Exceptional artisanal Indian perfumery.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Kabir Mehra</span>
                <span className="author-location">Delhi • Verified Patron</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Join The VIP Circle (Direct WhatsApp Community) */}
      <section className="vip-whatsapp-section">
        <div className="container">
          <div className="vip-whatsapp-card">
            <div className="vip-whatsapp-content">
              <span className="eyebrow">EXCLUSIVE ACCESS</span>
              <h2 className="vip-whatsapp-title">Join The VIP Circle</h2>
              <p className="vip-whatsapp-desc">
                Get private batch invitations, secret coupon drops & bespoke privileges directly on WhatsApp.
              </p>
              <a
                href="https://wa.me/919201991418?text=join%20me%20to%20the%20whatsapp%20group"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta-btn"
                aria-label="Join Seven Heaven VIP WhatsApp Group"
              >
                <MessageCircle size={20} className="wa-icon" />
                <span>Join WhatsApp Group</span>
              </a>
              <span className="vip-whatsapp-subnote">Pre-composed message: &ldquo;join me to the whatsapp group&rdquo;</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
