import { Sparkles, Flower2, Wind, Shield } from 'lucide-react'

export default function FragrancePyramid({ notes, benefits, isPerfume = true }) {
  if (!isPerfume && benefits && benefits.length > 0) {
    return (
      <div className="product-highlights-box">
        <div className="highlights-header">
          <Sparkles size={16} className="gold-text" />
          <h4 className="highlights-title">Key Primer Benefits</h4>
        </div>
        <div className="benefits-grid">
          {benefits.map((b, idx) => (
            <div key={idx} className="benefit-pill">
              <span className="benefit-bullet">✦</span>
              <span className="benefit-text">{b}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!notes) return null

  return (
    <div className="fragrance-pyramid-wrap">
      <div className="pyramid-header">
        <Sparkles size={16} className="gold-text" />
        <h4 className="pyramid-title">Olfactory Notes Pyramid</h4>
      </div>

      <div className="pyramid-tiers">
        {/* Top Notes */}
        <div className="pyramid-tier tier-top">
          <div className="tier-badge">
            <Wind size={14} />
            <span>Top Notes</span>
          </div>
          <p className="tier-timing">First 15-30 minutes • Initial impression</p>
          <div className="tier-ingredients">
            {(notes.top || []).map((n, i) => (
              <span key={i} className="note-pill">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Heart Notes */}
        <div className="pyramid-tier tier-heart">
          <div className="tier-badge">
            <Flower2 size={14} />
            <span>Heart Notes</span>
          </div>
          <p className="tier-timing">Hours 2 to 5 • True character</p>
          <div className="tier-ingredients">
            {(notes.heart || []).map((n, i) => (
              <span key={i} className="note-pill">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Base Notes */}
        <div className="pyramid-tier tier-base">
          <div className="tier-badge">
            <Shield size={14} />
            <span>Base Notes</span>
          </div>
          <p className="tier-timing">Hours 6 to 10+ • Rich lasting trail</p>
          <div className="tier-ingredients">
            {(notes.base || []).map((n, i) => (
              <span key={i} className="note-pill">
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
