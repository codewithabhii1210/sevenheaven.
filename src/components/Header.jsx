import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">7H</span>
          <span className="brand-name">
            Seven Heaven <em>Cosmetics</em>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about-us">Our Story</Link>
          <Link to="/contact-us">Contact</Link>
        </nav>
        <div className="header-actions">
          <Link to="/my-account" title="My Account" aria-label="My Account">
            Account
          </Link>
          <Link to="/wishlist" title="Wishlist" aria-label="Wishlist">
            Wishlist
          </Link>
          <Link to="/cart" title="Cart" aria-label="Cart">
            Cart
          </Link>
        </div>
      </div>
    </header>
  )
}
