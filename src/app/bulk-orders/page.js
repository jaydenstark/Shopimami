'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import Toast from '../../components/ui/Toast';
import FloatingContact from '../../components/layout/FloatingContact';
import { useCart } from '../../hooks/useCart';

// ─── Industry Recommended Products Data ───────────────────────────────────────
const INDUSTRIES_DATA = [
  {
    id: 'schools',
    icon: '🎓',
    name: 'Schools',
    color: '#2B8C8A',
    bgGradient: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
    accentColor: '#00897B',
    products: [
      'Child-Safe Disinfectant Concentrate',
      'Washroom Hygiene Soap Systems',
      'Eco-Friendly Floor Cleaner'
    ],
    prefillProducts: 'Child-Safe Disinfectant Concentrate, Washroom Hygiene Soap Systems, Eco-Friendly Floor Cleaner'
  },
  {
    id: 'hospitals',
    icon: '🏥',
    name: 'Hospitals',
    color: '#1565C0',
    bgGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    accentColor: '#1976D2',
    products: [
      'Clinical-Grade Disinfectant Concentrate',
      'Surgical Hand Rub EN 1500',
      'Ward & Bed Surface Sanitizer'
    ],
    prefillProducts: 'Clinical-Grade Disinfectant Concentrate, Surgical Hand Rub EN 1500, Ward & Bed Surface Sanitizer'
  },
  {
    id: 'hotels',
    icon: '🏨',
    name: 'Hotels',
    color: '#6A1B9A',
    bgGradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    accentColor: '#7B1FA2',
    products: [
      'Commercial Laundry Detergent & Fabric Softener',
      'High-Fragrance Room Air Freshener',
      'Premium Pool & Spa Chlorine Granules'
    ],
    prefillProducts: 'Commercial Laundry Detergent & Fabric Softener, High-Fragrance Room Air Freshener, Premium Pool & Spa Chlorine Granules'
  },
  {
    id: 'restaurants',
    icon: '🍽️',
    name: 'Restaurants',
    color: '#E65100',
    bgGradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    accentColor: '#F57C00',
    products: [
      'Degreaser (Heavy-Duty Oven & Grill)',
      'Floor Cleaner',
      'Surface Sanitizer (Food-Safe No-Rinse)'
    ],
    prefillProducts: 'Degreaser (Heavy-Duty Oven & Grill), Floor Cleaner, Surface Sanitizer (Food-Safe No-Rinse)'
  },
  {
    id: 'factories',
    icon: '🏭',
    name: 'Factories',
    color: '#37474F',
    bgGradient: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)',
    accentColor: '#455A64',
    products: [
      'NBT Industrial Machinery Degreaser 200L',
      'Heavy-Duty Concrete Floor Treatment',
      'Non-Corrosive Metal Parts Cleaner'
    ],
    prefillProducts: 'NBT Industrial Machinery Degreaser 200L, Heavy-Duty Concrete Floor Treatment, Non-Corrosive Metal Parts Cleaner'
  },
  {
    id: 'offices',
    icon: '🏢',
    name: 'Offices',
    color: '#1B5E20',
    bgGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    accentColor: '#2E7D32',
    products: [
      'Streak-Free Glass & Screen Cleaner',
      'Long-Lasting Air Freshener Systems',
      'Urinal Blocks & Anti-Bacterial Hand Soap'
    ],
    prefillProducts: 'Streak-Free Glass & Screen Cleaner, Long-Lasting Air Freshener Systems, Urinal Blocks & Anti-Bacterial Hand Soap'
  }
];

