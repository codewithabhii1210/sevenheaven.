import { products as localProducts } from '../data/products.js'
import { findCoupon as localFindCoupon } from '../data/coupons.js'

const isBrowser = typeof window !== 'undefined'
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local'))

// In browser production/mobile, ALWAYS use relative path '' so requests go to current origin /api/...
// In local dev, relative path '' is proxied by Vite to the backend port.
const API_BASE = isBrowser
  ? ''
  : (typeof process !== 'undefined' && process?.env?.VITE_API_URL) || 'http://localhost:5000'

// Helper to get stored auth token
function getAuthHeader() {
  if (typeof localStorage === 'undefined') return {}
  const token = localStorage.getItem('sh7_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  }

  let res
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // for HttpOnly cookies
    })
  } catch (netErr) {
    console.error(`[API Network Error on ${url}]:`, netErr)
    throw new Error(
      netErr.message === 'Failed to fetch' || netErr.message === 'fetch failed'
        ? 'Unable to connect to order server. Please verify your internet or try again.'
        : netErr.message || 'Network request failed'
    )
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`
    throw new Error(errorMsg)
  }

  return data
}

export const api = {
  // ---------- PRODUCTS ----------
  async getProducts() {
    try {
      const data = await request('/api/products')
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data.products
      }
      return localProducts
    } catch (err) {
      console.warn('API getProducts fallback to local:', err.message)
      return localProducts
    }
  },

  async getProduct(idOrSlug) {
    try {
      const data = await request(`/api/products/${idOrSlug}`)
      if (data && data.product) return data.product
      return (
        localProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
      )
    } catch (err) {
      console.warn('API getProduct fallback to local:', err.message)
      return (
        localProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
      )
    }
  },

  // ---------- COUPONS ----------
  async validateCoupon(code, subtotal = 0, productId = null) {
    try {
      const params = new URLSearchParams({
        code,
        subtotal: String(subtotal),
      })
      if (productId) params.append('productId', productId)
      return await request(`/api/coupons/validate?${params.toString()}`)
    } catch (err) {
      // Local fallback calculation
      const c = localFindCoupon(code)
      if (!c) throw new Error('Invalid coupon code')
      let discount = 0
      if (c.type === 'percent') {
        discount = Math.round((subtotal * c.value) / 100)
        if (c.maxDiscount && discount > c.maxDiscount) discount = c.maxDiscount
      } else if (c.type === 'flat') {
        discount = Math.min(subtotal, c.value)
      }
      return {
        valid: true,
        coupon: { code: c.code, type: c.type, value: c.value, description: c.description },
        discount,
        total: Math.max(0, subtotal - discount),
      }
    }
  },

  // ---------- ORDERS ----------
  async createOrder(orderData) {
    return await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  },

  async getMyOrders() {
    return await request('/api/orders/my')
  },

  async getOrder(orderNo) {
    return await request(`/api/orders/${orderNo}`)
  },

  // ---------- RAZORPAY ----------
  async createRazorpayOrder(orderNo) {
    return await request('/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderNo }),
    })
  },

  async verifyRazorpay(payload) {
    return await request('/api/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async reportRazorpayFailure(orderNo) {
    return await request('/api/razorpay/payment-failed', {
      method: 'POST',
      body: JSON.stringify({ orderNo }),
    })
  },

  // ---------- AUTH ----------
  async login(email, password) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token) localStorage.setItem('sh7_token', data.token)
    if (data.user) localStorage.setItem('sh7_user', JSON.stringify(data.user))
    return data
  },

  async register(userData) {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    if (data.token) localStorage.setItem('sh7_token', data.token)
    if (data.user) localStorage.setItem('sh7_user', JSON.stringify(data.user))
    return data
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' })
    } finally {
      localStorage.removeItem('sh7_token')
      localStorage.removeItem('sh7_user')
    }
  },

  async getMe() {
    return await request('/api/auth/me')
  },

  // ---------- SAVED ADDRESSES (Flipkart-Style) ----------
  async getAddresses() {
    try {
      const data = await request('/api/auth/addresses')
      return data?.addresses || []
    } catch (err) {
      console.warn('getAddresses fallback to empty:', err.message)
      return []
    }
  },

  async addAddress(addressData) {
    return await request('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    })
  },

  async updateAddress(addressId, addressData) {
    return await request(`/api/auth/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    })
  },

  async deleteAddress(addressId) {
    return await request(`/api/auth/addresses/${addressId}`, {
      method: 'DELETE',
    })
  },

  async setDefaultAddress(addressId) {
    return await request(`/api/auth/addresses/${addressId}/default`, {
      method: 'PATCH',
    })
  },

  // ---------- CONTACT & NEWSLETTER ----------
  async sendContact(data) {
    return await request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async subscribeNewsletter(email) {
    return await request('/api/contact/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  // ---------- ADMIN ----------
  async getAdminStats() {
    return await request('/api/admin/stats')
  },

  async getAdminOrders(params = {}) {
    const q = new URLSearchParams(params).toString()
    return await request(`/api/admin/orders${q ? `?${q}` : ''}`)
  },

  async updateOrderStatus(id, status, paymentStatus) {
    return await request(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paymentStatus }),
    })
  },

  async getAdminMessages() {
    return await request('/api/admin/messages')
  },

  async getAdminNewsletter() {
    return await request('/api/admin/newsletter')
  },
}
