import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    // Nav
    home: 'Home',
    shop: 'Shop All',
    perfumes: 'Perfumes',
    primer: 'Primer',
    about: 'Our Story',
    contact: 'Contact',
    account: 'Account',
    wishlist: 'Wishlist',
    cart: 'Cart',
    admin: 'Admin Panel',

    // Ticker
    tickerFreeShipping: '✦ FREE SHIPPING ON ORDERS ABOVE ₹499',
    tickerCod: '✦ CASH ON DELIVERY AVAILABLE ACROSS INDIA',
    tickerLuxury: '✦ 100% AUTHENTIC LUXURY INGREDIENTS',
    tickerCoupon: '✦ USE CODE WELCOME10 FOR 10% OFF',

    // Common actions
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    outOfStock: 'Out of Stock',
    viewDetails: 'View Details',
    applyCoupon: 'Apply',
    remove: 'Remove',
    checkout: 'Proceed to Checkout',
    emptyCart: 'Your Cart is Empty',
    exploreShop: 'Explore Catalog',
    saveDiscount: 'Save',
    taxInclusive: 'Inclusive of all taxes',
    freeShippingBadge: 'Free Delivery',
    codAvailableBadge: 'COD Available',

    // Sections
    featuredCollection: 'Curated Elegance',
    featuredMainHeading: 'Beauty Beyond Imagination',
    featuredSubtitle: 'Handcrafted fragrances and professional skin perfecting primer',
    allProducts: 'All Creations',
    shopByOccasion: 'Shop by Occasion',
    reviewsTitle: 'Echoes of Luxury',
    reviewsSubtitle: 'Real experiences from patrons who embrace elegance',
    vipJoin: 'Join the VIP Circle',
    vipSubtitle: 'Be the first to know about private reserves, seasonal launches & bespoke privileges.',
    subscribe: 'Subscribe',

    // Cart Drawer
    yourBag: 'Your Shopping Bag',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'FREE',
    grandTotal: 'Grand Total',
    unlockedFreeShip: '🎉 You have unlocked FREE Shipping!',
    addMoreFreeShip: 'Add ₹{amount} more to unlock FREE shipping!',
  },
  hi: {
    // Nav
    home: 'होम',
    shop: 'सभी उत्पाद',
    perfumes: 'परफ्यूम',
    primer: 'प्राइमर',
    about: 'हमारी कहानी',
    contact: 'संपर्क',
    account: 'खाता',
    wishlist: 'विशलिस्ट',
    cart: 'बैग',
    admin: 'एडमिन पैनल',

    // Ticker
    tickerFreeShipping: '✦ ₹499 से अधिक के ऑर्डर पर मुफ़्त डिलीवरी',
    tickerCod: '✦ पूरे भारत में कैश ऑन डिलीवरी (COD) उपलब्ध',
    tickerLuxury: '✦ 100% असली व प्रीमियम सामग्री',
    tickerCoupon: '✦ 10% छूट के लिए कोड WELCOME10 उपयोग करें',

    // Common actions
    addToCart: 'बैग में जोड़ें',
    buyNow: 'अभी खरीदें',
    outOfStock: 'स्टॉक में नहीं',
    viewDetails: 'विवरण देखें',
    applyCoupon: 'लागू करें',
    remove: 'हटाएं',
    checkout: 'चेकआउट करें',
    emptyCart: 'आपकी बैग खाली है',
    exploreShop: 'उत्पाद देखें',
    saveDiscount: 'बचत',
    taxInclusive: 'सभी कर सहित (GST)',
    freeShippingBadge: 'मुफ़्त डिलीवरी',
    codAvailableBadge: 'कैश ऑन डिलीवरी',

    // Sections
    featuredCollection: 'शाही संग्रह',
    featuredMainHeading: 'कल्पना से परे सौंदर्य',
    featuredSubtitle: 'हाथों से तैयार परफ्यूम और पेशेवर स्किन ब्लर प्राइमर',
    allProducts: 'सभी कृतियाँ',
    shopByOccasion: 'अवसर के अनुसार चुनें',
    reviewsTitle: 'ग्राहकों की आवाज़',
    reviewsSubtitle: 'सेवन हेवन के संतुष्ट संरक्षकों के अनुभव',
    vipJoin: 'वीआईपी क्लब में शामिल हों',
    vipSubtitle: 'नए लॉन्च और खास छूट की जानकारी सबसे पहले अपने इनबॉक्स में पाएं।',
    subscribe: 'सदस्यता लें',

    // Cart Drawer
    yourBag: 'आपकी शॉपिंग बैग',
    subtotal: 'उपकुल',
    shipping: 'डिलीवरी शुल्क',
    free: 'मुफ़्त',
    grandTotal: 'कुल योग',
    unlockedFreeShip: '🎉 आपको मुफ़्त डिलीवरी मिल गई है!',
    addMoreFreeShip: 'मुफ़्त डिलीवरी के लिए ₹{amount} और जोड़ें!',
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sh7_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('sh7_lang', lang)
  }, [lang])

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'))
  }

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations.en[key] || key
    Object.keys(params).forEach((p) => {
      str = str.replace(`{${p}}`, params[p])
    })
    return str
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
