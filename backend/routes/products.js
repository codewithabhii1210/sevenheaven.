import { Router } from 'express'
import { Product } from '../models/index.js'

const router = Router()

// GET /api/products — public list (filters: ?category=&search=&sort=&featured=)
router.get('/', async (req, res) => {
  const { category, search, sort, featured } = req.query
  const query = { active: true }
  if (category) query.category = category
  if (featured === '1') query.featured = true
  if (search) {
    const rx = new RegExp(String(search).trim(), 'i')
    query.$or = [{ name: rx }, { brand: rx }, { category: rx }, { description: rx }]
  }

  let cursor = Product.find(query)
  if (sort === 'price_asc') cursor = cursor.sort({ price: 1 })
  else if (sort === 'price_desc') cursor = cursor.sort({ price: -1 })
  else if (sort === 'rating') cursor = cursor.sort({ rating: -1 })
  else cursor = cursor.sort({ featured: -1, createdAt: -1 })

  const products = await cursor.lean()
  res.json({ count: products.length, products })
})

// GET /api/products/:slug — detail
router.get('/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true }).lean()
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json({ product })
})

export default router
