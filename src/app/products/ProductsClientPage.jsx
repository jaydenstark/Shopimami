'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense, useMemo } from 'react';
import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import Toast from '../../components/ui/Toast';
import FloatingContact from '../../components/layout/FloatingContact';
import ProductCard from '../../components/shop/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';

// Helper to classify size strings into Small, Medium, Large, and Industrial buckets
const classifySize = (sizeStr) => {
  const str = sizeStr.toLowerCase().trim();
  if (str.includes('ml')) {
    const num = parseFloat(str) || 0;
    return num < 1500 ? 'Small' : 'Medium';
  }
  if (
    str.includes('ibc') || 
    str.includes('bulk') || 
    str.includes('drum') || 
    str.includes('200l') || 
    str.includes('1000l') || 
    str.includes('ton')
  ) {
    return 'Industrial';
  }
  const numMatch = str.match(/[\d.]+/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    if (num <= 1.5) return 'Small';
    if (num <= 3) return 'Medium';
    if (num <= 5) return 'Large';
    return 'Industrial';
  }
  return 'Small';
};

function ProductsContent({ initialProducts }) {
  const searchParams = useSearchParams();
  const searchParamStr = searchParams ? searchParams.toString() : '';
  const [prevSearchParamStr, setPrevSearchParamStr] = useState(searchParamStr);

  const { products, isLoaded } = useProducts(initialProducts);
  const { cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart, clearCart, toastMessage, setToastMessage } = useCart();

  // Component-level States
  const [searchTerm, setSearchTerm] = useState(() => {
    const s = searchParams?.get('search');
    return s ? decodeURIComponent(s) : '';
  });

  const [selectedCategories, setSelectedCategories] = useState(() => {
    const catQuery = searchParams?.get('category');
    if (!catQuery) return [];
    const decodedCat = decodeURIComponent(catQuery).toLowerCase();
    const cats = Array.from(new Set(initialProducts.map((p) => p.category).filter(Boolean)));
    const matched = cats.find((c) => c.toLowerCase() === decodedCat);
    if (matched) return [matched];
    const normalized = decodedCat.replace(/-/g, ' ');
    const fuzzyMatched = cats.find(
      (c) => c.toLowerCase().includes(normalized) || normalized.includes(c.toLowerCase())
    );
    if (fuzzyMatched) return [fuzzyMatched];
    return [];
  });

  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null); // For Details Modal
  const [selectedProductSize, setSelectedProductSize] = useState(null);

  // 1. Enrich catalog products client-side deterministically based on product name hash
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Rating: between 4.0 and 5.0
      const rating = (4.0 + (hash % 11) / 10).toFixed(1);
      
      // Popularity score: view counts between 12 and 240
      const popularity = 12 + (hash % 229);
      
      // Created Date: mock timestamps up to 30 days ago from a fixed base (May 21, 2026)
      const baseTime = 1779321600000;
      const daysAgo = hash % 30;
      const date = new Date(baseTime - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      // Availability: 90% In Stock, 5% Direct Manufacture, 5% Bulk Solutions
      let availability = 'In Stock';
      if (hash % 10 === 0) {
        availability = 'Direct Manufacture';
      } else if (hash % 15 === 0) {
        availability = 'Bulk Solutions';
      }

      return {
        ...p,
        rating: parseFloat(rating),
        popularity,
        date,
        availability
      };
    });
  }, [products]);

  // 2. Extract unique categories dynamically from enriched products
  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(enrichedProducts.map((p) => p.category).filter(Boolean))
    ).sort();
  }, [enrichedProducts]);

  // 3. Render-phase state synchronization from URL query parameters when they change
  if (searchParamStr !== prevSearchParamStr) {
    setPrevSearchParamStr(searchParamStr);
    
    // Sync search term
    const s = searchParams?.get('search');
    setSearchTerm(s ? decodeURIComponent(s) : '');
    
    // Sync category
    const catQuery = searchParams?.get('category');
    if (catQuery) {
      const decodedCat = decodeURIComponent(catQuery).toLowerCase();
      const matched = uniqueCategories.find((c) => c.toLowerCase() === decodedCat);
      if (matched) {
        setSelectedCategories([matched]);
      } else {
        const normalized = decodedCat.replace(/-/g, ' ');
        const fuzzyMatched = uniqueCategories.find(
          (c) => c.toLowerCase().includes(normalized) || normalized.includes(c.toLowerCase())
        );
        if (fuzzyMatched) {
          setSelectedCategories([fuzzyMatched]);
        } else {
          setSelectedCategories([]);
        }
      }
    } else {
      setSelectedCategories([]);
    }
  }

  // 4. Checkbox Toggle Handlers
  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handlePriceToggle = (range) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const handleSizeToggle = (sizeGroup) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeGroup) ? prev.filter((s) => s !== sizeGroup) : [...prev, sizeGroup]
    );
  };

  const handleAvailabilityToggle = (avail) => {
    setSelectedAvailabilities((prev) =>
      prev.includes(avail) ? prev.filter((a) => a !== avail) : [...prev, avail]
    );
  };

  const handleRatingToggle = (score) => {
    setSelectedRatings((prev) =>
      prev.includes(score) ? prev.filter((r) => r !== score) : [...prev, score]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedSizes([]);
    setSelectedAvailabilities([]);
    setSelectedRatings([]);
    setSearchTerm('');
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedSizes.length > 0 ||
    selectedAvailabilities.length > 0 ||
    selectedRatings.length > 0 ||
    searchTerm !== '';

  // 5. Category Counts Helper
  const getCategoryCount = (catName) => {
    return enrichedProducts.filter((p) => p.category === catName).length;
  };

  // 6. Filtration Pipeline
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter((p) => {
      // Search matching
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Category matching (OR logic)
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }

      // Price range matching (OR logic)
      if (selectedPriceRanges.length > 0) {
        const startingPrice = p.sizes[0]?.price || 0;
        const matchesPrice = selectedPriceRanges.some((range) => {
          if (range === 'under-50') return startingPrice < 5;
          if (range === '50-150') return startingPrice >= 5 && startingPrice <= 150;
          if (range === '150-300') return startingPrice >= 150 && startingPrice <= 300;
          if (range === 'over-300') return startingPrice > 300;
          return false;
        });
        if (!matchesPrice) return false;
      }

      // Size matching (checks if ANY size fits the selected filters)
      if (selectedSizes.length > 0) {
        const matchesSize = p.sizes.some((s) => {
          const classified = classifySize(s.size);
          return selectedSizes.includes(classified);
        });
        if (!matchesSize) return false;
      }

      // Availability matching (OR logic)
      if (selectedAvailabilities.length > 0 && !selectedAvailabilities.includes(p.availability)) {
        return false;
      }

      // Rating matching (matches minimum selected rating)
      if (selectedRatings.length > 0) {
        const minRequired = Math.min(...selectedRatings.map(Number));
        if (p.rating < minRequired) return false;
      }

      return true;
    });
  }, [enrichedProducts, searchTerm, selectedCategories, selectedPriceRanges, selectedSizes, selectedAvailabilities, selectedRatings]);

  // 7. Sorting Pipeline
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'popular') {
        return b.popularity - a.popularity;
      }
      if (sortBy === 'price-asc') {
        return (a.sizes[0]?.price || 0) - (b.sizes[0]?.price || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.sizes[0]?.price || 0) - (a.sizes[0]?.price || 0);
      }
      if (sortBy === 'best-rated') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setSelectedProductSize(product.sizes[0]);
  };

  const closeDetailsModal = () => {
    setSelectedProduct(null);
    setSelectedProductSize(null);
  };

  const renderStars = (score) => {
    const rounded = Math.round(score);
    return (
      <span style={{ color: '#F59E0B', display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>
    );
  };

  // 8. Shared Sidebar Filter View
  const renderSidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Dynamic Categories */}
      <div>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Categories</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {uniqueCategories.map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            const count = getCategoryCount(cat);
            return (
              <label key={cat} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryToggle(cat)}
                />
                <span className="checkmark"></span>
                <span style={{ flexGrow: 1, fontWeight: isChecked ? 600 : 400, color: isChecked ? 'var(--secondary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                  {cat}
                </span>
                <span className="count-bubble" style={{
                  background: isChecked ? 'rgba(43, 140, 138, 0.15)' : '#f1f5f9',
                  color: isChecked ? 'var(--secondary)' : 'var(--text-muted)'
                }}>
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Ranges */}
      <div>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Price</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Under GH₵ 50', value: 'under-50' },
            { label: 'GH₵ 50 - 150', value: '50-150' },
            { label: 'GH₵ 150 - 300', value: '150-300' },
            { label: 'Over GH₵ 300', value: 'over-300' }
          ].map((range) => {
            const isChecked = selectedPriceRanges.includes(range.value);
            return (
              <label key={range.value} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handlePriceToggle(range.value)}
                />
                <span className="checkmark"></span>
                <span style={{ fontWeight: isChecked ? 600 : 400, color: isChecked ? 'var(--secondary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Volume / Size */}
      <div>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Size</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Small', desc: 'up to 1.5L', value: 'Small' },
            { label: 'Medium', desc: '1.5L to 3L', value: 'Medium' },
            { label: 'Large', desc: '4L to 5L', value: 'Large' },
            { label: 'Industrial', desc: 'Bulk & Drums', value: 'Industrial' }
          ].map((sizeOpt) => {
            const isChecked = selectedSizes.includes(sizeOpt.value);
            return (
              <label key={sizeOpt.value} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleSizeToggle(sizeOpt.value)}
                />
                <span className="checkmark"></span>
                <span style={{ fontWeight: isChecked ? 600 : 400, color: isChecked ? 'var(--secondary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                  {sizeOpt.label} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({sizeOpt.desc})</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Availability</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'In Stock', color: '#22c55e', value: 'In Stock' },
            { label: 'Direct Manufacture', color: '#f59e0b', value: 'Direct Manufacture' },
            { label: 'Bulk Solutions', color: '#3b82f6', value: 'Bulk Solutions' }
          ].map((availOpt) => {
            const isChecked = selectedAvailabilities.includes(availOpt.value);
            return (
              <label key={availOpt.value} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAvailabilityToggle(availOpt.value)}
                />
                <span className="checkmark"></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: availOpt.color }}></span>
                  <span style={{ fontWeight: isChecked ? 600 : 400, color: isChecked ? 'var(--secondary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                    {availOpt.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating Stars */}
      <div>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Rating</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: '★★★★★', score: '5' },
            { label: '★★★★☆ & up', score: '4' },
            { label: '★★★☆☆ & up', score: '3' }
          ].map((ratingOpt) => {
            const isChecked = selectedRatings.includes(ratingOpt.score);
            return (
              <label key={ratingOpt.score} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleRatingToggle(ratingOpt.score)}
                />
                <span className="checkmark"></span>
                <span style={{ color: '#F59E0B', fontSize: '0.9rem', fontWeight: isChecked ? 700 : 400, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {ratingOpt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={cartItems.length} onCartClick={() => setIsCartOpen(true)} />

      <main style={{ flexGrow: 1, background: '#f8fafc', paddingBottom: '100px' }}>
        {/* Marketplace Banner */}
        <section style={{
          background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
          color: 'white',
          padding: '70px 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(43,140,138,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div className="container">
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2.5px' }}>
              Neat Brand Trade
            </span>
            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', marginTop: '0.5rem', fontWeight: 800 }}>
              Premium Chemical Marketplace
            </h1>
            <p style={{ maxWidth: '600px', margin: '15px auto 0', opacity: 0.85, fontSize: '1.05rem', lineHeight: '1.6' }}>
              Explore our laboratory-certified formulations. Order high-efficiency retail packages or customize massive bulk volumes with complete compliance safety sheets.
            </p>
          </div>
        </section>

        {/* E-Commerce Grid Container */}
        <section className="container" style={{ marginTop: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', alignItems: 'start' }} className="products-layout-grid">
            
            {/* Desktop Left Sidebar Filters */}
            <aside className="desktop-sidebar" style={{
              background: 'white',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '100px',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800 }}>Sidebar Filters</h3>
                {hasActiveFilters && (
                  <button 
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {renderSidebarContent()}

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '24px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                💡 <strong>Need massive custom batches?</strong> Explore our <a href="/bulk-orders" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'underline' }}>Bulk Orders</a> portal for custom concentration quotes.
              </div>
            </aside>

            {/* Catalog Grid Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Top Panel: Search, Sort, Mobile Toggler */}
              <div style={{
                background: 'white',
                padding: '16px 24px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px', minWidth: '260px' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search Products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.25s, box-shadow 0.25s'
                    }}
                    className="search-input-field"
                  />
                </div>

                {/* Sort & Mobile Toggler Container */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  
                  {/* Mobile Filters Trigger */}
                  <button
                    className="mobile-filters-btn btn btn-outline"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    style={{
                      display: 'none',
                      padding: '10px 18px',
                      fontSize: '0.85rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ⚙️ Filter & Sort {hasActiveFilters && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></span>}
                  </button>

                  {/* Sort Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: 'white',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        outline: 'none',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <option value="popular">Popular</option>
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="best-rated">Best Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Tags (Visual feedback) */}
              {hasActiveFilters && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Filters:</span>
                  
                  {selectedCategories.map(c => (
                    <span key={c} className="filter-pill">
                      {c} <button onClick={() => handleCategoryToggle(c)}>×</button>
                    </span>
                  ))}
                  
                  {selectedPriceRanges.map(pr => (
                    <span key={pr} className="filter-pill">
                      {pr === 'under-50' ? 'Under GH₵ 50' : pr === '50-150' ? 'GH₵ 50-150' : pr === '150-300' ? 'GH₵ 150-300' : 'Over GH₵ 300'} 
                      <button onClick={() => handlePriceToggle(pr)}>×</button>
                    </span>
                  ))}

                  {selectedSizes.map(sz => (
                    <span key={sz} className="filter-pill">
                      Size: {sz} <button onClick={() => handleSizeToggle(sz)}>×</button>
                    </span>
                  ))}

                  {selectedAvailabilities.map(av => (
                    <span key={av} className="filter-pill">
                      {av} <button onClick={() => handleAvailabilityToggle(av)}>×</button>
                    </span>
                  ))}

                  {selectedRatings.map(rt => (
                    <span key={rt} className="filter-pill">
                      {rt}+ Stars <button onClick={() => handleRatingToggle(rt)}>×</button>
                    </span>
                  ))}

                  <button 
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline'
                    }}
                  >
                    Reset all
                  </button>
                </div>
              )}

              {/* Status statistics */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Showing <strong>{sortedProducts.length}</strong> matching formulations in database
              </div>

              {/* Products Catalog Display Grid */}
              {!isLoaded ? (
                <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--secondary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading certified formulations...</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '3rem' }}>🔬</span>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginTop: '15px', marginBottom: '8px', fontWeight: 800 }}>No Products Match Your Criteria</h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    We couldn't find any products matching your search term or active filters. Try expanding your search queries or resetting filters.
                  </p>
                  <button
                    className="btn btn-outline"
                    onClick={handleClearAll}
                    style={{ padding: '10px 24px', fontSize: '0.88rem', borderRadius: '10px' }}
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                <div className="product-grid" style={{ gap: '26px' }}>
                  {sortedProducts.map((p) => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onAddToCart={addToCart} 
                      onViewDetails={openDetailsModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B2339', color: '#cbd5e1', padding: '80px 0 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 800 }}>NEAT BRAND TRADE</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Your global partner in chemical distribution and custom manufacturing. 
              Specializing in high-efficiency active ratios, food-grade formulations, and clinical-safe sanitizers.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>Brands</h4>
            <ul style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li>✨ Deva Products</li>
              <li>🧪 Neat Product</li>
              <li>🌍 NBT Global</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>Solutions</h4>
            <ul style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li>🧪 Industrial Cleaning</li>
              <li>🏠 Household Cleaning</li>
              <li>✨ Hygiene & Sanitization</li>
              <li>📦 Bulk Distribution</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>Portals</h4>
            <ul style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li><a href="/admin" style={{ color: 'var(--secondary)', fontWeight: 600 }}>👤 Admin Portal</a></li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: '#64748b' }}>
          <span>
            © 2026 Neat Brand Trade (NBT). All Rights Reserved<a href="/admin" style={{ color: 'inherit', cursor: 'default', textDecoration: 'none', userSelect: 'none', display: 'inline-block', padding: '12px 10px', margin: '-12px -10px', position: 'relative', zIndex: 10 }}>.</a>
          </span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="/admin" style={{ textDecoration: 'none' }}>
              <span 
                className="btn" 
                style={{ 
                  padding: '8px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.85rem', 
                  borderRadius: '20px', 
                  color: '#cbd5e1', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--secondary)';
                  e.currentTarget.style.borderColor = 'var(--secondary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                👤 Admin
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />

      <Toast 
        isOpen={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage('')}
        onViewCart={() => {
          setToastMessage('');
          setIsCartOpen(true);
        }}
      />

      <FloatingContact />

      {/* Mobile Sidebar Filter Drawer Overlay */}
      {isMobileFiltersOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileFiltersOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>Sidebar Filters</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {hasActiveFilters && (
                  <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
                )}
                <button onClick={() => setIsMobileFiltersOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: '1' }}>×</button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '5px' }}>
              {renderSidebarContent()}
            </div>
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '20px', fontWeight: 700 }}
            >
              Apply Filters ({sortedProducts.length} Results)
            </button>
          </div>
        </div>
      )}

      {/* Product Details Modal (High-Fidelity UI Overlay) */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 35, 57, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3000,
          padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }} onClick={closeDetailsModal}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            maxWidth: '850px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            position: 'relative',
            maxHeight: '90vh',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={closeDetailsModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                zIndex: 10
              }}
            >
              ×
            </button>

            {/* Left Column: Image with details badge */}
            <div style={{
              background: '#f8fafc',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid var(--border)'
            }}>
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
              <div style={{
                marginTop: '30px',
                background: 'rgba(43, 140, 138, 0.08)',
                color: 'var(--secondary)',
                padding: '8px 16px',
                borderRadius: '30px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                🧪 Certified Safe Formula
              </div>
            </div>

            {/* Right Column: Information Panel */}
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {selectedProduct.brand}
              </span>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 800, lineHeight: 1.2 }}>
                {selectedProduct.name}
              </h2>
              
              {/* Rating and Tags */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                {renderStars(selectedProduct.rating)}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>({selectedProduct.rating.toFixed(1)} Stars)</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedProduct.category}
                </span>
                <span style={{ background: selectedProduct.type === 'industrial' ? 'rgba(11, 35, 57, 0.08)' : 'rgba(43, 140, 138, 0.08)', color: selectedProduct.type === 'industrial' ? 'var(--primary)' : 'var(--secondary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {selectedProduct.type}
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                {selectedProduct.description || 'This premium formulation is mixed with precision in our certified laboratory to provide maximum coverage, safe sanitation, and excellent material compatibility.'}
              </p>

              {/* Dilution/Precision Info */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px dashed var(--border)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--primary)' }}>🔬 Industrial Dilution Instruction</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {selectedProduct.type === 'industrial' 
                    ? 'Recommended: Dilute 1:20 with soft water for normal cleaning. Dilute 1:5 for highly stubborn grease.' 
                    : 'Ready to use. Do not dilute. Apply directly on the target surface using a micro-fiber cloth.'}
                </p>
              </div>

              {/* Sizes Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>AVAILABLE PACK SIZES</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedProductSize(s)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: `2px solid ${selectedProductSize.size === s.size ? 'var(--secondary)' : 'var(--border)'}`,
                        background: selectedProductSize.size === s.size ? 'var(--secondary)' : 'transparent',
                        color: selectedProductSize.size === s.size ? 'white' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Panel */}
              <div style={{
                marginTop: 'auto',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price per packaging unit</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    GH₵ {selectedProductSize?.price?.toLocaleString('en-US')}
                  </div>
                  {selectedProductSize?.qtyInBox > 1 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      ({selectedProductSize.qtyInBox} units/box)
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  style={{
                    padding: '16px 36px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700
                  }}
                  onClick={() => {
                    addToCart(selectedProduct, selectedProductSize);
                    closeDetailsModal();
                  }}
                >
                  📥 Add to Order Cart
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Styled Premium E-Commerce CSS Block */}
      <style>{`
        /* Premium custom checkbox styles */
        .custom-checkbox {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-main);
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          user-select: none;
        }
        .custom-checkbox:hover {
          background: #f1f5f9;
        }
        .custom-checkbox input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        .checkmark {
          position: relative;
          height: 18px;
          width: 18px;
          background-color: #fff;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-checkbox:hover input ~ .checkmark {
          border-color: var(--secondary);
        }
        .custom-checkbox input:checked ~ .checkmark {
          background-color: var(--secondary);
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(43, 140, 138, 0.15);
        }
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 1px;
          width: 4px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .custom-checkbox input:checked ~ .checkmark:after {
          display: block;
        }

        /* Count bubble helper */
        .count-bubble {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 700;
          transition: all 0.2s;
        }

        /* Active filter tags */
        .filter-pill {
          background: rgba(43, 140, 138, 0.08);
          color: var(--secondary);
          border: 1px solid rgba(43, 140, 138, 0.15);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 30px;
          display: flex;
          alignItems: center;
          gap: 6px;
          transition: var(--transition);
        }
        .filter-pill button {
          background: none;
          border: none;
          color: var(--secondary);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          line-height: 1;
        }
        .filter-pill:hover {
          background: rgba(43, 140, 138, 0.12);
        }

        /* Mobile Drawer layout */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11, 35, 57, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 4000;
          display: flex;
          justifyContent: flex-start;
          animation: fadeIn 0.25s ease-out;
        }
        .mobile-drawer-content {
          width: 320px;
          max-width: 85vw;
          background: white;
          height: 100%;
          box-shadow: 15px 0 30px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          padding: 24px;
          animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        /* Smooth scroll for filters */
        .desktop-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .desktop-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .desktop-sidebar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        /* Responsive Grid media queries */
        @media (max-width: 768px) {
          .products-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-filters-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ProductsClientPage({ initialProducts }) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: '#f8fafc' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <h3>Loading marketplace...</h3>
      </div>
    }>
      <ProductsContent initialProducts={initialProducts} />
    </Suspense>
  );
}

