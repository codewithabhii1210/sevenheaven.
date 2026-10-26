import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  Truck,
} from 'lucide-react'

export default function Cart() {
  const {
    items,
    itemsCount,
    subtotal,
    discount,
    shippingFee,
    appliedCoupon,
    updateQty,
    removeItem,
    clearCart,
    applyCouponCode,
    removeCoupon,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    isFreeShipping,
  } = useCart()

  const { t } = useLanguage()
  const navigate = useNavigate()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const progressPercent = Math.min(
    100,
    Math.round(((subtotal - discount) / freeShippingThreshold) * 100)
  )
  const finalTotal = Math.max(0, subtotal - discount) + shippingFee

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponLoading(true)
    const success = await applyCouponCode(couponInput.trim())
    setCouponLoading(false)
    if (success) setCouponInput('')
  }

  if (items.length === 0) {
    return (
      <div className="container cart-empty-page">
        <div className="empty-cart-card">
          <div className="empty-icon-wrap">
            <ShoppingBag size={56} strokeWidth={1.2} className="gold-text" />
          </div>
          <h1 className="empty-cart-heading">{t('emptyCart')}</h1>
          <p className="empty-cart-text">
            Your shopping bag awaits your discerning choice. Explore our luxury makeup
            and skincare collection.
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
    <div className="cart-page">
      <div className="container">
        {/* Page Header */}
        <div className="cart-page-header">
          <h1 className="cart-heading">
            {t('yourBag')} <span className="cart-count-pill">({itemsCount} items)</span>
          </h1>
          <button onClick={clearCart} className="clear-cart-btn">
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="free-shipping-card">
          <div className="shipping-text-row">
            {isFreeShipping ? (
              <span className="shipping-congrats">
                <Sparkles size={16} className="gold-text" /> {t('unlockedFreeShip')}
              </span>
            ) : (
              <span>
                Add <strong className="gold-text">₹{amountNeededForFreeShipping}</strong> more to
                unlock <strong>FREE Doorstep Delivery</strong>!
              </span>
            )}
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-bar"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>

        {/* Main Cart Grid: Left Items List, Right Order Summary */}
        <div className="cart-layout-grid">
          {/* Left: Items List */}
          <div className="cart-items-column">
            <ul className="cart-items-card-list">
              {items.map((item) => (
                <li key={item.productId} className="cart-page-item">
                  <div className="item-thumbnail">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>

                  <div className="item-details-area">
                    <div className="item-header-row">
                      <div>
                        <h3 className="item-title">{item.name}</h3>
                        {item.size && <span className="item-size-pill">{item.size}</span>}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="item-delete-btn"
                        title="Remove item"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="item-footer-row">
                      <div className="item-qty-control">
                        <button
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-number">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="item-pricing">
                        {item.mrp && item.mrp > item.price && (
                          <span className="item-mrp">₹{item.mrp * item.qty}</span>
                        )}
                        <span className="item-price">₹{item.price * item.qty}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Quick Available Promo Codes to click */}
            <div className="available-coupons-box">
              <div className="coupons-box-header">
                <Tag size={16} className="gold-text" />
                <h4>Available Patron Privilege Coupons</h4>
              </div>
              <div className="coupons-tags-list">
                <button
                  type="button"
                  onClick={() => applyCouponCode('WELCOME10')}
                  className="coupon-quick-tag"
                >
                  <span className="code">WELCOME10</span>
                  <span className="desc">10% Off Sitewide</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyCouponCode('SH7PRIMER10')}
                  className="coupon-quick-tag"
                >
                  <span className="code">SH7PRIMER10</span>
                  <span className="desc">10% Off Primer</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyCouponCode('FREESHIP')}
                  className="coupon-quick-tag"
                >
                  <span className="code">FREESHIP</span>
                  <span className="desc">Free Shipping on ₹499+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card */}
          <div className="cart-summary-column">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              {/* Coupon Form */}
              <div className="coupon-input-section">
                {appliedCoupon ? (
                  <div className="applied-coupon-card">
                    <div className="applied-coupon-info">
                      <Tag size={15} className="gold-text" />
                      <div>
                        <strong>{appliedCoupon.code}</strong> Applied
                        <p className="applied-coupon-desc">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="coupon-remove-btn">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="coupon-input-form">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter Coupon Code"
                      className="coupon-field"
                      aria-label="Coupon code"
                    />
                    <button
                      type="submit"
                      className="btn btn-gold-outline btn-sm coupon-apply-btn"
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? 'Checking...' : t('applyCoupon')}
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Bag Subtotal ({itemsCount} items)</span>
                  <span className="val">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Coupon Savings</span>
                    <span className="val gold-text">- ₹{discount}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Doorstep Delivery</span>
                  <span className="val">
                    {shippingFee === 0 ? (
                      <span className="gold-text font-bold">{t('free')}</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span>{t('grandTotal')}</span>
                  <span className="total-amount">₹{finalTotal}</span>
                </div>

                <p className="summary-tax-note">{t('taxInclusive')}</p>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-gold btn-lg btn-block checkout-cta-btn"
              >
                <span>{t('checkout')}</span>
                <ArrowRight size={16} />
              </button>

              <Link to="/shop" className="continue-shopping-link">
                ← Continue Browsing Creations
              </Link>

              {/* Guarantees Box */}
              <div className="summary-guarantees">
                <div className="guarantee-item">
                  <ShieldCheck size={16} className="gold-text" />
                  <span>256-bit Bank Grade Encrypted Checkout</span>
                </div>
                <div className="guarantee-item">
                  <Truck size={16} className="gold-text" />
                  <span>COD & Prepaid Fast Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
