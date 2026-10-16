import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useToast } from './ToastContext.jsx'
import { api } from '../services/api.js'

const CartContext = createContext()

const STORAGE_KEY = 'sevenheaven_cart'
const COUPON_STORAGE_KEY = 'sevenheaven_applied_coupon'
const FREE_SHIPPING_THRESHOLD = 499
const STANDARD_SHIPPING_FEE = 49
const COD_FEE = 25

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem(COUPON_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const { showToast } = useToast()

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err)
    }
  }, [items])

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon))
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY)
      }
    } catch (err) {
      console.error('Failed to save coupon to localStorage:', err)
    }
  }, [appliedCoupon])

  // Subtotal & Counts
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
  }, [items])

  const itemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.qty) || 1), 0)
  }, [items])

  // Discount calculation based on applied coupon
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0

    // Coupon could be for a specific product
    if (appliedCoupon.appliesTo && appliedCoupon.appliesTo !== 'sitewide') {
      const targetItem = items.find((i) => i.productId === appliedCoupon.appliesTo)
      if (!targetItem) return 0
      const targetTotal = targetItem.price * targetItem.qty
      if (appliedCoupon.type === 'percent') {
        const val = Math.round((targetTotal * appliedCoupon.value) / 100)
        return appliedCoupon.maxDiscount ? Math.min(val, appliedCoupon.maxDiscount) : val
      }
      return Math.min(targetTotal, appliedCoupon.value)
    }

    // Sitewide coupon
    if (appliedCoupon.type === 'percent') {
      const val = Math.round((subtotal * appliedCoupon.value) / 100)
      return appliedCoupon.maxDiscount ? Math.min(val, appliedCoupon.maxDiscount) : val
    }
    if (appliedCoupon.type === 'flat') {
      return Math.min(subtotal, appliedCoupon.value)
    }
    return 0
  }, [appliedCoupon, items, subtotal])

  // Shipping logic: Free >= 499 or FREESHIP coupon, else 49
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const isFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD || appliedCoupon?.code === 'FREESHIP'
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal)

  const addItem = (product, qty = 1) => {
    const pId = product.id || product.productId
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === pId)
      if (idx > -1) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          qty: Math.min(20, updated[idx].qty + qty),
        }
        return updated
      }
      return [
        ...prev,
        {
          productId: pId,
          name: product.name,
          price: product.price,
          mrp: product.mrp || product.price,
          image: product.image,
          size: product.size || '',
          qty: Math.min(20, Math.max(1, qty)),
        },
      ]
    })
    showToast(`Added "${product.name}" to your Bag`, 'gold')
    setIsCartOpen(true)
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
    showToast('Item removed from your Bag', 'info')
  }

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    const safeQty = Math.min(20, Math.max(1, qty))
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: safeQty } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
  }

  const applyCouponCode = async (code) => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code', 'info')
      return false
    }
    try {
      const result = await api.validateCoupon(code.trim().toUpperCase(), subtotal)
      if (result && result.valid) {
        setAppliedCoupon({
          code: result.coupon.code,
          type: result.coupon.type,
          value: result.coupon.value,
          description: result.coupon.description,
          maxDiscount: result.coupon.maxDiscount,
          appliesTo: result.coupon.appliesTo,
        })
        showToast(`Coupon "${result.coupon.code}" applied! Saved ₹${result.discount}`, 'gold')
        return true
      }
      showToast(result.error || 'Invalid or expired coupon', 'info')
      return false
    } catch (err) {
      showToast(err.message || 'Failed to apply coupon', 'info')
      return false
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    showToast('Coupon removed', 'info')
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        subtotal,
        discount,
        shippingFee,
        codHandlingFee: COD_FEE,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        isFreeShipping,
        appliedCoupon,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        removeItem,
        updateQty,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
