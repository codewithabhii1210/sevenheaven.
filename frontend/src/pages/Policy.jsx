import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Truck, Banknote, ShieldCheck, FileText, ArrowRight } from 'lucide-react'

const POLICIES = {
  '/shipping-policy': {
    icon: Truck,
    title: 'Shipping & Delivery Policy',
    intro:
      'Seven Heaven Cosmetics dispatches every order from our Bhopal atelier with tracked, insured delivery across India.',
    sections: [
      {
        heading: 'Free Delivery',
        body: 'All orders with a subtotal of ₹499 or more ship free anywhere in India. Orders below ₹499 are charged a flat ₹49 standard shipping fee.',
      },
      {
        heading: 'Dispatch Timeline',
        body: 'In-stock orders are packed within 24–48 working hours (Mon–Sat). You receive a tracking update on your registered phone/email once the parcel is handed to the courier.',
      },
      {
        heading: 'Delivery Estimates',
        body: 'Metro cities: 2–4 working days. Other serviceable pincodes: 3–7 working days. Remote locations may take slightly longer. Estimates begin from the dispatch date, not the order date.',
      },
      {
        heading: 'Serviceable Pincodes',
        body: 'We deliver to all serviceable Indian pincodes. You can check serviceability on any product page using the Pincode Checker before placing your order.',
      },
      {
        heading: 'Delays & Support',
        body: 'Weather, courier strikes or festive backlogs can occasionally cause delays. Write to sevenheavencosmetics@gmail.com or call +91 92019 91418 and our concierge will track it for you.',
      },
    ],
  },
  '/cod-policy': {
    icon: Banknote,
    title: 'Cash on Delivery (COD) Policy',
    intro:
      'Prefer to pay only when your parcel reaches you? Cash on Delivery is available across serviceable Indian pincodes.',
    sections: [
      {
        heading: 'COD Handling Fee',
        body: 'A flat ₹25 handling fee applies to every Cash on Delivery order. This fee is shown in the order summary before you confirm — no surprises at the door.',
      },
      {
        heading: 'How to Pay',
        body: 'Pay the courier in cash, or by UPI on delivery where the courier supports it. Please keep the exact amount ready where possible.',
      },
      {
        heading: 'Verification',
        body: 'For COD orders our team may call you once to confirm the order before dispatch. Unconfirmed orders may be held to protect you from fraudulent purchases.',
      },
      {
        heading: 'Returns on COD',
        body: 'Refunds for returned COD orders are processed to your bank account via bank transfer after the parcel reaches our atelier and passes quality checks. Kindly share your bank details with our concierge for the refund.',
      },
    ],
  },
  '/privacy-policy': {
    icon: ShieldCheck,
    title: 'Privacy Policy',
    intro:
      'Your trust is our finest ingredient. This policy explains what we collect and how we protect it.',
    sections: [
      {
        heading: 'What We Collect',
        body: 'Name, delivery address, phone number, email, order history, and — for registered patrons — your saved addresses. Payment card/UPI details are never stored on our servers; online payments are processed by Razorpay in full PCI-DSS compliance.',
      },
      {
        heading: 'How We Use It',
        body: 'Only to fulfil your orders, deliver your parcels, respond to your concierge requests, and (with your consent) send VIP offers via newsletter or WhatsApp.',
      },
      {
        heading: 'What We Never Do',
        body: 'We never sell, rent or trade your personal data to third parties. Coupons fraud and abuse are tracked strictly by hashed/limited identifiers.',
      },
      {
        heading: 'Security',
        body: 'Traffic is encrypted with HTTPS/TLS, passwords are stored only as bcrypt hashes, and access to order data is restricted to authenticated patrons and the store administrator.',
      },
      {
        heading: 'Your Rights',
        body: 'You may request correction or deletion of your account data any time at sevenheavencosmetics@gmail.com or +91 92019 91418.',
      },
    ],
  },
  '/terms': {
    icon: FileText,
    title: 'Terms & Conditions',
    intro: 'By shopping at sevenheaven.co.in you agree to the following fair-trade terms.',
    sections: [
      {
        heading: 'Products & Pricing',
        body: 'All prices are listed in Indian Rupees (₹) and include GST. Product colours may vary slightly from screen to screen due to display calibration — our handcrafted batches also vary naturally in shade and fragrance depth.',
      },
      {
        heading: 'Orders',
        body: 'An order is confirmed only after our system accepts it (you receive an order number starting with SH-). We may cancel and refund orders flagged as fraudulent or out of stock, with a full explanation.',
      },
      {
        heading: 'Payments',
        body: 'We accept Cash on Delivery (₹25 fee) and online payments via Razorpay (UPI, cards, net banking). Online payments are marked paid only after server-side signature verification.',
      },
      {
        heading: 'Returns & Refunds',
        body: 'For hygiene reasons, opened cosmetics and perfumes cannot be returned. Unopened, sealed products in original condition may be reported within 7 days of delivery for replacement or refund after quality inspection.',
      },
      {
        heading: 'Contact',
        body: 'Seven Heaven Cosmetics, Bhopal, Madhya Pradesh. sevenheavencosmetics@gmail.com · +91 92019 91418.',
      },
    ],
  },
}

export default function Policy() {
  const location = useLocation()
  const policy = POLICIES[location.pathname]

  useEffect(() => {
    document.title = `${policy?.title || 'Policy'} | Seven Heaven Cosmetics`
    window.scrollTo(0, 0)
  }, [location.pathname, policy])

  if (!policy) {
    return (
      <div className="container policy-page">
        <div className="policy-card">
          <h1 className="policy-title">Policy Not Found</h1>
          <Link to="/" className="btn btn-gold-outline">
            Return Home <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const Icon = policy.icon

  return (
    <div className="container policy-page">
      <article className="policy-card">
        <header className="policy-header">
          <Icon size={34} className="gold-text" />
          <h1 className="policy-title">{policy.title}</h1>
          <p className="policy-intro">{policy.intro}</p>
        </header>

        <div className="policy-sections">
          {policy.sections.map((s) => (
            <section key={s.heading} className="policy-section">
              <h2 className="policy-section-title">{s.heading}</h2>
              <p className="policy-section-body">{s.body}</p>
            </section>
          ))}
        </div>

        <footer className="policy-footer">
          <span>Last updated: October 2026</span>
          <Link to="/contact-us" className="policy-contact-link">
            Questions? Contact Concierge <ArrowRight size={14} />
          </Link>
        </footer>
      </article>
    </div>
  )
}
