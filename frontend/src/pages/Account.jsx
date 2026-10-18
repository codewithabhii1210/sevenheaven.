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

  // Fetch orders when logged in
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
    }
  }, [isAuthenticated])

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
      <div className="container" style={{ padding: '3.5rem 0 5rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          {/* Tab 2: Profile Details */}
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
