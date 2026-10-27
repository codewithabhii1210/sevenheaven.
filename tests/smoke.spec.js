// Smoke: core pages render, shopping works without login, no console errors.
import { test, expect } from '@playwright/test'
import { seedCart, watchErrors, realErrors } from './helpers.js'

test('home page loads with navigation', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('header').first()).toBeVisible()
  await expect(page.getByRole('link', { name: /shop all/i }).first()).toBeVisible()
  expect(realErrors(errors)).toEqual([])
})

test('shop page renders the product grid', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/shop', { waitUntil: 'networkidle' })
  await expect(page.locator('article.product-card').first()).toBeVisible()
  const count = await page.locator('article.product-card').count()
  expect(count).toBeGreaterThan(0)
  expect(realErrors(errors)).toEqual([])
})

test('product detail page + add to cart works for guests', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/product/invisible-blur-primer', { waitUntil: 'networkidle' })
  await expect(page.locator('button', { hasText: /add to cart/i }).first()).toBeVisible()

  await page.locator('button', { hasText: /add to cart/i }).first().click()
  await page.waitForTimeout(600)

  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('sevenheaven_cart') || '[]'))
  expect(cart.length).toBeGreaterThan(0)

  await page.goto('/cart', { waitUntil: 'networkidle' })
  await expect(page.locator('.cart-count-pill')).toContainText('1 items')
  expect(realErrors(errors)).toEqual([])
})

test('guest browsing never hits order APIs', async ({ page }) => {
  const orderCalls = []
  page.on('request', (req) => {
    if (/\/api\/orders/.test(req.url())) orderCalls.push(req.method() + ' ' + req.url())
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.goto('/shop', { waitUntil: 'networkidle' })
  await seedCart(page)
  await page.goto('/cart', { waitUntil: 'networkidle' })
  expect(orderCalls).toEqual([])
})
