import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ShoppingBag } from 'lucide-react'

// Minimal product card — image, name, price, add to cart. Nothing else.
export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { t } = useLanguage()

  if (!product) return null

  const productUrl = `/product/${product.slug || product.id}`

  return (
    <article className="product-card group">
      <div className="product-media-wrap">
        <Link to={productUrl} className="product-img-link" tabIndex={-1}>
          <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        </Link>
      </div>

      <div className="product-info-wrap">
        <h3 className="product-title">
          <Link to={productUrl}>{product.name}</Link>
        </h3>

        <div className="product-price-row">
          <span className="product-current-price">₹{product.price}</span>
        </div>

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
