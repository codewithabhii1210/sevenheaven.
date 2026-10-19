import { useState, useEffect } from 'react'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../services/api.js'
import {
  User,
  Package,
  LogOut,
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  MapPin,
  CreditCard,
  ChevronRight,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home as HomeIcon,
  Briefcase,
} from 'lucide-react'

export default function Account() {
  const [searchParams] = useSearchParams()
  const { orderNo: routeOrderNo } = useParams()
  const { user, isAuthenticated, isAdmin, login, register, logout, loading } = useAuth()
  const { showToast } = useToast()

  // Tabs for guest: 'login' | 'register' | 'track'
  const [authTab, setAuthTab] = useState(routeOrderNo ? 'track' : 'login')

  // Tabs for logged in user: 'orders' | 'profile' | 'track'
  const [activeTab, setActiveTab] = useState(
    routeOrderNo ? 'track' : searchParams.get('tab') || 'orders'
  )

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

  // Orders list
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Address management state (Flipkart-Style Multi-Address)
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '',
    type: 'Home',
    isDefault: false,
  })
  const [addressErrors, setAddressErrors] = useState({})

  // Order Details Modal / View
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Order Lookup / Tracking
  const [trackInput, setTrackInput] = useState(routeOrderNo || '')
  const [trackedOrder, setTrackedOrder] = useState(null)
  const [trackLoading, setTrackLoading] = useState(false)

  const handleLookupOrder = async (queryNo) => {
    const no = (queryNo || trackInput || '').trim()
    if (!no) {
      showToast('Please enter an order number (e.g. SH-261017-7484)', 'info')
      return
    }
    setTrackLoading(true)
    try {
      const res = await api.getOrder(no)
      if (res && res.order) {
        setTrackedOrder(res.order)
        showToast(`Order ${no} retrieved successfully`, 'gold')
      } else {
        setTrackedOrder(null)
        showToast(`No order found matching "${no}"`, 'info')
      }
    } catch (err) {
      setTrackedOrder(null)
      showToast(err.message || 'Order lookup failed', 'info')
    } finally {
      setTrackLoading(false)
    }
  }

  // If route has orderNo, automatically look up that order
  useEffect(() => {
    if (routeOrderNo) {
      setTrackInput(routeOrderNo)
      handleLookupOrder(routeOrderNo)
    }
  }, [routeOrderNo])

  // Fetch orders and addresses when logged in
  useEffect(() => {
    if (isAuthenticated) {
      setOrdersLoading(true)
      api
        .getMyOrders()
        .then((res) => {
          setOrders(res.orders || [])
        })
        .catch((err) => {
          console.warn('Orders fetch error:', err.message)
        })
        .finally(() => {
          setOrdersLoading(false)
        })

      setAddressesLoading(true)
      api
        .getAddresses()
        .then((addrs) => {
          if (Array.isArray(addrs)) {
            setAddresses(addrs)
          } else if (user?.addresses) {
            setAddresses(user.addresses)
          }
        })
        .catch((err) => {
          console.warn('Addresses fetch error:', err.message)
        })
        .finally(() => {
          setAddressesLoading(false)
        })
    }
  }, [isAuthenticated, user])

  // Address validation helper
  const validateAddressData = (data) => {
    const errors = {}
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Full customer name is required (min 2 characters)'
    }
    const cleanPhone = (data.phone || '').replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      errors.phone = 'Valid 10-digit Indian mobile number is required'
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
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Address CRUD Handlers
  const handleSaveAddress = async (e) => {
    e.preventDefault()
    if (!validateAddressData(addressForm)) {
      showToast('Please fix address errors', 'info')
      return
    }

    try {
      if (editingAddressId) {
        const res = await api.updateAddress(editingAddressId, addressForm)
        if (res && res.addresses) {
          setAddresses(res.addresses)
          setEditingAddressId(null)
          showToast('Address updated successfully!', 'gold')
        }
      } else {
        const res = await api.addAddress(addressForm)
        if (res && res.addresses) {
          setAddresses(res.addresses)
          setIsAddingAddress(false)
          showToast('New delivery address saved!', 'gold')
        }
      }
      setAddressForm({
        name: user?.name || '',
        phone: user?.phone || '',
        line1: '',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '',
        type: 'Home',
        isDefault: false,
      })
    } catch (err) {
      showToast(err.message || 'Failed to save address', 'info')
    }
  }

  const handleDeleteAddress = async (e, addressId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return
    try {
      const res = await api.deleteAddress(addressId)
      if (res && res.addresses) {
        setAddresses(res.addresses)
        showToast('Address removed', 'info')
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete address', 'info')
    }
  }

  const handleSetDefaultAddress = async (e, addressId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await api.setDefaultAddress(addressId)
      if (res && res.addresses) {
        setAddresses(res.addresses)
        showToast('Default address set!', 'gold')
      }
    } catch (err) {
      showToast(err.message || 'Failed to set default address', 'info')
    }
  }

  const startEditAddress = (addr) => {
    setEditingAddressId(addr._id)
    setIsAddingAddress(false)
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
    setAddressErrors({})
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both email and password', 'info')
      return
    }
    try {
      await login(loginEmail.trim(), loginPassword)
    } catch {
      // Error handled inside AuthContext
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!regName.trim() || regName.trim().length < 2) {
      showToast('Please enter your full name', 'info')
      return
    }
    if (!regEmail || !regEmail.includes('@')) {
      showToast('Please enter a valid email address', 'info')
      return
    }
    if (regPassword.length < 8) {
      showToast('Password must be at least 8 characters with letters & numbers', 'info')
      return
    }
    if (regPassword !== regPasswordConfirm) {
      showToast('Passwords do not match', 'info')
      return
    }

    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      })
    } catch {
      // Error handled inside AuthContext
    }
  }

  // Render Order Details Box (used in modal or tracking pane)
  const renderOrderDetailsCard = (ord, onClose = null) => {
    if (!ord) return null
    const stages = ['placed', 'packed', 'shipped', 'delivered']
    const currentStageIndex = Math.max(0, stages.indexOf(ord.status || 'placed'))

    return (
      <div className="order-details-modal-box">
        {onClose && (
          <button onClick={onClose} className="order-modal-close-btn" aria-label="Close details">
            <X size={20} />
          </button>
        )}

        <div className="order-modal-header">
          <div className="order-modal-tag">SEVEN HEAVEN ATELIER DISPATCH</div>
          <h2 className="order-modal-title">Order Details: {ord.orderNo}</h2>
          <span className="order-modal-date">
            Placed on{' '}
            {new Date(ord.placedAt || ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Visual 4-Step Tracker */}
        <div className="order-progress-stepper">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex
            const isCurrent = idx === currentStageIndex
            return (
              <div key={stage} className={`stepper-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="stepper-dot">
                  {isCompleted ? <CheckCircle2 size={14} /> : <span>{idx + 1}</span>}
                </div>
                <span className="stepper-label">{stage.toUpperCase()}</span>
              </div>
            )
          })}
        </div>

        {/* 2-Column Summary Grid */}
        <div className="order-modal-grid">
          {/* Column 1: Shipping Destination */}
          <div className="order-modal-card">
            <h4 className="card-subhead">
              <MapPin size={16} className="gold-text" />
              <span>Shipping Destination</span>
            </h4>
            <div className="card-info-lines">
              <p className="recipient-name"><strong>{ord.address?.name || 'Customer'}</strong></p>
              <p>{ord.address?.line1 || ''}</p>
              <p>
                {ord.address?.city || ''}, {ord.address?.state || ''} – {ord.address?.pincode || ''}
              </p>
              <p className="phone-line">📞 {ord.address?.phone || 'Not provided'}</p>
              {ord.address?.email && <p className="email-line">✉️ {ord.address?.email}</p>}
            </div>
          </div>

          {/* Column 2: Payment & Financials */}
          <div className="order-modal-card">
            <h4 className="card-subhead">
              <CreditCard size={16} className="gold-text" />
              <span>Payment & Financials</span>
            </h4>
            <div className="card-info-lines">
              <p>
                <strong>Method:</strong>{' '}
                {ord.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Online'}
              </p>
              <p>
                <strong>Payment Status:</strong>{' '}
                <span className={`status-pill payment-${ord.paymentStatus}`}>
                  {(ord.paymentStatus || 'pending').toUpperCase()}
                </span>
              </p>
              <p>
                <strong>Order Status:</strong>{' '}
                <span className={`status-pill status-${ord.status}`}>
                  {(ord.status || 'placed').toUpperCase()}
                </span>
              </p>
              <div className="order-price-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal:</span>
                  <span>₹{ord.subtotal || ord.total}</span>
                </div>
                {ord.discount > 0 && (
                  <div className="breakdown-row gold-text">
                    <span>Discount:</span>
                    <span>- ₹{ord.discount}</span>
                  </div>
                )}
                {ord.codFee > 0 && (
                  <div className="breakdown-row">
                    <span>COD Fee:</span>
                    <span>₹{ord.codFee}</span>
                  </div>
                )}
                <div className="breakdown-row total-row">
                  <span>Grand Total:</span>
                  <strong>₹{ord.total}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packaged Creations */}
        <div className="order-modal-items">
          <h4 className="items-title">Packaged Creations ({ord.items?.length || 0})</h4>
          <div className="items-table-list">
            {(ord.items || []).map((item, idx) => (
              <div key={idx} className="item-detail-row">
                <img src={item.image || '/images/hero-banner.jpg'} alt={item.name} className="item-thumb" />
                <div className="item-names">
                  <strong>{item.name}</strong>
                  <span>{item.size ? `Volume: ${item.size}` : 'Luxury Formulation'}</span>
                </div>
                <div className="item-pricing">
                  <span>Qty: {item.qty}</span>
                  <strong>₹{(Number(item.price) || 0) * (Number(item.qty) || 1)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Note */}
        <div className="order-modal-support">
          <Truck size={16} className="gold-text" />
          <span>Bhopal Concierge Helpline: +91 92019 91418 • sevenheavencosmetics@gmail.com</span>
        </div>
      </div>
    )
  }

  // ============================================================
  // STANDALONE ORDER DETAILS VIEW (/order/:orderNo)
  // ============================================================
  if (routeOrderNo) {
    return (
      <div className="container standalone-order-page">
        <div className="standalone-order-inner">
          <div className="standalone-order-top-nav">
            <Link to="/shop" className="btn btn-gold-outline btn-sm">
              ← Return to Catalog
            </Link>
            <Link to="/my-account" className="btn btn-gold-outline btn-sm">
              My Account
            </Link>
          </div>
          {trackLoading ? (
            <div className="orders-loading" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <Sparkles size={32} className="gold-text spinning" />
              <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                Retrieving live details for Order {routeOrderNo}...
              </p>
            </div>
          ) : trackedOrder ? (
            renderOrderDetailsCard(trackedOrder)
          ) : (
            <div className="orders-empty-card">
              <AlertCircle size={44} className="gold-text" />
              <h3>Order Not Found</h3>
              <p>We could not find an order matching &ldquo;{routeOrderNo}&rdquo;.</p>
              <Link to="/shop" className="btn btn-gold btn-sm">
                Explore Catalog
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // LOGGED IN PATRON VIEW
  // ============================================================
  if (isAuthenticated && user) {
    return (
      <div className="account-page">
        <div className="container">
          {/* Patron Header Banner */}
          <div className="account-welcome-banner">
            <div className="patron-avatar">
              <span>{user.name ? user.name[0].toUpperCase() : 'P'}</span>
            </div>
            <div className="patron-meta">
              <span className="patron-tier">
                {isAdmin ? '🛡️ MASTER ADMINISTRATOR' : '✦ SEVEN HEAVEN VIP PATRON'}
              </span>
              <h1 className="patron-name">{user.name}</h1>
              <p className="patron-contact">
                {user.email} {user.phone && `• +91 ${user.phone}`}
              </p>
            </div>
            <div className="patron-actions">
              {isAdmin && (
                <Link to="/admin" className="btn btn-gold btn-sm admin-cta-btn">
                  <ShieldAlert size={16} />
                  <span>Admin Control Panel</span>
                </Link>
              )}
              <button onClick={logout} className="btn btn-gold-outline btn-sm logout-btn">
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Account Sub-Navigation */}
          <div className="account-tabs-row" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'orders'}
              onClick={() => {
                setActiveTab('orders')
                setSelectedOrder(null)
              }}
              className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package size={16} />
              <span>Order Archive ({orders.length})</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'addresses'}
              onClick={() => {
                setActiveTab('addresses')
                setSelectedOrder(null)
              }}
              className={`account-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            >
              <MapPin size={16} />
              <span>Saved Addresses ({addresses.length})</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'profile'}
              onClick={() => {
                setActiveTab('profile')
                setSelectedOrder(null)
              }}
              className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={16} />
              <span>Patron Profile</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'track'}
              onClick={() => {
                setActiveTab('track')
                setSelectedOrder(null)
              }}
              className={`account-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
            >
              <Search size={16} />
              <span>Track Order / Look Up</span>
            </button>
          </div>

          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="account-content-pane">
              {selectedOrder ? (
                renderOrderDetailsCard(selectedOrder, () => setSelectedOrder(null))
              ) : ordersLoading ? (
                <div className="orders-loading">
                  <Sparkles size={28} className="gold-text spinning" />
                  <p>Retrieving your order archive...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="orders-empty-card">
                  <Package size={48} strokeWidth={1.2} className="gold-text" />
                  <h3>No Orders Placed Yet</h3>
                  <p>You have not acquired any Seven Heaven creations yet.</p>
                  <Link to="/shop" className="btn btn-gold btn-sm">
                    <span>Explore Catalog</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="orders-list-stack">
                  {orders.map((ord) => (
                    <div key={ord._id || ord.orderNo} className="order-history-card">
                      <div className="order-history-header">
                        <div>
                          <span className="order-no-title">{ord.orderNo}</span>
                          <span className="order-date-text">
                            Placed on{' '}
                            {new Date(ord.placedAt || ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="order-badges-group">
                          <span className={`status-pill status-${ord.status}`}>
                            {(ord.status || 'placed').toUpperCase()}
                          </span>
                          <span className={`status-pill payment-${ord.paymentStatus}`}>
                            {(ord.paymentStatus || 'pending').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="order-items-preview-row">
                        {(ord.items || []).map((item, idx) => (
                          <div key={idx} className="order-item-thumb-box">
                            <img src={item.image || '/images/hero-banner.jpg'} alt={item.name} />
                            <div className="order-item-thumb-info">
                              <span className="thumb-name">{item.name}</span>
                              <span className="thumb-qty">
                                Qty: {item.qty} • ₹{(Number(item.price) || 0) * (Number(item.qty) || 1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-history-footer">
                        <div className="order-footer-details">
                          <span>
                            <strong>Method:</strong> {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Delivery to:</strong> {ord.address?.city || ''}, {ord.address?.pincode || ''}
                          </span>
                        </div>
                        <div className="order-footer-actions">
                          <div className="order-total-price">
                            <span>Total:</span>
                            <strong>₹{ord.total}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="btn btn-gold-outline btn-xs view-order-btn"
                          >
                            <span>View Full Details</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Saved Addresses (Flipkart-Style Multi-Address Management) */}
          {activeTab === 'addresses' && (
            <div className="account-content-pane">
              {/* Header Action Bar */}
              <div className="addresses-pane-header">
                <div>
                  <h3 className="addresses-pane-title">Saved Delivery Addresses</h3>
                  <p className="addresses-pane-sub">
                    Manage your delivery destinations for rapid, one-click luxury checkout.
                  </p>
                </div>
                {!isAddingAddress && !editingAddressId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(true)
                      setEditingAddressId(null)
                      setAddressForm({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        line1: '',
                        city: 'Bhopal',
                        state: 'Madhya Pradesh',
                        pincode: '',
                        type: 'Home',
                        isDefault: addresses.length === 0,
                      })
                      setAddressErrors({})
                    }}
                    className="btn btn-gold btn-sm"
                  >
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Form Pane */}
              {(isAddingAddress || editingAddressId) && (
                <div className="account-address-form-card">
                  <div className="form-card-header">
                    <h4>{editingAddressId ? 'Edit Delivery Destination' : 'Add New Delivery Destination'}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAddress(false)
                        setEditingAddressId(null)
                      }}
                      className="address-cancel-btn"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress}>
                    <div className="form-fields-grid">
                      {/* Name */}
                      <div className="field-group full-width">
                        <label className="field-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, name: e.target.value })
                            if (addressErrors.name) setAddressErrors({ ...addressErrors, name: '' })
                          }}
                          placeholder="e.g. Devendra Sharma"
                          className={`text-input ${addressErrors.name ? 'has-error' : ''}`}
                          required
                        />
                        {addressErrors.name && <span className="field-error">{addressErrors.name}</span>}
                      </div>

                      {/* Phone */}
                      <div className="field-group">
                        <label className="field-label">
                          Mobile Phone (+91) <span className="req">*</span>
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setAddressForm({ ...addressForm, phone: val })
                            if (addressErrors.phone) setAddressErrors({ ...addressErrors, phone: '' })
                          }}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className={`text-input ${addressErrors.phone ? 'has-error' : ''}`}
                          required
                        />
                        {addressErrors.phone && <span className="field-error">{addressErrors.phone}</span>}
                      </div>

                      {/* Type */}
                      <div className="field-group">
                        <label className="field-label">Address Type</label>
                        <div className="address-type-toggle">
                          <label className={`type-choice ${addressForm.type === 'Home' ? 'active' : ''}`}>
                            <input
                              type="radio"
                              name="accAddressType"
                              value="Home"
                              checked={addressForm.type === 'Home'}
                              onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                            />
                            <HomeIcon size={13} />
                            <span>Home</span>
                          </label>
                          <label className={`type-choice ${addressForm.type === 'Work' ? 'active' : ''}`}>
                            <input
                              type="radio"
                              name="accAddressType"
                              value="Work"
                              checked={addressForm.type === 'Work'}
                              onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                            />
                            <Briefcase size={13} />
                            <span>Work</span>
                          </label>
                        </div>
                      </div>

                      {/* Line 1 */}
                      <div className="field-group full-width">
                        <label className="field-label">
                          Street Address & House/Flat No. <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.line1}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, line1: e.target.value })
                            if (addressErrors.line1) setAddressErrors({ ...addressErrors, line1: '' })
                          }}
                          placeholder="e.g. 42 Arera Colony, Near Platinum Plaza"
                          className={`text-input ${addressErrors.line1 ? 'has-error' : ''}`}
                          required
                        />
                        {addressErrors.line1 && <span className="field-error">{addressErrors.line1}</span>}
                      </div>

                      {/* City */}
                      <div className="field-group">
                        <label className="field-label">
                          City <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, city: e.target.value })
                            if (addressErrors.city) setAddressErrors({ ...addressErrors, city: '' })
                          }}
                          placeholder="e.g. Bhopal"
                          className={`text-input ${addressErrors.city ? 'has-error' : ''}`}
                          required
                        />
                        {addressErrors.city && <span className="field-error">{addressErrors.city}</span>}
                      </div>

                      {/* State */}
                      <div className="field-group">
                        <label className="field-label">
                          State <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="text-input"
                          required
                        />
                      </div>

                      {/* Pincode */}
                      <div className="field-group full-width">
                        <label className="field-label">
                          Postal Pincode <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setAddressForm({ ...addressForm, pincode: val })
                            if (addressErrors.pincode) setAddressErrors({ ...addressErrors, pincode: '' })
                          }}
                          placeholder="6-digit Indian Pincode"
                          maxLength={6}
                          className={`text-input ${addressErrors.pincode ? 'has-error' : ''}`}
                          required
                        />
                        {addressErrors.pincode && <span className="field-error">{addressErrors.pincode}</span>}
                      </div>

                      {/* Default checkbox */}
                      <div className="field-group full-width default-checkbox-row">
                        <label className="default-checkbox-label">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          />
                          <span>Set as default delivery address</span>
                        </label>
                      </div>
                    </div>

                    <div className="address-form-actions" style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-gold btn-sm">
                        <Check size={14} />
                        <span>{editingAddressId ? 'Update Address' : 'Save Address'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false)
                          setEditingAddressId(null)
                        }}
                        className="btn btn-gold-outline btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              {addressesLoading ? (
                <div className="orders-loading">
                  <Sparkles size={28} className="gold-text spinning" />
                  <p>Retrieving your saved addresses...</p>
                </div>
              ) : addresses.length === 0 && !isAddingAddress && !editingAddressId ? (
                <div className="orders-empty-card">
                  <MapPin size={48} strokeWidth={1.2} className="gold-text" />
                  <h3>No Saved Addresses</h3>
                  <p>Save your home and office addresses to enjoy frictionless checkout.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(true)
                      setAddressForm({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        line1: '',
                        city: 'Bhopal',
                        state: 'Madhya Pradesh',
                        pincode: '',
                        type: 'Home',
                        isDefault: true,
                      })
                    }}
                    className="btn btn-gold btn-sm"
                  >
                    <Plus size={14} />
                    <span>Add First Address</span>
                  </button>
                </div>
              ) : (
                <div className="account-addresses-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`account-address-card ${addr.isDefault ? 'is-default-card' : ''}`}
                    >
                      <div className="address-card-top">
                        <div className="address-meta-tags">
                          <strong className="address-recipient-name">{addr.name}</strong>
                          <span className="address-type-pill">
                            {addr.type === 'Work' ? <Briefcase size={11} /> : <HomeIcon size={11} />}
                            {addr.type || 'Home'}
                          </span>
                          {addr.isDefault && <span className="address-default-badge">DEFAULT</span>}
                        </div>

                        <div className="address-actions-row">
                          <button
                            type="button"
                            onClick={() => startEditAddress(addr)}
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

                      <div className="address-card-footer">
                        {addr.isDefault ? (
                          <span className="default-indicator-text">
                            <Check size={13} /> Primary Delivery Address
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleSetDefaultAddress(e, addr._id)}
                            className="btn btn-gold-outline btn-xs"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Profile Details */}
          {activeTab === 'profile' && (
            <div className="account-content-pane">
              <div className="profile-details-card">
                <h3 className="profile-card-title">Patron Details</h3>
                <div className="profile-info-grid">
                  <div className="info-cell">
                    <span className="cell-label">Full Name</span>
                    <span className="cell-val">{user.name}</span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Email Address</span>
                    <span className="cell-val">{user.email}</span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Phone Number</span>
                    <span className="cell-val">{user.phone ? `+91 ${user.phone}` : 'Not provided'}</span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Patron Privilege Tier</span>
                    <span className="cell-val gold-text">
                      {isAdmin ? 'Master Administrator' : 'VIP Circle Member'}
                    </span>
                  </div>
                </div>

                <div className="profile-notice-box">
                  <Sparkles size={16} className="gold-text" />
                  <p>
                    Your privacy is sacred to Seven Heaven. We strictly never sell your personal data or
                    share contact details with third-party advertisers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Order Tracking / Look Up */}
          {activeTab === 'track' && (
            <div className="account-content-pane">
              <div className="order-track-box">
                <h3 className="track-title">Live Dispatch Tracking</h3>
                <p className="track-desc">Enter any Seven Heaven Order # to inspect delivery timeline & address.</p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleLookupOrder()
                  }}
                  className="track-input-form"
                >
                  <input
                    type="text"
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    placeholder="e.g. SH-261017-7484"
                    className="text-input track-text-field"
                    required
                  />
                  <button type="submit" disabled={trackLoading} className="btn btn-gold btn-sm">
                    {trackLoading ? 'Searching...' : 'Track Order'}
                  </button>
                </form>

                {trackedOrder && (
                  <div style={{ marginTop: '1.5rem' }}>
                    {renderOrderDetailsCard(trackedOrder)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // GUEST LOGIN / REGISTER / ORDER TRACKING VIEW
  // ============================================================
  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">SEVEN HEAVEN CONCIERGE</span>
            <h1 className="auth-title">
              {authTab === 'login'
                ? 'Patron Sign In'
                : authTab === 'register'
                ? 'Join The VIP Circle'
                : 'Track Order Details'}
            </h1>
            <p className="auth-subtitle">
              {authTab === 'login'
                ? 'Access your private order history, tracking details, and saved wishlist.'
                : authTab === 'register'
                ? 'Register for private reserve access, 10% inaugural discount, and VIP concierge.'
                : 'Inspect complete order details and live dispatch progress with your Order Number.'}
            </p>

            {/* Auth Tab Switcher */}
            <div className="auth-tab-switch">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`tab-btn ${authTab === 'login' ? 'active' : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`tab-btn ${authTab === 'register' ? 'active' : ''}`}
              >
                New Patron
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('track')}
                className={`tab-btn ${authTab === 'track' ? 'active' : ''}`}
              >
                Track Order
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="patron@example.com"
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold btn-block btn-lg"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Your Account'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="auth-hint-box">
                <Sparkles size={14} className="gold-text" />
                <span>
                  Admin Login: <code>sevenheavencosmetics@gmail.com</code> / <code>Sh7Admin#2026</code>
                </span>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {authTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vishal Verma"
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="patron@example.com"
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Mobile Number (+91)</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="text-input"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password (Min 8 Characters)</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Include letters and numbers"
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold btn-block btn-lg"
              >
                <span>{loading ? 'Registering VIP...' : 'Create VIP Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* GUEST ORDER TRACKING / LOOKUP */}
          {authTab === 'track' && (
            <div className="auth-form guest-track-form">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleLookupOrder()
                }}
              >
                <div className="field-group">
                  <label className="field-label">Enter Seven Heaven Order Number</label>
                  <div className="input-with-icon">
                    <Search size={16} className="input-icon" />
                    <input
                      type="text"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      placeholder="e.g. SH-261017-7484"
                      className="text-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="btn btn-gold btn-block btn-lg"
                >
                  <span>{trackLoading ? 'Searching Archive...' : 'Look Up Order Details'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {trackedOrder && (
                <div style={{ marginTop: '1.5rem' }}>
                  {renderOrderDetailsCard(trackedOrder)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
