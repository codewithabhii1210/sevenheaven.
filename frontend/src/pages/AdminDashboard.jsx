import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../services/api.js'
import {
  ShieldAlert,
  Package,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('orders') // orders | messages | subscribers | stats
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      showToast('Access restricted: Administrator privileges required', 'info')
      navigate('/my-account')
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate, showToast])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes, messagesRes, subsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: {} })),
        api.getAdminOrders({ limit: 50 }).catch(() => ({ orders: [] })),
        api.getAdminMessages().catch(() => ({ messages: [] })),
        api.getAdminNewsletter().catch(() => ({ subscribers: [] })),
      ])
      setStats(statsRes.stats || {})
      setOrders(ordersRes.orders || [])
      setMessages(messagesRes.messages || [])
      setSubscribers(subsRes.subscribers || [])
    } catch (err) {
      console.error('Admin data fetch error:', err)
      showToast('Failed to load some admin telemetry data', 'info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  const handleUpdateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
    setUpdatingId(orderId)
    try {
      await api.updateOrderStatus(orderId, newStatus, newPaymentStatus)
      showToast(`Order status updated to ${newStatus?.toUpperCase() || 'updated'}`, 'gold')
      // Update local state
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId
            ? {
                ...ord,
                ...(newStatus ? { status: newStatus } : {}),
                ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}),
              }
            : ord
        )
      )
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'info')
    } finally {
      setUpdatingId(null)
    }
  }

  if (authLoading || (!isAdmin && isAuthenticated)) {
    return (
      <div className="admin-loading-screen">
        <Sparkles size={36} className="gold-text spinning" />
        <p>Verifying administrative credentials...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        {/* Admin Header Banner */}
        <div className="admin-header-row">
          <div>
            <div className="admin-security-tag">
              <ShieldAlert size={14} className="gold-text" />
              <span>CONFIDENTIAL CONTROL SYSTEM</span>
            </div>
            <h1 className="admin-title">Seven Heaven Command Center</h1>
            <p className="admin-sub">
              Logged in as Master Administrator ({user?.email})
            </p>
          </div>

          <button onClick={fetchData} className="btn btn-gold-outline btn-sm refresh-btn">
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>

        {/* 4 Key Metric Metric Cards */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap">
              <TrendingUp size={20} className="gold-text" />
            </div>
            <div>
              <span className="metric-label">Paid Net Revenue</span>
              <strong className="metric-number">₹{stats?.totalRevenue || 0}</strong>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Package size={20} className="gold-text" />
            </div>
            <div>
              <span className="metric-label">Total Orders Placed</span>
              <strong className="metric-number">{stats?.totalOrders || orders.length}</strong>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Clock size={20} className="gold-text" />
            </div>
            <div>
              <span className="metric-label">Pending / Packed Orders</span>
              <strong className="metric-number">{stats?.pendingOrders || 0}</strong>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Mail size={20} className="gold-text" />
            </div>
            <div>
              <span className="metric-label">VIP Subscribers</span>
              <strong className="metric-number">{subscribers.length || stats?.subscribersCount || 0}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs-row" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <Package size={16} />
            <span>Orders Management ({orders.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
            className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          >
            <MessageSquare size={16} />
            <span>Customer Inquiries ({messages.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'subscribers'}
            onClick={() => setActiveTab('subscribers')}
            className={`admin-tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
          >
            <Mail size={16} />
            <span>VIP Email Subscribers ({subscribers.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div className="admin-content-pane">
            <div className="admin-pane-header">
              <h3>Live Orders Pipeline</h3>
              <span className="orders-count-text">Displaying {orders.length} transactions</span>
            </div>

            {loading ? (
              <div className="admin-loading-state">
                <Sparkles size={24} className="gold-text spinning" />
                <p>Loading transactions...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="admin-empty-state">
                <p>No customer orders in database yet.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Patron & Destination</th>
                      <th>Creations</th>
                      <th>Total</th>
                      <th>Method</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <strong className="table-order-no">{ord.orderNo}</strong>
                          <span className="table-date">
                            {new Date(ord.placedAt || ord.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>
                        <td>
                          <strong>{ord.address?.name}</strong>
                          <span className="table-subtext">
                            {ord.address?.city}, {ord.address?.pincode}
                          </span>
                          <span className="table-subtext">📞 {ord.address?.phone}</span>
                        </td>
                        <td>
                          <div className="table-items-preview">
                            {(ord.items || []).map((item, idx) => (
                              <span key={idx} className="table-item-chip">
                                {item.name} × {item.qty}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong className="table-amount">₹{ord.total}</strong>
                        </td>
                        <td>
                          <span className="method-tag">
                            {ord.paymentMethod?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord._id, null, e.target.value)
                            }
                            className={`status-select payment-${ord.paymentStatus}`}
                            disabled={updatingId === ord._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord._id, e.target.value, null)
                            }
                            className={`status-select status-${ord.status}`}
                            disabled={updatingId === ord._id}
                          >
                            <option value="placed">Placed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(
                                ord._id,
                                ord.status === 'placed'
                                  ? 'packed'
                                  : ord.status === 'packed'
                                  ? 'shipped'
                                  : 'delivered',
                                ord.paymentMethod === 'cod' && ord.status === 'shipped' ? 'paid' : null
                              )
                            }
                            className="btn btn-gold-outline btn-xs"
                            disabled={updatingId === ord._id || ord.status === 'delivered'}
                          >
                            {ord.status === 'placed'
                              ? 'Mark Packed →'
                              : ord.status === 'packed'
                              ? 'Mark Shipped →'
                              : ord.status === 'shipped'
                              ? 'Mark Delivered ✓'
                              : 'Completed'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="admin-content-pane">
            <div className="admin-pane-header">
              <h3>Customer Inquiry Submissions</h3>
              <span className="orders-count-text">{messages.length} messages received</span>
            </div>

            {messages.length === 0 ? (
              <div className="admin-empty-state">
                <p>No customer messages in the inbox.</p>
              </div>
            ) : (
              <div className="messages-grid">
                {messages.map((msg) => (
                  <div key={msg._id} className="admin-message-card">
                    <div className="message-header-row">
                      <div>
                        <strong className="message-sender">{msg.name}</strong>
                        <span className="message-email"> &lt;{msg.email}&gt;</span>
                      </div>
                      <span className="message-date">
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="message-subject-pill">{msg.subject}</span>
                    <p className="message-body-text">{msg.message}</p>
                    <div className="message-actions-row">
                      <a href={`mailto:${msg.email}?subject=Seven Heaven Reply: ${encodeURIComponent(msg.subject)}`} className="btn btn-gold-outline btn-xs">
                        Reply via Email →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VIP SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="admin-content-pane">
            <div className="admin-pane-header">
              <h3>VIP Circle Email Roster</h3>
              <span className="orders-count-text">{subscribers.length} total subscribers</span>
            </div>

            {subscribers.length === 0 ? (
              <div className="admin-empty-state">
                <p>No subscribers logged yet.</p>
              </div>
            ) : (
              <div className="subscribers-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email Address</th>
                      <th>Acquired Via</th>
                      <th>Subscription Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub, idx) => (
                      <tr key={sub._id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{sub.email}</strong>
                        </td>
                        <td>
                          <span className="method-tag">{sub.source || 'footer'}</span>
                        </td>
                        <td>
                          {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
