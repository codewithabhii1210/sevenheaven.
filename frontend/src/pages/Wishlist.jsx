import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react'

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addItem } = useCart()
  const { t } = useLanguage()

  if (wishlist.length === 0) {
    return (
      <div className="container wishlist-empty-page">
        <div className="empty-wishlist-card">
          <div className="empty-icon-wrap">
            <Heart size={56} strokeWidth={1.2} className="gold-text" />
          </div>
          <h1 className="empty-heading">Your Wishlist is Empty</h1>
          <p className="empty-text">
            You haven&apos;t saved any Seven Heaven creations yet. Explore our artisanal perfumes
            and the acclaimed Invisible Blur Primer to curate your personal archive.
          </p>
          <Link to="/shop" className="btn btn-gold btn-lg">
            <span>{t('exploreShop')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Page Header */}
        <div className="wishlist-header-row">
          <div>
            <span className="eyebrow">SAVED ARCHIVE</span>
            <h1 className="wishlist-heading">
              Your Wishlist <span className="wishlist-count-pill">({wishlist.length} items)</span>
            </h1>
          </div>
          <button onClick={clearWishlist} className="clear-wishlist-btn">
            Clear Wishlist
          </button>
        </div>

        {/* Wishlist Items Grid */}
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <article key={product.id} className="wishlist-card">
              <div className="wishlist-media">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name} />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="wishlist-remove-icon-btn"
                  title="Remove from wishlist"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="wishlist-info">
                {product.size && <span className="wishlist-size-tag">{product.size}</span>}
                <h3 className="wishlist-title">
                  <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>

                <div className="wishlist-price-row">
                  <span className="wishlist-price">₹{product.price}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="wishlist-mrp">₹{product.mrp}</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    addItem(product, 1)
                    removeFromWishlist(product.id)
                  }}
                  className="btn btn-gold btn-sm btn-block wishlist-move-btn"
                >
                  <ShoppingBag size={14} />
                  <span>Move to Bag</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
