'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/layout/Navbar';
import Cart from '../../../components/shop/Cart';
import Toast from '../../../components/ui/Toast';
import FloatingContact from '../../../components/layout/FloatingContact';
import { useCart } from '../../../hooks/useCart';

// ─── Deterministic enrichment (same as catalog) ─────────────────────────────
function enrichProduct(p) {
  if (!p) return p;
  const hash = p.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = parseFloat((4.0 + (hash % 11) / 10).toFixed(1));
  const reviewCount = 8 + (hash % 187);
  const availability = hash % 10 === 0 ? 'Direct Manufacture' : hash % 15 === 0 ? 'Bulk Solutions' : 'In Stock';
  return { ...p, rating, reviewCount, availability };
}

function enrichProducts(products) {
  return products.map(enrichProduct);
}

// ─── Star renderer ────────────────────────────────────────────────────────────
function Stars({ score, size = '1.1rem' }) {
  const rounded = Math.round(score);
  return (
    <span style={{ color: '#F59E0B', fontSize: size, letterSpacing: '2px' }}>
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  );
}

// ─── Mock tab content builders ────────────────────────────────────────────────
function buildTabContent(product) {
  const isIndustrial = product.type === 'industrial';
  return {
    description: product.description ||
      `${product.name} is a premium ${isIndustrial ? 'industrial-grade' : 'household'} formulation by ${product.brand}, engineered for reliable performance across a wide range of surfaces. Made with certified active ingredients that deliver deep-cleaning, sanitizing, and deodorizing action without harsh residues.`,
    specifications: [
      { label: 'Brand', value: product.brand },
      { label: 'Category', value: product.category },
      { label: 'Product Type', value: isIndustrial ? 'Industrial' : 'Retail / Household' },
      { label: 'Available Sizes', value: product.sizes.map(s => s.size).join(', ') },
      { label: 'pH Level', value: isIndustrial ? '12–13 (Alkaline)' : '7–8 (Neutral)' },
      { label: 'Active Ingredient', value: isIndustrial ? 'Sodium Hydroxide + Surfactant Blend' : 'Anionic Surfactants + Fragrance Complex' },
      { label: 'Appearance', value: 'Clear to slightly opaque liquid' },
      { label: 'Packaging', value: 'HDPE Food-Grade Container' },
      { label: 'Shelf Life', value: '24 months from manufacture date' },
      { label: 'Storage', value: 'Cool, dry place. Keep away from direct sunlight.' },
      { label: 'Country of Origin', value: 'Ghana' },
    ],
    directions: isIndustrial
      ? `1. Dilute 1:20 with clean water for standard surface cleaning.\n2. For heavy grease or industrial build-up, dilute 1:5.\n3. Apply with a mop, cloth, or spray gun.\n4. Allow 2–3 minutes contact time.\n5. Rinse surfaces thoroughly with clean water.\n6. Wear protective gloves and ensure adequate ventilation.`
      : `1. Apply directly onto the surface with a clean cloth or sponge.\n2. Wipe in circular motions for best results.\n3. For stubborn stains, leave for 30 seconds before wiping.\n4. No rinsing required for household surfaces.\n5. Re-seal container after use and store safely.`,
    safety: `⚠️ SAFETY INFORMATION\n\n• Keep out of reach of children.\n• Avoid contact with eyes. In case of eye contact, flush immediately with large amounts of water and seek medical advice.\n• Do not mix with bleach or acidic cleaners.\n• In case of skin irritation, rinse with water. Discontinue use and consult a doctor if irritation persists.\n• Do not ingest. If swallowed, do not induce vomiting — seek immediate medical attention.\n• Wear gloves when handling ${isIndustrial ? 'in industrial settings' : ''}.\n• Dispose of container responsibly in accordance with local regulations.`,
  };
}

// ─── Mock reviews ─────────────────────────────────────────────────────────────
const REVIEW_POOL = [
  { name: 'Kwame A.', role: 'Facility Manager', stars: 5, text: 'Outstanding product. Works exactly as described and our entire facility smells fresh after use.' },
  { name: 'Abena M.', role: 'Hotel Housekeeping Supervisor', stars: 5, text: 'We switched our entire hotel to NBT products and the results have been incredible. Highly recommend!' },
  { name: 'David O.', role: 'Factory Safety Officer', stars: 4, text: 'Very effective on heavy machinery grease. Only mixed it as instructed and saw great results immediately.' },
  { name: 'Fatima B.', role: 'Restaurant Owner', stars: 5, text: 'Keeps our kitchen spotless. The dilution ratio means a single 5L lasts us weeks. Great value.' },
  { name: 'Emmanuel K.', role: 'School Maintenance Head', stars: 4, text: 'Safe for use around children and still very effective. The kids love how clean the classrooms smell.' },
  { name: 'Ama N.', role: 'Homemaker', stars: 5, text: 'My go-to for everything at home. The scent is pleasant and it cleans really well.' },
];

