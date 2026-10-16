// ============================================================
// Site-wide configuration — Seven Heaven Cosmetics
// Sab kuch ek jagah: contact, shipping rules, GST, socials.
// (Data local save — DB aane par isi se seed hoga)
// ============================================================

export const site = {
  name: 'Seven Heaven Cosmetics',
  shortName: 'Seven Heaven',
  tagline: 'Beauty Beyond Imagination',
  taglineHindi: 'कल्पना से परे सुंदरता',
  domain: 'sevenheaven.co.in',
  url: 'https://sevenheaven.co.in',
  location: 'Bhopal, Madhya Pradesh, India',

  // Contact — COD ke liye ek hi number sab jagah
  phone: '+91 92019 91418',
  phoneRaw: '9201991418',
  whatsapp: '919201991418',
  email: 'sevenheavencosmetics@gmail.com',

  // Socials (purani site se)
  socials: {
    instagram: 'https://www.instagram.com/sevenheavencosmetics/',
    facebook: 'https://www.facebook.com/profile.php?id=61591355289980',
    youtube: 'https://www.youtube.com/@SevenHeavenCosmetics',
  },

  // Admin (panel login)
  adminEmail: 'sevenheavencosmetics@gmail.com',

  // Pricing — GST inclusive (Flipkart/Amazon style)
  currency: 'INR',
  locale: 'en-IN',
  gstIncluded: true,

  // Shipping — Flipkart style (confirmed)
  shipping: {
    freeAbove: 499, // ₹499+ par free delivery
    standardFee: 49, // ₹499 se niche delivery charge
    codHandlingFee: 25, // COD par handling fee
    estimatedDays: '3-6', // delivery estimate (din)
    codAvailable: true,
    prepaidDiscountPct: 0, // future: prepaid par extra discount
  },

  // Payments
  payments: {
    cod: true,
    razorpay: true, // keys .env me aayengi (account baad me)
    stripe: false, // future
  },

  // i18n default
  defaultLang: 'en', // 'en' | 'hi'
}
