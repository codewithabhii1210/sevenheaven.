import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import PincodeChecker from '../components/PincodeChecker.jsx'
import FragrancePyramid from '../components/FragrancePyramid.jsx'
import ProductCard from '../components/ProductCard.jsx'
import {
  Heart,
  ShoppingBag,
  Zap,
  Check,
  Sparkles,
} from 'lucide-react'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')

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
        <p>Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container pdp-not-found">
        <h2>Product Not Found</h2>
        <p>This product is not available.</p>
        <Link to="/shop" className="btn btn-gold">
          Browse Shop
        </Link>
      </div>
    )
  }

  const isFavorited = isInWishlist(product.id)
  const isPerfume = product.category === 'fragrance'
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addItem(product, qty, false)
  }

  const handleBuyNow = () => {
    addItem(product, qty, false)
    navigate('/checkout')
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
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="pdp-details-col">
          {/* Title */}
          <h1 className="pdp-title">{product.name}</h1>

          {/* Price */}
          <div className="pdp-price-block">
            <div className="price-row">
              <span className="current-price">₹{product.price}</span>
            </div>
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

          {/* Quantity & CTAs */}
          <div className="pdp-cta-block">
            <div className="qty-selector-wrap">
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
            Description
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'howToUse'}
            onClick={() => setActiveTab('howToUse')}
            className={`tab-link ${activeTab === 'howToUse' ? 'active' : ''}`}
          >
            How to Use
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'specifications'}
            onClick={() => setActiveTab('specifications')}
            className={`tab-link ${activeTab === 'specifications' ? 'active' : ''}`}
          >
            Specifications
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
              <p className="tab-desc-text">{product.howToUse || 'Apply evenly.'}</p>
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container pdp-related-section">
          <div className="section-header-centered">
            <h2 className="section-heading">You May Also Like</h2>
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
