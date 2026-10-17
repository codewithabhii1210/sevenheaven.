import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { Heart, Star, ShoppingBag, Sparkles } from 'lucide-react'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { t } = useLanguage()

  if (!product) return null

  const isFavorited = isInWishlist(product.id)
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0

  const primaryFamily =
    product.category === 'makeup'
      ? 'Skin Perfecting'
      : product.notes?.heart?.[0] || product.notes?.base?.[0] || 'Luxury EDP'

  const productUrl = `/product/${product.slug || product.id}`

  return (
    <article className="product-card group">
      {/* Top Media Container */}
      <div className="product-media-wrap">
        <Link to={productUrl} className="product-img-link" tabIndex={-1}>
          <img
            src={product.image}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
        </Link>

        {/* Badges on top left */}
        <div className="product-badges-stack">
          {product.badge === 'bestseller' && (
            <span className="badge badge-bestseller">
              <Sparkles size={11} /> Bestseller
            </span>
          )}
          {product.badge === 'new' && (
            <span className="badge badge-new">New Arrival</span>
          )}
          {product.badge === 'sale' && (
            <span className="badge badge-sale">Limited Deal</span>
          )}
          {discount > 0 && (
            <span className="badge badge-discount">{discount}% OFF</span>
          )}
        </div>

        {/* Wishlist Heart Button on top right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product)
          }}
          className={`wishlist-btn ${isFavorited ? 'is-active' : ''}`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isFavorited ? '#D4AF37' : 'none'} stroke={isFavorited ? '#D4AF37' : '#FFFFFF'} />
        </button>
      </div>

      {/* Product Information Body */}
      <div className="product-info-wrap">
        {/* Category / Longevity Tag */}
        <div className="product-meta-row">
          <span className="product-family-tag">{primaryFamily}</span>
          {product.size && <span className="product-size-tag">{product.size}</span>}
        </div>

        {/* Title */}
        <h3 className="product-title">
          <Link to={productUrl}>{product.name}</Link>
        </h3>
        {product.subname && <p className="product-subname">{product.subname}</p>}

        {/* Rating */}
        <div className="product-rating-row">
          <div className="rating-stars" aria-label={`Rating ${product.rating || 4.8} out of 5`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.floor(product.rating || 5) ? '#D4AF37' : 'none'}
                stroke="#D4AF37"
              />
            ))}
          </div>
          <span className="rating-number">{product.rating || 4.8}</span>
          <span className="reviews-count">({product.reviewsCount || 45})</span>
        </div>

        {/* Pricing */}
        <div className="product-price-row">
          <span className="product-current-price">₹{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="product-mrp-price">₹{product.mrp}</span>
          )}
          {discount > 0 && (
            <span className="product-save-text">
              Save ₹{product.mrp - product.price}
            </span>
          )}
        </div>

        <p className="product-tax-note">{t('taxInclusive')}</p>

        {/* Flipkart-Style Action Button Aligned at Bottom */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            addItem(product, 1)
          }}
          className="product-card-action-btn"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag size={14} />
          <span>{t('addToCart')}</span>
        </button>
      </div>
    </article>
  )
}
