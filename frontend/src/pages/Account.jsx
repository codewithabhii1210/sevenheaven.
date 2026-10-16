import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
} from 'lucide-react'

export default function Account() {
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated, isAdmin, login, register, logout, loading } = useAuth()
  const { showToast } = useToast()

  // Tabs for guest: 'login' | 'register'
  const [authTab, setAuthTab] = useState('login')

  // Tabs for logged in user: 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders')

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
              onClick={() => setActiveTab('orders')}
              className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package size={16} />
              <span>Order Archive ({orders.length})</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={16} />
              <span>Patron Profile</span>
            </button>
          </div>

          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="account-content-pane">
              {ordersLoading ? (
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
                            {new Date(ord.placedAt || ord.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="order-badges-group">
                          <span className={`status-pill status-${ord.status}`}>
                            {ord.status?.toUpperCase()}
                          </span>
                          <span className={`status-pill payment-${ord.paymentStatus}`}>
                            {ord.paymentStatus?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="order-items-preview-row">
                        {(ord.items || []).map((item, idx) => (
                          <div key={idx} className="order-item-thumb-box">
                            <img src={item.image} alt={item.name} />
                            <div className="order-item-thumb-info">
                              <span className="thumb-name">{item.name}</span>
                              <span className="thumb-qty">
                                Qty: {item.qty} • ₹{item.price * item.qty}
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
                            <strong>Delivery to:</strong> {ord.address?.city}, {ord.address?.pincode}
                          </span>
                        </div>
                        <div className="order-total-price">
                          <span>Total Paid:</span>
                          <strong>₹{ord.total}</strong>
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
        </div>
      </div>
    )
  }

  // ============================================================
  // GUEST LOGIN / REGISTER VIEW
  // ============================================================
  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">SEVEN HEAVEN CONCIERGE</span>
            <h1 className="auth-title">
              {authTab === 'login' ? 'Patron Sign In' : 'Join The VIP Circle'}
            </h1>
            <p className="auth-subtitle">
              {authTab === 'login'
                ? 'Access your private order history, tracking details, and saved wishlist.'
                : 'Register for private reserve access, 10% inaugural discount, and VIP concierge.'}
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
                New Patron (Register)
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
        </div>
      </div>
    </div>
  )
}
