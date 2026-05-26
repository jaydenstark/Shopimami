'use client';

import Navbar from '../components/layout/Navbar';
import Hero from '../components/layout/Hero';
import Cart from '../components/shop/Cart';
import Toast from '../components/ui/Toast';
import FloatingContact from '../components/layout/FloatingContact';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: "Akosua Mensah",
    role: "Procurement Lead, Golden Tulip Accra",
    review: "NBT's bulk sanitizers and industrial laundry detergents transformed our resort's operational standards. Their precise active dilution ratios allowed us to cut chemical waste by 30% while retaining five-star cleanliness.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    rating: 5
  },
  {
    name: "Kwame Boateng",
    role: "Quality Assurance Manager, Ghana Breweries Limited",
    review: "Strict ISO compliance is mandatory in food manufacturing. Neat Brand Trade supplies certified food-grade citric compounds and heavy machinery degreasers that meet global health standards perfectly.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    rating: 5
  },
  {
    name: "Dr. Evelyn Hanson",
    role: "Director of Facilities, Ridge Hospital",
    review: "Hospital sanitization requires powerful disinfectants that are entirely safe. NBT has provided consistent, high-concentration disinfectants for our clinics. Their fast logistics and delivery are second to none.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    rating: 5
  }
];

export default function ClientPage({ initialProducts }) {
  const { products, isLoaded } = useProducts(initialProducts);
  const { cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart, clearCart, toastMessage, setToastMessage } = useCart();

  // Show only 4 highly-rated best sellers on the homepage
  const bestSellers = products ? products.slice(0, 4) : [];

  // Before / After Slider Position
  const [sliderPos, setSliderPos] = useState(50);

  // Testimonial Carousel State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);



  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setToastMessage('✉️ Thank you for subscribing to our chemical safety & discount newsletter!');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="App" style={{ background: '#f8fafc', overflowX: 'hidden' }}>
      
      {/* 1. HEADER & NAVIGATION */}
      <Navbar 
        cartCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main>
        
        {/* 2 & 3. WELCOME AREA (HERO + TRUSTED BY) */}
        <div id="section-welcome">
          {/* 2. HERO SECTION */}
          <Hero />
          
          {/* 3. TRUST SECTION */}
          <section style={{ 
            background: 'var(--white)', 
            padding: '40px 0', 
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <div className="container" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '30px'
            }}>
              {/* Review rating stars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#F59E0B', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', gap: '3px' }}>
                  ★★★★★
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  CUSTOMER RATING (4.9/5 stars)
                </span>
              </div>

              {/* Trusted By Grid */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }} className="trusted-logo-panel">
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  TRUSTED BY LEADING PLACES:
                </span>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="trust-badge">🏢 Offices</span>
                  <span className="trust-badge">🍽️ Restaurants</span>
                  <span className="trust-badge">🏫 Schools</span>
                  <span className="trust-badge">🏨 Hotels</span>
                  <span className="trust-badge">🏭 Factories</span>
                </div>
              </div>

              {/* Customer Served Metric */}
              <div style={{
                background: 'rgba(43, 140, 138, 0.08)',
                padding: '12px 24px',
                borderRadius: '30px',
                border: '1px solid rgba(43, 140, 138, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>🎉</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                  We've proudly served <span style={{ color: 'var(--secondary)' }}>14,000+ customers</span> Ghanaian wide!
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* 4. BEST SELLERS */}
        <section id="section-best-sellers" className="section" style={{ background: '#ffffff', padding: '90px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(43, 140, 138, 0.06)', padding: '6px 14px', borderRadius: '12px' }}>
                Popular Cleaners
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                Our Best Sellers
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '12px auto 0', fontSize: '1.05rem' }}>
                Discover our highly active chemical cleaners engineered for ultimate sanitization and pristine surface results.
              </p>
            </div>

            {isLoaded ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '2.5rem'
              }}>
                {bestSellers.map((product) => {
                  const startingSize = product.sizes[0];
                  return (
                    <div 
                      key={product.id}
                      className="product-card"
                      style={{
                        background: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ 
                        width: '100%', 
                        height: '240px', 
                        background: '#f8fafc',
                        padding: '1.5rem',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          {product.brand}
                        </span>
                        
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', lineHeight: '1.3' }}>
                          {product.name}
                        </h3>

                        {/* Stars Review Indicator */}
                        <div style={{ color: '#F59E0B', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '2px' }}>
                          ★★★★★
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1, lineHeight: 1.5 }}>
                          {product.description ? product.description.slice(0, 85) + '...' : 'Premium concentrated formulation calculated for ultimate cleaning efficiency.'}
                        </p>
                        
                        {/* Card Footer */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          paddingTop: '1.25rem',
                          borderTop: '1px solid var(--border)'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GHC Price</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                              GH₵ {startingSize.price.toFixed(2)}
                            </div>
                          </div>
                          <button 
                            onClick={() => addToCart(product, startingSize)}
                            className="btn btn-primary" 
                            style={{ 
                              padding: '10px 18px', 
                              fontSize: '0.8rem', 
                              borderRadius: '8px',
                              background: 'var(--primary)'
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                🔬 Loading our specialized formulations...
              </div>
            )}
          </div>
        </section>

        {/* 5. SHOP BY CATEGORY */}
        <section id="section-categories" className="section" style={{ background: '#f1f5f9', padding: '95px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Smart Classification
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                Shop By Category
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '12px auto 0', fontSize: '1.05rem' }}>
                Filter our complete industrial and retail chemical inventory by precise operational use.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {/* Category cards list */}
              <Link href="/products?category=industrial cleaners">
                <div className="category-card" style={{ background: 'linear-gradient(135deg, #0B2339 0%, #153e63 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧪</div>
                  <h3 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '6px' }}>Industrial Cleaners</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 }}>High-concentration chemical solutions for industrial output and factories.</p>
                </div>
              </Link>

              <Link href="/products?category=disinfectants">
                <div className="category-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
                  <h3 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '6px' }}>Disinfectants</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 }}>Medical grade sanitizers and chemical disinfectants for clinical protection.</p>
                </div>
              </Link>

              <Link href="/products?category=hygiene products">
                <div className="category-card" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                  <h3 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '6px' }}>Sanitizers</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 }}>Personal and general-use hand sanitizers, washes, and skin soaps.</p>
                </div>
              </Link>

              <Link href="/products?category=cleaning">
                <div className="category-card" style={{ background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧺</div>
                  <h3 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '6px' }}>Laundry</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 }}>Concentrated fabric softeners, washing powders, and liquid detergents.</p>
                </div>
              </Link>

              <Link href="/products?category=hygiene products">
                <div className="category-card" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌬️</div>
                  <h3 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '6px' }}>Air Fresheners</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 }}>Long-lasting mist sprays and neutralizers to eliminate harsh odors.</p>
                </div>
              </Link>

              <Link href="/products?category=cleaning">
                <div className="category-card" style={{ background: 'linear-gradient(135deg, #155e75 0%, #06b6d4 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚽</div>
                  <h3 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '6px' }}>Washroom Products</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 }}>Acidic scale removers, tiles cleaners, and heavy-duty washroom formulas.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. WHY CHOOSE NBT */}
        <section id="section-why-nbt" className="section" style={{ background: '#ffffff', padding: '95px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Operational Excellence
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                Why Choose NBT
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '12px auto 0', fontSize: '1.05rem' }}>
                Your trusted partner in quality compliance, active concentrations, and country-wide distribution.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem'
            }}>
              <div className="benefit-card">
                <div style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginBottom: '12px' }}>🏆</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>High Quality</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  Our chemical compositions guarantee exact active ratios, tested continuously for ultimate cleaning and hygiene power.
                </p>
              </div>

              <div className="benefit-card">
                <div style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>Fast Delivery</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  We coordinate continuous nationwide logistics across Ghana to supply businesses, hospitals, and homes quickly.
                </p>
              </div>

              <div className="benefit-card">
                <div style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginBottom: '12px' }}>🛡️</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>Safe Products</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  Certified non-toxic and food-grade safety standard chemicals that sanitize thoroughly without destroying surfaces.
                </p>
              </div>

              <div className="benefit-card">
                <div style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginBottom: '12px' }}>📦</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>Bulk Supply</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  Accommodating small wholesale supplies from 5 Liters up to 1,000 Liter customizable manufacturing shipments.
                </p>
              </div>

              <div className="benefit-card">
                <div style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginBottom: '12px' }}>📞</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>Customer Support</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  Speak directly with our chemists or support staff at any time for customized safety data sheets and ratio calculations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. BEFORE / AFTER COMPARISON SLIDER */}
        <section id="section-transformations" className="section" style={{ background: '#f8fafc', padding: '95px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Visual Transformation
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                Before & After Transformations
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '12px auto 0', fontSize: '1.05rem' }}>
                Drag the slider handle horizontally below to see how our concentrated formulations lift heavy grease and sanitise spaces instantly!
              </p>
            </div>

            {/* Slider Container */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '900px', height: '500px', margin: '0 auto', overflow: 'hidden', borderRadius: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
              
              {/* Dirty / Before Image (Backdrop) */}
              <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                <img 
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=1200" 
                  alt="Workspace Before Cleaning" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.65) brightness(0.6) contrast(0.85) saturate(0.7)' }} 
                />
                <div style={{ position: 'absolute', bottom: '25px', left: '25px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>
                  ❌ DIRTY WORKSPACE
                </div>
              </div>

              {/* Clean / After Image (Foreground, dynamic width) */}
              <div style={{ 
                width: `${sliderPos}%`, 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                overflow: 'hidden',
                zIndex: 2,
                transition: 'width 0.05s ease-out',
                borderRight: '2px solid white'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=1200" 
                  alt="Workspace After Cleaning" 
                  style={{ 
                    width: '100vw', 
                    maxWidth: '900px',
                    height: '500px', 
                    objectFit: 'cover',
                    filter: 'brightness(1.15) contrast(1.15) saturate(1.2)' 
                  }} 
                />
                <div style={{ position: 'absolute', bottom: '25px', left: '25px', background: 'var(--secondary)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  ✨ PRISTINE NBT CLEAN
                </div>
              </div>

              {/* Slider Handle (Divider Control) */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                bottom: 0, 
                left: `${sliderPos}%`, 
                width: '4px', 
                background: 'white', 
                zIndex: 3, 
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                transition: 'left 0.05s ease-out'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '48px',
                  height: '48px',
                  background: 'var(--secondary)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  border: '3px solid white',
                  userSelect: 'none'
                }}>
                  ↔
                </div>
              </div>

              {/* Hidden Range Input overlay for easy mobile/desktop drag handling */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos} 
                onChange={(e) => setSliderPos(Number(e.target.value))}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: '100%', 
                  height: '100%', 
                  opacity: 0, 
                  cursor: 'ew-resize', 
                  zIndex: 4 
                }} 
              />
            </div>
          </div>
        </section>

        {/* 8. TESTIMONIALS */}
        <section id="section-testimonials" className="section" style={{ background: 'var(--white)', padding: '95px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Client Praise
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                Testimonial Reviews
              </h2>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
              
              {/* Testimonial card */}
              <div style={{ 
                background: '#f8fafc', 
                padding: '40px 30px', 
                borderRadius: '24px', 
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'slideUp 0.6s ease-out'
              }}>
                <div style={{ color: '#F59E0B', fontSize: '1.35rem', marginBottom: '15px' }}>
                  {"★".repeat(testimonials[activeTestimonial].rating)}
                </div>
                
                <p style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '25px', maxWidth: '650px' }}>
                  "{testimonials[activeTestimonial].review}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={testimonials[activeTestimonial].image} 
                    alt={testimonials[activeTestimonial].name} 
                    style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--secondary)' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>{testimonials[activeTestimonial].name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{testimonials[activeTestimonial].role}</span>
                  </div>
                </div>
              </div>

              {/* Slider Dots indicators */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '25px' }}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      background: activeTestimonial === i ? 'var(--secondary)' : 'var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. BULK CTA SECTION */}
        <section id="section-bulk-cta" style={{ 
          background: 'linear-gradient(135deg, #0B2339 0%, #1a4975 100%)', 
          color: 'white', 
          padding: '80px 0', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glowing accents */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(43, 140, 138, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(43, 140, 138, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Procurement Savings
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, margin: '10px 0 15px' }}>
              Need bulk supply?
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 35px', lineHeight: 1.6 }}>
              Contact our laboratory team for custom chemical formulations, discounted bulk contract quotes, and dedicated regional distribution networks.
            </p>
            
            <Link href="/bulk-orders" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ 
                padding: '16px 50px', 
                fontSize: '1.05rem', 
                borderRadius: '12px',
                background: 'var(--secondary)',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 10px 20px rgba(43, 140, 138, 0.3)'
              }}>
                📋 Get Customized Quote
              </button>
            </Link>
          </div>
        </section>

      </main>

      {/* 10. DETAILED CORPORATE FOOTER */}
      <footer id="section-footer" style={{ background: 'var(--primary)', color: 'white', padding: '80px 0 40px', borderTop: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3.5rem' }}>
          
          {/* Logo & Brand Info */}
          <div>
            <img 
              src="/NBT Logo_.png" 
              alt="NBT Logo" 
              style={{ height: '70px', width: 'auto', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px' }} 
            />
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Your global partner in chemical distribution and custom manufacturing compliance. 
              Engineering highly concentrated surfactants and food-grade hygiene formulas.
            </p>
            
            {/* Social Icons row */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <span className="social-icon" title="Facebook">🌐 FB</span>
              <span className="social-icon" title="LinkedIn">🌐 LI</span>
              <span className="social-icon" title="Instagram">🌐 IG</span>
            </div>
          </div>

          {/* Quick Links Nav */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem' }}>Corporate Portal</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0 }}>
              <li><Link href="/" style={footerLinkStyle}>🏠 Home</Link></li>
              <li><Link href="/products" style={footerLinkStyle}>🛒 Products Catalog</Link></li>
              <li><Link href="/industries" style={footerLinkStyle}>🏭 Industries Served</Link></li>
              <li><Link href="/bulk-orders" style={footerLinkStyle}>📋 Bulk Quotes</Link></li>
              <li><Link href="/about" style={footerLinkStyle}>🔬 About Our Plant</Link></li>
              <li><Link href="/blog" style={footerLinkStyle}>📚 Chemical Blog</Link></li>
              <li><Link href="/contact" style={footerLinkStyle}>📞 Direct Contact</Link></li>
            </ul>
          </div>

          {/* Official Contacts */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem' }}>Direct Communication</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>📞</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>CALL OR TEXT</span>
                  <a href="tel:0246272115" style={{ color: 'white', fontWeight: 700 }}>0246272115</a>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>💬</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>WHATSAPP CHAT</span>
                  <a href="https://wa.me/233246272115" target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 700 }}>+233 24 627 2115</a>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>✉️</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>EMAIL COMPLIANCE</span>
                  <a href="mailto:info@neatbrandtrade.com" style={{ color: 'white', fontWeight: 700 }}>info@neatbrandtrade.com</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter Input Form */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem' }}>Chemical Newsletters</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Subscribe to receive active ingredient safety resources, dilution guides, and direct wholesale discount updates.
            </p>

            {newsletterSubscribed ? (
              <div style={{ background: 'rgba(43, 140, 138, 0.1)', border: '1px dashed var(--secondary)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem' }}>✓ Subscription Confirmed!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', background: 'var(--secondary)' }}>
                  Subscribe ✓
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="container" style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: '#64748b' }}>
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

      {/* Cart Drawer */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />

      {/* Elegant Toast Notifications */}
      <Toast 
        isOpen={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage('')}
        onViewCart={() => {
          setToastMessage('');
          setIsCartOpen(true);
        }}
      />

      {/* Floating contact helpers */}
      <FloatingContact />


      {/* Premium styles overlay */}
      <style>{`
        .trust-badge {
          background: #f1f5f9;
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          transition: transform 0.2s, background 0.2s;
          display: inline-block;
          border: 1px solid var(--border);
        }
        .trust-badge:hover {
          transform: translateY(-2px);
          background: #e2e8f0;
        }
        .category-card {
          padding: 35px 25px;
          border-radius: 20px;
          color: white;
          text-align: left;
          height: 100%;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .benefit-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s, box-shadow 0.3s;
          text-align: left;
        }
        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .social-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border-radius: 50%;
          display: flex;
          alignItems: center;
          justifyContent: center;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: bold;
          transition: background 0.2s, color 0.2s;
        }
        .social-icon:hover {
          background: var(--secondary);
          color: white;
        }
        @media (max-width: 768px) {
          .trusted-logo-panel {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
        footer a:hover {
          color: var(--secondary) !important;
        }
      `}</style>
    </div>
  );
}

const footerLinkStyle = {
  fontSize: '0.85rem',
  color: '#cbd5e1',
  textDecoration: 'none',
  transition: 'color 0.2s',
  display: 'inline-block'
};
