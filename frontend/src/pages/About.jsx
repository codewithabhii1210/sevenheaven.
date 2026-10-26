import { Link } from 'react-router-dom'
import Logo7H from '../components/Logo7H.jsx'
import { Sparkles, Award, Heart, Droplets, MapPin, ArrowRight } from 'lucide-react'

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Header */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow">THE ARCHIVE OF SEVEN HEAVEN</span>
          <h1 className="about-hero-title">
            Beauty Beyond <span className="gold-gradient-text">Imagination</span>
          </h1>
          <p className="about-hero-sub">
            Born in the heart of Bhopal, Seven Heaven is an artisanal Indian house of haute parfumerie
            and complexion-perfecting cosmetics.
          </p>
          <div className="gold-divider-center" />
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="container about-story-section">
        <div className="about-story-grid">
          <div className="story-media-col">
            <div className="story-image-card">
              <img
                src="/images/category-fragrance.jpg"
                alt="Seven Heaven Fragrance Formulation Atelier"
                className="story-img"
                loading="lazy"
              />
              <div className="story-origin-tag">
                <MapPin size={16} className="gold-text" />
                <span>Bhopal, Madhya Pradesh • Est. 2024</span>
              </div>
            </div>
          </div>

          <div className="story-text-col">
            <span className="eyebrow">OUR GENESIS</span>
            <h2 className="story-heading">Crafted in Bhopal, Celebrated Across India</h2>
            <p className="story-paragraph">
              Seven Heaven Cosmetics was born from a singular conviction: that luxury beauty and high-sillage
              perfumery should not remain an elusive privilege locked behind exorbitant international price tags.
            </p>
            <p className="story-paragraph">
              Founded in Bhopal by <strong>Radha, Devendra, and Vishal</strong>, Seven Heaven harmonizes
              time-tested Indian botanicals with refined French-Middle Eastern extraction techniques. From our
              flagship <em>Invisible Blur Primer</em> engineered specifically for tropical Indian skin, to rich,
              resinous <em>Golden Oud</em>, every creation represents obsessive dedication to purity and longevity.
            </p>
            <div className="story-quote-card">
              <p className="founder-quote">
                &ldquo;We don&apos;t just formulate cosmetics; we craft daily armor of confidence. When you wear Seven Heaven,
                you step into your highest self.&rdquo;
              </p>
              <span className="quote-authors">— Radha, Devendra & Vishal (Founding Trio)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Seven Heaven */}
      <section className="about-pillars-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">FOUNDATIONAL INTEGRITY</span>
            <h2 className="section-heading">The Four Pillars of Seven Heaven</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Droplets size={26} className="gold-text" />
              </div>
              <h3 className="pillar-title">1. Purity (शुद्धता)</h3>
              <p className="pillar-desc">
                Ethically harvested ingredients, 100% cruelty-free, and dermatologically tested. Our Invisible Blur
                Primer is non-comedogenic and free from harsh parabens and mineral oils.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Sparkles size={26} className="gold-text" />
              </div>
              <h3 className="pillar-title">2. Craftsmanship (शिल्पकला)</h3>
              <p className="pillar-desc">
                Small-batch distillation and controlled maturation ensure each bottle of Eau de Parfum delivers
                8 to 12 hours of projection tailored to thrive in Indian climates.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Award size={26} className="gold-text" />
              </div>
              <h3 className="pillar-title">3. Innovation (नवाचार)</h3>
              <p className="pillar-desc">
                Our pore-blurring optical technology diffuses harsh lighting and absorbs surface sebum, giving your
                skin a silky canvas that locks foundation intact for up to 14 hours.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Heart size={26} className="gold-text" />
              </div>
              <h3 className="pillar-title">4. Inclusivity (समावेशिता)</h3>
              <p className="pillar-desc">
                Beauty knows no boundaries. Every formula is designed to perform universally across Indian undertones,
                gender expressions, and diverse skin types.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Primer Showcase Callout */}
      <section className="container about-cta-banner">
        <div className="cta-banner-card">
          <Logo7H size="large" showText={false} />
          <h2 className="cta-title">Experience the Invisible Blur Primer</h2>
          <p className="cta-desc">
            Discover why beauty enthusiasts across Madhya Pradesh and beyond trust Seven Heaven as their holy-grail
            complexion base.
          </p>
          <div className="cta-actions">
            <Link to="/product/invisible-blur-primer" className="btn btn-gold btn-lg">
              <span>Acquire Primer (₹499)</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn btn-gold-outline btn-lg">
              <span>Explore All Perfumes</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
