import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { api } from '../services/api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const [productsList, setProductsList] = useState([])
  const { t } = useLanguage()

  useEffect(() => {
    api.getProducts().then((data) => {
      setProductsList(data || [])
    })
  }, [])

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section" aria-label="Seven Heaven Hero">
        <div className="hero-backdrop" />
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Beauty Beyond <br />
              <span className="gold-gradient-text">Imagination</span>
            </h1>

            <p className="hero-description">
              Professional cosmetics formulated for flawless artistry.
            </p>

            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold btn-lg">
                <span>Shop All Products</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-showcase-card">
            <div className="showcase-glow" />
            <img
              src="/images/hero-banner.jpg"
              alt="Seven Heaven Luxury Cosmetics"
              className="showcase-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section-curated" id="bestsellers">
        <div className="container">
          <div className="section-header-centered">
            <h2 className="section-heading-curated">{t('featuredMainHeading')}</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="products-grid">
            {productsList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {productsList.length === 0 && (
            <p className="home-empty-note">New creations arriving soon.</p>
          )}
        </div>
      </section>
    </div>
  )
}
