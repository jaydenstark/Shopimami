'use client';

import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import FloatingContact from '../../components/layout/FloatingContact';
import { useCart } from '../../hooks/useCart';

export default function AboutPage() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();

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
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Neat Brand Trade</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.5rem', fontWeight: 800 }}>Laboratory Precision & Chemical Standards</h1>
            <p style={{ maxWidth: '600px', margin: '15px auto 0', opacity: 0.85, fontSize: '1.05rem', lineHeight: '1.6' }}>
              We engineer advanced liquid formulations with strict quality-control protocols to yield professional-grade outcomes.
            </p>
          </div>
        </section>

        {/* Corporate History & Lab Standards Section */}
        <section className="container" style={{ marginTop: '50px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>THE NBT IDENTITY</span>
              <h2 style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
                Pioneering Precision Chemical Engineering
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '20px', fontSize: '1rem' }}>
                Neat Brand Trade (NBT) is a global chemical manufacturer and supplier. We cater to wholesale distributors, commercial industries, hospitality providers, healthcare plants, and retail consumers. 
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '25px', fontSize: '1rem' }}>
                By using state-of-the-art laboratory testing, our chemical formulations have redefined efficiency. Every single batch is audited for active ingredient levels, precise pH balances, specific gravity, and foaming capacity. We ensure that our customers get maximum coverage out of every drop.
              </p>
              <a href="/products" className="btn btn-primary" style={{ textDecoration: 'none', padding: '14px 35px' }}>
                🔍 Explore Chemical Formulas
              </a>
            </div>
            <div style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <h3 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '25px', fontSize: '1.4rem' }}>Our Compliance Framework</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🛡️</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--primary)' }}>ISO 9001:2015 Compliant</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Adhering to strict international guidelines for safety, composition stability, and ecological manufacturing.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🧪</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--primary)' }}>Certified Laboratory Ratios</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Each chemical composition has undergone robust lab testing to prevent corrosion and deliver heavy-duty dirt breakdown.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🌿</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--primary)' }}>Eco-Friendly Surfactants</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>We formulate with biodegradable surface-active elements that safeguard public health and water systems.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Corporate Value Pillars */}
        <section className="container" style={{ marginTop: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Operational Pillars</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontWeight: 800, marginTop: '5px' }}>Why Enterprises Trust Neat Brand Trade</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
            
            <div style={pillarCardStyle}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>🔬</span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '10px' }}>Scientific Formulation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                We avoid general diluted solutions. Our laboratory maximizes chemical solids percentage, so you buy concentrates that handle dilution smoothly.
              </p>
            </div>

            <div style={pillarCardStyle}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>🏭</span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '10px' }}>Scalable Packaging</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                From 1L bottles for retail clients to 5L jugs, 25L drums, and multi-ton intermediate bulk containers (IBC) for major factories.
              </p>
            </div>

            <div style={pillarCardStyle}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>📈</span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '10px' }}>Direct Supply Economy</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Because we manufacture directly, our clients bypass distribution markups, giving you premium-grade solutions at direct-to-market prices.
              </p>
            </div>

          </div>
        </section>

        {/* Global Sub-brands Spotlight */}
        <section style={{ background: 'white', padding: '80px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: '80px' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Corporate Portfolio</span>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontWeight: 800, marginTop: '5px' }}>Our Certified Global Brands</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '550px', margin: '10px auto 0' }}>Under the NBT flagship umbrella, we manufacture and distribute three main specialized product portfolios.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              
              <div style={brandCardStyle}>
                <div style={{ fontSize: '1rem', letterSpacing: '6px', fontWeight: 800, color: 'var(--primary)', marginBottom: '15px' }}>🧪 NEAT BRAND</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  High-efficiency homecare and fabric solutions including floral disinfectants, laundry detergents, floral all-purpose soaps, and handwashes.
                </p>
              </div>

              <div style={brandCardStyle}>
                <div style={{ fontSize: '1rem', letterSpacing: '6px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '15px' }}>✨ DEVA SANITARY</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Sleek personal hygiene and retail sanitization solutions curated for absolute skin compatibility and powerful germ prevention.
                </p>
              </div>

              <div style={brandCardStyle}>
                <div style={{ fontSize: '1rem', letterSpacing: '6px', fontWeight: 800, color: '#334155', marginBottom: '15px' }}>🌍 NBT GLOBAL</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Raw bulk chemical solutions, industrial degreasers, food plant disinfectants, and large-scale wholesale supply channels.
                </p>
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

const pillarCardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '20px',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  transition: 'transform 0.3s ease'
};

const brandCardStyle = {
  background: '#f8fafc',
  padding: '35px',
  borderRadius: '20px',
  border: '1px solid var(--border)',
  textAlign: 'center'
};
