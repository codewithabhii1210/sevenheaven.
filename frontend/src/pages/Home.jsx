import { useState, useEffect, useMemo } from 'react'
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
  Star,
  Flame,
  Award,
  MessageCircle,
  Zap,
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

  // 3–4 Trending Products rotation system
  const defaultTrending = [
    {
      id: 'sh7-primer-30ml',
      slug: 'invisible-blur-primer',
      name: 'Invisible Blur Primer',
      subname: 'Smooth Blur Perfect • 30 ml',
      categoryLabel: 'Flagship Cosmetic',
      price: 499,
      mrp: 699,
      discount: 29,
      rating: 4.8,
      reviewsCount: 126,
      image: '/images/products/invisible-blur-primer.png',
    },
    {
      id: 'sh7-matte-lipstick-nude',
      slug: 'velvet-suede-lipstick-bhopal-nude',
      name: 'Velvet Suede Lipstick • Bhopal Nude',
      subname: 'Perfect Everyday Warm Nude • 3.8 g',
      categoryLabel: 'Signature Lip Colour',
      price: 549,
      mrp: 799,
      discount: 31,
      rating: 4.9,
      reviewsCount: 178,
      image: '/images/products/velvet-suede-lipstick-bhopal-nude.jpg',
    },
    {
      id: 'sh7-matte-foundation-30',
      slug: 'velvet-matte-hd-foundation',
      name: 'Velvet Matte HD Foundation',
      subname: '24HR Flawless Complexion • 30 ml',
      categoryLabel: 'Complexion Couture',
      price: 899,
      mrp: 1299,
      discount: 31,
      rating: 4.8,
      reviewsCount: 142,
      image: '/images/products/velvet-matte-hd-foundation.jpg',
    },
    {
      id: 'sh7-nourishing-lip-oil-8',
      slug: '24k-gold-nourishing-lip-oil',
      name: '24K Gold Nourishing Lip Oil',
      subname: 'Botanical Glass Gloss Elixir • 8 ml',
      categoryLabel: 'Lip Ritual Luxury',
      price: 449,
      mrp: 649,
      discount: 31,
      rating: 4.9,
      reviewsCount: 145,
      image: '/images/products/24k-gold-nourishing-lip-oil.jpg',
    },
  ]

  const trendingProducts = useMemo(() => {
    if (productsList && productsList.length >= 3) {
      return productsList.slice(0, 4).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        subname: p.subname || `${p.size || ''}`,
        categoryLabel: p.category === 'makeup' ? 'Flagship Cosmetic' : 'Haute Fragrance',
        price: p.price,
        mrp: p.mrp || Math.round(p.price * 1.35),
        discount: p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 25,
        rating: p.rating || 4.8,
        reviewsCount: p.reviewsCount || 45,
        image: p.image,
      }))
    }
    return defaultTrending
  }, [productsList])

  const [trendingIndex, setTrendingIndex] = useState(0)
  const [isRotating, setIsRotating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (trendingProducts.length <= 1 || isHovered) return

    const timer = setInterval(() => {
      setIsRotating(true)
      setTimeout(() => {
        setTrendingIndex((prev) => (prev + 1) % trendingProducts.length)
        setIsRotating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(timer)
  }, [trendingProducts.length, isHovered])

  const currentTrending = trendingProducts[trendingIndex] || trendingProducts[0]

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
              Step into the realm of Seven Heaven. Professional cosmetics formulated for flawless
              artistry — led by our acclaimed Invisible Blur Primer, designed for high-definition
              radiance.
            </p>

            {/* Animated Trending Products Showcase (Rotates every 4s) */}
            <div
              className="hero-trending-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Link
                to={`/product/${currentTrending.slug || currentTrending.id}`}
                className={`hero-trending-card ${isRotating ? 'is-fading' : ''}`}
                aria-label={`Trending Product: ${currentTrending.name}`}
              >
                <div className="trending-pill">
                  <Flame size={12} className="flame-icon" />
                  <span>TRENDING #{trendingIndex + 1}</span>
                </div>

                <div className="trending-body">
                  <div className="trending-img-wrap">
                    <img
                      src={currentTrending.image}
                      alt={currentTrending.name}
                      className="trending-thumb"
                    />
                  </div>
                  <div className="trending-details">
                    <div className="trending-meta">
                      <span className="trending-cat">{currentTrending.categoryLabel}</span>
                      <span className="trending-rating">★ {currentTrending.rating} ({currentTrending.reviewsCount})</span>
                    </div>
                    <h3 className="trending-title">{currentTrending.name}</h3>
                    <p className="trending-sub">{currentTrending.subname}</p>
                    <div className="trending-price-row">
                      <span className="trending-price">₹{currentTrending.price}</span>
                      {currentTrending.mrp > currentTrending.price && (
                        <span className="trending-mrp">₹{currentTrending.mrp}</span>
                      )}
                      {currentTrending.discount > 0 && (
                        <span className="trending-save">{currentTrending.discount}% OFF</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="trending-dots-bar">
                  {trendingProducts.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setTrendingIndex(idx)
                      }}
                      className={`trending-dot ${idx === trendingIndex ? 'active' : ''}`}
                      title={p.name}
                      aria-label={`Select trending product: ${p.name}`}
                    />
                  ))}
                </div>
              </Link>
            </div>

            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold btn-lg">
                <span>Shop All Products</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  addItem(currentTrending, 1, false)
                  navigate('/checkout')
                }}
                className="btn btn-gold-outline btn-lg hero-buy-now-btn"
              >
                <Zap size={16} className="gold-text" />
                <span>Buy Now • ₹{currentTrending.price}</span>
              </button>
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
                aria-selected={activeCategoryTab === 'makeup'}
                onClick={() => setActiveCategoryTab('makeup')}
                className={`tab-btn ${activeCategoryTab === 'makeup' ? 'active' : ''}`}
              >
                Cosmetics & Skincare ({productsList.filter((p) => p.category === 'makeup').length || 24})
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
                <span className="author-location">Bhopal • Patron</span>
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
                <span className="author-location">Mumbai • Patron</span>
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
                <span className="author-location">Indore • Patron</span>
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
                <span className="author-location">Delhi • Patron</span>
              </div>
            </div>
          </div>

          <p className="reviews-disclaimer testimonials-disclaimer">
            * Showcase testimonials. Verified purchase reviews will be published here as orders
            are delivered.
          </p>
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
