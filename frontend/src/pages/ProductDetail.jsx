import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import PincodeChecker from '../components/PincodeChecker.jsx'
import FragrancePyramid from '../components/FragrancePyramid.jsx'
import ProductCard from '../components/ProductCard.jsx'
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  Share2,
  Clock,
  Droplets,
} from 'lucide-react'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  const [activeTab, setActiveTab] = useState('description') // description | howToUse | reviews

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)

    Promise.all([api.getProduct(slug), api.getProducts()]).then(([p, all]) => {
      setProduct(p)
      setSelectedImage(p?.image || '')
      setAllProducts(all || [])
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="pdp-loading-screen">
        <Sparkles size={36} className="gold-text spinning" />
        <p>Unveiling luxury formulation...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container pdp-not-found">
        <h2>Creation Not Found</h2>
        <p>The product you are looking for is not in our current archive.</p>
        <Link to="/shop" className="btn btn-gold">
          Browse Catalog
        </Link>
      </div>
    )
  }

  const isFavorited = isInWishlist(product.id)
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0

  const isPerfume = product.category === 'fragrance'
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addItem(product, qty, false)
  }

  const handleBuyNow = () => {
    addItem(product, qty, false)
    navigate('/checkout')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} — Seven Heaven Cosmetics`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Product link copied to clipboard!', 'gold')
    }
  }

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(true)
    showToast(`Code "${code}" copied! Apply at checkout.`, 'gold')
    setTimeout(() => setCopiedCoupon(false), 3000)
  }

  const imagesList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image]

  return (
    <div className="pdp-page">
      {/* Breadcrumb Navigation */}
      <div className="container breadcrumb-container">
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/shop?category=${product.category}`}>
            {product.category === 'makeup' ? 'Cosmetics' : 'Fragrance'}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>
      </div>

      <div className="container pdp-main-layout">
        {/* Left: Gallery Column */}
        <div className="pdp-gallery-col">
          <div className="main-image-wrap">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="pdp-main-image"
            />
            {product.badge && (
              <span className={`pdp-badge badge-${product.badge}`}>
                {product.badge === 'bestseller' ? '★ Bestseller' : product.badge}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`pdp-wishlist-btn ${isFavorited ? 'is-active' : ''}`}
              title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label="Wishlist toggle"
            >
              <Heart
                size={20}
                fill={isFavorited ? '#D4AF37' : 'none'}
                stroke={isFavorited ? '#D4AF37' : '#FFFFFF'}
              />
            </button>
          </div>

          {/* Thumbnails Row */}
          {imagesList.length > 1 && (
            <div className="pdp-thumbnails-row">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`thumbnail-btn ${selectedImage === img ? 'active' : ''}`}
                >
                  <img src={img} alt={`${product.name} angle ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees under images */}
          <div className="pdp-trust-grid">
            <div className="trust-cell">
              <Truck size={18} className="gold-text" />
              <div>
                <strong>Free Shipping</strong>
                <span>On orders ₹499+</span>
              </div>
            </div>
            <div className="trust-cell">
              <ShieldCheck size={18} className="gold-text" />
              <div>
                <strong>Cash on Delivery</strong>
                <span>Pay upon arrival</span>
              </div>
            </div>
            <div className="trust-cell">
              <Sparkles size={18} className="gold-text" />
              <div>
                <strong>100% Genuine</strong>
                <span>Direct from Bhopal HQ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="pdp-details-col">
          {/* Eyebrow & Category */}
          <div className="pdp-eyebrow-row">
            <span className="pdp-brand-tag">{product.brand || 'Seven Heaven Cosmetics'}</span>
            <button onClick={handleShare} className="pdp-share-btn" title="Share Creation">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>

          {/* Title & Subname */}
          <h1 className="pdp-title">{product.name}</h1>
          {product.subname && <p className="pdp-subname">{product.subname}</p>}

          {/* Rating & Reviews Bar */}
          <div className="pdp-rating-row">
            <div className="stars-wrap">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  fill={i < Math.floor(product.rating || 5) ? '#D4AF37' : 'none'}
                  stroke="#D4AF37"
                />
              ))}
            </div>
            <span className="rating-score">{product.rating || 4.8} / 5</span>
            <span className="rating-sep">•</span>
            <a href="#patron-reviews" className="reviews-link">
              {product.reviewsCount || 45} Patron Reviews
            </a>
          </div>

          {/* Price Block */}
          <div className="pdp-price-block">
            <div className="price-row">
              <span className="current-price">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="mrp-price">₹{product.mrp}</span>
                  <span className="save-badge">Save ₹{product.mrp - product.price} ({discount}% OFF)</span>
                </>
              )}
            </div>
            <p className="tax-inclusive-text">
              Inclusive of all taxes (GST) • Direct Bhopal Formulation
            </p>
          </div>

          {/* Size / Volume Display */}
          {product.size && (
            <div className="pdp-variant-block">
              <span className="variant-label">Selected Volume:</span>
              <div className="variant-options">
                <span className="variant-pill active">
                  {product.size} <Check size={12} />
                </span>
              </div>
            </div>
          )}

          {/* Available Coupon Offer Banner */}
          {product.couponCode && (
            <div className="pdp-coupon-callout">
              <div className="coupon-callout-icon">
                <Sparkles size={16} className="gold-text" />
              </div>
              <div className="coupon-callout-body">
                <p className="coupon-callout-title">
                  Special Patron Privilege Available!
                </p>
                <p className="coupon-callout-sub">
                  Use coupon code <strong className="gold-text">{product.couponCode}</strong> for instant discount.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyCouponCode(product.couponCode)}
                className="btn btn-gold-outline btn-sm"
              >
                {copiedCoupon ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedCoupon ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* Quantity Stepper & Dual CTAs */}
          <div className="pdp-cta-block">
            <div className="qty-selector-wrap">
              <span className="qty-label">Quantity:</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-val">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.min(20, prev + 1))}
                  className="qty-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons-stack">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-gold btn-lg btn-block btn-add-cart"
              >
                <ShoppingBag size={18} />
                <span>Add to Bag • ₹{product.price * qty}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-gold-outline btn-lg btn-block buy-now-btn btn-buy-now"
              >
                <Zap size={18} className="gold-text" />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>
          </div>

          {/* Pincode Availability Checker */}
          <PincodeChecker />

          {/* Olfactory Notes or Key Complexion Benefits */}
          <FragrancePyramid
            notes={product.notes}
            benefits={product.benefits}
            isPerfume={isPerfume}
          />
        </div>
      </div>

      {/* Tabs Section: Description, How to Use, Specs */}
      <section className="container pdp-tabs-section">
        <div className="pdp-tabs-nav" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'description'}
            onClick={() => setActiveTab('description')}
            className={`tab-link ${activeTab === 'description' ? 'active' : ''}`}
          >
            The Creation
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'howToUse'}
            onClick={() => setActiveTab('howToUse')}
            className={`tab-link ${activeTab === 'howToUse' ? 'active' : ''}`}
          >
            Application Ritual
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'specifications'}
            onClick={() => setActiveTab('specifications')}
            className={`tab-link ${activeTab === 'specifications' ? 'active' : ''}`}
          >
            Formulation Details
          </button>
        </div>

        <div className="pdp-tabs-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <p className="tab-desc-text">{product.description}</p>
              {product.benefits && (
                <div className="features-checklist">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="checklist-item">
                      <Check size={16} className="gold-text" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'howToUse' && (
            <div className="tab-pane">
              <h4 className="ritual-title">How to Experience {product.name}</h4>
              <p className="tab-desc-text">{product.howToUse || 'Apply evenly or spray on pulse points.'}</p>
              <div className="ritual-tips-box">
                <Clock size={16} className="gold-text" />
                <p>
                  <strong>Patron Tip:</strong> For perfumes, do not rub wrists together after spraying;
                  let the top notes evaporate naturally to experience the full scent progression. For the
                  primer, allow 60 seconds to set before applying foundation.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-pane">
              <div className="specs-table">
                <div className="specs-row">
                  <span className="spec-label">Brand</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
                <div className="specs-row">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{product.category === 'makeup' ? 'Cosmetics / Primer' : 'Haute Fragrance (EDP)'}</span>
                </div>
                <div className="specs-row">
                  <span className="spec-label">Net Content</span>
                  <span className="spec-value">{product.size}</span>
                </div>
                <div className="specs-row">
                  <span className="spec-label">Country of Origin</span>
                  <span className="spec-value">India (Crafted in Bhopal, MP)</span>
                </div>
                <div className="specs-row">
                  <span className="spec-label">Cruelty Free</span>
                  <span className="spec-value">Yes • 100% Not Tested on Animals</span>
                </div>
                <div className="specs-row">
                  <span className="spec-label">Quality Standard</span>
                  <span className="spec-value">ISO & GMP Certified Luxury Batch</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Patron Reviews Section */}
      <section className="container pdp-reviews-section" id="patron-reviews">
        <div className="reviews-header-block">
          <div>
            <span className="eyebrow">PATRON VOICES</span>
            <h2 className="section-heading">Verified Experiences ({product.reviewsCount || 45})</h2>
          </div>
          <div className="rating-summary-card">
            <span className="big-rating-score">{product.rating || 4.8}</span>
            <div className="summary-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#D4AF37" stroke="#D4AF37" />
              ))}
            </div>
            <span className="summary-subtext">Based on verified orders</span>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="pdp-reviews-grid">
          <div className="pdp-review-card">
            <div className="review-card-top">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <span className="verified-badge">✓ Verified Buyer</span>
            </div>
            <h4 className="review-card-title">Pure luxury in every drop</h4>
            <p className="review-card-text">
              &ldquo;The finish is sublime. Truly competes with high-end international brands at a
              fraction of the price. Packaging was exceptionally elegant.&rdquo;
            </p>
            <span className="review-card-author">Kavita M. • Bhopal</span>
          </div>

          <div className="pdp-review-card">
            <div className="review-card-top">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#D4AF37" stroke="#D4AF37" />
                ))}
              </div>
              <span className="verified-badge">✓ Verified Buyer</span>
            </div>
            <h4 className="review-card-title">Exceeded all expectations</h4>
            <p className="review-card-text">
              &ldquo;I ordered on Cash on Delivery and received it in 3 days. Superb longevity and
              texture. Definitely returning for full size bottles.&rdquo;
            </p>
            <span className="review-card-author">Rahul V. • Delhi</span>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container pdp-related-section">
          <div className="section-header-centered">
            <span className="eyebrow">CURATED COMPLEMENTS</span>
            <h2 className="section-heading">You May Also Admire</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="mobile-sticky-bar">
        <div className="mobile-sticky-info">
          <span className="sticky-name">{product.name}</span>
          <span className="sticky-price">₹{product.price}</span>
        </div>
        <div className="mobile-sticky-btns">
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-gold-outline btn-sm mobile-sticky-add-btn btn-add-cart"
            aria-label="Add to bag"
          >
            <ShoppingBag size={14} />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="btn btn-gold btn-sm mobile-sticky-buy-btn btn-buy-now"
            aria-label="Buy now"
          >
            <Zap size={14} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
