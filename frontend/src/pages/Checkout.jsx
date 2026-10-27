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
  MapPin,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home as HomeIcon,
  Briefcase,
  X,
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

  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // ------------------------------------------------------------
  // SAVED ADDRESSES (Flipkart-Style Multi-Address Management)
  // ------------------------------------------------------------
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)

  // Address Form State (used for adding / editing addresses)
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: localStorage.getItem('sh7_pincode') || '',
    type: 'Home',
    isDefault: false,
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

  // Fetch saved addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api
        .getAddresses()
        .then((addrs) => {
          if (Array.isArray(addrs) && addrs.length > 0) {
            setSavedAddresses(addrs)
            // Pre-select default address or first address
            const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0]
            setSelectedAddressId(defaultAddr._id)
          } else if (user?.addresses && user.addresses.length > 0) {
            setSavedAddresses(user.addresses)
            const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0]
            setSelectedAddressId(defaultAddr._id)
          } else {
            setSavedAddresses([])
            setIsAddingNewAddress(true)
          }
        })
        .catch((err) => {
          console.warn('Failed to load saved addresses:', err.message)
        })
    }
  }, [isAuthenticated, user])

  // Selected address object for logged-in user
  const activeSelectedAddress = savedAddresses.find((a) => a._id === selectedAddressId) || null

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Address validation
  const validateAddressData = (data) => {
    const errors = {}
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Full customer name is required (min 2 characters)'
    }
    const cleanPhone = (data.phone || '').replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      errors.phone = 'Valid 10-digit Indian phone number is required'
    }
    if (data.email !== undefined && data.email && !data.email.includes('@')) {
      errors.email = 'Valid email address is required'
    }
    if (!data.line1 || data.line1.trim().length < 5) {
      errors.line1 = 'Detailed street address (house/flat no) is required'
    }
    if (!data.city || !data.city.trim()) {
      errors.city = 'City name is required'
    }
    if (!data.pincode || !/^[1-9][0-9]{5}$/.test(data.pincode.trim())) {
      errors.pincode = 'Valid 6-digit Indian postal pincode is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save New Address
  const handleSaveNewAddress = async (e) => {
    e.preventDefault()
    if (!validateAddressData(addressForm)) {
      showToast('Please fix address errors', 'info')
      return
    }

    try {
      const res = await api.addAddress(addressForm)
      if (res && res.addresses) {
        setSavedAddresses(res.addresses)
        const addedId = res.address?._id || res.addresses[res.addresses.length - 1]?._id
        setSelectedAddressId(addedId)
        setIsAddingNewAddress(false)
        showToast('New delivery address saved!', 'gold')
        // Reset form
        setAddressForm({
          name: user?.name || '',
          phone: user?.phone || '',
          line1: '',
          city: 'Bhopal',
          state: 'Madhya Pradesh',
          pincode: localStorage.getItem('sh7_pincode') || '',
          type: 'Home',
          isDefault: false,
        })
      }
    } catch (err) {
      showToast(err.message || 'Failed to save address', 'info')
    }
  }

  // Edit Existing Address Submit
  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    if (!validateAddressData(addressForm)) {
      showToast('Please fix address errors', 'info')
      return
    }

    try {
      const res = await api.updateAddress(editingAddressId, addressForm)
      if (res && res.addresses) {
        setSavedAddresses(res.addresses)
        setEditingAddressId(null)
        showToast('Address updated successfully!', 'gold')
      }
    } catch (err) {
      showToast(err.message || 'Failed to update address', 'info')
    }
  }

  // Delete Address
  const handleDeleteAddress = async (e, addressId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this delivery address?')) return

    try {
      const res = await api.deleteAddress(addressId)
      if (res && res.addresses) {
        setSavedAddresses(res.addresses)
        if (selectedAddressId === addressId) {
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0]
          setSelectedAddressId(defaultAddr?._id || null)
        }
        showToast('Address removed', 'info')
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete address', 'info')
    }
  }

  // Set Address as Default
  const handleSetDefaultAddress = async (e, addressId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await api.setDefaultAddress(addressId)
      if (res && res.addresses) {
        setSavedAddresses(res.addresses)
        setSelectedAddressId(addressId)
        showToast('Default address updated!', 'gold')
      }
    } catch (err) {
      showToast(err.message || 'Failed to set default address', 'info')
    }
  }

  // Start Editing an Address
  const startEditingAddress = (e, addr) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingAddressId(addr._id)
    setAddressForm({
      name: addr.name || '',
      phone: addr.phone || '',
      line1: addr.line1 || '',
      city: addr.city || 'Bhopal',
      state: addr.state || 'Madhya Pradesh',
      pincode: addr.pincode || '',
      type: addr.type || 'Home',
      isDefault: !!addr.isDefault,
    })
    setFormErrors({})
  }

  // ------------------------------------------------------------
  // PLACE ORDER HANDLER (Robust, Duplicate-Proof, Never Stuck)
  // ------------------------------------------------------------
  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    // 1. Gather delivery address (login is mandatory — see login wall above)
    let orderAddress // both branches below assign it (or return early)
    if (savedAddresses.length > 0 && !isAddingNewAddress && !editingAddressId) {
      if (!activeSelectedAddress) {
        showToast('Please select a delivery address', 'info')
        return
      }
      orderAddress = {
        name: activeSelectedAddress.name.trim(),
        phone: activeSelectedAddress.phone.replace(/\D/g, ''),
        email: user?.email || '',
        line1: activeSelectedAddress.line1.trim(),
        city: activeSelectedAddress.city.trim(),
        state: activeSelectedAddress.state.trim(),
        pincode: activeSelectedAddress.pincode.trim(),
      }
    } else {
      // Validate the add/edit address form directly
      if (!validateAddressData(addressForm)) {
        showToast('Please complete all required shipping address fields', 'info')
        return
      }
      orderAddress = {
        name: addressForm.name.trim(),
        phone: addressForm.phone.replace(/\D/g, ''),
        email: user?.email || '',
        line1: addressForm.line1.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
      }
      // Silently save to user's saved addresses in backend
      try {
        if (!editingAddressId) {
          api.addAddress(addressForm).then((res) => {
            if (res && res.addresses) setSavedAddresses(res.addresses)
          }).catch(() => {})
        }
      } catch {
        // non-blocking
      }
    }

    setIsSubmitting(true)

    try {
      // 2. Prepare Order Payload
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
        })),
        address: orderAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
      }

      // 3. Create Order in Backend API
      const orderRes = await api.createOrder(orderPayload)
      if (!orderRes || !orderRes.orderNo) {
        throw new Error(orderRes?.error || 'Failed to initiate order')
      }

      const orderNo = orderRes.orderNo

      // 4. Handle Cash on Delivery (COD)
      if (paymentMethod === 'cod') {
        clearCart()
        setConfirmedOrder(orderRes.order)
        showToast(`Order ${orderNo} placed successfully via Cash on Delivery!`, 'gold')
        setIsSubmitting(false)
        return
      }

      // 5. Handle Razorpay Online Payment
      if (paymentMethod === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          throw new Error('Razorpay payment gateway failed to load. Please use Cash on Delivery.')
        }

        const rzpOrderData = await api.createRazorpayOrder(orderNo)
        if (!rzpOrderData || !rzpOrderData.razorpayOrderId) {
          throw new Error(rzpOrderData?.error || 'Failed to initiate Razorpay transaction')
        }

        // Key must come from the backend — never fall back to a hardcoded key
        if (!rzpOrderData.keyId) {
          throw new Error('Payment gateway is not configured. Please try Cash on Delivery.')
        }

        const options = {
          key: rzpOrderData.keyId,
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency || 'INR',
          name: 'Seven Heaven Cosmetics',
          description: `Order ${orderNo} — Luxury Beauty & Cosmetics`,
          image: '/images/logo-seven-heaven.png',
          order_id: rzpOrderData.razorpayOrderId,
          prefill: {
            name: orderAddress.name,
            email: orderAddress.email,
            contact: orderAddress.phone,
          },
          theme: {
            color: '#D4AF37', // Gold branding
          },
          handler: async (response) => {
            try {
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

        try {
          const rzp = new window.Razorpay(options)
          rzp.on('payment.failed', (failResponse) => {
            setIsSubmitting(false)
            showToast(`Payment failed: ${failResponse.error?.description || 'Payment rejected'}`, 'info')
            // Tell the server so reserved stock is released (idempotent, non-blocking)
            api.reportRazorpayFailure(orderNo).catch(() => {
              // Webhook remains the safety net if this report never lands
            })
          })
          rzp.open()
        } catch (openErr) {
          console.error('Razorpay open error:', openErr)
          setIsSubmitting(false)
          showToast('Failed to open payment gateway. Please choose Cash on Delivery.', 'info')
        }
      }
    } catch (err) {
      console.error('Checkout Error:', err)
      showToast(err.message || 'Failed to place order. Please try again.', 'info')
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
              Placed on{' '}
              {new Date(confirmedOrder.placedAt || confirmedOrder.createdAt).toLocaleDateString('en-IN', {
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
                {confirmedOrder.address?.city}, {confirmedOrder.address?.state} –{' '}
                {confirmedOrder.address?.pincode}
              </p>
              <p className="detail-phone">📞 +91 {confirmedOrder.address?.phone}</p>
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
            <Link to={`/order/${confirmedOrder.orderNo}`} className="btn btn-gold-outline btn-lg">
              Inspect Live Order Details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // LOGIN WALL (Flipkart-style: checkout requires an account)
  // Guest browsing & cart stay open — only placing the order needs login.
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="container checkout-container">
          <div className="checkout-header-block">
            <div className="checkout-lock-badge">
              <Lock size={14} className="gold-text" />
              <span>256-BIT ENCRYPTED LUXURY CHECKOUT</span>
            </div>
            <h1 className="checkout-heading">Complete Your Order</h1>
          </div>

          <div className="checkout-card checkout-login-wall">
            <div className="checkout-login-icon">
              <Lock size={40} className="gold-text" />
            </div>
            <h2 className="checkout-login-title">Login Required to Place Your Order</h2>
            <p className="checkout-login-sub">
              For a secure checkout and effortless order tracking, please sign in or
              create a free account. Your cart is saved and waiting for you.
            </p>
            <div className="checkout-login-actions">
              <Link to="/my-account?tab=login&redirect=/checkout" className="btn btn-gold btn-lg">
                <span>Sign In to Continue</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/my-account?tab=register&redirect=/checkout" className="btn btn-gold-outline btn-lg">
                <span>Create Free Account</span>
              </Link>
            </div>
            <div className="checkout-login-trust">
              <ShieldCheck size={14} className="gold-text" />
              <span>Browsing &amp; cart stay open — login is only needed to place the order.</span>
            </div>
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
            {/* 1. Shipping Address Card (Flipkart-Style) */}
            <div className="checkout-card">
              <div className="card-header-row">
                <div className="step-badge">1</div>
                <div>
                  <h3 className="card-title">Delivery Address</h3>
                  <p className="card-subtitle">
                    Select from your saved addresses or add a new delivery destination
                  </p>
                </div>
              </div>

              {/* LOGGED IN: SAVED ADDRESSES SELECTOR */}
              {savedAddresses.length > 0 && !isAddingNewAddress && !editingAddressId && (
                <div className="saved-addresses-list">
                  {savedAddresses.map((addr) => {
                    const isSelected = addr._id === selectedAddressId
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`address-radio-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="address-card-top">
                          <div className="address-radio-wrap">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr._id)}
                            />
                            <strong className="address-recipient-name">{addr.name}</strong>
                            <span className="address-type-pill">
                              {addr.type === 'Work' ? <Briefcase size={11} /> : <HomeIcon size={11} />}
                              {addr.type || 'Home'}
                            </span>
                            {addr.isDefault && <span className="address-default-badge">DEFAULT</span>}
                          </div>

                          <div className="address-actions-row" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => startEditingAddress(e, addr)}
                              className="address-action-btn"
                              title="Edit Address"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(e, addr._id)}
                              className="address-action-btn delete"
                              title="Delete Address"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="address-card-body">
                          <p className="address-text-line">{addr.line1}</p>
                          <p className="address-text-line">
                            {addr.city}, {addr.state} – <strong>{addr.pincode}</strong>
                          </p>
                          <p className="address-phone-line">
                            📞 <strong>+91 {addr.phone}</strong>
                          </p>
                        </div>

                        <div className="address-deliver-here-row">
                          {isSelected ? (
                            <span className="deliver-here-badge">
                              <Check size={13} /> Deliver to this Address
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedAddressId(addr._id)}
                              className="btn btn-gold-outline btn-xs"
                            >
                              Deliver Here
                            </button>
                          )}
                          {!addr.isDefault && isSelected && (
                            <button
                              type="button"
                              onClick={(e) => handleSetDefaultAddress(e, addr._id)}
                              className="set-default-btn"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddress(true)
                      setEditingAddressId(null)
                    }}
                    className="btn btn-gold-outline btn-sm add-new-address-btn"
                  >
                    <Plus size={16} />
                    <span>Add a New Delivery Address</span>
                  </button>
                </div>
              )}

              {/* LOGGED IN: ADD OR EDIT ADDRESS FORM */}
              {(isAddingNewAddress || editingAddressId) && (
                <div className="new-address-subform">
                  <div className="new-address-header">
                    <h4>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Destination'}</h4>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false)
                          setEditingAddressId(null)
                        }}
                        className="address-cancel-btn"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  <div className="form-fields-grid">
                    {/* Full Name */}
                    <div className="field-group full-width">
                      <label htmlFor="addr-name" className="field-label">
                        Full Name <span className="req">*</span>
                      </label>
                      <input
                        id="addr-name"
                        name="name"
                        type="text"
                        value={addressForm.name}
                        onChange={handleAddressFormChange}
                        placeholder="e.g. Devendra Sharma"
                        className={`text-input ${formErrors.name ? 'has-error' : ''}`}
                        required
                      />
                      {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                    </div>

                    {/* Mobile Phone */}
                    <div className="field-group">
                      <label htmlFor="addr-phone" className="field-label">
                        Mobile Phone (+91) <span className="req">*</span>
                      </label>
                      <input
                        id="addr-phone"
                        name="phone"
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setAddressForm((prev) => ({ ...prev, phone: val }))
                          if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }))
                        }}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={`text-input ${formErrors.phone ? 'has-error' : ''}`}
                        required
                      />
                      {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                    </div>

                    {/* Address Type */}
                    <div className="field-group">
                      <label className="field-label">Address Type</label>
                      <div className="address-type-toggle">
                        <label className={`type-choice ${addressForm.type === 'Home' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="type"
                            value="Home"
                            checked={addressForm.type === 'Home'}
                            onChange={handleAddressFormChange}
                          />
                          <HomeIcon size={13} />
                          <span>Home</span>
                        </label>
                        <label className={`type-choice ${addressForm.type === 'Work' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="type"
                            value="Work"
                            checked={addressForm.type === 'Work'}
                            onChange={handleAddressFormChange}
                          />
                          <Briefcase size={13} />
                          <span>Work</span>
                        </label>
                      </div>
                    </div>

                    {/* Street Address */}
                    <div className="field-group full-width">
                      <label htmlFor="addr-line1" className="field-label">
                        Street Address & House/Flat No. <span className="req">*</span>
                      </label>
                      <input
                        id="addr-line1"
                        name="line1"
                        type="text"
                        value={addressForm.line1}
                        onChange={handleAddressFormChange}
                        placeholder="e.g. 42 Arera Colony, Near Platinum Plaza"
                        className={`text-input ${formErrors.line1 ? 'has-error' : ''}`}
                        required
                      />
                      {formErrors.line1 && <span className="field-error">{formErrors.line1}</span>}
                    </div>

                    {/* City */}
                    <div className="field-group">
                      <label htmlFor="addr-city" className="field-label">
                        City <span className="req">*</span>
                      </label>
                      <input
                        id="addr-city"
                        name="city"
                        type="text"
                        value={addressForm.city}
                        onChange={handleAddressFormChange}
                        placeholder="e.g. Bhopal"
                        className={`text-input ${formErrors.city ? 'has-error' : ''}`}
                        required
                      />
                      {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                    </div>

                    {/* State */}
                    <div className="field-group">
                      <label htmlFor="addr-state" className="field-label">
                        State <span className="req">*</span>
                      </label>
                      <input
                        id="addr-state"
                        name="state"
                        type="text"
                        value={addressForm.state}
                        onChange={handleAddressFormChange}
                        className="text-input"
                        required
                      />
                    </div>

                    {/* Pincode */}
                    <div className="field-group full-width">
                      <label htmlFor="addr-pincode" className="field-label">
                        Postal Pincode <span className="req">*</span>
                      </label>
                      <input
                        id="addr-pincode"
                        name="pincode"
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setAddressForm((prev) => ({ ...prev, pincode: val }))
                          if (formErrors.pincode) setFormErrors((prev) => ({ ...prev, pincode: '' }))
                        }}
                        placeholder="6-digit Indian Pincode"
                        maxLength={6}
                        className={`text-input ${formErrors.pincode ? 'has-error' : ''}`}
                        required
                      />
                      {formErrors.pincode && <span className="field-error">{formErrors.pincode}</span>}
                    </div>

                    {/* Default Checkbox */}
                    <div className="field-group full-width default-checkbox-row">
                      <label className="default-checkbox-label">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressFormChange}
                        />
                        <span>Make this my default delivery address</span>
                      </label>
                    </div>
                  </div>

                  <div className="address-form-actions">
                    <button
                      type="button"
                      onClick={editingAddressId ? handleUpdateAddress : handleSaveNewAddress}
                      className="btn btn-gold btn-sm"
                    >
                      <span>{editingAddressId ? 'Update Address' : 'Save & Deliver Here'}</span>
                      <Check size={14} />
                    </button>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false)
                          setEditingAddressId(null)
                        }}
                        className="btn btn-gold-outline btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

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

              {/* Delivery Destination Summary Preview */}
              <div className="checkout-delivery-target-preview">
                <MapPin size={14} className="gold-text" />
                <div className="target-text">
                  <span>Delivering to: </span>
                  <strong>
                    {activeSelectedAddress
                      ? `${activeSelectedAddress.name} (${activeSelectedAddress.city}, ${activeSelectedAddress.pincode})`
                      : addressForm.name
                      ? `${addressForm.name} (${addressForm.city || 'Bhopal'}, ${addressForm.pincode || ''})`
                      : 'Please specify address'}
                  </strong>
                </div>
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
