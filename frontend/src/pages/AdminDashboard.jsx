import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../services/api.js'
import {
  ShieldAlert,
  Package,
  TrendingUp,
  MessageSquare,
  Mail,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Edit2,
  Power,
} from 'lucide-react'

const EMPTY_PRODUCT_FORM = {
  name: '',
  category: 'makeup',
  subcategory: '',
  size: '',
  price: '',
  mrp: '',
  stock: '',
  badge: '',
  featured: false,
  image: '',
  shortDesc: '',
  description: '',
  howToUse: '',
  benefits: '',
}

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('orders') // orders | products | messages | subscribers
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [messages, setMessages] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  // Product create/edit form state
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null) // null = creating
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM)
  const [productSaving, setProductSaving] = useState(false)

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
      const [statsRes, ordersRes, productsRes, messagesRes, subsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: {} })),
        api.getAdminOrders({ limit: 50 }).catch(() => ({ orders: [] })),
        api.getAdminProducts().catch(() => ({ products: [] })),
        api.getAdminMessages().catch(() => ({ messages: [] })),
        api.getAdminNewsletter().catch(() => ({ subscribers: [] })),
      ])
      setStats(statsRes.stats || {})
      setOrders(ordersRes.orders || [])
      setProducts(productsRes.products || [])
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

  // ---------- PRODUCT MANAGEMENT HANDLERS ----------
  const openNewProduct = () => {
    setEditingProduct(null)
    setProductForm(EMPTY_PRODUCT_FORM)
    setShowProductForm(true)
  }

  const openEditProduct = (p) => {
    setEditingProduct(p)
    setProductForm({
      name: p.name || '',
      category: p.category || 'makeup',
      subcategory: p.subcategory || '',
      size: p.size || '',
      price: p.price ?? '',
      mrp: p.mrp ?? '',
      stock: p.stock ?? '',
      badge: p.badge || '',
      featured: !!p.featured,
      image: p.image || '',
      shortDesc: p.shortDesc || '',
      description: p.description || '',
      howToUse: p.howToUse || '',
      benefits: Array.isArray(p.benefits) ? p.benefits.join(', ') : '',
    })
    setShowProductForm(true)
  }

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    if (!productForm.name.trim()) {
      showToast('Product name is required', 'info')
      return
    }
    if (productForm.price === '' || productForm.mrp === '') {
      showToast('Price and MRP are required', 'info')
      return
    }

    setProductSaving(true)
    try {
      const payload = {
        name: productForm.name.trim(),
        category: productForm.category,
        subcategory: productForm.subcategory.trim(),
        size: productForm.size.trim(),
        price: Number(productForm.price),
        mrp: Number(productForm.mrp),
        stock: Number(productForm.stock) || 0,
        badge: productForm.badge || undefined,
        featured: productForm.featured,
        image: productForm.image.trim(),
        shortDesc: productForm.shortDesc.trim(),
        description: productForm.description.trim(),
        howToUse: productForm.howToUse.trim(),
        benefits: productForm.benefits
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
      }

      if (editingProduct) {
        await api.updateAdminProduct(editingProduct._id, payload)
        showToast(`Product "${payload.name}" updated`, 'gold')
      } else {
        await api.createAdminProduct(payload)
        showToast(`Product "${payload.name}" added to catalog`, 'gold')
      }
      setShowProductForm(false)
      setEditingProduct(null)
      // Refresh product list
      const res = await api.getAdminProducts().catch(() => null)
      if (res?.products) setProducts(res.products)
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'info')
    } finally {
      setProductSaving(false)
    }
  }

  const handleToggleProduct = async (p) => {
    setUpdatingId(p._id)
    try {
      const res = await api.toggleAdminProduct(p._id)
      setProducts((prev) =>
        prev.map((prod) => (prod._id === p._id ? { ...prod, active: res.active } : prod))
      )
      showToast(
        res.active ? `"${p.name}" is now LIVE in store` : `"${p.name}" hidden from store`,
        'gold'
      )
    } catch (err) {
      showToast(err.message || 'Failed to toggle product status', 'info')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStockChange = async (p, newStock) => {
    const stock = Number(newStock)
    if (Number.isNaN(stock) || stock < 0) {
      showToast('Stock must be a number of 0 or more', 'info')
      return
    }
    setUpdatingId(p._id)
    try {
      await api.updateAdminProduct(p._id, { stock })
      setProducts((prev) => prev.map((prod) => (prod._id === p._id ? { ...prod, stock } : prod)))
      showToast(`Stock for "${p.name}" set to ${stock}`, 'gold')
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'info')
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
            aria-selected={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>Catalog Products ({products.length})</span>
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

        {/* TAB 3: CATALOG PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="admin-content-pane">
            <div className="admin-pane-header">
              <h3>Product Catalog</h3>
              <button onClick={openNewProduct} className="btn btn-gold btn-sm">
                <Plus size={15} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Inline Product Create / Edit Form */}
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="admin-product-form">
                <h4 className="product-form-title">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
                </h4>
                <div className="product-form-grid">
                  <label className="form-field">
                    <span>Product Name *</span>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      className="text-input"
                      maxLength={120}
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Category *</span>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      className="text-input"
                    >
                      <option value="makeup">Makeup</option>
                      <option value="skincare">Skincare</option>
                      <option value="fragrance">Fragrance</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Subcategory</span>
                    <input
                      type="text"
                      name="subcategory"
                      value={productForm.subcategory}
                      onChange={handleProductFormChange}
                      className="text-input"
                      maxLength={60}
                      placeholder="e.g. lipstick, primer, kajal"
                    />
                  </label>
                  <label className="form-field">
                    <span>Size / Volume</span>
                    <input
                      type="text"
                      name="size"
                      value={productForm.size}
                      onChange={handleProductFormChange}
                      className="text-input"
                      maxLength={40}
                      placeholder="e.g. 30 ml"
                    />
                  </label>
                  <label className="form-field">
                    <span>Sale Price (₹) *</span>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      className="text-input"
                      min="0"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>MRP (₹) *</span>
                    <input
                      type="number"
                      name="mrp"
                      value={productForm.mrp}
                      onChange={handleProductFormChange}
                      className="text-input"
                      min="0"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Stock Qty</span>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      className="text-input"
                      min="0"
                    />
                  </label>
                  <label className="form-field">
                    <span>Badge</span>
                    <select
                      name="badge"
                      value={productForm.badge}
                      onChange={handleProductFormChange}
                      className="text-input"
                    >
                      <option value="">None</option>
                      <option value="bestseller">Bestseller</option>
                      <option value="new">New</option>
                      <option value="sale">Sale</option>
                    </select>
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Image Path or URL</span>
                    <input
                      type="text"
                      name="image"
                      value={productForm.image}
                      onChange={handleProductFormChange}
                      className="text-input"
                      maxLength={500}
                      placeholder="/images/products/your-image.jpg"
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Short Description</span>
                    <input
                      type="text"
                      name="shortDesc"
                      value={productForm.shortDesc}
                      onChange={handleProductFormChange}
                      className="text-input"
                      maxLength={200}
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Description</span>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      className="text-input"
                      rows={3}
                      maxLength={2000}
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Key Benefits (comma separated)</span>
                    <input
                      type="text"
                      name="benefits"
                      value={productForm.benefits}
                      onChange={handleProductFormChange}
                      className="text-input"
                      maxLength={300}
                      placeholder="16HR Wear, Non-Drying, Cruelty-Free"
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>How to Use</span>
                    <textarea
                      name="howToUse"
                      value={productForm.howToUse}
                      onChange={handleProductFormChange}
                      className="text-input"
                      rows={2}
                      maxLength={1000}
                    />
                  </label>
                  <label className="form-field checkbox-field">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={productForm.featured}
                      onChange={handleProductFormChange}
                    />
                    <span>Featured on Homepage</span>
                  </label>
                </div>
                <div className="product-form-actions">
                  <button type="submit" className="btn btn-gold btn-sm" disabled={productSaving}>
                    {productSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false)
                      setEditingProduct(null)
                    }}
                    className="btn btn-gold-outline btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="admin-loading-state">
                <Sparkles size={24} className="gold-text spinning" />
                <p>Loading catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="admin-empty-state">
                <p>No products in the catalog yet. Click "Add New Product" to list one.</p>
              </div>
            ) : (
              <div className="orders-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price / MRP</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr key={p._id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="product-admin-cell">
                            <img
                              src={p.image || '/images/hero-banner.jpg'}
                              alt={p.name}
                              className="product-admin-thumb"
                            />
                            <div>
                              <strong>{p.name}</strong>
                              <span className="table-subtext">/{p.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="method-tag">{p.category}</span>
                        </td>
                        <td>
                          <strong className="table-amount">₹{p.price}</strong>
                          {p.mrp > p.price && (
                            <span className="table-subtext">MRP ₹{p.mrp}</span>
                          )}
                        </td>
                        <td>
                          <form
                            className="stock-update-form"
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleStockChange(p, e.target.elements.stock.value)
                            }}
                          >
                            <input
                              type="number"
                              name="stock"
                              defaultValue={p.stock}
                              min="0"
                              className="stock-input"
                              key={`${p._id}-${p.stock}`}
                            />
                            <button
                              type="submit"
                              className="btn btn-gold-outline btn-sm"
                              disabled={updatingId === p._id}
                            >
                              Save
                            </button>
                          </form>
                        </td>
                        <td>
                          <span className={`status-pill ${p.active ? 'status-placed' : 'status-cancelled'}`}>
                            {p.active ? 'LIVE' : 'HIDDEN'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="btn btn-gold-outline btn-sm"
                              title="Edit product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleProduct(p)}
                              className="btn btn-gold-outline btn-sm"
                              disabled={updatingId === p._id}
                              title={p.active ? 'Hide from store' : 'Publish to store'}
                            >
                              <Power size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VIP SUBSCRIBERS */}
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
