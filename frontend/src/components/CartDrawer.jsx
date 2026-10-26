import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function CartDrawer() {
  const {
    items,
    itemsCount,
    subtotal,
    discount,
    shippingFee,
    isCartOpen,
    closeCart,
    updateQty,
    removeItem,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    isFreeShipping,
  } = useCart()

  const { t } = useLanguage()
  const navigate = useNavigate()

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const progressPercent = Math.min(100, Math.round(((subtotal - discount) / freeShippingThreshold) * 100))
  const finalTotal = Math.max(0, subtotal - discount) + shippingFee

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-label="Shopping Cart Drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="drawer-title-wrap">
            <ShoppingBag size={20} className="gold-text" />
            <h2 className="drawer-title">
              {t('yourBag')} <span className="drawer-count">({itemsCount})</span>
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="drawer-close-btn"
            aria-label="Close Shopping Bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="free-shipping-bar-wrap">
          <div className="shipping-bar-text">
            {isFreeShipping ? (
              <span className="shipping-unlocked">
                <Sparkles size={14} className="gold-text" /> {t('unlockedFreeShip')}
              </span>
            ) : (
              <span>
                Add <strong className="gold-text">₹{amountNeededForFreeShipping}</strong> more for{' '}
                <strong>FREE Shipping</strong>!
              </span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>

        {/* Drawer Content */}
        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon-wrap">
                <ShoppingBag size={48} strokeWidth={1.2} />
              </div>
              <h3 className="empty-cart-title">{t('emptyCart')}</h3>
              <p className="empty-cart-desc">
                Explore our luxury makeup and skincare collection to fill your bag.
              </p>
              <Link
                to="/shop"
                className="btn btn-gold btn-sm"
                onClick={closeCart}
              >
                {t('exploreShop')} <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul className="cart-items-list" aria-label="Cart items list">
              {items.map((item) => (
                <li key={item.productId} className="cart-item-row">
                  <div className="cart-item-img-wrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="cart-item-remove-btn"
                        title="Remove item"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.size && <span className="cart-item-size">{item.size}</span>}

                    <div className="cart-item-bottom">
                      <div className="cart-qty-stepper">
                        <button
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-value">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="cart-item-pricing">
                        {item.mrp && item.mrp > item.price && (
                          <span className="cart-item-mrp">₹{item.mrp * item.qty}</span>
                        )}
                        <span className="cart-item-price">₹{item.price * item.qty}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-lines">
              <div className="summary-line">
                <span>{t('subtotal')}</span>
                <span className="summary-val">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="summary-line discount-line">
                  <span>Discount</span>
                  <span className="summary-val gold-text">- ₹{discount}</span>
                </div>
              )}
              <div className="summary-line">
                <span>{t('shipping')}</span>
                <span className="summary-val">
                  {shippingFee === 0 ? <strong className="gold-text">{t('free')}</strong> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="summary-line total-line">
                <span>{t('grandTotal')}</span>
                <span className="summary-val total-price">₹{finalTotal}</span>
              </div>
            </div>

            <div className="drawer-actions">
              <button
                onClick={() => {
                  closeCart()
                  navigate('/checkout')
                }}
                className="btn btn-gold btn-block btn-checkout"
              >
                <span>{t('checkout')}</span>
                <ArrowRight size={16} />
              </button>
              <Link
                to="/cart"
                onClick={closeCart}
                className="view-cart-link"
              >
                View Bag & Apply Coupon
              </Link>
            </div>

            <div className="drawer-trust-badge">
              <ShieldCheck size={14} className="gold-text" />
              <span>100% Genuine • Free Returns • Safe & Encrypted</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
