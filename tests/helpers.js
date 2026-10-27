// Shared helpers for the Playwright E2E suite.
// Test data policy: every account/order created by a test is deleted (and
// stock restored) in the test's teardown — never touches real customers.
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB as dbConnect } from '../backend/db.js'

dotenv.config()

export const BASE_URL = process.env.E2E_BASE_URL || 'https://sevenheaven.co.in'

// ---------- DB (single connection per worker) ----------
let dbPromise = null
export async function connectDB() {
  if (!dbPromise) dbPromise = dbConnect()
  return dbPromise
}
export async function disconnectDB() {
  if (!dbPromise) return
  await dbPromise.catch(() => {})
  dbPromise = null
  await mongoose.disconnect().catch(() => {})
}

// ---------- HTTP ----------
export async function apiPost(path, body, token) {
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, data }
}

// ---------- Test patrons ----------
export async function registerPatron(label) {
  const s = Date.now()
  const email = `e2e-${label}+${s}@sevenheaven.test`
  const password = 'E2eSuite#2026'
  const phone = `9${String(s).slice(-9)}`
  const name = `E2E ${label}`
  const { status, data } = await apiPost('/api/auth/register', { name, email, phone, password })
  if (!data?.token) throw new Error(`register failed (${status}): ${JSON.stringify(data)}`)
  return { email, password, phone, name, token: data.token, user: data.user }
}

export async function deletePatron(email) {
  if (!email) return
  await connectDB()
  await mongoose.connection
    .collection('users')
    .deleteOne({ email: email.toLowerCase() })
}

// Restore stock for + delete every order a test patron placed.
export async function cleanupPatronOrders(userId) {
  if (!userId) return { ordersDeleted: 0 }
  await connectDB()
  const { Order, Product } = await import('../backend/models/index.js')
  const orders = await Order.find({ userId }).lean()
  for (const o of orders) {
    if (o.status !== 'cancelled' && !o.stockRestored) {
      for (const item of o.items || []) {
        await Product.updateOne({ id: item.productId }, { $inc: { stock: item.qty } })
      }
    }
    await Order.deleteOne({ _id: o._id })
  }
  return { ordersDeleted: orders.length }
}

export async function getProductStock(productId) {
  await connectDB()
  const { Product } = await import('../backend/models/index.js')
  const p = await Product.findOne({ id: productId }).lean()
  return p?.stock
}

// ---------- Page helpers ----------
export const KAJAL = {
  productId: 'sh7-gel-kajal-black',
  name: 'Waterproof Gel Kohl Smokey Kajal',
  price: 349,
  mrp: 499,
  image: '/images/products/waterproof-gel-kohl-smokey-kajal.jpg',
  size: '1.2 g',
  qty: 1,
}

export async function seedCart(page, items = [KAJAL]) {
  await page.evaluate((cart) => localStorage.setItem('sevenheaven_cart', JSON.stringify(cart)), items)
}

// Simulate an existing login by writing the session exactly the way the
// login flow does (sh7_token + sh7_user) before the page mounts.
export async function loginViaStorage(page, patron) {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('sh7_token', token)
      localStorage.setItem('sh7_user', JSON.stringify(user))
    },
    { token: patron.token, user: patron.user }
  )
}

// Collect console/page errors; filter known third-party noise.
export function watchErrors(page) {
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  return errors
}
export function realErrors(errors) {
  return errors.filter((e) => !/razorpay|net::ERR|favicon|googletagmanager|gtag|fonts\.google/i.test(e))
}
