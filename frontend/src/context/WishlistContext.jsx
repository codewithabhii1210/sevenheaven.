import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext.jsx'

const WishlistContext = createContext()

const STORAGE_KEY = 'sevenheaven_wishlist'

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const { showToast } = useToast()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
    } catch (err) {
      console.error('Failed to save wishlist:', err)
    }
  }, [wishlist])

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId || item === productId)
  }

  const toggleWishlist = (product) => {
    const exists = isInWishlist(product.id)
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id && item !== product.id))
      showToast(`Removed "${product.name}" from your Wishlist`, 'info')
    } else {
      setWishlist((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          image: product.image,
          size: product.size,
          category: product.category,
        },
      ])
      showToast(`Saved "${product.name}" to your Wishlist ♡`, 'gold')
    }
  }

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId && item !== productId))
    showToast('Item removed from Wishlist', 'info')
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