// ─── Related Product Card ─────────────────────────────────────────────────────
function RelatedCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const ep = enrichProduct(product);
  const startSize = product.sizes[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: hovered ? '1px solid var(--secondary)' : '1px solid var(--border)',
        boxShadow: hovered ? '0 16px 32px rgba(11,35,57,0.10)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}>
        <div style={{ background: '#f8fafc', padding: '1.25rem', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</span>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>GH₵ {startSize.price.toLocaleString()}</span>
            <Stars score={ep.rating} size="0.85rem" />
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product, startSize); }}
            style={{
              marginTop: '8px', padding: '9px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
              background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
            }}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetailClientPage({ product: rawProduct, related: rawRelated }) {
  const { cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart, clearCart, toastMessage, setToastMessage } = useCart();

  const product = useMemo(() => enrichProduct(rawProduct), [rawProduct]);
  const related = useMemo(() => enrichProducts(rawRelated || []), [rawRelated]);

  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState(rawProduct?.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  // Derived thumbnail list — product image + placeholder angles
  const thumbs = useMemo(() => {
    if (!product) return [];
    // Use the single image multiple times as placeholders for gallery
    return [product.image, product.image, product.image];
  }, [product]);

  const tabContent = useMemo(() => product ? buildTabContent(product) : null, [product]);
  const reviews = useMemo(() => {
    if (!product) return [];
    const hash = product.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const count = 2 + (hash % 4);
    return REVIEW_POOL.slice(0, count).map((r, i) => ({
      ...r,
      stars: i === 0 ? 5 : r.stars,
    }));
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    for (let i = 0; i < quantity; i++) addToCart(product, selectedSize);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartOpen(true);
  };

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '16px' }}>
        <span style={{ fontSize: '4rem' }}>🔬</span>
        <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>This product may have been removed or the link is incorrect.</p>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px 32px' }}>
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const availColor = product.availability === 'In Stock' ? '#16a34a' : product.availability === 'Direct Manufacture' ? '#d97706' : '#2563eb';
  const availBg = product.availability === 'In Stock' ? 'rgba(34,197,94,0.10)' : product.availability === 'Direct Manufacture' ? 'rgba(245,158,11,0.10)' : 'rgba(59,130,246,0.10)';

  const TABS = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'directions', label: 'Directions' },
    { key: 'safety', label: 'Safety Information' },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar cartCount={cartItems.length} onCartClick={() => setIsCartOpen(true)} />

      <main style={{ flexGrow: 1, paddingBottom: '100px' }}>
        {/* Breadcrumb */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
          <div className="container" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Products</Link>
            <span>›</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{product.category}</Link>
            <span>›</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{product.name}</span>
          </div>
        </div>

        {/* ── PRODUCT HERO ── */}
        <section style={{ background: 'white', paddingTop: '40px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="pdp-hero-grid">

              {/* LEFT: Image gallery */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Large image */}
                <div style={{
                  background: '#f1f5f9',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '420px',
                }}>
                  {/* Availability badge */}
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: availBg, color: availColor, padding: '5px 12px', borderRadius: '30px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', border: `1px solid ${availColor}33` }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: availColor }} />
                    {product.availability}
                  </div>
                  <img
                    src={thumbs[activeThumb]}
                    alt={product.name}
                    style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', transition: 'opacity 0.3s ease' }}
                  />
                </div>

                {/* Thumbnail strip */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {thumbs.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveThumb(i)}
                      style={{
                        flex: 1,
                        background: '#f1f5f9',
                        borderRadius: '12px',
                        border: `2px solid ${activeThumb === i ? 'var(--secondary)' : 'var(--border)'}`,
                        padding: '10px',
                        cursor: 'pointer',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.2s ease',
                        boxShadow: activeThumb === i ? '0 0 0 3px rgba(43,140,138,0.15)' : 'none',
                      }}
                    >
                      <img src={src} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: i === 0 ? 1 : 0.55 + i * 0.15 }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: Product info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Brand + Name */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {product.brand}
                  </span>
                  <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, lineHeight: 1.2, marginTop: '8px' }}>
                    {product.name}
                  </h1>
                </div>

                {/* Stars + review count + category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Stars score={product.rating} size="1.3rem" />
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{product.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.reviewCount} reviews)</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{product.category}</span>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                    GH₵ {selectedSize?.price?.toLocaleString('en-US')}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {selectedSize?.size}</span>
                </div>

                {/* Short summary */}
                <p style={{ fontSize: '0.97rem', color: 'var(--text-muted)', lineHeight: 1.7, borderLeft: '3px solid var(--secondary)', paddingLeft: '14px' }}>
                  {(product.description || `Premium ${product.category.toLowerCase()} formulation by ${product.brand}. Engineered for superior cleaning performance, safe application, and long-lasting freshness.`).slice(0, 200)}
                  {(product.description?.length || 0) > 200 ? '…' : ''}
                </p>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--border)' }} />

                {/* Size selector */}
                {product.sizes.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Size / Pack
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.sizes.map((s) => (
                        <button
                          key={s.size}
                          onClick={() => setSelectedSize(s)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: `2px solid ${selectedSize?.size === s.size ? 'var(--secondary)' : 'var(--border)'}`,
                            background: selectedSize?.size === s.size ? 'var(--secondary)' : 'white',
                            color: selectedSize?.size === s.size ? 'white' : 'var(--text-main)',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: selectedSize?.size === s.size ? '0 4px 12px rgba(43,140,138,0.25)' : 'none',
                          }}
                        >
                          {s.size}
                          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>
                            GH₵ {s.price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selector */}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Quantity
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', width: 'fit-content' }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ width: '44px', height: '44px', background: '#f8fafc', border: 'none', borderRight: '1px solid var(--border)', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    >−</button>
                    <span style={{ minWidth: '52px', textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', padding: '0 4px' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      style={{ width: '44px', height: '44px', background: '#f8fafc', border: 'none', borderLeft: '1px solid var(--border)', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    >+</button>
                  </div>
                  {quantity > 1 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                      Total: GH₵ {((selectedSize?.price || 0) * quantity).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* CTA Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-outline"
                    style={{ padding: '15px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="btn btn-primary"
                    style={{ padding: '15px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    ⚡ Buy Now
                  </button>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '8px' }}>
                  {[
                    { icon: '🚚', text: 'Free delivery on bulk' },
                    { icon: '✅', text: 'Certified safe formula' },
                    { icon: '🔄', text: 'Easy returns' },
                  ].map(b => (
                    <span key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {b.icon} {b.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TABS SECTION ── */}
        <section className="container" style={{ marginTop: '40px' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {/* Tab Bar */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '16px 24px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? 'var(--secondary)' : 'var(--text-muted)',
                    borderBottom: `2px solid ${activeTab === tab.key ? 'var(--secondary)' : 'transparent'}`,
                    marginBottom: '-2px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '32px', minHeight: '200px' }}>

              {/* Description */}
              {activeTab === 'description' && (
                <div style={{ maxWidth: '780px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>Product Description</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.96rem' }}>{tabContent.description}</p>
                  <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    {[
                      { icon: '🧪', title: 'Certified Formula', desc: 'ISO-certified active ingredient ratios' },
                      { icon: '🌿', title: 'Eco-Friendly', desc: 'Biodegradable & non-toxic formulation' },
                      { icon: '💧', title: 'Rinse-Free Option', desc: 'Safe on most surfaces without rinse' },
                      { icon: '🏭', title: 'Made in Ghana', desc: 'Locally manufactured, quality assured' },
                    ].map(f => (
                      <div key={f.title} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '6px' }}>{f.icon}</span>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--primary)', display: 'block' }}>{f.title}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {activeTab === 'specifications' && (
                <div style={{ maxWidth: '720px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Product Specifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {tabContent.specifications.map((spec, i) => (
                      <div key={spec.label} style={{
                        display: 'grid',
                        gridTemplateColumns: '200px 1fr',
                        gap: '20px',
                        padding: '14px 0',
                        borderBottom: i < tabContent.specifications.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{spec.label}</span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Directions */}
              {activeTab === 'directions' && (
                <div style={{ maxWidth: '680px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Directions for Use</h3>
                  <div style={{ background: 'rgba(43,140,138,0.04)', border: '1px solid rgba(43,140,138,0.15)', borderRadius: '14px', padding: '24px' }}>
                    {tabContent.directions.split('\n').map((line, i) => line.trim() && (
                      <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <span style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, paddingTop: '3px' }}>
                          {line.replace(/^\d+\.\s*/, '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety */}
              {activeTab === 'safety' && (
                <div style={{ maxWidth: '720px' }}>
                  <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px', padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#dc2626', fontFamily: 'Outfit, sans-serif', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚠️ Safety Information
                    </h3>
                    {tabContent.safety.split('\n').filter(l => l.trim() && !l.includes('SAFETY INFORMATION')).map((line, i) => (
                      <p key={i} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '8px' }}>
                        {line.startsWith('•') ? line : `• ${line}`}
                      </p>
                    ))}
                  </div>
                  <div style={{ marginTop: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      📄 For a full Safety Data Sheet (SDS/MSDS), please <Link href="/contact" style={{ color: 'var(--secondary)', fontWeight: 700 }}>contact our team</Link> or visit your nearest distributor.
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>{product.rating.toFixed(1)}</div>
                      <Stars score={product.rating} size="1.2rem" />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{product.reviewCount} reviews</div>
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '320px' }}>
                      {[5, 4, 3, 2, 1].map(n => {
                        const pct = n === 5 ? 68 : n === 4 ? 22 : n === 3 ? 7 : n === 2 ? 2 : 1;
                        return (
                          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#F59E0B', minWidth: '14px', fontWeight: 700 }}>{n}★</span>
                            <div style={{ flexGrow: 1, height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: '99px' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '24px' }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((r, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>
                              {r.name[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{r.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.role}</div>
                            </div>
                          </div>
                          <Stars score={r.stars} size="0.9rem" />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{r.text}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link href="/contact" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '0.88rem', borderRadius: '10px' }}>
                      ✍️ Leave a Review
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className="container" style={{ marginTop: '56px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>More like this</span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginTop: '4px' }}>Related Products</h2>
              </div>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px' }}>
                View All {product.category} →
              </Link>
            </div>
            <div className="related-grid">
              {related.map(p => (
                <RelatedCard key={p.id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
        )}

        {/* ── BULK ORDER CTA ── */}
        <section className="container" style={{ marginTop: '56px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #153a5c 100%)',
            borderRadius: '24px',
            padding: 'clamp(28px, 5vw, 50px)',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,140,138,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div>
              <h3 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 800, marginBottom: '8px' }}>
                📦 Need This in Bulk?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', maxWidth: '480px', lineHeight: 1.6 }}>
                Get custom pricing on IBC totes, drums, and ton-level orders of <strong style={{ color: 'white' }}>{product.name}</strong>. Tailored formulations available.
              </p>
            </div>
            <Link href="/bulk-orders" className="btn" style={{ background: 'var(--secondary)', color: 'white', padding: '15px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
              Request Bulk Quote →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B2339', color: '#cbd5e1', padding: '60px 0 32px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem', fontWeight: 800, fontSize: '1rem' }}>NEAT BRAND TRADE</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6' }}>Your trusted partner in chemical distribution and hygiene solutions across Ghana.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Quick Links</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['/', '/products', '/bulk-orders', '/about', '/contact'].map((href, i) => (
                <li key={href}><Link href={href} style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none' }}>{['Home', 'Products', 'Bulk Orders', 'About', 'Contact'][i]}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Contact</h4>
            <ul style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>📞 0246272115</li>
              <li>✉️ info@neatbrandtrade.com</li>
              <li>📍 Accra, Ghana</li>
            </ul>
          </div>
        </div>
        {/* Footer bottom bar */}
        <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: '#64748b' }}>
          <span>
            © 2026 Neat Brand Trade (NBT). All Rights Reserved<Link href="/admin" style={{ color: 'inherit', cursor: 'default', textDecoration: 'none', userSelect: 'none', display: 'inline-block', padding: '12px 10px', margin: '-12px -10px', position: 'relative', zIndex: 10 }}>.</Link>
          </span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
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
            </Link>
          </div>
        </div>
      </footer>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} onRemove={removeFromCart} onClearCart={clearCart} />
      <Toast isOpen={!!toastMessage} message={toastMessage} onClose={() => setToastMessage('')} onViewCart={() => { setToastMessage(''); setIsCartOpen(true); }} />
      <FloatingContact />

      <style>{`
        .pdp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 900px) {
          .pdp-hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 560px) {
          .related-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 380px) {
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
