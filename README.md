# Seven Heaven Cosmetics — E-commerce Website

Redesign of [sevenheaven.co.in](https://sevenheaven.co.in/) — a premium perfume & cosmetics store.
**New design from scratch (black & gold luxury), old site sirf features/content ke liye reference hai.**

## Tech Stack

| Layer    | Tech                          |
| -------- | ----------------------------- |
| Frontend | React 19 + Vite               |
| Routing  | React Router                  |
| Backend  | Firebase (Auth + Firestore)   |
| Payments | Razorpay + COD (Stripe later) |
| Hosting  | Hostinger (custom domain)     |

## Pages

- `/` — Home (hero, featured products, offers)
- `/shop` — Shop (products + search/filters, category: skincare/makeup/perfume)
- `/about-us` — Our Story (founders, vision, mission)
- `/contact-us` — Contact (phone, email, socials, form)
- `/my-account` — Login / Register
- `/cart` — Cart + checkout
- `/wishlist` — Wishlist

## Features

- [x] Project scaffold (Vite + React Router)
- [ ] Black & gold luxury design system
- [ ] Hindi / English language switcher
- [ ] Products + admin panel (Firestore)
- [ ] Cart + wishlist (localStorage)
- [ ] Login / Signup (Firebase Auth)
- [ ] Razorpay + COD checkout
- [ ] Coupon / discount codes
- [ ] Deploy on Hostinger

## Getting Started

```bash
npm install
npm run dev      # local development
npm run build    # production build -> dist/
```

## Deployment (Hostinger)

`npm run build` → upload `dist/` contents + `.htaccess` (SPA routing) via Hostinger File Manager.

---

© Seven Heaven Cosmetics. Beauty • Elegance • Confidence
