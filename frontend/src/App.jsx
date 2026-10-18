import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

// Layout Components (Critical, load eagerly)
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'

// Eager Landing Page (Instant initial paint)
import Home from './pages/Home.jsx'

// Lazy-Loaded Routes (Code-Split for maximum performance & fast component load)
const Shop = lazy(() => import('./pages/Shop.jsx'))
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const Account = lazy(() => import('./pages/Account.jsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderTopColor: '#D4AF37',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="app-root">
                  {/* Global Sticky Luxury Header */}
                  <Header />

                  {/* Global Slide-Over Cart Drawer */}
                  <CartDrawer />

                  {/* Main View Router with Suspense Code-Splitting */}
                  <main id="main-content" className="app-main-content">
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/my-account" element={<Account />} />
                        <Route path="/orders" element={<Account />} />
                        <Route path="/order/:orderNo" element={<Account />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/about-us" element={<About />} />
                        <Route path="/contact-us" element={<Contact />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="*" element={<Home />} />
                      </Routes>
                    </Suspense>
                  </main>

                  {/* Global 4-Column Luxury Footer */}
                  <Footer />
                </div>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
