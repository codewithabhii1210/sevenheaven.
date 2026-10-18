import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar.jsx'
import Logo7H from './Logo7H.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Package,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { products } from '../data/products.js'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

  const { itemsCount, openCart } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { t, lang, toggleLanguage } = useLanguage()

  const navigate = useNavigate()
  const location = useLocation()
  const searchInputRef = useRef(null)
  const accountDropdownRef = useRef(null)

  // Track scroll for sticky glassmorphism header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
    setIsAccountDropdownOpen(false)
  }, [location.pathname])

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100)
    }
  }, [isSearchOpen])

  // Click outside to close account dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setIsAccountDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter products for search overlay
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subname?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      {/* Top Ticker Announcement */}
      <AnnouncementBar />

      {/* Main Luxury Header */}
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="mobile-menu-trigger"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="brand-logo-link" aria-label="Seven Heaven Cosmetics Home">
            <Logo7H size="default" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              {t('home')}
            </Link>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>
              {t('shop')}
            </Link>
            <Link
              to="/shop?category=fragrance"
              className={location.search.includes('fragrance') ? 'active' : ''}
            >
              {t('perfumes')}
            </Link>
            <Link
              to="/product/invisible-blur-primer"
              className="nav-link-primer"
            >
              <span className="gold-text">Primer</span>
              <span className="nav-tag-badge">Bestseller</span>
            </Link>
            <Link to="/about-us" className={location.pathname === '/about-us' ? 'active' : ''}>
              {t('about')}
            </Link>
            <Link to="/contact-us" className={location.pathname === '/contact-us' ? 'active' : ''}>
              {t('contact')}
            </Link>
          </nav>

          {/* Header Action Icons */}
          <div className="header-actions">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="action-icon-btn"
              title="Search products"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="action-icon-btn wishlist-icon-link"
              title={t('wishlist')}
              aria-label={t('wishlist')}
            >
              <Heart size={20} />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="action-icon-btn cart-icon-btn"
              title={t('cart')}
              aria-label={t('cart')}
            >
              <ShoppingBag size={20} />
              {itemsCount > 0 && <span className="action-badge">{itemsCount}</span>}
            </button>

            {/* Account Profile / Dropdown */}
            <div className="account-dropdown-wrap" ref={accountDropdownRef}>
              <Link
                to="/my-account"
                className={`action-icon-btn profile-nav-btn ${isAuthenticated ? 'user-logged-in' : ''}`}
                title={isAuthenticated ? `Account (${user?.name || 'Patron'})` : 'Sign In / Account'}
                aria-label="Account Menu"
                onClick={(e) => {
                  if (isAuthenticated) {
                    e.preventDefault()
                    setIsAccountDropdownOpen((prev) => !prev)
                  }
                }}
              >
                <User size={20} />
              </Link>

              {isAccountDropdownOpen && (
                <div className="account-dropdown-menu">
                  {isAuthenticated ? (
                    <>
                      <div className="dropdown-user-header">
                        <p className="dropdown-user-name">{user?.name || 'Valued Patron'}</p>
                        <p className="dropdown-user-email">{user?.email}</p>
                        {isAdmin && <span className="admin-status-pill">Administrator</span>}
                      </div>
                      <div className="dropdown-divider" />
                      <Link
                        to="/my-account"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="dropdown-link"
                      >
                        <User size={15} /> My Profile & Details
                      </Link>
                      <Link
                        to="/my-account?tab=orders"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="dropdown-link"
                      >
                        <Package size={15} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="dropdown-link admin-highlight"
                        >
                          <ShieldAlert size={15} className="gold-text" /> Admin Control Panel
                        </Link>
                      )}
                      <div className="dropdown-divider" />
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false)
                          logout()
                        }}
                        className="dropdown-link logout-btn"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropdown-auth-prompt">
                        <p className="auth-prompt-title">Seven Heaven VIP</p>
                        <p className="auth-prompt-desc">Access private orders, tracking & exclusive offers.</p>
                      </div>
                      <Link
                        to="/my-account"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="btn btn-gold btn-sm btn-block"
                      >
                        Login / Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      {isSearchOpen && (
        <div className="search-modal-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <form onSubmit={handleSearchSubmit} className="search-bar-form">
                <Search size={22} className="search-input-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search perfumes, primer, notes (oud, amber, rose)..."
                  className="search-input-field"
                  aria-label="Search catalog"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                  >
                    <X size={18} />
                  </button>
                )}
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="search-close-btn"
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>

            {/* Instant Search Results Preview */}
            <div className="search-results-area">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div className="search-results-grid">
                    <p className="search-results-count">
                      Found {searchResults.length} creations matching &ldquo;{searchQuery}&rdquo;
                    </p>
                    <div className="results-list">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug || product.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="search-result-card"
                        >
                          <img src={product.image} alt={product.name} />
                          <div className="result-info">
                            <span className="result-category">{product.category}</span>
                            <h4 className="result-title">{product.name}</h4>
                            <span className="result-price">₹{product.price}</span>
                          </div>
                          <ArrowRight size={16} className="result-arrow" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="search-no-results">
                    <p>No products found for &ldquo;{searchQuery}&rdquo;</p>
                    <span className="search-suggestion">
                      Try searching &ldquo;primer&rdquo;, &ldquo;oud&rdquo;, &ldquo;noir&rdquo;, or &ldquo;amber&rdquo;
                    </span>
                  </div>
                )
              ) : (
                <div className="search-quick-tags">
                  <span className="quick-tag-label">Popular Searches:</span>
                  <div className="tags-row">
                    <button
                      type="button"
                      onClick={() => setSearchQuery('primer')}
                      className="tag-btn"
                    >
                      Invisible Blur Primer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('oud')}
                      className="tag-btn"
                    >
                      Golden Oud
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('noir')}
                      className="tag-btn"
                    >
                      Noir Essence
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('lunar')}
                      className="tag-btn"
                    >
                      Lunar Nights
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-in Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-top">
              <Logo7H size="small" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-drawer-close"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-drawer-nav">
              <Link to="/">{t('home')}</Link>
              <Link to="/shop">{t('shop')}</Link>
              <Link to="/shop?category=fragrance">{t('perfumes')}</Link>
              <Link to="/product/invisible-blur-primer" className="mobile-primer-link">
                <span>Invisible Blur Primer</span>
                <span className="badge badge-bestseller">Top Seller</span>
              </Link>
              <Link to="/about-us">{t('about')}</Link>
              <Link to="/contact-us">{t('contact')}</Link>
              <Link to="/wishlist">
                {t('wishlist')} {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link to="/my-account">{t('account')}</Link>
              {isAdmin && (
                <Link to="/admin" className="mobile-admin-link">
                  <ShieldAlert size={16} className="gold-text" /> Admin Control Panel
                </Link>
              )}
            </nav>

            <div className="mobile-drawer-bottom">
              <div className="mobile-lang-row">
                <span>Language:</span>
                <button onClick={toggleLanguage} className="lang-switcher-btn">
                  <span className={lang === 'en' ? 'active-lang' : ''}>EN</span> /{' '}
                  <span className={lang === 'hi' ? 'active-lang' : ''}>हिन्दी</span>
                </button>
              </div>
              <div className="mobile-contact-row">
                <a href="tel:+919201991418" className="mobile-phone-link">
                  📞 +91 92019 91418
                </a>
                <span className="mobile-hours">Mon–Sat 10:00 AM – 7:00 PM</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
