import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../services/api.js'
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react'

// Helper to load Razorpay checkout script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    codHandlingFee,
    appliedCoupon,
    clearCart,
  } = useCart()

  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    line1: '',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: localStorage.getItem('sh7_pincode') || '',
  })

  // Payment Method: 'razorpay' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Confirmed Order State
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  // Calculations
  const codFee = paymentMethod === 'cod' ? codHandlingFee : 0
  const finalTotal = Math.max(0, subtotal - discount) + shippingFee + codFee

  // Redirect if cart is empty and no confirmed order
  useEffect(() => {
    if (items.length === 0 && !confirmedOrder) {
      navigate('/cart')
    }
  }, [items, confirmedOrder, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Strict Address Validation matching backend sanitize.js
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters)'
    }
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number'
    }
    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.line1.trim() || formData.line1.trim().length < 5) {
      errors.line1 = 'Please enter detailed address line (house/flat no, street)'
    }
    if (!formData.city.trim()) {
      errors.city = 'Please enter your city'
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit postal pincode'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showToast('Please fix the errors in your shipping address', 'info')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Prepare Order Payload
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
        })),
        address: {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email.trim(),
          line1: formData.line1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
      }

      // 2. Create Order in Backend API
      const orderRes = await api.createOrder(orderPayload)
      if (!orderRes || !orderRes.orderNo) {
        throw new Error(orderRes?.error || 'Failed to initiate order')
      }

      const orderNo = orderRes.orderNo

      // 3. Handle Cash on Delivery (COD)
      if (paymentMethod === 'cod') {
        clearCart()
        setConfirmedOrder(orderRes.order)
        showToast(`Order ${orderNo} confirmed via Cash on Delivery!`, 'gold')
        setIsSubmitting(false)
        return
      }

      // 4. Handle Razorpay Online Payment
      if (paymentMethod === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          throw new Error('Razorpay payment gateway failed to load. Please try COD.')
        }

        const rzpOrderData = await api.createRazorpayOrder(orderNo)
        if (!rzpOrderData || !rzpOrderData.razorpayOrderId) {
          throw new Error(rzpOrderData?.error || 'Failed to initiate Razorpay transaction')
        }

        const options = {
          key: rzpOrderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency || 'INR',
          name: 'Seven Heaven Cosmetics',
          description: `Order ${orderNo} — Luxury Beauty & Fragrance`,
          image: '/images/logo-seven-heaven.png',
          order_id: rzpOrderData.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#D4AF37', // Gold branding
          },
          handler: async (response) => {
            try {
              // Verify Signature with Timing-Safe HMAC-SHA256 in Backend
              const verifyRes = await api.verifyRazorpay({
                orderNo,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })

              if (verifyRes && verifyRes.success) {
                clearCart()
                const updatedOrder = await api.getOrder(orderNo)
                setConfirmedOrder(updatedOrder.order || orderRes.order)
                showToast(`Payment successful! Order ${orderNo} confirmed.`, 'gold')
              } else {
                showToast('Payment verification failed. Please contact concierge.', 'info')
              }
            } catch (vErr) {
              console.error('Verification error:', vErr)
              showToast(vErr.message || 'Payment verification error', 'info')
            } finally {
              setIsSubmitting(false)
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false)
              showToast('Payment window closed. You can retry or choose COD.', 'info')
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (failResponse) => {
          setIsSubmitting(false)
          showToast(`Payment failed: ${failResponse.error?.description || 'Unknown error'}`, 'info')
        })
        rzp.open()
      }
    } catch (err) {
      console.error('Checkout error:', err)
      showToast(err.message || 'Failed to complete order. Please try again.', 'info')
      setIsSubmitting(false)
    }
  }

  // ============================================================
  // ORDER CONFIRMATION SCREEN (When order succeeds)
  // ============================================================
  if (confirmedOrder) {
    return (
      <div className="container confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-icon-wrap">
            <CheckCircle2 size={64} className="gold-text" />
          </div>

          <span className="confirmation-eyebrow">PATRON CONFIRMATION</span>
          <h1 className="confirmation-title">Thank You For Your Order</h1>
          <p className="confirmation-sub">
            Your creation is being hand-packed with care at our Bhopal atelier.
          </p>

          <div className="order-number-banner">
            <span className="order-no-label">ORDER NUMBER</span>
            <strong className="order-no-val">{confirmedOrder.orderNo}</strong>
            <span className="order-date">
              Placed on {new Date(confirmedOrder.placedAt || Date.now()).toLocaleDateString('en-IN', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Details Grid */}
          <div className="confirmation-details-grid">
            <div className="confirmation-detail-box">
              <h4 className="detail-box-title">
                <MapPin size={16} className="gold-text" /> Delivery Destination
              </h4>
              <p className="detail-name">{confirmedOrder.address?.name}</p>
              <p className="detail-line">{confirmedOrder.address?.line1}</p>
              <p className="detail-line">
                {confirmedOrder.address?.city}, {confirmedOrder.address?.state} – {confirmedOrder.address?.pincode}
              </p>
              <p className="detail-phone">📞 {confirmedOrder.address?.phone}</p>
            </div>

            <div className="confirmation-detail-box">
              <h4 className="detail-box-title">
                <CreditCard size={16} className="gold-text" /> Payment & Dispatch
              </h4>
              <p className="detail-line">
                <strong>Method:</strong>{' '}
                {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Online'}
              </p>
              <p className="detail-line">
                <strong>Payment Status:</strong>{' '}
                <span className={`status-badge status-${confirmedOrder.paymentStatus}`}>
                  {confirmedOrder.paymentStatus?.toUpperCase()}
                </span>
              </p>
              <p className="detail-line">
                <strong>Total Amount:</strong> ₹{confirmedOrder.total}
              </p>
              <p className="detail-line">
                <strong>Estimated Delivery:</strong> 3–5 Business Days
              </p>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="confirmation-items-summary">
            <h4 className="items-summary-title">Packaged Creations</h4>
            <div className="confirmation-items-list">
              {(confirmedOrder.items || []).map((item, idx) => (
                <div key={idx} className="confirmation-item-row">
                  <img src={item.image} alt={item.name} className="item-mini-thumb" />
                  <div className="item-mini-info">
                    <strong>{item.name}</strong>
                    <span>
                      Qty: {item.qty} {item.size && `• ${item.size}`}
                    </span>
                  </div>
                  <span className="item-mini-price">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concierge Support Note */}
          <div className="confirmation-concierge-note">
            <Phone size={16} className="gold-text" />
            <p>
              Questions about your parcel? Our Bhopal Concierge is at your service on{' '}
              <a href="tel:+919201991418" className="gold-text">
                +91 92019 91418
              </a>{' '}
              or email{' '}
              <a href="mailto:sevenheavencosmetics@gmail.com" className="gold-text">
                sevenheavencosmetics@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="confirmation-actions">
            <Link to="/shop" className="btn btn-gold btn-lg">
              <span>Return to Catalog</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/my-account" className="btn btn-gold-outline btn-lg">
              View Order in My Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // ACTIVE CHECKOUT FORM SCREEN
  // ============================================================
  return (
    <div className="checkout-page">
      <div className="container checkout-container">
        {/* Header */}
        <div className="checkout-header-block">
          <div className="checkout-lock-badge">
            <Lock size={14} className="gold-text" />
            <span>256-BIT ENCRYPTED LUXURY CHECKOUT</span>
          </div>
          <h1 className="checkout-heading">Complete Your Order</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-main-grid">
          {/* Left Column: Shipping Address & Payment Selection */}
          <div className="checkout-form-column">
            {/* 1. Shipping Address Card */}
            <div className="checkout-card">
              <div className="card-header-row">
                <div className="step-badge">1</div>
                <div>
                  <h3 className="card-title">Shipping Address</h3>
                  <p className="card-subtitle">Where should we deliver your luxury parcel?</p>
                </div>
              </div>

              <div className="form-fields-grid">
                {/* Full Name */}
                <div className="field-group full-width">
                  <label htmlFor="name" className="field-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Devendra Sharma"
                    className={`text-input ${formErrors.name ? 'has-error' : ''}`}
                    required
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>

                {/* Mobile Phone */}
                <div className="field-group">
                  <label htmlFor="phone" className="field-label">
                    Mobile Phone (+91) <span className="req">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`text-input ${formErrors.phone ? 'has-error' : ''}`}
                    required
                  />
                  {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                </div>

                {/* Email Address */}
                <div className="field-group">
                  <label htmlFor="email" className="field-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="For order receipt & tracking"
                    className={`text-input ${formErrors.email ? 'has-error' : ''}`}
                    required
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>

                {/* Address Line 1 */}
                <div className="field-group full-width">
                  <label htmlFor="line1" className="field-label">
                    Street Address & House/Flat No. <span className="req">*</span>
                  </label>
                  <input
                    id="line1"
                    name="line1"
                    type="text"
                    value={formData.line1}
                    onChange={handleInputChange}
                    placeholder="e.g. 42 Arera Colony, Near Platinum Plaza"
                    className={`text-input ${formErrors.line1 ? 'has-error' : ''}`}
                    required
                  />
                  {formErrors.line1 && <span className="field-error">{formErrors.line1}</span>}
                </div>

                {/* City */}
                <div className="field-group">
                  <label htmlFor="city" className="field-label">
                    City <span className="req">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bhopal"
                    className={`text-input ${formErrors.city ? 'has-error' : ''}`}
                    required
                  />
                  {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                </div>

                {/* State */}
                <div className="field-group">
                  <label htmlFor="state" className="field-label">
                    State <span className="req">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="text-input"
                    required
                  />
                </div>

                {/* Postal Pincode */}
                <div className="field-group">
                  <label htmlFor="pincode" className="field-label">
                    Postal Pincode <span className="req">*</span>
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit Indian Pincode"
                    maxLength={6}
                    className={`text-input ${formErrors.pincode ? 'has-error' : ''}`}
                    required
                  />
                  {formErrors.pincode && <span className="field-error">{formErrors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="checkout-card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header-row">
                <div className="step-badge">2</div>
                <div>
                  <h3 className="card-title">Payment Method</h3>
                  <p className="card-subtitle">Choose your preferred transaction method</p>
                </div>
              </div>

              <div className="payment-options-stack">
                {/* Option 1: Razorpay Online Payment */}
                <label
                  className={`payment-choice-card ${paymentMethod === 'razorpay' ? 'is-selected' : ''}`}
                >
                  <div className="payment-choice-header">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                    <div className="payment-title-group">
                      <div className="payment-name-row">
                        <CreditCard size={18} className="gold-text" />
                        <strong>Razorpay Secure Online Payment</strong>
                        <span className="recommended-tag">RECOMMENDED</span>
                      </div>
                      <p className="payment-desc">
                        UPI (GPay, PhonePe, Paytm), Credit / Debit Card, Net Banking. Zero convenience fee.
                      </p>
                    </div>
                  </div>
                  <div className="payment-perk-badge">
                    <span>Instant dispatch confirmation • 256-bit SSL</span>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery (COD) */}
                <label
                  className={`payment-choice-card ${paymentMethod === 'cod' ? 'is-selected' : ''}`}
                >
                  <div className="payment-choice-header">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="payment-title-group">
                      <div className="payment-name-row">
                        <Banknote size={18} className="gold-text" />
                        <strong>Cash on Delivery (COD)</strong>
                      </div>
                      <p className="payment-desc">
                        Pay cash or UPI to courier agent upon doorstep delivery (+₹25 handling fee).
                      </p>
                    </div>
                  </div>
                  <div className="payment-perk-badge">
                    <span>Available across 27,000+ Indian pincodes</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Confirmation CTA */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <h3 className="summary-card-heading">Your Order</h3>

              {/* Items List Preview */}
              <div className="checkout-items-preview">
                {items.map((item) => (
                  <div key={item.productId} className="checkout-item-line">
                    <div className="checkout-item-info">
                      <img src={item.image} alt={item.name} className="checkout-thumb" />
                      <div>
                        <h4 className="checkout-item-name">{item.name}</h4>
                        <span className="checkout-item-qty">
                          Qty: {item.qty} {item.size && `• ${item.size}`}
                        </span>
                      </div>
                    </div>
                    <span className="checkout-item-price">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="checkout-pricing-table">
                <div className="price-line">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="price-line discount-line">
                    <span>Privilege Coupon ({appliedCoupon?.code})</span>
                    <span className="gold-text">- ₹{discount}</span>
                  </div>
                )}

                <div className="price-line">
                  <span>Doorstep Delivery</span>
                  <span>{shippingFee === 0 ? <strong className="gold-text">FREE</strong> : `₹${shippingFee}`}</span>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="price-line">
                    <span>COD Handling Fee</span>
                    <span>₹{codHandlingFee}</span>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="price-line grand-total-line">
                  <span>Grand Total</span>
                  <span className="grand-total-val">₹{finalTotal}</span>
                </div>

                <p className="inclusive-tax-note">All taxes inclusive (GST)</p>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-gold btn-lg btn-block place-order-btn"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles size={16} className="spinning" />
                    <span>Processing Secure Order...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>
                      {paymentMethod === 'cod'
                        ? `Confirm COD Order • ₹${finalTotal}`
                        : `Pay ₹${finalTotal} with Razorpay`}
                    </span>
                  </>
                )}
              </button>

              <div className="checkout-trust-footer">
                <div className="trust-row">
                  <ShieldCheck size={16} className="gold-text" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
                <div className="trust-row">
                  <Truck size={16} className="gold-text" />
                  <span>Double-boxed velvet delivery</span>
                </div>
                <div className="trust-row">
                  <Phone size={16} className="gold-text" />
                  <span>Patron Helpline: +91 92019 91418</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
