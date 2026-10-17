import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import CountdownTimer from '../components/CountdownTimer.jsx'
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

            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold btn-lg">
                <span>Explore Catalog</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/product/invisible-blur-primer" className="btn btn-gold-outline btn-lg">
                <span>Discover Primer (₹499)</span>
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

      {/* 3. Deal Urgency Banner with Countdown Timer */}
      <section className="deal-urgency-section">
        <div className="container deal-inner">
          <div className="deal-info">
            <span className="deal-tag">VIP PATRON PRIVILEGE</span>
            <h2 className="deal-title">The Grand Inaugural Offer</h2>
            <p className="deal-desc">
              Experience the dual synergy of our Invisible Blur Primer and handpicked French-Middle Eastern
              fragrances. Enjoy flat 10% off using code <strong>WELCOME10</strong> + Free Shipping on ₹499+.
            </p>
          </div>
          <CountdownTimer hours={24} label="Offer window expires in:" />
        </div>
      </section>

      {/* 4. Curated Bestsellers Collection Grid */}
      <section className="section-curated" id="bestsellers">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">{t('featuredCollection')}</span>
            <h2 className="section-heading">{t('featuredMainHeading')}</h2>
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

      {/* 5. Spotlight on REAL Product: Invisible Blur Primer */}
      {primerProduct && (
        <section className="primer-spotlight-section" aria-label="Invisible Blur Primer Spotlight">
          <div className="container primer-spotlight-inner">
            <div className="primer-spotlight-media">
              <div className="spotlight-image-card">
                <span className="spotlight-badge">★ #1 FLAGSHIP COSMETIC</span>
                <img
                  src={primerProduct.image}
                  alt="Seven Heaven Invisible Blur Primer Smooth Blur Perfect"
                  className="primer-large-img"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="primer-spotlight-content">
              <span className="eyebrow">PROFESSIONAL COMPLEXION PREP</span>
              <h2 className="primer-spotlight-title">Invisible Blur Primer</h2>
              <p className="primer-spotlight-sub">Smooth Blur Perfect • 30 ml</p>

              <div className="primer-price-box">
                <span className="primer-sale-price">₹{primerProduct.price}</span>
                <span className="primer-mrp-price">₹{primerProduct.mrp}</span>
                <span className="badge badge-discount">Save ₹{primerProduct.mrp - primerProduct.price} (29% OFF)</span>
              </div>

              <p className="primer-description">
                {primerProduct.description} Formulated for humid Indian climates, it glides like silk, locks moisture,
                and creates a filter-like velvet canvas that lasts from dawn till midnight.
              </p>

              {/* 8 Signature Benefits Grid */}
              <div className="primer-benefits-grid">
                {(primerProduct.benefits || []).slice(0, 6).map((benefit, i) => (
                  <div key={i} className="primer-benefit-item">
                    <Check size={16} className="gold-text" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="primer-action-row">
                <button
                  onClick={() => {
                    addItem(primerProduct, 1)
                  }}
                  className="btn btn-gold btn-lg"
                >
                  <span>Add Primer to Bag (₹{primerProduct.price})</span>
                  <ArrowRight size={16} />
                </button>
                <Link
                  to={`/product/${primerProduct.slug}`}
                  className="btn btn-gold-outline btn-lg"
                >
                  View Details & Reviews
                </Link>
              </div>

              <div className="primer-guarantee-note">
                <ShieldCheck size={16} className="gold-text" />
                <span>Suitable for sensitive, oily, and dry skin types. Non-Comedogenic.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Shop by Fragrance Occasion (Matching in.ajmal.com) */}
      <section className="occasions-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">BESPOKE FRAGRANCE WARDROBE</span>
            <h2 className="section-heading">Scent for Every Occasion</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="occasions-grid">
            <div className="occasion-card">
              <div className="occasion-bg evening-bg" />
              <div className="occasion-overlay">
                <span className="occasion-tag">BOLD & MAGNETIC</span>
                <h3 className="occasion-title">Evening & Gala</h3>
                <p className="occasion-desc">Deep oud, rich black amber, and incense that command attention.</p>
                <Link to="/product/noir-essence" className="occasion-link">
                  Explore Noir Essence →
                </Link>
              </div>
            </div>

            <div className="occasion-card">
              <div className="occasion-bg royal-bg" />
              <div className="occasion-overlay">
                <span className="occasion-tag">REGAL CELEBRATION</span>
                <h3 className="occasion-title">Weddings & Royalty</h3>
                <p className="occasion-desc">Golden oud laced with warm saffron and Tuscan leather.</p>
                <Link to="/product/golden-oud" className="occasion-link">
                  Explore Golden Oud →
                </Link>
              </div>
            </div>

            <div className="occasion-card">
              <div className="occasion-bg date-bg" />
              <div className="occasion-overlay">
                <span className="occasion-tag">INTIMATE & ROMANTIC</span>
                <h3 className="occasion-title">Date Nights</h3>
                <p className="occasion-desc">Moonlit florals, velvety jasmine, and creamy sandalwood.</p>
                <Link to="/product/lunar-nights" className="occasion-link">
                  Explore Lunar Nights →
                </Link>
              </div>
            </div>

            <div className="occasion-card">
              <div className="occasion-bg daily-bg" />
              <div className="occasion-overlay">
                <span className="occasion-tag">VERSATILE EVERYDAY</span>
                <h3 className="occasion-title">Office & Daywear</h3>
                <p className="occasion-desc">Sun-drenched honey, sweet mandarin, and clean amber.</p>
                <Link to="/product/amber-essence" className="occasion-link">
                  Explore Amber Essence →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Active Promo / Coupon Codes Showcase */}
      <section className="coupons-showcase-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">EXCLUSIVE REWARDS</span>
            <h2 className="section-heading">Active Privilege Codes</h2>
            <p className="section-subtext">Click any code to copy instantly for checkout savings.</p>
            <div className="gold-divider-center" />
          </div>

          <div className="coupons-grid">
            {/* Coupon 1 */}
            <div className="coupon-card">
              <div className="coupon-left">
                <span className="coupon-discount-text">10% OFF</span>
                <span className="coupon-type-text">FIRST ORDER</span>
              </div>
              <div className="coupon-right">
                <div className="coupon-code-badge">WELCOME10</div>
                <p className="coupon-desc">10% off on your inaugural order (sitewide)</p>
                <button
                  onClick={() => copyCoupon('WELCOME10')}
                  className="coupon-copy-btn"
                  aria-label="Copy coupon WELCOME10"
                >
                  {copiedCode === 'WELCOME10' ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Coupon 2 */}
            <div className="coupon-card">
              <div className="coupon-left">
                <span className="coupon-discount-text">10% OFF</span>
                <span className="coupon-type-text">PRIMER SPECIAL</span>
              </div>
              <div className="coupon-right">
                <div className="coupon-code-badge">SH7PRIMER10</div>
                <p className="coupon-desc">Extra 10% off on Invisible Blur Primer</p>
                <button
                  onClick={() => copyCoupon('SH7PRIMER10')}
                  className="coupon-copy-btn"
                  aria-label="Copy coupon SH7PRIMER10"
                >
                  {copiedCode === 'SH7PRIMER10' ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Coupon 3 */}
            <div className="coupon-card">
              <div className="coupon-left">
                <span className="coupon-discount-text">FREE</span>
                <span className="coupon-type-text">SHIPPING</span>
              </div>
              <div className="coupon-right">
                <div className="coupon-code-badge">FREESHIP</div>
                <p className="coupon-desc">Free doorstep delivery on orders above ₹499</p>
                <button
                  onClick={() => copyCoupon('FREESHIP')}
                  className="coupon-copy-btn"
                  aria-label="Copy coupon FREESHIP"
                >
                  {copiedCode === 'FREESHIP' ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Patron Testimonials & Reviews */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">{t('reviewsTitle')}</span>
            <h2 className="section-heading">{t('reviewsSubtitle')}</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;The Invisible Blur Primer is truly holy grail. It creates a poreless, matte velvet
                finish that held my makeup intact for 14 hours during a Bhopal wedding in August heat.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Ananya Sharma</span>
                <span className="author-location">Bhopal • Verified Patron</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;Golden Oud smells indistinguishable from a ₹15,000 niche Dubai perfume house.
                The projection is phenomenal, easily 10+ hours. The packaging and bottle are pure luxury.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Devansh Kothari</span>
                <span className="author-location">Mumbai • Verified Patron</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <p className="testimonial-quote">
                &ldquo;Seven Heaven represents authentic luxury at Indian prices. Ordering on COD was
                seamless and delivery reached Indore in 3 days. Noir Essence is my new signature scent.&rdquo;
              </p>
              <div className="testimonial-author">
                <span className="author-name">Pooja Rathore</span>
                <span className="author-location">Indore • Verified Patron</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
