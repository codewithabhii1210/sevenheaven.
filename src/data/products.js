// ============================================================
// Product catalog — Seven Heaven Cosmetics (local DB seed)
// 1 asli Seven Heaven product + 4 demo perfumes (Pexels images).
// MongoDB Atlas aane par isi data se `products` collection seed hoga.
// Prices GST-inclusive. Sab images repo me save hain (public/images).
// ============================================================

export const products = [
  // ---------- 1. REAL PRODUCT — Seven Heaven ----------
  {
    id: 'sh7-primer-30ml',
    slug: 'invisible-blur-primer',
    name: 'Invisible Blur Primer',
    subname: 'Smooth Blur Perfect',
    brand: 'Seven Heaven Cosmetics',
    category: 'makeup', // makeup | fragrance | skincare
    subcategory: 'primer',
    size: '30 ml',
    price: 499, // sale price (GST included)
    mrp: 699, // MRP
    stock: 100,
    badge: 'bestseller', // bestseller | new | sale | null
    featured: true,
    rating: 4.8,
    reviewsCount: 126,
    couponCode: 'SH7PRIMER10',
    image: '/images/products/invisible-blur-primer.png',
    gallery: ['/images/products/invisible-blur-primer.png'],
    shortDesc: 'Instantly blurs imperfections — silky-smooth base for all-day makeup.',
    description:
      'Creates a silky-smooth base, minimizes the appearance of pores and fine lines, controls excess oil, and helps makeup stay fresh all day.',
    benefits: [
      'Instantly Blurs Pores',
      'Smooths Fine Lines',
      'Visibly Minimizes Pores',
      'Controls Excess Oil',
      'Extends Makeup Wear',
      'Helps Makeup Last Longer',
      'Non-Comedogenic',
      'Suitable for All Skin Types',
    ],
    features: ['Pore Blur', 'Oil Control', 'Long Lasting', 'Lightweight', 'All Skin Types'],
    howToUse: 'Moisturizer ke baad, foundation se pehle thoda sa primer fingertips se face par evenly lagayein.',
    notes: null, // perfumes ke liye
    active: true,
    createdAt: '2026-08-09',
  },

  // ---------- 2. Demo perfume ----------
  {
    id: 'sh7-noir-essence-50',
    slug: 'noir-essence',
    name: 'Noir Essence',
    subname: 'Eau de Parfum',
    brand: 'Seven Heaven',
    category: 'fragrance',
    subcategory: 'edp',
    size: '50 ml',
    price: 1299,
    mrp: 1999,
    stock: 60,
    badge: 'bestseller',
    featured: true,
    rating: 4.7,
    reviewsCount: 84,
    couponCode: 'SH7NOIR15',
    image: '/images/products/noir-essence.jpg',
    gallery: ['/images/products/noir-essence.jpg'],
    shortDesc: 'Dark oud and black amber — a magnetic evening signature.',
    description:
      'A dark, magnetic blend of oud and amber made for evening wear — bold, warm and unforgettable.',
    benefits: ['8-10 hour longevity', 'Strong sillage', 'Unisex', 'Evening / special occasions'],
    features: [],
    howToUse: 'Pulse points (wrist, neck) par 1-2 spray — body heat se fragrance khulta hai.',
    notes: {
      top: ['Black Pepper', 'Bergamot'],
      heart: ['Rose', 'Incense'],
      base: ['Oud', 'Black Amber', 'Musk'],
    },
    active: true,
    createdAt: '2026-10-16',
  },

  // ---------- 3. Demo perfume ----------
  {
    id: 'sh7-golden-oud-100',
    slug: 'golden-oud',
    name: 'Golden Oud',
    subname: 'Eau de Parfum',
    brand: 'Seven Heaven',
    category: 'fragrance',
    subcategory: 'edp',
    size: '100 ml',
    price: 1799,
    mrp: 2499,
    stock: 45,
    badge: 'sale',
    featured: true,
    rating: 4.9,
    reviewsCount: 67,
    couponCode: 'SH7GOLD10',
    image: '/images/products/golden-oud.jpg',
    gallery: ['/images/products/golden-oud.jpg'],
    shortDesc: 'Rich golden oud with saffron and leather — celebration in a bottle.',
    description:
      'Rich golden oud wrapped in saffron and leather — a signature scent for celebrations and power evenings.',
    benefits: ['10-12 hour longevity', 'Long-lasting projection', 'Men', 'Celebration wear'],
    features: [],
    howToUse: 'Chest aur neck par spray — layering ke liye matching body lotion ke saath behtar.',
    notes: {
      top: ['Saffron', 'Cardamom'],
      heart: ['Leather', 'Cedar'],
      base: ['Oud', 'Vanilla', 'Tonka'],
    },
    active: true,
    createdAt: '2026-10-16',
  },

  // ---------- 4. Demo perfume ----------
  {
    id: 'sh7-lunar-nights-50',
    slug: 'lunar-nights',
    name: 'Lunar Nights',
    subname: 'Eau de Parfum',
    brand: 'Seven Heaven',
    category: 'fragrance',
    subcategory: 'edp',
    size: '50 ml',
    price: 1199,
    mrp: 1699,
    stock: 75,
    badge: 'new',
    featured: true,
    rating: 4.6,
    reviewsCount: 41,
    couponCode: 'SH7LUNAR12',
    image: '/images/products/lunar-nights.jpg',
    gallery: ['/images/products/lunar-nights.jpg'],
    shortDesc: 'Moonlit florals over jasmine and creamy sandalwood.',
    description:
      'A moonlit floral — juicy fruits over jasmine and creamy sandalwood for graceful evenings.',
    benefits: ['7-9 hour longevity', 'Soft, silky trail', 'Women', 'Date / evening'],
    features: [],
    howToUse: 'Wrist aur inner elbow par 1-2 spray; zyada rub na karein taaki top notes na toot jayein.',
    notes: {
      top: ['Lychee', 'Freesia'],
      heart: ['Jasmine', 'Peony'],
      base: ['Sandalwood', 'White Musk'],
    },
    active: true,
    createdAt: '2026-10-16',
  },

  // ---------- 5. Demo perfume ----------
  {
    id: 'sh7-amber-essence-50',
    slug: 'amber-essence',
    name: 'Amber Essence',
    subname: 'Eau de Parfum',
    brand: 'Seven Heaven',
    category: 'fragrance',
    subcategory: 'edp',
    size: '50 ml',
    price: 899,
    mrp: 1299,
    stock: 90,
    badge: null,
    featured: false,
    rating: 4.5,
    reviewsCount: 33,
    couponCode: 'SH7AMBER15',
    image: '/images/products/amber-essence.jpg',
    gallery: ['/images/products/amber-essence.jpg'],
    shortDesc: 'Sun-warmed amber and honey — friendly everyday fragrance.',
    description:
      'Sun-warmed amber and honey — a friendly everyday fragrance that works from office to evening.',
    benefits: ['6-8 hour longevity', 'Office-friendly', 'Unisex', 'Daily wear'],
    features: [],
    howToUse: 'Subah 2 spray shirt/collar ke paas — halka aur fresh rahe din bhar.',
    notes: {
      top: ['Mandarin', 'Honey'],
      heart: ['Amber', 'Cinnamon'],
      base: ['Benzoin', 'Musk'],
    },
    active: true,
    createdAt: '2026-10-16',
  },
]

// Categories (nav + filters ke liye)
export const categories = [
  { id: 'fragrance', label: 'Fragrance', labelHi: 'परफ्यूम', image: '/images/category-fragrance.jpg' },
  { id: 'makeup', label: 'Makeup', labelHi: 'मेकअप', image: '/images/products/invisible-blur-primer.png' },
  { id: 'skincare', label: 'Skincare', labelHi: 'स्किनकेयर', image: null }, // abhi khaali
]

// Helper: discount %
export function discountPct(product) {
  return Math.round(((product.mrp - product.price) / product.mrp) * 100)
}
