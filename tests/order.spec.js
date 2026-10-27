// THE money path: a logged-in patron completes a real COD order end-to-end,
// then every trace of the test (order + stock + patron) is cleaned up.
// Payment is COD only — no real payments are ever exercised.
import { test, expect } from '@playwright/test'
import {
  registerPatron,
  deletePatron,
  cleanupPatronOrders,
  getProductStock,
  connectDB,
  disconnectDB,
  seedCart,
  loginViaStorage,
  KAJAL,
} from './helpers.js'

let patron
let stockBefore

test.beforeAll(async () => {
  await connectDB()
  patron = await registerPatron('order')
  stockBefore = await getProductStock(KAJAL.productId)
})

test.afterAll(async () => {
  if (patron) {
    const cleaned = await cleanupPatronOrders(patron.user.id)
    if (cleaned.ordersDeleted > 0) console.log(`[cleanup] removed ${cleaned.ordersDeleted} test order(s) + restored stock`)
    await deletePatron(patron.email)
  }
  await disconnectDB()
})

test('logged-in patron places a COD order and sees confirmation', async ({ page }) => {
  // Session exactly as login writes it + a one-item cart
  await loginViaStorage(page, patron)
  await seedCart(page)

  await page.goto('/checkout', { waitUntil: 'networkidle' })
  await expect(page.locator('.new-address-subform, .saved-addresses-list').first()).toBeVisible({
    timeout: 20000,
  })

  // Fresh patron → add-address form
  await page.fill('#addr-name', 'E2E Order Patron')
  await page.fill('#addr-phone', patron.phone)
  await page.fill('#addr-line1', '42 Arera Colony, Test Lane')
  await page.fill('#addr-pincode', '462016')

  // Cash on Delivery (default is razorpay — must switch; no real payments)
  await page.locator('label.payment-choice-card', { hasText: 'Cash on Delivery' }).click()
  await page.locator('.place-order-btn').click()

  // Confirmation screen with a real order number
  await expect(page.getByText('Thank You For Your Order')).toBeVisible({ timeout: 45000 })
  const orderNo = (await page.locator('.order-no-val').textContent())?.trim()
  expect(orderNo).toMatch(/^SH-\d{6}-\d{4}$/)

  // DB: order exists, owned by the authenticated patron, stock deducted
  const { Order, Product } = await import('../backend/models/index.js')
  const doc = await Order.findOne({ orderNo }).lean()
  expect(doc).toBeTruthy()
  expect(String(doc.userId)).toBe(String(patron.user.id))
  expect(doc.paymentMethod).toBe('cod')

  const stockMid = await Product.findOne({ id: KAJAL.productId }).lean()
  expect(stockMid.stock).toBeLessThanOrEqual(stockBefore - 1)

  // Owner tracking endpoint returns the full order for this patron
  const trackRes = await fetch(`${process.env.E2E_BASE_URL || 'https://sevenheaven.co.in'}/api/orders/${orderNo}`, {
    headers: { Authorization: `Bearer ${patron.token}` },
  })
  expect(trackRes.status).toBe(200)
})
