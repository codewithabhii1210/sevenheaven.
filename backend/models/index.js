import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ---------------- Products ----------------
const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subname: String,
    brand: { type: String, default: 'Seven Heaven' },
    category: { type: String, required: true, index: true }, // fragrance | makeup | skincare
    subcategory: String,
    size: String,
    price: { type: Number, required: true }, // GST-inclusive sale price
    mrp: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    badge: String, // bestseller | new | sale | null
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    couponCode: String,
    image: String,
    gallery: [String],
    shortDesc: String,
    description: String,
    benefits: [String],
    features: [String],
    howToUse: String,
    notes: {
      top: [String],
      heart: [String],
      base: [String],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ---------------- Coupons ----------------
const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ['percent', 'flat', 'freeShipping'], required: true },
    value: { type: Number, default: 0 },
    appliesTo: { type: String, default: 'sitewide' }, // product id | 'sitewide'
    minOrder: { type: Number, default: 0 },
    maxDiscount: Number, // null = no cap
    minItems: { type: Number, default: 1 },
    firstOrderOnly: { type: Boolean, default: false },
    usageLimit: Number, // null = unlimited
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: Date, // null = never
    description: String,
  },
  { timestamps: true }
)

// ---------------- Orders ----------------
const orderSchema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true }, // SH-YYMMDD-XXXX
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        image: String,
        size: String,
      },
    ],
    coupon: {
      code: String,
      discount: Number,
    }, // null nahi — empty allowed
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    total: Number,
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    stockRestored: { type: Boolean, default: false }, // guards double stock restore on cancel/fail
    status: {
      type: String,
      enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    address: {
      name: String,
      phone: String,
      email: String,
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// ---------------- Users ----------------
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    phone: String,
    addresses: [
      {
        name: String,
        phone: String,
        line1: String,
        city: String,
        state: String,
        pincode: String,
        type: { type: String, default: 'Home' }, // Home | Work | Other
        isDefault: { type: Boolean, default: false },
      },
    ],
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
)

// ---------------- Contact / Newsletter ----------------
const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'replied'], default: 'new' },
  },
  { timestamps: true }
)

const newsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    source: { type: String, default: 'footer' },
  },
  { timestamps: true }
)

// ---------------- Rate Limit Counters (persistent, shared across serverless instances) ----------------
// Written by middleware/mongoRateLimitStore.js. bucketKey embeds the fixed
// window start (e.g. "auth:1.2.3.4:1793120000000"); the TTL index deletes
// buckets automatically shortly after their window closes.
const rateLimitSchema = new Schema({
  bucketKey: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
})
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Product = model('Product', productSchema)
export const Coupon = model('Coupon', couponSchema)
export const Order = model('Order', orderSchema)
export const User = model('User', userSchema)
export const ContactMessage = model('ContactMessage', contactSchema)
export const Newsletter = model('Newsletter', newsletterSchema)
export const RateLimit = model('RateLimit', rateLimitSchema)
