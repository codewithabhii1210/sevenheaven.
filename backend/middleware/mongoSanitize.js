// ============================================================
// NoSQL Injection Sanitizer — Express 5 compatible
// (express-mongo-sanitize v2 Express 5 me crash karta hai kyunki
//  req.query getter-only hai — yahan Object.defineProperty use hota hai)
// Strips keys starting with `$` or containing `.` from query/body/params.
// ============================================================

function deepSanitize(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => (item && typeof item === 'object' ? deepSanitize(item) : item))
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Buffer)) {
    const clean = {}
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$') || key.includes('.')) continue // strip operator/dot keys
      clean[key] = value && typeof value === 'object' ? deepSanitize(value) : value
    }
    return clean
  }
  return obj
}

export function mongoSanitize(req, res, next) {
  try {
    // Query: getter-only in Express 5 → own property se override karo
    const cleanQuery = deepSanitize(req.query || {})
    Object.defineProperty(req, 'query', {
      value: cleanQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    })

    if (req.body && typeof req.body === 'object') {
      req.body = deepSanitize(req.body)
    }

    if (req.params && typeof req.params === 'object') {
      Object.defineProperty(req, 'params', {
        value: deepSanitize(req.params),
        writable: true,
        configurable: true,
        enumerable: true,
      })
    }
  } catch (err) {
    console.error('[SANITIZE ERROR]:', err.message)
  }
  next()
}
