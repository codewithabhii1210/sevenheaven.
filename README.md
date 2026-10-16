# ✦ Seven Heaven Cosmetics — E-commerce Website

**Full redesign of [sevenheaven.co.in](https://sevenheaven.co.in/) — naye design, nayi architecture, same brand soul.**
Purani site sirf **features aur content reference** hai — design/layout bilkul naya banega (black & gold luxury).

> **Repo:** github.com/codewithabhii1210/sevenheaven. · **Domain:** sevenheaven.co.in (Hostinger)
> **Rule:** har change ke baad commit + push (`main` branch).

---

## 📑 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Design Direction](#-design-direction)
3. [Site Architecture & Routes](#-site-architecture--routes)
4. [Folder Structure](#-folder-structure-planned)
5. [Page-wise Breakdown](#-page-wise-breakdown)
6. [Features List](#-features-list)
7. [Product Catalog (Data)](#-product-catalog-data)
8. [Coupon Codes](#-coupon-codes)
9. [Images & Assets](#-images--assets)
10. [Data Model (MongoDB)](#-data-model-mongodb)
11. [Payments (Razorpay + COD)](#-payments-razorpay--cod)
12. [Shipping, GST & Contact Rules](#-shipping-gst--contact-rules-confirmed)
13. [Auth & Admin Panel](#-auth--admin-panel)
14. [Backend Setup Steps (user ke liye)](#-backend-setup-steps-user-ke-liye)
15. [Deployment (Hostinger)](#-deployment-hostinger)
16. [Roadmap / Phases](#-roadmap--phases)
17. [Local Development](#-local-development)
18. [Open Decisions (TODO)](#-open-decisions-todo)

---

## 🛠 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite 8** | Fast dev server + tiny production bundle |
| Frontend | **React 19** (JSX) | Component-based, easy to extend |
| Routing | **React Router v7** | SPA routing for all pages |
| State | **Context API** (Cart, Wishlist, Auth, Language) | Small catalog — no Redux needed |
| Backend API | **Node.js + Express** | MongoDB ke saath standard stack |
| Database | **MongoDB Atlas** (free M0) ✅ confirmed | User ko MongoDB aata hai |
| Auth | **JWT** (email/password via API) | Simple, API ke saath native |
| Payments | **Razorpay (test→live) + COD** | Keys `.env` me (account baad me) ✅ |
| Hosting | **Hostinger** — frontend `dist/`; API: plan pe depend | Domain already yahin hai |
| Styling | Plain CSS + CSS variables (design tokens) | Full control over luxury look |

**Note (Hostinger plan unknown):** Node.js sirf **Business/Cloud plans** par chalta hai.
- Business/Cloud mila → API isi Hostinger par deploy
- Premium/Unlimited mila → API **Render free tier** par (frontend Hostinger par)

---

## 🎨 Design Direction

**Theme: Black & Gold Luxury** (perfume-brand aesthetic — purani site se completely different)

### Color Tokens
| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0b0b0d` | Page background (near black) |
| `--color-surface` | `#131317` | Cards, panels |
| `--color-text` | `#f4f1ea` | Primary text (warm white) |
| `--color-text-muted` | `#a7a29b` | Secondary text |
| `--color-gold` | `#d4af37` | Primary accent (gold) |
| `--color-gold-soft` | `#e8cf7a` | Hover / highlights |
| `--color-border` | `rgba(212,175,55,.22)` | Hairline gold borders |

### Typography
- **Display/Headings:** `Georgia / 'Times New Roman', serif` (editorial luxury)
- **Body/UI:** `Segoe UI / system-ui` sans-serif
- Headings: wide letter-spacing, UPPERCASE eyebrows; Prices: serif + gold

### Logo Plan
1. **Primary logo (current):** official rose-gold logo → `public/images/logo-seven-heaven.png` (saved ✅)
2. **New 7H typographic luxury logo (SVG):** design phase me banega —
   - Circular thin gold ring + serif **"7H"** monogram · `SEVEN HEAVEN` wordmark · `✦` divider
   - Tagline: `BEAUTY BEYOND IMAGINATION` · single-color gold `#d4af37`
   - Favicon: `public/favicon.svg` (7H on black) ✅

### Effects / Patterns
- Gold shimmer gradient buttons, thin gold dividers (✦ motifs), card hover: lift + gold glow
- Announcement ticker (offers), scroll-to-top, product images on dark surfaces

---

## 🗺 Site Architecture & Routes

| Route | Page | Component | Notes |
|---|---|---|---|
| `/` | Home | `pages/Home.jsx` | Hero, featured, offers, story teaser |
| `/shop` | Shop | `pages/Shop.jsx` | All products + search/filters |
| `/shop/:category` | Category | `pages/Shop.jsx` | `fragrance`, `makeup`, `skincare` |
| `/product/:slug` | Product detail | `pages/ProductDetail.jsx` | Gallery, notes, add-to-cart, coupon |
| `/about-us` | Our Story | `pages/About.jsx` | Purani site ka pura content |
| `/contact-us` | Contact | `pages/Contact.jsx` | Phone/email/socials + form |
| `/my-account` | Login/Register | `pages/Account.jsx` | JWT auth (API) |
| `/wishlist` | Wishlist | `pages/Wishlist.jsx` | Saved products |
| `/cart` | Cart | `pages/Cart.jsx` | Items, qty, coupon apply |
| `/checkout` | Checkout | `pages/Checkout.jsx` | Address + Razorpay/COD |
| `/order-confirmation/:id` | Success | `pages/OrderConfirmation.jsx` | Order ID + summary |
| `/admin` | Admin panel | `pages/admin/*` | Login-protected (role: admin) |
| `/privacy-policy`, `/terms` | Legal | `pages/Legal.jsx` | Trust ke liye |
| `*` | 404 | `pages/NotFound.jsx` | Custom luxury 404 |

**Layout (har page):** `Announcement ticker → Header (logo, nav, हिं/EN, account/wishlist/cart, Shop Now) → Content → Footer (links, JOIN newsletter, copyright) → Scroll-to-top`

---

## 📁 Folder Structure (planned)

```
sevenheaven/
├── index.html / vite.config.js / package.json
├── .env                          ← API URL, Razorpay keys (GIT-IGNORED ✅)
├── public/
│   ├── favicon.svg               ✅ 7H gold favicon
│   ├── images/                   ✅ SAB images local saved
│   │   ├── logo-seven-heaven.png ✅
│   │   ├── hero-banner.jpg       ✅
│   │   ├── offer-banner.jpg      ✅
│   │   ├── category-fragrance.jpg✅
│   │   └── products/             ✅ 5 product images
│   └── .htaccess                 ← Hostinger SPA routing (deploy phase)
├── server/                       ← Node + Express API
│   ├── index.js                  ← express app entry
│   ├── db.js                     ← MongoDB Atlas connection (mongoose)
│   ├── routes/ (products, orders, auth, coupons, contact, razorpay)
│   ├── middleware/ (auth JWT, adminOnly)
│   └── seed.js                   ← products.js/coupons.js se DB seed
├── src/
│   ├── main.jsx / App.jsx / index.css   ✅
│   ├── styles/                   ← component CSS
│   ├── components/               ✅ Header, Footer + baaki (ProductCard, SearchFilter, CouponInput, LangSwitch, ScrollToTop, Toast)
│   ├── pages/                    ✅ 7 placeholders + ProductDetail, Checkout, OrderConfirmation, NotFound, Legal, admin/*
│   ├── context/                  ← CartContext, WishlistContext, AuthContext, LangContext
│   ├── data/
│   │   ├── site.js               ✅ phone, shipping, GST, socials
│   │   ├── products.js           ✅ 5 products (DB seed)
│   │   └── coupons.js            ✅ 8 coupons (DB seed)
│   ├── lib/
│   │   ├── api.js                ← fetch wrapper (VITE_API_URL)
│   │   ├── razorpay.js           ← checkout script loader
│   │   └── format.js             ← ₹ formatting (en-IN)
│   └── i18n/ (hi.js, en.js)
└── README.md                     ← ye file
```

---

## 📄 Page-wise Breakdown

### 1. Home (`/`)
1. **Hero** — dark banner, eyebrow `SEVEN HEAVEN COSMETICS`, H1 *"Beauty, Elevated."*, 2 CTAs, gold overlay
2. **Trust strip** — ✦ Free Shipping ₹499+ · ◆ Premium Beauty · ✓ Secure Checkout / COD
3. **Featured products** — primer + best perfumes
4. **Offer banner** — `WELCOME10` highlight
5. **First Collection teaser** — Seven Heaven primer (purani "Coming Soon" section ka redesign)
6. **Brand pillars** — Beauty • Elegance • Confidence
7. **Newsletter JOIN** — email → API

### 2. Shop (`/shop`)
- Product cards: image, name, price (MRP strike + discount %), ★rating, Quick Add + Wishlist
- **Filters:** search, category, price range, sort (popular/price/low-high/new)
- Empty state: *"Great things are on the horizon"* (purani site wala message)

### 3. Product Detail (`/product/:slug`)
- Gallery + badges (Bestseller/New/Sale %)
- Price + **coupon hint** (*"Use SH7PRIMER10 for 10% off"*), qty stepper, Add to Cart / Buy Now
- Tabs: Description · Benefits/Notes · Shipping & Returns
- Perfume: **Top/Heart/Base notes** + longevity + how-to-use · Related products

### 4. Our Story (`/about-us`) — purani site ka pura content, naye layout me
- Origin: **Bhopal** · belief: confidence, creativity, knowledge, elegance
- **Founders (01/02/03):** Radha (Beauty Artist & Educator — 3,000+ learners), Devendra (Marketing & Digital Ops), Vishal (Pharma Science & Digital)
- 4 pillars: Beauty Experience · Scientific Perspective · Digital Creativity · Marketing & Community
- Vision: *"To Build Beauty With Meaning"* · Mission: *"Learn. Create. Improve."* · CTA buttons

### 5. Contact (`/contact-us`)
- ☎ **+91 92019 91418** (sab jagah yehi — confirmed) · ✉ sevenheavencosmetics@gmail.com · 🌐 sevenheaven.co.in
- Socials: Instagram @sevenheavencosmetics, Facebook, YouTube
- Form: name, email, subject, message → API `contact_messages` (mailto fallback)
- CTA: Explore Collection

### 6. My Account (`/my-account`)
- Login (email+password) / Register / password reset — JWT auth
- Logged in: profile, order history, logout

### 7. Cart, Checkout, Wishlist
- Cart: items, qty +/-, remove, **coupon box**, summary (subtotal → coupon → shipping → total)
- Checkout: address → payment (**Razorpay** | **COD** ₹25 handling) → order → API → confirmation
- Wishlist: saved → move to cart

### 8. Admin (`/admin`)
- Dashboard (orders/revenue) · Products CRUD · Order status (placed→packed→shipped→delivered) · Coupons · Contact messages

---

## ⚙ Features List

**Storefront:** product catalog (5) + detail pages · search/filters/badges · cart (localStorage) · wishlist · **coupon engine** (8 codes) · checkout COD+Razorpay · order confirmation + history

**User:** register/login/logout (JWT) · password reset · guest checkout allowed · order history

**Admin:** login (role: admin) · products CRUD · order status · coupons CRUD (active/expiry/limit) · messages + newsletter list

**Marketing/UX:** **हिं/EN switcher** · newsletter JOIN · announcement ticker · ₹ (en-IN) formatting + discount % · toasts · scroll-to-top

**Technical:** SEO (title/meta/OG per route, sitemap, robots) · responsive, lazy images · API auth (JWT) + admin guard · 404, error boundary, form validation · SPA routing `.htaccess`

---

## 🛍 Product Catalog (Data)

> **5 products = 1 asli Seven Heaven product + 4 demo perfumes.** Sab data + images **local repo me saved** (`src/data/products.js` + `public/images/`). Prices **GST-inclusive**. DB banne par isi se seed.

### 1. ⭐ Seven Heaven Invisible Blur Primer — *REAL*

| Field | Value |
|---|---|
| Brand / Tagline | Seven Heaven Cosmetics · *Beauty Beyond Imagination* |
| Name | **Invisible Blur Primer — "Smooth Blur Perfect"** |
| Category / Size | Makeup (Primer) · **30 ml** |
| Price | MRP **₹699** → Sale **₹499** (29% off) ✅ confirmed · GST included |
| Coupon | `SH7PRIMER10` (10% off) |
| Image (local) | `public/images/products/invisible-blur-primer.png` |
| Short line | *Instantly Blurs Imperfections* |
| Description | Creates a silky-smooth base, minimizes the appearance of pores and fine lines, controls excess oil, and helps makeup stay fresh all day. |
| Benefits | Instantly Blurs Pores · Smooths Fine Lines · Visibly Minimizes Pores · Controls Excess Oil · Extends Makeup Wear · Helps Makeup Last Longer · Non-Comedogenic · Suitable for All Skin Types |
| Feature icons | Pore Blur · Oil Control · Long Lasting · Lightweight · All Skin Types |
| Rating / Stock | 4.8 ★ (126) · stock 100 · badge: Bestseller · **featured** |

### 2. Noir Essence — EDP *(dummy)*
50 ml · **₹1,999 → ₹1,299** (35% off) · coupon `SH7NOIR15` · Unisex, 8-10h
Notes: Black Pepper, Bergamot / Rose, Incense / Oud, Black Amber, Musk
*"A dark, magnetic blend of oud and amber made for evening wear."*
Image: `public/images/products/noir-essence.jpg`

### 3. Golden Oud — EDP *(dummy)*
100 ml · **₹2,499 → ₹1,799** (28% off) · coupon `SH7GOLD10` · Men, 10-12h
Notes: Saffron, Cardamom / Leather, Cedar / Oud, Vanilla, Tonka
*"Rich golden oud wrapped in saffron and leather — celebrations and power evenings."*
Image: `public/images/products/golden-oud.jpg`

### 4. Lunar Nights — EDP *(dummy)*
50 ml · **₹1,699 → ₹1,199** (29% off) · coupon `SH7LUNAR12` · Women, 7-9h · badge: New
Notes: Lychee, Freesia / Jasmine, Peony / Sandalwood, White Musk
*"A moonlit floral — juicy fruits over jasmine and creamy sandalwood."*
Image: `public/images/products/lunar-nights.jpg`

### 5. Amber Essence — EDP *(dummy)*
50 ml · **₹1,299 → ₹899** (31% off) · coupon `SH7AMBER15` · Unisex, 6-8h
Notes: Mandarin, Honey / Amber, Cinnamon / Benzoin, Musk
*"Sun-warmed amber and honey — friendly everyday fragrance."*
Image: `public/images/products/amber-essence.jpg`

**Categories:** `fragrance` (4 perfumes) · `makeup` (primer) · `skincare` (abhi khaali, nav me)

---

## 🎟 Coupon Codes

> Rule: **ek order me 1 coupon** (product-specific ya sitewide). Data → `src/data/coupons.js` + DB seed.

### Per-product
| Code | Discount | Applies to |
|---|---|---|
| `SH7PRIMER10` | 10% off | Invisible Blur Primer |
| `SH7NOIR15` | 15% off | Noir Essence |
| `SH7GOLD10` | 10% off | Golden Oud |
| `SH7LUNAR12` | 12% off | Lunar Nights |
| `SH7AMBER15` | 15% off | Amber Essence |

### Sitewide
| Code | Discount | Terms |
|---|---|---|
| `WELCOME10` | 10% off (max ₹200) | First order only |
| `FREESHIP` | Free shipping | Min order ₹499 |
| `COMBO20` | 20% off (max ₹500) | 3+ items in cart |

---

## 🖼 Images & Assets

> **Sab images abhi repo me saved hain** (`public/images/`) — local PC ✅ · DB me product `image` paths ke roop me ✅ · real photos aane par replace honge.

| Asset | Local path | Source |
|---|---|---|
| Logo (official) | `public/images/logo-seven-heaven.png` | sevenheaven.co.in |
| Primer (official) | `public/images/products/invisible-blur-primer.png` | sevenheaven.co.in |
| Noir Essence | `public/images/products/noir-essence.jpg` | Pexels 11517300 |
| Golden Oud | `public/images/products/golden-oud.jpg` | Pexels 12456259 |
| Lunar Nights | `public/images/products/lunar-nights.jpg` | Pexels 7850600 |
| Amber Essence | `public/images/products/amber-essence.jpg` | Pexels 11711828 |
| **Hero banner** | `public/images/hero-banner.jpg` | Pexels 16239693 |
| Offer banner | `public/images/offer-banner.jpg` | Pexels 16722498 |
| Category — Fragrance | `public/images/category-fragrance.jpg` | Pexels 10924522 |
| Favicon | `public/favicon.svg` | bana diya ✅ |

> License: **Pexels** (free commercial, no attribution) + brand ke apne assets. Hotlink nahi — sab local (fast + safe).
> Note: images thodi badi hain (1-2 MB official) — deploy se pehle compress karenge.

---

## 🗄 Data Model (MongoDB)

**DB:** MongoDB Atlas (M0 free) · **Cluster name suggestion:** `sevenheaven` · **DB:** `sevenheaven_db`

```
products      { _id, id, slug, name, subname, brand, category, subcategory, size,
                price, mrp, stock, badge, featured, rating, reviewsCount,
                couponCode, image, gallery[], shortDesc, description,
                benefits[], features[], howToUse, notes{top,heart,base},
                active, createdAt }

coupons       { _id, code, type(percent|flat|freeShipping), value, appliesTo(productId|sitewide),
                minOrder, maxDiscount, minItems, firstOrderOnly,
                usageLimit, usedCount, active, expiresAt, description }

orders        { _id, orderNo(SH-YYMMDD-XXXX), userId|null, items[{productId,name,price,qty,image}],
                coupon{code,discount}|null, subtotal, discount,
                shippingFee, codFee, total, paymentMethod(razorpay|cod),
                paymentStatus(paid|pending|failed), status(placed|packed|shipped|delivered|cancelled),
                address{name,phone,email,line1,city,state,pincode}, placedAt, updatedAt }

users         { _id, name, email, passwordHash, phone, addresses[], role(customer|admin), createdAt }

contact_messages   { _id, name, email, subject, message, status(new|replied), createdAt }
newsletter         { _id, email, source, createdAt }
```

**API access rules:**
- `GET /api/products`, `GET /api/products/:slug`, `GET /api/coupons` → public
- `POST /api/orders` → public (guest allowed); `GET /api/orders/me` → logged-in; admin sab
- `POST /api/auth/register|login` → public
- Write (products/coupons/status) → **adminOnly** middleware (JWT + `role: admin`)
- Passwords: **bcrypt** hash · JWT expiry 7d

---

## 💳 Payments (Razorpay + COD) ✅ confirmed: abhi integrate, keys baad me

### COD (phase 1 — launch ready)
1. Checkout → address → **COD** → `shippingFee` (Flipkart rules) + **₹25 handling** add
2. Order → `POST /api/orders` → MongoDB (`paymentStatus: pending`)
3. Admin panel se status manage · confirm phone: **+91 92019 91418**

### Razorpay (integration abhi, keys baad me)
1. `.env` me placeholders: `VITE_RAZORPAY_KEY_ID=`, `VITE_RAZORPAY_KEY_SECRET=` (test keys aane par)
2. Frontend: Razorpay checkout script loader (`src/lib/razorpay.js`)
3. Backend: `POST /api/razorpay/order` → amount ₹→paise → Razorpay Orders API (server-side, secret key **sirf server .env** me)
4. Frontend checkout → success/failure handler → backend `POST /api/razorpay/verify` (HMAC-SHA256 signature verify) → order `paid`
5. Test mode (`rzp_test_*`) → KYC ke baad `rzp_live_*` sirf .env badal ke (code same)
6. Failure → toast + retry; order pending rehta hai till verify

### Stripe — future (international), abhi skip ✅

---

## 📦 Shipping, GST & Contact Rules (confirmed)

| Rule | Value |
|---|---|
| Free shipping | Orders **₹499+** (Flipkart style) |
| Below ₹499 | **₹49** delivery charge |
| **COD handling fee** | **₹25** (per order) |
| Delivery estimate | 3-6 working days |
| **COD / contact phone** | **+91 92019 91418** — *sab jagah yehi* |
| Email | sevenheavencosmetics@gmail.com |
| **GST** | **Prices GST-inclusive** — checkout me alag tax line nahi |
| Admin login email | sevenheavencosmetics@gmail.com |

Order summary flow: `Subtotal → Coupon discount → Shipping (free if ₹499+ after discount) → COD fee (agar COD) → **Total**`

---

## 🔐 Auth & Admin Panel

- **JWT auth**: `POST /api/auth/register` (name, email, password) · `login` → token (localStorage, 7d)
- Password reset: email link ka simple version (SMTP baad me) — fallback: admin manual reset
- **Admin:** user `role: "admin"` — pehla admin `server/seed.js` se (admin email: **sevenheavencosmetics@gmail.com**)
- Admin routes guarded — non-admin → login redirect
- Order ke liye login **optional** (guest checkout COD se start) ✅

---

## 🛠 Backend Setup Steps (user ke liye)

### A) MongoDB Atlas account (5 min — tumhe banana hai)
1. [cloud.mongodb.com](https://cloud.mongodb.com) → **Sign up** (Google/email)
2. **Build a Free (M0) Cluster** → default name `Cluster0`
3. **Database Access** → Add New Database User → username/password (yavalahkaro)
4. **Network Access** → Add IP Address → **0.0.0.0/0** (allow all)
5. **Connect** → Drivers → copy **connection string** → mujhe de do (password ke saath)
6. Main `server/db.js` + seed script laga dunga — collection apne ban jayenge ✅

### B) Hostinger plan kaise check karein
1. hPanel login → **Hosting** → apna domain select
2. Upar/jo plan dikhe — agar **"Business / Cloud"** → Node.js deploy hoga ✅
3. Sirf **Premium / Unlimited** dikhe → API Render free par deploy hogi (koi dikkat nahi)

### C) Razorpay account (jab KYC ready ho)
1. [razorpay.com](https://razorpay.com) → Sign up → business details + PAN/bank (KYC)
2. Dashboard → **Settings → API Keys → Generate Test Key**
3. Key ID + Secret mujhe do → `.env` me daal ke test mode chalu ✅ (live keys baad me, code same)

---

## 🚀 Deployment (Hostinger)

1. `npm run build` → `dist/` upload → `public_html/` (File Manager)
2. `public/.htaccess` — SPA rewrite + HTTPS + gzip/cache
3. Domain `sevenheaven.co.in` wahi par hai — DNS same
4. API: Business plan → hPanel **Node.js app** se deploy; else **Render** free
5. Razorpay allowed origin me domain add

---

## 🗺 Roadmap / Phases

| Phase | Kaam | Status |
|---|---|---|
| P0 | Repo + Vite/React scaffold + routing + tokens | ✅ `5d5ed1f` |
| P1 | Detailed README — architecture, data, coupons | ✅ `a3ea2be` |
| P1.5 | Pricing confirm + **sab images/data local save** + decisions update | ✅ this commit |
| P2 | Design system: 7H SVG logo, header/ticker/footer, buttons/cards | ⬜ |
| P3 | Home page (hero, featured, offer, teaser, pillars, newsletter) | ⬜ |
| P4 | Shop + filters/search + Product detail + categories | ⬜ |
| P5 | Cart + Wishlist + Coupon engine (localStorage) | ⬜ |
| P6 | **Node+Express API** (auth JWT, products, orders) + MongoDB Atlas connect + seed | ⬜ (Atlas account pending) |
| P7 | Account pages + Checkout: **COD first** → Razorpay (test→live) | ⬜ |
| P8 | Admin panel (products/orders/coupons/messages) | ⬜ |
| P9 | हिं/EN switcher + SEO + legal + 404 | ⬜ |
| P10 | Hostinger deploy + `.htaccess` + domain live | ⬜ |

**Commit rule:** har change → `git add -A` + descriptive commit + `git push origin main`
Format: `feat: ...`, `fix: ...`, `style: ...`, `docs: ...`, `chore: ...`

---

## 💻 Local Development

```bash
npm install       # frontend deps
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/

# API (phase P6 ke baad)
cd server && npm install && npm run dev   # http://localhost:5000
```

---

## 📌 Open Decisions (TODO)

- [ ] **MongoDB Atlas account** — user bana raha hai (steps upar) → connection string chahiye
- [ ] **Hostinger plan** — hPanel se check karke batana (Business vs Premium)
- [ ] **Razorpay test keys** — account KYC ke baad
- [ ] **Real product photos** — abhi Pexels demo ✅, baad me replace
- [ ] **Logo finalization** — official PNG vs naya 7H SVG (dono ready kar sakte hain)
- [ ] **Password reset email** — SMTP (Gmail app password / Brevo) kabhi decide karenge
- [ ] **Newsletter** — API me store (abhi plan) vs Mailchimp/Brevo

---

## 📜 Credits & License

- **Brand content/data:** © Seven Heaven Cosmetics (Bhopal) — purani site se reference
- **Demo images:** [Pexels License](https://www.pexels.com/license/) — free commercial use · sab local saved
- **Built with:** React · Vite · Node/Express · MongoDB Atlas · Razorpay
- Repo: `github.com/codewithabhii1210/sevenheaven.`

*Beauty • Elegance • Confidence — Seven Heaven Cosmetics* ✦
