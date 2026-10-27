// Flipkart-style login policy at checkout & order tracking (guest side).
import { test, expect } from '@playwright/test'
import { registerPatron, deletePatron, connectDB, disconnectDB, seedCart } from './helpers.js'

let patron

test.beforeAll(async () => {
  await connectDB()
  patron = await registerPatron('guest-wall')
})

test.afterAll(async () => {
  await deletePatron(patron?.email)
  await disconnectDB()
})

test('guest with a cart sees the checkout LOGIN WALL (no address form)', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'networkidle' })
  await seedCart(page)
  await page.goto('/checkout', { waitUntil: 'networkidle' })

  await expect(page.getByText('Login Required to Place Your Order')).toBeVisible()
  await expect(page.getByText('Delivery Address')).toHaveCount(0)

  // Wall links carry the redirect back to checkout
  await expect(page.locator('a', { hasText: 'Sign In to Continue' })).toHaveAttribute(
    'href',
    '/my-account?tab=login&redirect=/checkout'
  )
  await expect(page.locator('a', { hasText: 'Create Free Account' })).toHaveAttribute(
    'href',
    '/my-account?tab=register&redirect=/checkout'
  )
})

test('guest /order/:no shows the login notice and fires NO order API call', async ({ page }) => {
  const orderCalls = []
  page.on('request', (req) => {
    if (/\/api\/orders\//.test(req.url())) orderCalls.push(req.method() + ' ' + req.url())
  })

  await page.goto('/order/SH-000000-0000', { waitUntil: 'networkidle' })
  await expect(page.getByText('Sign In to View Your Order')).toBeVisible()
  await expect(page.getByText('Order Not Found')).toHaveCount(0)
  await expect(page.locator('a[href="/my-account?tab=login&redirect=/order/SH-000000-0000"]')).toBeVisible()

  await page.waitForTimeout(700)
  expect(orderCalls).toEqual([])
})

test('login from the wall returns to checkout with the address form', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'networkidle' })
  await seedCart(page)
  await page.goto('/checkout', { waitUntil: 'networkidle' })

  await page.click('a:has-text("Sign In to Continue")')
  await page.waitForURL((u) => u.pathname === '/my-account')
  expect(page.url()).toContain('redirect=/checkout')

  await page.fill('input[placeholder="patron@example.com"]', patron.email)
  await page.fill('input[placeholder="Enter your password"]', patron.password)
  await page.click('button:has-text("Sign In to Your Account")')

  await page.waitForURL((u) => u.pathname === '/checkout', { timeout: 20000 })
  // Address UI appears after the (possibly cold) addresses endpoint resolves
  await expect(page.locator('.new-address-subform, .saved-addresses-list').first()).toBeVisible({
    timeout: 20000,
  })
  await expect(page.getByText('Login Required to Place Your Order')).toHaveCount(0)
  await expect(page.locator('#addr-name')).toBeVisible()
})
