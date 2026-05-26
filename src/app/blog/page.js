'use client';

import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import FloatingContact from '../../components/layout/FloatingContact';
import { useCart } from '../../hooks/useCart';

export default function BlogPage() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();

  // Dilution Calculator States (Highly premium interactive feature)
  const [chemicalVolume, setChemicalVolume] = useState(1); // in liters
  const [ratioPart, setRatioPart] = useState(20); // 1:20 ratio
  const [waterRequired, setWaterRequired] = useState(20);
  const [totalSolution, setTotalSolution] = useState(21);

  const calculateDilution = (vol, rat) => {
    const v = parseFloat(vol) || 0;
    const r = parseFloat(rat) || 0;
    const water = v * r;
    setWaterRequired(water);
    setTotalSolution(v + water);
  };

  const handleVolumeChange = (e) => {
    const val = e.target.value;
    setChemicalVolume(val);
    calculateDilution(val, ratioPart);
  };

  const handleRatioChange = (e) => {
    const val = e.target.value;
    setRatioPart(val);
    calculateDilution(chemicalVolume, val);
  };

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        cartCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main style={{ flexGrow: 1, background: '#f8fafc', paddingBottom: '80px' }}>
        {/* Banner Section */}
        <section style={{
          background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
          color: 'white',
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <div className="container">
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>NBT Knowledgebase</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.5rem', fontWeight: 800 }}>Chemical Safety & Usage Resources</h1>
            <p style={{ maxWidth: '600px', margin: '15px auto 0', opacity: 0.85, fontSize: '1.05rem', lineHeight: '1.6' }}>
              Access expert guidelines, chemical safety sheets (SDS), active dilution ratio guidelines, and clean-water management techniques.
            </p>
          </div>
        </section>

        {/* Dilution Calculator section (Wow Factor!) */}
        <section className="container" style={{ marginTop: '40px' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            padding: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px'
          }}>
            <div>
              <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>LABORATORY TOOL</span>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '15px', lineHeight: 1.2 }}>
                Dynamic Chemical Dilution Calculator
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '0px' }}>
                Ensure maximum active ingredient utility while maintaining strict corrosion thresholds. Enter your concentrate volume and target mixing ratio to calculate required soft water volume.
              </p>
              
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={calcLabelStyle}>Concentrated Chemical (Liters) *</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    step="0.1"
                    value={chemicalVolume}
                    onChange={handleVolumeChange}
                    style={calcInputStyle}
                  />
                </div>
                <div>
                  <label style={calcLabelStyle}>Target Mixing Ratio (1 : X Parts Water) *</label>
                  <select 
                    value={ratioPart}
                    onChange={handleRatioChange}
                    style={calcInputStyle}
                  >
                    <option value="5">1 : 5 (Ultra Heavy Industrial Degreasing)</option>
                    <option value="10">1 : 10 (Heavy Duty Concrete/Metal Clean)</option>
                    <option value="20">1 : 20 (Standard Commercial Wash / Floral Disinfect)</option>
                    <option value="50">1 : 50 (Light Multi-surface Floor Scrub)</option>
                    <option value="100">1 : 100 (High-Efficiency Window & Mirror Wipe)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '2px dashed var(--secondary)',
              borderRadius: '20px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--primary)', textAlign: 'center' }}>Mixing Formula Results</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={calcResultRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Chemical Concentrate:</span>
                  <strong style={{ color: 'var(--primary)' }}>{chemicalVolume} L</strong>
                </div>
                <div style={calcResultRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Required Water Volume:</span>
                  <strong style={{ color: 'var(--secondary)' }}>{waterRequired.toFixed(1)} L</strong>
                </div>
                <div style={{ height: '1px', background: '#e2e8f0', margin: '5px 0' }} />
                <div style={calcResultRowStyle}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Total Final Solution:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{totalSolution.toFixed(1)} L</strong>
                </div>
              </div>

              <div style={{
                marginTop: '25px',
                background: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}>
                🔬 <strong>Mixing Tip:</strong> Always add concentrated chemical to water rather than water to chemical to prevent hazardous splashing. Use clean safety goggles.
              </div>
            </div>
          </div>
        </section>

        {/* Safety & Educational Resource Grid */}
        <section className="container" style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '35px', textAlign: 'center' }}>
            Latest Safety & Composition Studies
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* Article 1 */}
            <div style={articleCardStyle}>
              <div style={{ background: '#0B2339', color: 'white', padding: '24px', position: 'relative' }}>
                <span style={{ background: 'var(--secondary)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', position: 'absolute', top: '15px', left: '15px' }}>DILUTION</span>
                <span style={{ fontSize: '3rem', display: 'block', marginTop: '10px' }}>🧪</span>
              </div>
              <div style={{ padding: '30px' }}>
                <h3 style={articleTitleStyle}>Commercial Dilution Optimization</h3>
                <p style={articleDescStyle}>
                  Diluting large-scale 25L drums of all-purpose floral soap or laundry detergents incorrectly compromises active surfactant levels. Learn how to audit specific gravity variables using a standard hydrometer to guarantee premium cleaning output.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read Time: 6 min</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>Expert Guide →</span>
                </div>
              </div>
            </div>

            {/* Article 2 */}
            <div style={articleCardStyle}>
              <div style={{ background: '#2B8C8A', color: 'white', padding: '24px', position: 'relative' }}>
                <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', position: 'absolute', top: '15px', left: '15px' }}>SAFETY</span>
                <span style={{ fontSize: '3rem', display: 'block', marginTop: '10px' }}>🥽</span>
              </div>
              <div style={{ padding: '30px' }}>
                <h3 style={articleTitleStyle}>Chemical Handling & Storage Rules</h3>
                <p style={articleDescStyle}>
                  Storing sodium hypochlorite or industrial acid complexes requires excellent ventilation and isolated double-wall storage units. This study highlights safety thresholds, emergency skin washing protocols, and eye-protection specs for workers.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read Time: 9 min</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>Safety Standards →</span>
                </div>
              </div>
            </div>

            {/* Article 3 */}
            <div style={articleCardStyle}>
              <div style={{ background: '#334155', color: 'white', padding: '24px', position: 'relative' }}>
                <span style={{ background: 'var(--secondary)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', position: 'absolute', top: '15px', left: '15px' }}>COMPLIANCE</span>
                <span style={{ fontSize: '3rem', display: 'block', marginTop: '10px' }}>📜</span>
              </div>
              <div style={{ padding: '30px' }}>
                <h3 style={articleTitleStyle}>Understanding SDS Guidelines</h3>
                <p style={articleDescStyle}>
                  Safety Data Sheets (SDS) are critical for industrial compliance audits. Learn how to interpret hazard symbols, active chemical solids percentage metrics, ecological impact warnings, and fire-safety ratings before industrial deployment.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read Time: 5 min</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>Regulatory Help →</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />

      <FloatingContact />
    </div>
  );
}

const calcLabelStyle = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.75rem',
  color: 'var(--primary)',
  marginBottom: '6px'
};

const calcInputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  outline: 'none',
  fontSize: '0.9rem',
  background: '#ffffff',
  fontFamily: 'Inter, sans-serif'
};

const calcResultRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.95rem'
};

const articleCardStyle = {
  background: 'white',
  borderRadius: '20px',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
};

const articleTitleStyle = {
  fontSize: '1.25rem',
  color: 'var(--primary)',
  marginBottom: '10px',
  fontWeight: 800
};

const articleDescStyle = {
  fontSize: '0.88rem',
  color: 'var(--text-muted)',
  lineHeight: 1.6,
  marginBottom: '20px',
  flexGrow: 1
};
