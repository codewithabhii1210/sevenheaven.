// Auth: UI login/logout roundtrip + UI registration (Flipkart-style accounts).
import { test, expect } from '@playwright/test'
import { registerPatron, deletePatron, connectDB, disconnectDB } from './helpers.js'

let patron
let uiRegisteredEmail

test.beforeAll(async () => {
  await connectDB()
  patron = await registerPatron('auth')
})

test.afterAll(async () => {
  await deletePatron(patron?.email)
  await deletePatron(uiRegisteredEmail)
  await disconnectDB()
})

test('UI login shows account dashboard; logout clears the session', async ({ page }) => {
  await page.goto('/my-account?tab=login', { waitUntil: 'networkidle' })
  await page.fill('input[placeholder="patron@example.com"]', patron.email)
  await page.fill('input[placeholder="Enter your password"]', patron.password)
  await page.click('button:has-text("Sign In to Your Account")')

  // Logged-in dashboard: account tabs + logout action visible
  await expect(page.locator('.patron-actions .logout-btn')).toBeVisible({ timeout: 20000 })
  await expect(page.locator('.account-tab-btn').first()).toBeVisible()

  // Logout clears BOTH token and user (synchronous clear — audit fix)
  await page.click('.patron-actions .logout-btn')
  await expect(page.getByText('Patron Sign In')).toBeVisible({ timeout: 10000 })
  const session = await page.evaluate(() => ({
    token: localStorage.getItem('sh7_token'),
    user: localStorage.getItem('sh7_user'),
  }))
  expect(session.token).toBeNull()
  expect(session.user).toBeNull()
})

test('UI registration creates a logged-in session', async ({ page }) => {
  const s = Date.now()
  uiRegisteredEmail = `e2e-ui+${s}@sevenheaven.test`

  await page.goto('/my-account?tab=register', { waitUntil: 'networkidle' })
  await page.fill('input[placeholder="e.g. Vishal Verma"]', 'E2E UI Register')
  await page.fill('input[placeholder="patron@example.com"]', uiRegisteredEmail)
  await page.fill('input[placeholder="10-digit mobile number"]', `8${String(s).slice(-9)}`)
  await page.fill('input[placeholder="Include letters and numbers"]', 'E2eSuite#2026')
  await page.fill('input[placeholder="Re-enter password"]', 'E2eSuite#2026')
  await page.click('button:has-text("Create VIP Account")')

  await expect(page.locator('.patron-actions .logout-btn')).toBeVisible({ timeout: 20000 })
  const token = await page.evaluate(() => localStorage.getItem('sh7_token'))
  expect(token).toBeTruthy()
})

test('guest /my-account shows the sign-in form (no dashboard leak)', async ({ page }) => {
  await page.goto('/my-account', { waitUntil: 'networkidle' })
  await expect(page.getByText('Patron Sign In')).toBeVisible()
  await expect(page.locator('.patron-actions .logout-btn')).toHaveCount(0)
})
