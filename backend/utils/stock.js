import { Order, Product, Coupon } from '../models/index.js'

const productMatch = (productId) => ({
  $or: [{ id: productId }, { slug: productId }],
  active: true,
})

/**
 * Atomically reserve stock for cart items (conditional $inc prevents
 * negative stock under concurrent checkouts).
 * Rolls back partial reservations if any item fails.
 * @returns {{ok: true} | {ok: false, failedName: string}}
 */
export async function reserveStock(items) {
  const reserved = []
  for (const item of items) {
    const result = await Product.updateOne(
      { ...productMatch(item.productId), stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } }
    )
    if (result.modifiedCount === 0) {
      // Rollback everything already reserved in this attempt
      for (const r of reserved) {
        await Product.updateOne(productMatch(r.productId), { $inc: { stock: r.qty } })
      }
      return { ok: false, failedName: item.name }
    }
    reserved.push(item)
  }
  return { ok: true }
}

/** Give stock back (no flag) — used for reservation rollback. */
export async function releaseStock(items) {
  for (const item of items || []) {
    await Product.updateOne(productMatch(item.productId), { $inc: { stock: item.qty } })
  }
}

/**
 * Release stock + coupon usage for a WHOLE ORDER exactly once.
 * Guarded by order.stockRestored (atomic claim) so admin-cancel,
 * webhook payment.failed, and client failure reports can never double-restore.
 * @returns {Promise<boolean>} true if this call performed the restore
 */
export async function releaseOrderStock(order) {
  if (!order || !order.items?.length) return false

  const claim = await Order.updateOne(
    { _id: order._id, stockRestored: { $ne: true } },
    { $set: { stockRestored: true } }
  )
  if (claim.modifiedCount === 0) return false // someone already restored

  await releaseStock(order.items)

  if (order.coupon?.code) {
    await Coupon.updateOne(
      { code: order.coupon.code, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    )
  }
  return true
}

/**
 * Re-reserve stock for an order that later became PAID after previously
 * being released (failed payment / cancelled then revived).
 * Paid always wins: decrements even if stock ran low (negative stock
 * flags the situation for manual restock attention).
 * @returns {Promise<boolean>} true if stock was re-reserved
 */
export async function reReserveOrderStock(order) {
  if (!order || !order.items?.length || order.stockRestored === false) return false

  const claim = await Order.updateOne(
    { _id: order._id, stockRestored: true },
    { $set: { stockRestored: false } }
  )
  if (claim.modifiedCount === 0) return false // not previously restored → nothing to do

  for (const item of order.items) {
    await Product.updateOne(productMatch(item.productId), { $inc: { stock: -item.qty } })
  }
  if (order.coupon?.code) {
    await Coupon.updateOne({ code: order.coupon.code }, { $inc: { usedCount: 1 } })
  }
  return true
}