export default function BulkOrdersPage() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart, toastMessage, setToastMessage } = useCart();
  
  // States
  const [selectedIndustryId, setSelectedIndustryId] = useState('restaurants');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    industrySector: 'Restaurants',
    productsNeeded: 'Degreaser (Heavy-Duty Oven & Grill), Floor Cleaner, Surface Sanitizer (Food-Safe No-Rinse)',
    quantity: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectIndustry = (ind) => {
    setSelectedIndustryId(ind.id);
    setFormData((prev) => ({
      ...prev,
      industrySector: ind.name,
      productsNeeded: ind.prefillProducts
    }));
  };

  const handleRequestQuote = (ind) => {
    setSelectedIndustryId(ind.id);
    setFormData((prev) => ({
      ...prev,
      industrySector: ind.name,
      productsNeeded: ind.prefillProducts
    }));
    
    // Smooth scroll to form
    setTimeout(() => {
      document.getElementById('quote-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save Wholesale Inquiry to Firestore collection 'bulk_inquiries'
      await addDoc(collection(db, 'bulk_inquiries'), {
        ...formData,
        status: 'new_inquiry',
        createdAt: serverTimestamp()
      });

      setIsSubmitted(true);
      setIsSubmitting(false);
      setToastMessage("Wholesale quote request submitted successfully!");
    } catch (error) {
      console.error("Error submitting bulk inquiry: ", error);
      alert("Failed to submit inquiry. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  const selectedIndustry = INDUSTRIES_DATA.find(i => i.id === selectedIndustryId) || INDUSTRIES_DATA[3];

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar cartCount={cartItems.length} onCartClick={() => setIsCartOpen(true)} />

      <main style={{ flexGrow: 1, paddingBottom: '100px' }}>
        
        {/* ── HERO SECTION ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
          color: 'white',
          padding: 'clamp(60px, 9vw, 100px) 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,140,138,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,140,138,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Wholesale & Commercial Distribution
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginTop: '12px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1.15 }}>
              Need Commercial Quantities?
            </h1>
            <p style={{ maxWidth: '650px', margin: '20px auto 0', opacity: 0.85, fontSize: '1.08rem', lineHeight: 1.7 }}>
              Get factory-direct wholesale pricing, dedicated laboratory support, and secure high-volume delivery across all 16 regions of Ghana. Select your industry below to customize your formulation.
            </p>
          </div>
        </section>

        {/* ── BENEFITS SECTION ── */}
        <section className="container" style={{ marginTop: '-30px', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {[
              { title: 'Wholesale pricing', desc: 'Direct-from-factory prices without middleman markups.', icon: '🏷️' },
              { title: 'Dedicated support', desc: '1-on-1 account managers and laboratory formulation experts.', icon: '🤝' },
              { title: 'Fast delivery', desc: 'Secure fleet distribution across all 16 regions of Ghana.', icon: '🚚' }
            ].map(benefit => (
              <div key={benefit.title} style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 8px 30px rgba(11,35,57,0.06)',
                transition: 'transform 0.25s ease',
              }} className="benefit-card">
                <span style={{ fontSize: '2.2rem' }}>{benefit.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '3px' }}>
                    ✓ {benefit.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INDUSTRIES WE SERVE & RECOMMENDATION ── */}
        <section className="container" style={{ marginTop: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Custom Formulation Recommendations
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--primary)', marginTop: '6px' }}>
              Industries We Serve
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Click any industry card below to view certified recommended chemical products
            </p>
          </div>

          {/* Grid of Industry Cards */}
          <div className="industries-mini-grid" style={{ marginBottom: '30px' }}>
            {INDUSTRIES_DATA.map(ind => {
              const active = ind.id === selectedIndustryId;
              return (
                <button
                  key={ind.id}
                  onClick={() => handleSelectIndustry(ind)}
                  style={{
                    background: active ? ind.bgGradient : 'white',
                    border: `2px solid ${active ? ind.accentColor : 'var(--border)'}`,
                    borderRadius: '16px',
                    padding: '20px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.25s ease',
                    boxShadow: active ? `0 10px 25px ${ind.accentColor}18` : 'var(--shadow-sm)',
                    transform: active ? 'translateY(-4px)' : 'none'
                  }}
                  className="industry-btn"
                >
                  <span style={{ fontSize: '2.2rem' }}>{ind.icon}</span>
                  <span style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: active ? ind.accentColor : 'var(--primary)',
                    fontFamily: 'Outfit, sans-serif'
                  }}>{ind.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Detail Display */}
          <div className="quote-display-panel" style={{
            background: 'white',
            borderRadius: '20px',
            border: `1px solid ${selectedIndustry.accentColor}33`,
            boxShadow: `0 10px 40px ${selectedIndustry.accentColor}0a`,
            padding: '32px clamp(20px, 4vw, 40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInUp 0.4s ease-out'
          }}>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '6rem', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>
              {selectedIndustry.icon}
            </div>
            
            <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 1 }}>
              <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedIndustry.icon}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  {selectedIndustry.name} Recommended Solutions
                </h3>
              </div>
              <ul className="panel-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px', margin: 0 }}>
                {selectedIndustry.products.map((prod, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <span style={{ color: selectedIndustry.accentColor, fontSize: '1.1rem' }}>•</span>
                    {prod}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <button
                onClick={() => handleRequestQuote(selectedIndustry)}
                style={{
                  background: selectedIndustry.accentColor,
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: `0 8px 20px ${selectedIndustry.accentColor}33`,
                  transition: 'transform 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="btn-quote"
              >
                📋 Request {selectedIndustry.name} Quote
              </button>
            </div>
          </div>
        </section>

        {/* ── FORM SECTION ── */}
        <section className="container" style={{ marginTop: '60px', maxWidth: '800px' }} id="quote-form-section">
          <div style={{
            background: 'white',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: '0 12px 40px rgba(11,35,57,0.05)',
            overflow: 'hidden'
          }}>
            
            {/* Form Header */}
            <div className="quote-form-header" style={{
              background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
              padding: '30px 40px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', margin: '0 0 6px 0' }}>
                Wholesale Quote Specification
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                Submit your customized chemical request. Our commercial laboratory specialists will formulate a bespoke wholesale quote within 24 hours.
              </p>
            </div>

            <div className="quote-form-body" style={{ padding: '36px clamp(20px, 5vw, 40px)' }}>
              {isSubmitted ? (
                /* Success Message */
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '50%',
                    background: 'rgba(43, 140, 138, 0.1)',
                    color: 'var(--secondary)',
                    fontSize: '2.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                    Request Submitted Successfully
                  </h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    Thank you! Your commercial request has been logged securely. Our wholesale logistics team is processing your specifications and will follow up shortly via Phone or WhatsApp.
                  </p>
                  <div className="quote-success-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          businessName: '',
                          contactPerson: '',
                          phone: '',
                          email: '',
                          industrySector: 'Restaurants',
                          productsNeeded: 'Degreaser (Heavy-Duty Oven & Grill), Floor Cleaner, Surface Sanitizer (Food-Safe No-Rinse)',
                          quantity: '',
                          message: ''
                        });
                        setSelectedIndustryId('restaurants');
                      }}
                      style={{ padding: '12px 24px', borderRadius: '10px' }}
                    >
                      📝 Send Another Request
                    </button>
                    <a
                      href="/products"
                      className="btn btn-outline"
                      style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}
                    >
                      🔍 Browse Catalog
                    </a>
                  </div>
                </div>
              ) : (
                /* Form Elements */
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Business Name *</label>
                      <input 
                        type="text" 
                        name="businessName"
                        required
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Stark Hotels & Resorts"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Contact Person *</label>
                      <input 
                        type="text" 
                        name="contactPerson"
                        required
                        value={formData.contactPerson}
                        onChange={handleChange}
                        placeholder="e.g. Madam Joycelyn Mensah"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +233 24 123 4567"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. procurement@starkhotels.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Industry Sector *</label>
                      <select 
                        name="industrySector"
                        required
                        value={formData.industrySector}
                        onChange={(e) => {
                          handleChange(e);
                          const matching = INDUSTRIES_DATA.find(i => i.name.toLowerCase() === e.target.value.toLowerCase());
                          if (matching) {
                            setSelectedIndustryId(matching.id);
                            setFormData(prev => ({ ...prev, productsNeeded: matching.prefillProducts }));
                          } else {
                            setSelectedIndustryId('');
                          }
                        }}
                        style={inputStyle}
                      >
                        <option value="Schools">Schools / Educational</option>
                        <option value="Hospitals">Hospitals / Healthcare</option>
                        <option value="Hotels">Hotels / Hospitality</option>
                        <option value="Restaurants">Restaurants / Food Service</option>
                        <option value="Factories">Factories / Manufacturing</option>
                        <option value="Offices">Offices / Corporate</option>
                        <option value="Other">Other / Specialized Sector</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Quantity Needed *</label>
                      <input 
                        type="text" 
                        name="quantity"
                        required
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 50 Drums of 25L, or 2 Tons"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Products Needed *</label>
                    <textarea 
                      name="productsNeeded"
                      required
                      value={formData.productsNeeded}
                      onChange={handleChange}
                      placeholder="Specify the chemical products or custom formulas requested..."
                      style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Special Message or Safety Requirements (Optional)</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Mention any custom specifications, pH tolerances, labeling, or urgent deadlines..."
                      style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{
                      padding: '14px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: '12px',
                      width: '100%',
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing Submission...' : 'Submit Quote Request ✓'}
                  </button>

                </form>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ background: '#0B2339', color: '#cbd5e1', padding: '60px 0 32px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem', fontWeight: 800, fontSize: '1rem' }}>NEAT BRAND TRADE</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6' }}>Your trusted partner in industrial chemical distribution and hygiene solutions across all 16 regions of Ghana.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Industries</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {INDUSTRIES_DATA.map(ind => (
                <li key={ind.id}>
                  <button 
                    onClick={() => { handleSelectIndustry(ind); window.scrollTo({ top: 400, behavior: 'smooth' }); }} 
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                  >
                    {ind.icon} {ind.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Quick Links</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['/', 'Home'], ['/products', 'Products'], ['/industries', 'Industries'], ['/about', 'About'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}><a href={href} style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        {/* Footer bottom bar */}
        <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: '#64748b' }}>
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

      {toastMessage && (
        <Toast
          isOpen={!!toastMessage}
          message={toastMessage}
          onClose={() => setToastMessage('')}
          onViewCart={() => { setToastMessage(''); setIsCartOpen(true); }}
        />
      )}

      <FloatingContact />
      
      <style>{`
        .industries-mini-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .industries-mini-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .industries-mini-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .benefit-card {
            padding: 16px !important;
            gap: 12px !important;
          }
          .benefit-card span {
            font-size: 1.8rem !important;
          }
          .quote-display-panel {
            flex-direction: column !important;
            align-items: stretch !important;
            text-align: center !important;
            padding: 24px 16px !important;
            gap: 20px !important;
          }
          .quote-display-panel .panel-header {
            flex-direction: column !important;
            align-items: center !important;
            gap: 6px !important;
          }
          .quote-display-panel .panel-list {
            align-items: center !important;
          }
          .quote-display-panel li {
            justify-content: center !important;
            font-size: 0.85rem !important;
          }
          .btn-quote {
            width: 100% !important;
            justify-content: center !important;
          }
          .quote-form-header {
            padding: 20px 16px !important;
            text-align: center !important;
          }
          .quote-form-body {
            padding: 24px 16px !important;
          }
          .quote-success-buttons {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .quote-success-buttons a, .quote-success-buttons button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 480px) {
          .industry-btn {
            padding: 16px 10px !important;
            border-radius: 12px !important;
            gap: 6px !important;
          }
          .industry-btn span:first-of-type {
            font-size: 1.8rem !important;
          }
          .industry-btn span:last-of-type {
            font-size: 0.82rem !important;
          }
        }
        .benefit-card:hover {
          transform: translateY(-5px);
        }
        .industry-btn:hover {
          background: #f1f5f9;
        }
        .btn-quote:hover {
          transform: scale(1.03);
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontWeight: 800,
  fontSize: '0.8rem',
  color: 'var(--primary)',
  marginBottom: '6px',
  fontFamily: 'Outfit, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  fontSize: '0.95rem',
  color: 'var(--text-main)',
  outline: 'none',
  background: '#ffffff',
  transition: 'all 0.25s ease',
  fontFamily: 'Inter, sans-serif'
};
