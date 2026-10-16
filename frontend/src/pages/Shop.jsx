import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { api } from '../services/api.js'
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react'

export default function Shop() {
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedFamily, setSelectedFamily] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [priceMax, setPriceMax] = useState(3000)
  const [sortBy, setSortBy] = useState('featured')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .getProducts()
      .then((data) => {
        setProductsList(data || [])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Sync with URL query params
  useEffect(() => {
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    if (cat) setSelectedCategory(cat)
    if (search) setSearchQuery(search)
  }, [searchParams])

  // Extract available fragrance families
  const fragranceFamilies = useMemo(() => {
    const set = new Set()
    productsList.forEach((p) => {
      if (p.notes?.heart) p.notes.heart.forEach((n) => set.add(n))
      if (p.notes?.base) p.notes.base.forEach((n) => set.add(n))
    })
    return Array.from(set)
  }, [productsList])

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchCategory = p.category.toLowerCase().includes(q)
        const matchDesc = p.shortDesc?.toLowerCase().includes(q)
        const matchNotes =
          p.notes &&
          Object.values(p.notes)
            .flat()
            .some((n) => n.toLowerCase().includes(q))
        if (!matchName && !matchCategory && !matchDesc && !matchNotes) return false
      }

      // 2. Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false
      }

      // 3. Fragrance Note / Family
      if (selectedFamily !== 'all') {
        const hasNote =
          p.notes &&
          Object.values(p.notes)
            .flat()
            .includes(selectedFamily)
        if (!hasNote) return false
      }

      // 4. Gender (benefits or description check)
      if (selectedGender !== 'all') {
        const genderText = (p.benefits || []).join(' ').toLowerCase() + ' ' + (p.description || '').toLowerCase()
        if (selectedGender === 'unisex' && !genderText.includes('unisex')) return false
        if (selectedGender === 'men' && !genderText.includes('men')) return false
        if (selectedGender === 'women' && !genderText.includes('women')) return false
      }

      // 5. Price Max
      if (p.price > priceMax) return false

      return true
    })
  }, [productsList, searchQuery, selectedCategory, selectedFamily, selectedGender, priceMax])

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price)
      case 'rating':
        return list.sort((a, b) => (b.rating || 5) - (a.rating || 5))
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      case 'featured':
      default:
        return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }
  }, [filteredProducts, sortBy])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedFamily('all')
    setSelectedGender('all')
    setPriceMax(3000)
    setSortBy('featured')
    setSearchParams({})
  }

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedFamily !== 'all' ||
    selectedGender !== 'all' ||
    priceMax < 3000

  return (
    <div className="shop-page">
      {/* Shop Header Banner */}
      <section className="shop-hero-banner">
        <div className="container shop-hero-inner">
          <span className="eyebrow">HAUTE PARFUMERIE & COMPLEXION</span>
          <h1 className="shop-hero-title">The Complete Archive</h1>
          <p className="shop-hero-sub">
            Explore our limited-batch luxury fragrances and the signature Invisible Blur Primer.
            Every creation is hand-crafted and sealed in Bhopal, MP.
          </p>
        </div>
      </section>

      <div className="container shop-layout-container">
        {/* Top Control Bar: Search, Result Count, Sort, Mobile Filter Toggle */}
        <div className="shop-control-bar">
          <div className="shop-search-wrap">
            <Search size={18} className="shop-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, notes (oud, amber, rose)..."
              className="shop-search-input"
              aria-label="Filter products"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="shop-search-clear"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="shop-control-right">
            <span className="products-count-badge">
              Showing <strong>{sortedProducts.length}</strong> of {productsList.length} creations
            </span>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="btn btn-gold-outline btn-sm mobile-filter-btn"
            >
              <SlidersHorizontal size={14} />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <ArrowUpDown size={15} className="sort-icon gold-text" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
                aria-label="Sort products by"
              >
                <option value="featured">Sort: Featured Collection</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="active-filters-row">
            <span className="active-filters-label">Active Filters:</span>
            {searchQuery && (
              <span className="filter-pill">
                Keyword: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')}>×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="filter-pill">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}>×</button>
              </span>
            )}
            {selectedFamily !== 'all' && (
              <span className="filter-pill">
                Note: {selectedFamily}
                <button onClick={() => setSelectedFamily('all')}>×</button>
              </span>
            )}
            {selectedGender !== 'all' && (
              <span className="filter-pill">
                Gender: {selectedGender}
                <button onClick={() => setSelectedGender('all')}>×</button>
              </span>
            )}
            {priceMax < 3000 && (
              <span className="filter-pill">
                Under ₹{priceMax}
                <button onClick={() => setPriceMax(3000)}>×</button>
              </span>
            )}
            <button onClick={clearAllFilters} className="clear-all-btn">
              Clear All
            </button>
          </div>
        )}

        <div className="shop-main-grid-wrap">
          {/* Sidebar Filters (Desktop) */}
          <aside className="shop-sidebar-desktop">
            <div className="sidebar-sticky-wrap">
              <div className="sidebar-header">
                <div className="sidebar-title">
                  <Filter size={16} className="gold-text" />
                  <span>Refine Catalog</span>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="sidebar-reset-btn">
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Category Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Collection Category</h4>
                <div className="filter-options">
                  <label className="filter-radio-label">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                    />
                    <span>All Collections</span>
                    <span className="count-pill">({productsList.length})</span>
                  </label>
                  <label className="filter-radio-label">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'fragrance'}
                      onChange={() => setSelectedCategory('fragrance')}
                    />
                    <span>Haute Perfumes</span>
                    <span className="count-pill">
                      ({productsList.filter((p) => p.category === 'fragrance').length})
                    </span>
                  </label>
                  <label className="filter-radio-label">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'makeup'}
                      onChange={() => setSelectedCategory('makeup')}
                    />
                    <span>Complexion & Primer</span>
                    <span className="count-pill">
                      ({productsList.filter((p) => p.category === 'makeup').length})
                    </span>
                  </label>
                </div>
              </div>

              {/* 2. Price Range Filter */}
              <div className="filter-group">
                <div className="price-filter-header">
                  <h4 className="filter-group-title">Maximum Price</h4>
                  <span className="price-display-val">₹{priceMax}</span>
                </div>
                <input
                  type="range"
                  min="499"
                  max="3000"
                  step="100"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-range-labels">
                  <span>₹499 (Primer)</span>
                  <span>₹3,000</span>
                </div>
              </div>

              {/* 3. Gender / Profile Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Audience Profile</h4>
                <div className="filter-options">
                  {['all', 'unisex', 'men', 'women'].map((gender) => (
                    <label key={gender} className="filter-radio-label">
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === gender}
                        onChange={() => setSelectedGender(gender)}
                      />
                      <span style={{ textTransform: 'capitalize' }}>
                        {gender === 'all' ? 'All Genders / Unisex' : gender}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Fragrance Notes Filter */}
              {fragranceFamilies.length > 0 && (
                <div className="filter-group">
                  <h4 className="filter-group-title">Key Olfactory Notes</h4>
                  <div className="notes-tag-cloud">
                    <button
                      onClick={() => setSelectedFamily('all')}
                      className={`note-filter-tag ${selectedFamily === 'all' ? 'active' : ''}`}
                    >
                      All Notes
                    </button>
                    {fragranceFamilies.map((note) => (
                      <button
                        key={note}
                        onClick={() => setSelectedFamily(note)}
                        className={`note-filter-tag ${selectedFamily === note ? 'active' : ''}`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bhopal Dispatch Guarantee Box */}
              <div className="sidebar-perk-box">
                <Sparkles size={16} className="gold-text" />
                <p>
                  <strong>Direct Bhopal Dispatch:</strong> All orders are double-boxed with velvet
                  packaging and shipped via express courier.
                </p>
              </div>
            </div>
          </aside>

          {/* Product Cards Grid Area */}
          <main className="shop-products-area">
            {loading ? (
              <div className="shop-loading-state">
                <Sparkles size={32} className="gold-text spinning" />
                <p>Curating your luxury collection...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="shop-empty-state">
                <Sparkles size={40} className="gold-text" />
                <h3>No creations matched your criteria</h3>
                <p>Try resetting your price slider or search keyword.</p>
                <button onClick={clearAllFilters} className="btn btn-gold btn-sm">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="shop-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-in Modal */}
      {isMobileFilterOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileFilterOpen(false)}>
          <aside className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-top">
              <h3>Filters & Sorting</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mobile-filters-body" style={{ padding: '1rem', overflowY: 'auto' }}>
              <div className="filter-group">
                <h4 className="filter-group-title">Collection</h4>
                {['all', 'fragrance', 'makeup'].map((cat) => (
                  <label key={cat} className="filter-radio-label">
                    <input
                      type="radio"
                      name="m-cat"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>
                      {cat === 'all' ? 'All Collections' : cat}
                    </span>
                  </label>
                ))}
              </div>

              <div className="filter-group" style={{ marginTop: '1.5rem' }}>
                <h4 className="filter-group-title">Max Price: ₹{priceMax}</h4>
                <input
                  type="range"
                  min="499"
                  max="3000"
                  step="100"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={clearAllFilters}
                  className="btn btn-gold-outline btn-block"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="btn btn-gold btn-block"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
