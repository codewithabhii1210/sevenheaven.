export default function Logo7H({ size = 'default', showText = true, className = '' }) {
  const isSmall = size === 'small'
  const isLarge = size === 'large'

  const iconSize = isSmall ? 32 : isLarge ? 54 : 42

  return (
    <div className={`brand-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* 7H Typographic Luxury Emblem */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-emblem-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E79F" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA7C11" />
            <stop offset="100%" stopColor="#EDC967" />
          </linearGradient>
          <linearGradient id="goldStroke" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#997A15" />
            <stop offset="50%" stopColor="#F4D03F" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="50" cy="50" r="46" stroke="url(#goldStroke)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
        <circle cx="50" cy="50" r="42" stroke="url(#goldGradient)" strokeWidth="1.5" />

        {/* Inner Diamond Accents */}
        <path d="M 50 14 L 52 18 L 50 22 L 48 18 Z" fill="url(#goldGradient)" />
        <path d="M 50 78 L 52 82 L 50 86 L 48 82 Z" fill="url(#goldGradient)" />
        <path d="M 14 50 L 18 52 L 22 50 L 18 48 Z" fill="url(#goldGradient)" />
        <path d="M 78 50 L 82 52 L 86 50 L 82 48 Z" fill="url(#goldGradient)" />

        {/* Stylized '7' */}
        <path
          d="M 30 33 L 58 33 L 42 67 L 49 67 L 65 33 L 65 28 L 30 28 Z"
          fill="url(#goldGradient)"
        />

        {/* Stylized 'H' interlocking */}
        <path
          d="M 54 44 L 54 68 L 58 68 L 58 56 L 68 56 L 68 68 L 72 68 L 72 44 L 68 44 L 68 52 L 58 52 L 58 44 Z"
          fill="url(#goldGradient)"
        />

        {/* Central Star Crown Sparkle */}
        <path d="M 50 26 L 51 29 L 54 30 L 51 31 L 50 34 L 49 31 L 46 30 L 49 29 Z" fill="#FFF8DC" />
      </svg>

      {/* Brand Typographic Wordmark */}
      {showText && (
        <div className="brand-wordmark" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            className="brand-title"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isSmall ? '1.05rem' : isLarge ? '1.55rem' : '1.3rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #FFFFFF 20%, #F5E5C9 60%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
            }}
          >
            Seven Heaven
          </span>
          <span
            className="brand-subtitle"
            style={{
              fontSize: isSmall ? '0.58rem' : isLarge ? '0.72rem' : '0.65rem',
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: 'var(--color-gold, #D4AF37)',
              fontWeight: 500,
              paddingLeft: '2px',
              marginTop: '2px',
            }}
          >
            Cosmetics
          </span>
        </div>
      )}
    </div>
  )
}
