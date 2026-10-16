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
10. [Data Model (Firebase/Firestore)](#-data-model-firebasefirestore)
11. [Payments (Razorpay + COD)](#-payments-razorpay--cod)
12. [Auth & Admin Panel](#-auth--admin-panel)
13. [Language (Hindi/English)](#-language-hindienglish)
14. [Deployment (Hostinger)](#-deployment-hostinger)
15. [Roadmap / Phases](#-roadmap--phases)
16. [Local Development](#-local-development)
17. [Open Decisions (TODO)](#-open-decisions-todo)

---

## 🛠 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite 8** | Fast dev server + tiny production bundle |
| Frontend | **React 19** (JSX) | Component-based, easy to extend |
| Routing | **React Router v7** | SPA routing for all pages |
| State | **Context API** (Cart, Wishlist, Auth, Language) | Small catalog — no Redux needed |
| Backend/DB | **Firebase** (Auth + Firestore + Cloud Functions) | Quick, free tier, no server management |
| Payments | **Razorpay (online) + COD** (Stripe later) | India-first payments |
| Hosting | **Hostinger** (static `dist/` + custom domain) | Already purchased domain |
| Styling | Plain CSS + CSS variables (design tokens) | Full control over luxury look, no framework bloat |

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
- Headings: wide letter-spacing, UPPERCASE eyebrows
- Prices: serif + gold

### Logo Plan
1. **Primary logo (current):** Seven Heaven ka official rose-gold logo (asset URL below) — header/footer me.
   `https://sevenheaven.co.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-9-2026-05_33_06-AM.png`
2. **New 7H typographic luxury logo (SVG):** design phase me banega —
   - Circular thin gold ring + **serif "7H"** monogram (stroke-based, high contrast)
   - Neeche `SEVEN HEAVEN` wordmark (tracked-out serif caps) + `✦` star divider
   - Tagline: `BEAUTY BEYOND IMAGINATION`
   - Single-color gold (`#d4af37`), scales from 16px favicon to 500px banner
   - Favicon: `public/favicon.svg` (7H on black, done ✅)

### Effects / Patterns
- Gold shimmer gradient on buttons, thin gold dividers (✦ diamond motifs)
- Card hover: lift + gold border glow; product images on dark surfaces
- Ticker/announcement bar (free shipping offers), scroll-to-top button

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
| `/my-account` | Login/Register | `pages/Account.jsx` | Firebase Auth |
| `/wishlist` | Wishlist | `pages/Wishlist.jsx` | Saved products |
| `/cart` | Cart | `pages/Cart.jsx` | Items, qty, coupon apply |
| `/checkout` | Checkout | `pages/Checkout.jsx` | Address + Razorpay/COD |
| `/order-confirmation/:id` | Success | `pages/OrderConfirmation.jsx` | Order ID + summary |
| `/admin` | Admin panel | `pages/admin/*` | Login-protected (role: admin) |
| `/privacy-policy`, `/terms` | Legal | `pages/Legal.jsx` | Trust ke liye |
| `*` | 404 | `pages/NotFound.jsx` | Custom luxury 404 |

**Layout structure (har page par):**
`Announcement ticker → Header (logo, nav, lang switch, account/wishlist/cart icons, Shop Now) → Page content → Footer (links, newsletter JOIN, copyright) → Scroll-to-top`

---

## 📁 Folder Structure (planned)

```
sevenheaven/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── favicon.svg                 ✅ 7H gold favicon
│   └── .htaccess                   ← Hostinger SPA routing (deploy phase)
├── src/
│   ├── main.jsx                    ✅ app entry
│   ├── App.jsx                     ✅ routes
│   ├── index.css                   ✅ design tokens (base)
│   ├── styles/                     ← component CSS files
│   ├── components/
│   │   ├── Header.jsx              ✅ (upgrade pending)
│   │   ├── Footer.jsx              ✅ (upgrade pending)
│   │   ├── AnnouncementBar.jsx     ← ticker
│   │   ├── ProductCard.jsx         ← product tile
│   │   ├── SearchFilter.jsx        ← search + category/sort/price
│   │   ├── CouponInput.jsx         ← cart/checkout coupon box
│   │   ├── LangSwitch.jsx          ← हिं/EN toggle
│   │   └── ScrollToTop.jsx
│   ├── pages/                      ✅ 7 placeholder pages + add later:
│   │   ├── ProductDetail.jsx / Checkout.jsx / OrderConfirmation.jsx
│   │   ├── NotFound.jsx / Legal.jsx
│   │   └── admin/ (Dashboard, Products, Orders, Coupons, Messages)
│   ├── context/
│   │   ├── CartContext.jsx         ← cart + totals + coupon
│   │   ├── WishlistContext.jsx     ← wishlist (localStorage)
│   │   ├── AuthContext.jsx         ← Firebase login/session
│   │   └── LangContext.jsx         ← i18n
│   ├── data/
│   │   ├── products.js             ← catalog (section 7)
│   │   └── coupons.js              ← coupon engine (section 8)
│   ├── lib/
│   │   ├── firebase.js             ← Firebase init (env-based)
│   │   ├── razorpay.js             ← checkout script loader
│   │   └── format.js               ← ₹ formatting, dates
│   └── i18n/  (hi.js, en.js)
└── README.md                       ← ye file
```

---

## 📄 Page-wise Breakdown

### 1. Home (`/`)
1. **Hero** — full-width dark banner, eyebrow `SEVEN HEAVEN COSMETICS`, H1 *"Beauty, Elevated."*, 2 CTAs (`Explore Collection →`, `✦ Coming Soon`), gold gradient overlay
2. **Trust strip** — ✦ Free Shipping · ◆ Premium Beauty · ✓ Secure Checkout
3. **Featured products** — 3-4 product cards (primer + best perfume)
4. **Offer banner** — coupon highlight (`WELCOME10` etc.)
5. **"First Collection" teaser** — Seven Heaven primer large visual (purani site wale "Coming Soon" section ka redesign)
6. **Brand pillars** — Beauty • Elegance • Confidence (4 mini-cards)
7. **Newsletter JOIN** — email capture (Firestore)

### 2. Shop (`/shop`)
- Grid of product cards: image, name, category, price (MRP strikethrough), discount %, ★rating, Quick Add + Wishlist icons
- **Sidebar/Filters:** search box, category (Fragrance/Makeup/Skincare), price range, sort (popular/price low-high/high-low/new)
- Empty category state: "Great things are on the horizon" (purani site wala message)

### 3. Product Detail (`/product/:slug`)
- Image gallery + badges (Bestseller/New/Sale %)
- Price block, coupon hint (*"Use code SH7PRIMER10 for 10% off"*), qty stepper, Add to Cart / Buy Now
- Tabs: Description · Benefits/Notes · Shipping info
- Perfume ke liye: **Top/Heart/Base notes** + longevity + size
- Related products

### 4. Our Story (`/about-us`) — purani site ka pura content, naye layout me
- Origin: **Bhopal** · belief: *confidence, creativity, knowledge, elegance*
- **Founders (3 cards 01/02/03):** Radha (Beauty Artist & Educator — 3,000+ learners), Devendra (Marketing & Digital Operations), Vishal (Pharmaceutical Science & Digital)
- 4 pillars: Beauty Experience · Scientific Perspective · Digital Creativity · Marketing & Community
- Vision: *"To Build Beauty With Meaning"* · Mission: *"Learn. Create. Improve."*
- CTA: Explore Collection / Contact

### 5. Contact (`/contact-us`)
- ☎ +91 92325 61621 · ✉ sevenheavencosmetics@gmail.com · 🌐 sevenheaven.co.in
- Socials: Instagram @sevenheavencosmetics, Facebook, YouTube
- Form: name, email, subject, message → **Firestore `contact_messages`** (mailto fallback)
- CTA: Explore Collection

### 6. My Account (`/my-account`)
- Login (email+password) / Register / lost password — Firebase Auth
- Logged in: profile, order history, logout

### 7. Cart, Checkout, Wishlist
- Cart: line items, qty +/-, remove, coupon box, order summary (subtotal, discount, shipping, total)
- Checkout: address form → payment choice (**Razorpay** | **COD**) → order place → Firestore order doc
- Wishlist: saved items → move to cart

### 8. Admin (`/admin`)
- Dashboard (orders/revenue stats) · Products CRUD · Order status (Placed→Packed→Shipped→Delivered) · Coupons · Contact messages

---

## ⚙ Features List

**Storefront**
- [ ] Product catalog (5 demo products) with detail pages
- [ ] Search + filters (category, price, sort) + product badges
- [ ] Cart (qty, remove, order summary) — localStorage
- [ ] Wishlist — localStorage
- [ ] Coupon engine (per-product + sitewide codes, % / flat / free-ship)
- [ ] Checkout: address + **Razorpay online** + **COD**
- [ ] Order confirmation page + order history

**User**
- [ ] Register / Login / Logout (Firebase Auth)
- [ ] Password reset (email link)
- [ ] Guest checkout allowed? (decision: allow + encourage login)

**Admin**
- [ ] Admin login (custom claim `role: admin`)
- [ ] Products CRUD (image URL, price, stock, coupon)
- [ ] Orders list + status update
- [ ] Coupons CRUD (active/inactive, expiry, usage limit)
- [ ] Contact messages + newsletter subscribers list

**Marketing / UX**
- [ ] Hindi ⇄ English language switcher (global)
- [ ] Newsletter JOIN (footer)
- [ ] Announcement ticker (offers)
- [ ] ₹ formatting, discount %, strikethrough MRP
- [ ] Toast notifications (added to cart, coupon applied)
- [ ] Scroll-to-top, back-to-product links

**Technical**
- [ ] SEO: title/meta per route, OG tags, `sitemap.xml`, `robots.txt`
- [ ] Responsive (mobile-first), lazy images, fast load
- [ ] Firestore security rules (public read products, write only admin/orders)
- [ ] 404 page, error boundary, form validation
- [ ] SPA routing on Hostinger (`.htaccess`)

---

## 🛍 Product Catalog (Data)

> **5 products total = 1 real Seven Heaven cosmetic + 4 demo perfumes.**
> Perfume data 100% dummy (demo prices) — replace with real data later.
> Images: Pexels free-license URLs (hotlink demo) — real photos ke liye replace karenge.

### 1. ⭐ Seven Heaven Invisible Blur Primer — *REAL PRODUCT*

| Field | Value |
|---|---|
| Brand | Seven Heaven Cosmetics |
| Tagline | Beauty Beyond Imagination |
| Name | **Invisible Blur Primer — "Smooth Blur Perfect"** |
| Category | Makeup (Primer) |
| Size | **30 ml** |
| Price (demo) | MRP **₹699** → Sale **₹499** ⚠️ *rate confirm karna hai* |
| Coupon | `SH7PRIMER10` (10% extra) |
| Image (official) | `https://sevenheaven.co.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-9-2026-05_15_45-AM.png` |
| Short line | *Instantly Blurs Imperfections* |
| Description | Creates a silky-smooth base, minimizes the appearance of pores and fine lines, controls excess oil, and helps makeup stay fresh all day. |
| Benefits (box se) | Instantly Blurs Pores · Smooths Fine Lines · Visibly Minimizes Pores · Controls Excess Oil · Extends Makeup Wear · Helps Makeup Last Longer · Non-Comedogenic · Suitable for All Skin Types |
| Feature icons | Pore Blur · Oil Control · Long Lasting · Lightweight · All Skin Types |
| Badge | ⭐ Bestseller / Launch |

### 2. Noir Essence — Eau de Parfum *(dummy)*

| Field | Value |
|---|---|
| Category | Fragrance (Unisex) |
| Size | 50 ml |
| Price | MRP **₹1,999** → **₹1,299** (35% off) |
| Coupon | `SH7NOIR15` (15%) |
| Notes | Top: Black Pepper, Bergamot · Heart: Rose, Incense · Base: Oud, Black Amber, Musk |
| Longevity | 8–10 hours · Sillage: strong |
| Description | A dark, magnetic blend of oud and amber made for evening wear — bold, warm and unforgettable. |
| Image | `https://images.pexels.com/photos/11517300/pexels-photo-11517300.jpeg?auto=compress&cs=tinysrgb&w=800` |

### 3. Golden Oud — Eau de Parfum *(dummy)*

| Field | Value |
|---|---|
| Category | Fragrance (Men) |
| Size | 100 ml |
| Price | MRP **₹2,499** → **₹1,799** (28% off) |
| Coupon | `SH7GOLD10` (10%) |
| Notes | Top: Saffron, Cardamom · Heart: Leather, Cedar · Base: Oud, Vanilla, Tonka |
| Longevity | 10–12 hours |
| Description | Rich golden oud wrapped in saffron and leather — a signature scent for celebrations and power evenings. |
| Image | `https://images.pexels.com/photos/12456259/pexels-photo-12456259.jpeg?auto=compress&cs=tinysrgb&w=800` |

### 4. Lunar Nights — Eau de Parfum *(dummy)*

| Field | Value |
|---|---|
| Category | Fragrance (Women) |
| Size | 50 ml |
| Price | MRP **₹1,699** → **₹1,199** (29% off) |
| Coupon | `SH7LUNAR12` (12%) |
| Notes | Top: Lychee, Freesia · Heart: Jasmine, Peony · Base: Sandalwood, White Musk |
| Longevity | 7–9 hours · Soft, silky trail |
| Description | A moonlit floral — juicy fruits over jasmine and creamy sandalwood for graceful evenings. |
| Image | `https://images.pexels.com/photos/7850600/pexels-photo-7850600.jpeg?auto=compress&cs=tinysrgb&w=800` |

### 5. Amber Essence — Eau de Parfum *(dummy)*

| Field | Value |
|---|---|
| Category | Fragrance (Unisex) |
| Size | 50 ml |
| Price | MRP **₹1,299** → **₹899** (31% off) |
| Coupon | `SH7AMBER15` (15%) |
| Notes | Top: Mandarin, Honey · Heart: Amber, Cinnamon · Base: Benzoin, Musk |
| Longevity | 6–8 hours · Daily wear |
| Description | Sun-warmed amber and honey — a friendly everyday fragrance that works from office to evening. |
| Image | `https://images.pexels.com/photos/11711828/pexels-photo-11711828.jpeg?auto=compress&cs=tinysrgb&w=800` |

**Category mapping:** `makeup` → primer · `fragrance` → 4 perfumes · `skincare` → abhi khaali (nav me rakha hai, products aane par fill hoga)

---

## 🎟 Coupon Codes

> Engine rule: **ek order me sirf 1 coupon** (sitewide ya product-specific). Product coupon cart me item add hote hi hint ke roop me dikhega.

### Per-product coupons
| Code | Discount | Applies to | Min Order | Valid Till |
|---|---|---|---|---|
| `SH7PRIMER10` | 10% off | Invisible Blur Primer | ₹0 | Launch offer |
| `SH7NOIR15` | 15% off | Noir Essence | ₹0 | Launch offer |
| `SH7GOLD10` | 10% off | Golden Oud | ₹0 | Launch offer |
| `SH7LUNAR12` | 12% off | Lunar Nights | ₹0 | Launch offer |
| `SH7AMBER15` | 15% off | Amber Essence | ₹0 | Launch offer |

### Sitewide coupons
| Code | Discount | Applies to | Terms |
|---|---|---|---|
| `WELCOME10` | 10% off | poora order | First order only · max off ₹200 |
| `FREESHIP` | Free shipping | poora order | Min order ₹499 |
| `COMBO20` | 20% off | poora order | 3+ items in cart · max off ₹500 |

*(Dummy codes — Firestore `coupons` collection me active/inactive, expiry, usage-limit toggle hoga; admin panel se manage.)*

---

## 🖼 Images & Assets

### Product images (Pexels — free commercial license, no attribution needed)
| Product | URL |
|---|---|
| Primer (official) | `https://sevenheaven.co.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-9-2026-05_15_45-AM.png` |
| Noir Essence | `https://images.pexels.com/photos/11517300/pexels-photo-11517300.jpeg?auto=compress&cs=tinysrgb&w=800` |
| Golden Oud | `https://images.pexels.com/photos/12456259/pexels-photo-12456259.jpeg?auto=compress&cs=tinysrgb&w=800` |
| Lunar Nights | `https://images.pexels.com/photos/7850600/pexels-photo-7850600.jpeg?auto=compress&cs=tinysrgb&w=800` |
| Amber Essence | `https://images.pexels.com/photos/11711828/pexels-photo-11711828.jpeg?auto=compress&cs=tinysrgb&w=800` |

> Note: Unsplash/Google se direct scrape karna blocked hai license/safety reasons se — isliye **Pexels** (same free-license category) use kiya. Demo images hain, real product photos aane par `products.js` me replace ho jayengi.

### Hero / Banner images
| Use | URL |
|---|---|
| **Main hero** (dark leather + copy space) | `https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&w=1600` |
| First Collection teaser (official) | `https://sevenheaven.co.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-9-2026-05_15_45-AM.png` |
| Offer banner (gold, light theme section) | `https://images.pexels.com/photos/16722498/pexels-photo-16722498.jpeg?auto=compress&cs=tinysrgb&w=1200` |
| Category card — Fragrance | `https://images.pexels.com/photos/10924522/pexels-photo-10924522.jpeg?auto=compress&cs=tinysrgb&w=800` |

### Logo
| Use | Asset |
|---|---|
| Primary logo | `https://sevenheaven.co.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-9-2026-05_33_06-AM.png` (official rose-gold) |
| 7H typographic logo | SVG — design phase me banega (spec → Design Direction) |
| Favicon | `public/favicon.svg` ✅ |

---

## 🗄 Data Model (Firebase/Firestore)

```
products/{productId}
  name, slug, category(fragrance|makeup|skincare), size, price, mrp, discountPct,
  image, gallery[], description, shortDesc, benefits[], notes{top,heart,base},
  stock, badge(bestseller|new|sale), featured, rating, reviewsCount, active, createdAt

coupons/{code}
  type(percent|flat|freeShipping), value, appliesTo(productId|sitewide),
  minOrder, maxDiscount, usageLimit, usedCount, active, expiresAt

orders/{orderId}
  orderId(SH-YYMMDD-XXXX), userId|null, items[{productId,name,price,qty,image}],
  coupon{code,discount}|null, subtotal, discount, shipping, total,
  paymentMethod(razorpay|cod), paymentStatus(paid|pending|failed),
  status(placed|packed|shipped|delivered|cancelled),
  address{name,phone,email,line1,city,state,pincode}, placedAt, updatedAt

users/{uid}
  name, email, phone, addresses[], createdAt, role(customer|admin)

newsletter_subscribers/{autoId}   email, source, createdAt
contact_messages/{autoId}         name, email, subject, message, status(new|replied), createdAt
```

**Security rules (summary):**
- `products`, `coupons`: public **read**, **write** sirf admin
- `orders`: create — logged-in ya guest (server-side validate); read — apna order ya admin; update — sirf admin
- `users`: sirf apna doc (ya admin)
- `contact_messages` / `newsletter`: create public, read admin only
- Admin = Firebase custom claim `role: "admin"`

---

## 💳 Payments (Razorpay + COD)

### COD (phase 1 — bina KYC ke live)
1. Checkout → address → **COD** select → order doc Firestore me (`paymentStatus: pending`)
2. Admin panel se status manage → phone/WhatsApp confirm (+91 92325 61621)

### Razorpay (phase 2 — account KYC ke baad)
1. Checkout → **Razorpay** → `Razorpay Checkout` script load
2. Order create: **Firebase Cloud Function** `createRazorpayOrder` (amount ₹→paise, secure server-side)
3. Payment success → function verifies **signature** (HMAC-SHA256) → order `paymentStatus: paid`
4. Failure → toast + retry; webhook se final sync
5. **Secret keys sirf `.env` / Cloud Functions me** (client me kabhi nahi) — `.env` git-ignored ✅
6. Test mode (`rzp_test_*`) pehle chalega, live (`rzp_live_*`) KYC ke baad bina code change ke swap

### Stripe
Future/international — abhi skip (India customers ke liye Razorpay + COD kaafi).

---

## 🔐 Auth & Admin Panel

- **Firebase Auth**: Email/Password (register link + reset). Optional later: Google sign-in
- **Admin access**: user me custom claim `role: admin` (Firebase Console ya one-time script se set)
- Admin routes guarded — non-admin → redirect login
- Order placing ke liye login **optional** (guest checkout COD se start)

---

## 🌐 Language (Hindi/English)

- `LangContext` + `i18n/en.js`, `i18n/hi.js` — har UI string ka key
- Header me toggle `हिं / EN` — choice `localStorage` me save, default: English
- Content scope: nav, buttons, labels, messages, checkout flow (product descriptions English me rehne dete hain — brands aisa hi karte hain)

---

## 🚀 Deployment (Hostinger)

1. `npm run build` → `dist/` folder
2. Hostinger **File Manager** → `public_html/` me `dist/*` upload
3. `public/.htaccess` — SPA rewrite (har route `index.html` pe):
   - `RewriteEngine On` → non-file/non-dir → `index.html`
   - HTTPS redirect + gzip/cache headers
4. Domain `sevenheaven.co.in` already Hostinger par — DNS wahi rahega
5. Firebase Console me domain add (Auth allow list) + Razorpay allowed origin
6. **Live before Razorpay KYC:** COD live ✅ · products real photos ✅

---

## 🗺 Roadmap / Phases

| Phase | Kaam | Status |
|---|---|---|
| P0 | Repo clone + Vite/React scaffold + routing + base tokens | ✅ done (`5d5ed1f`) |
| P1 | **Detailed README** (this file) — architecture, data, coupons, assets | ✅ done |
| P2 | Design system complete: 7H SVG logo, header/ticker/footer, buttons/cards | ⬜ |
| P3 | Home page (hero, featured, offer banner, teaser, pillars, newsletter) | ⬜ |
| P4 | Shop + filters/search + Product detail + categories | ⬜ |
| P5 | Cart + Wishlist + Coupon engine (localStorage) | ⬜ |
| P6 | Firebase Auth → Account pages + Firestore orders | ⬜ |
| P7 | Checkout: COD first → Razorpay (test → live) | ⬜ |
| P8 | Admin panel (products/orders/coupons/messages) | ⬜ |
| P9 | Hindi/English switcher + SEO + legal pages + 404 | ⬜ |
| P10 | Hostinger deploy + `.htaccess` + domain live | ⬜ |

**Commit rule:** har change ke baad → `git add -A` + descriptive commit + `git push origin main`.
Format: `feat: ...`, `fix: ...`, `style: ...`, `docs: ...`, `chore: ...`

---

## 💻 Local Development

```bash
npm install       # dependencies
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # build preview
```

---

## 📌 Open Decisions (TODO)

- [ ] **Primer ka asli rate** — demo ₹699→₹499 rakha hai; actual MRP/sale price batao
- [ ] **Firebase project** — user bana raha hai (Google account) → `firebase.js` me config paste hoga
- [ ] **Razorpay KYC** — COD phase 1 me live, Razorpay baad me
- [ ] **COD phone number** — `+91 92325 61621` same rakhein? shipping charge (free/₹)?
- [ ] **Real product photos** — demo Pexels images replace karne hain
- [ ] **Logo finalization** — official PNG vs naya 7H SVG (dono ready kar sakte hain)
- [ ] **Newsletter backend** — Firestore me store ya Mailchimp/Brevo?

---

## 📜 Credits & License

- **Brand content/data:** © Seven Heaven Cosmetics (Bhopal) — purani site se reference
- **Demo images:** [Pexels License](https://www.pexels.com/license/) — free commercial use
- **Built with:** React · Vite · Firebase · Razorpay
- Repo: `github.com/codewithabhii1210/sevenheaven.`

*Beauty • Elegance • Confidence — Seven Heaven Cosmetics* ✦
