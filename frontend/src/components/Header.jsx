import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo7H from './Logo7H.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import {
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Package,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

  const { itemsCount, openCart } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { t, lang, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const location = useLocation()
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
    setIsAccountDropdownOpen(false)
  }, [location.pathname])

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

  return (
    <>
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
              to="/shop?category=makeup"
              className={location.search.includes('makeup') ? 'active' : ''}
            >
              {t('perfumes')}
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

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="action-icon-btn theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Luxury Theme' : 'Switch to Dark Noir Theme'}
              aria-label="Toggle dark and light theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

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
              <Link to="/shop?category=makeup">{t('perfumes')}</Link>
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
              <div className="mobile-theme-lang-row">
                <div className="mobile-theme-wrap">
                  <span>Theme:</span>
                  <button onClick={toggleTheme} className="theme-switcher-btn" aria-label="Toggle Theme">
                    {theme === 'dark' ? (
                      <>
                        <Sun size={14} className="gold-text" /> <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={14} className="gold-text" /> <span>Dark</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mobile-lang-wrap">
                  <span>Language:</span>
                  <button onClick={toggleLanguage} className="lang-switcher-btn" aria-label="Toggle Language">
                    <span className={lang === 'en' ? 'active-lang' : ''}>EN</span> /{' '}
                    <span className={lang === 'hi' ? 'active-lang' : ''}>हिन्दी</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
