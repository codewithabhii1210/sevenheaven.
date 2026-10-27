// Persistent rate-limit store backed by MongoDB (Atlas).
//
// Why: the default express-rate-limit MemoryStore is per-process. On Vercel
// serverless every instance keeps its own counter, so an attacker spraying
// requests across cold starts multiplies their effective budget. Sharing the
// counters in MongoDB makes limits global across all instances.
//
// Design:
// - Fixed-window buckets: bucketKey = "<prefix>:<clientKey>:<windowStart>"
//   (window baked into the key → expired buckets are simply never read again;
//   a TTL index removes them from the collection)
// - Atomic $inc via upsert (safe under concurrency across instances); a
//   duplicate-key race on insert is retried once
// - FAIL-OPEN: any database error logs and allows the request — an Atlas blip
//   must never take the storefront down
import { RateLimit } from '../models/index.js'

export class MongoRateLimitStore {
  /**
   * @param {{ windowMs: number, prefix: string }} opts
   *  prefix must be unique per limiter (auth/api/order/contact), otherwise
   *  different limiters would share the same counter for one client.
   */
  constructor({ windowMs, prefix }) {
    this.windowMs = windowMs
    this.prefix = prefix
  }

  // Called by express-rate-limit with the limiter options
  init() {}

  _bucket(key) {
    const now = Date.now()
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs
    return {
      bucketKey: `${this.prefix}:${key}:${windowStart}`,
      resetTime: new Date(windowStart + this.windowMs),
      // TTL safety margin: bucket may outlive its window by one full window
      expiresAt: new Date(windowStart + this.windowMs * 2),
    }
  }

  async increment(key) {
    const { bucketKey, resetTime, expiresAt } = this._bucket(key)
    // Two attempts: concurrent first-hit upserts can race on the unique index
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const doc = await RateLimit.findOneAndUpdate(
          { bucketKey },
          { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
          { upsert: true, returnDocument: 'after', lean: true }
        )
        return { totalHits: doc.count, resetTime }
      } catch (err) {
        if (err?.code === 11000 && attempt === 0) continue // duplicate key race → retry
        console.error(`[rateLimit] ${this.prefix} increment failed (fail-open):`, err.message)
        // Fail open: report a low hit count so the request is allowed
        return { totalHits: 1, resetTime }
      }
    }
    return { totalHits: 1, resetTime }
  }

  async decrement(key) {
    const { bucketKey } = this._bucket(key)
    try {
      await RateLimit.updateOne({ bucketKey }, { $inc: { count: -1 } })
    } catch (err) {
      console.error(`[rateLimit] ${this.prefix} decrement failed (ignored):`, err.message)
    }
  }

  async resetKey(key) {
    const { bucketKey } = this._bucket(key)
    try {
      await RateLimit.deleteOne({ bucketKey })
    } catch (err) {
      console.error(`[rateLimit] ${this.prefix} resetKey failed (ignored):`, err.message)
    }
  }
}
