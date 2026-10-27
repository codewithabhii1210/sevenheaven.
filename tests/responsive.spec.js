// Responsive: key pages at phone/tablet widths must have ZERO horizontal
// scroll (a hard project requirement).
import { test, expect } from '@playwright/test'
import { seedCart } from './helpers.js'

const viewports = [
  { name: 'small-phone', width: 360, height: 740 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
]

const pages = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop' },
  { name: 'pdp', path: '/product/invisible-blur-primer' },
  { name: 'cart', path: '/cart', cart: true },
  { name: 'checkout-wall', path: '/checkout', cart: true },
  { name: 'account', path: '/my-account' },
]

for (const vp of viewports) {
  for (const pg of pages) {
    test(`${vp.name} · ${pg.name} — zero horizontal scroll`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await context.newPage()
      try {
        await page.goto('/shop', { waitUntil: 'domcontentloaded' })
        if (pg.cart) await seedCart(page)
        await page.goto(pg.path, { waitUntil: 'networkidle' })
        await page.waitForTimeout(400)

        const m = await page.evaluate(() => ({
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
        }))
        expect(
          m.scrollW,
          `horizontal overflow: scrollW=${m.scrollW} innerW=${m.innerW}`
        ).toBeLessThanOrEqual(m.innerW + 1)
      } finally {
        await context.close()
      }
    })
  }
}
