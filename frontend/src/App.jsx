import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

// Layout Components
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'

// Pages
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Account from './pages/Account.jsx'
import Wishlist from './pages/Wishlist.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  return (
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

                {/* Main View Router */}
                <main id="main-content" className="app-main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/my-account" element={<Account />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about-us" element={<About />} />
                    <Route path="/contact-us" element={<Contact />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>

                {/* Global 4-Column Luxury Footer */}
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  )
}
