import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-brand">Seven Heaven Cosmetics</p>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about-us">Our Story</Link>
          <Link to="/contact-us">Contact</Link>
          <Link to="/my-account">My Account</Link>
        </nav>
        <p className="footer-copy">
          © {new Date().getFullYear()} Seven Heaven Cosmetics. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}
