import validator from 'validator'

// Strict Input Sanitization & Validation Helper
export const sanitize = {
  string(val, maxLength = 255) {
    if (typeof val !== 'string') return ''
    return val.trim().slice(0, maxLength)
  },

  email(val) {
    if (typeof val !== 'string') return null
    const clean = val.trim().toLowerCase()
    return validator.isEmail(clean) ? clean : null
  },

  phone(val) {
    if (typeof val !== 'string' && typeof val !== 'number') return null
    const cleaned = String(val).replace(/\D/g, '')
    // Indian 10 digit mobile (optional leading 91 or 0)
    if (cleaned.length === 10) return cleaned
    if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2)
    if (cleaned.length === 11 && cleaned.startsWith('0')) return cleaned.slice(1)
    return null
  },

  pincode(val) {
    if (typeof val !== 'string' && typeof val !== 'number') return null
    const cleaned = String(val).trim()
    return /^[1-9][0-9]{5}$/.test(cleaned) ? cleaned : null
  },

  number(val, min = 0, max = 1000000) {
    const num = Number(val)
    if (Number.isNaN(num) || !Number.isFinite(num)) return null
    if (num < min || num > max) return null
    return num
  },

  int(val, min = 1, max = 100) {
    const num = parseInt(val, 10)
    if (Number.isNaN(num) || !Number.isFinite(num)) return null
    if (num < min || num > max) return null
    return num
  },

  // Password policy: min 8 chars, at least 1 number, 1 uppercase or special
  isStrongPassword(password) {
    if (typeof password !== 'string') return false
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  },
}
