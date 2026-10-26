import { Link, useLocation } from 'react-router-dom'
import { Compass, ArrowRight, Home, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'

export default function NotFound() {
  const location = useLocation()

  useEffect(() => {
    document.title = 'Page Not Found | Seven Heaven Cosmetics'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="container not-found-page">
      <div className="not-found-card">
        <div className="not-found-code" aria-hidden="true">
          404
        </div>
        <Compass size={44} className="gold-text not-found-icon" />
        <h1 className="not-found-title">This Page Has Wandered Off</h1>
        <p className="not-found-desc">
          The address <code className="not-found-path">{location.pathname}</code> does not exist in our
          atelier. Let us guide you back to the collections.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-gold">
            <Home size={16} />
            <span>Return Home</span>
          </Link>
          <Link to="/shop" className="btn btn-gold-outline">
            <ShoppingBag size={16} />
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
