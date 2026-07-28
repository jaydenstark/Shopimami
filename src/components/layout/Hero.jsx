'use client';

import Link from 'next/link';

const Hero = () => {
  return (
    <section style={{ 
      position: 'relative', 
      minHeight: 'clamp(550px, 80vh, 700px)', 
      display: 'flex', 
      alignItems: 'center', 
      color: 'white',
      overflow: 'hidden',
      background: 'var(--primary)'
    }}>
      {/* Background Looping Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          opacity: 0.35 // Soft visibility to keep text readable
        }}
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-water-droplets-liquid-12053-large.mp4" type="video/mp4" />
        {/* Fallback to premium styled background gradient if video fails */}
      </video>

      {/* Modern High-End Overlay Filters */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(10, 15, 22, 0.95) 0%, rgba(20, 25, 35, 0.8) 50%, rgba(255, 107, 0, 0.2) 100%)',
        zIndex: 2
      }}></div>

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        zIndex: 3,
        pointerEvents: 'none'
      }}></div>

      {/* Content Container */}
      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 4, 
        width: '100%', 
        paddingTop: '60px', 
        paddingBottom: '60px' 
      }}>
        <div style={{ maxWidth: '750px', animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          <span style={{ 
            color: 'var(--accent)', 
            fontWeight: 800, 
            letterSpacing: '2px', 
            textTransform: 'uppercase', 
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1rem',
            background: 'rgba(255, 209, 0, 0.1)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255, 209, 0, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🛍️</span> THE PREMIER SHOPPING DESTINATION
          </span>

          <h1 style={{ 
            fontSize: 'clamp(3rem, 6vw, 4.5rem)', 
            lineHeight: '1.1', 
            fontWeight: 800, 
            marginBottom: '1.5rem',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-1.5px',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            Shop the Best of <br />
            <span style={{ 
              background: 'linear-gradient(to right, var(--secondary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              display: 'inline-block'
            }}>Ghana's Premium Mall</span>
          </h1>

          <p style={{ 
            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', 
            opacity: 0.9, 
            marginBottom: '2.5rem', 
            lineHeight: 1.6,
            fontWeight: '400',
            color: '#e2e8f0',
            maxWidth: '600px'
          }}>
            Discover unmatched quality across fashion, electronics, and daily essentials. Enjoy lightning-fast delivery and secure mobile money payments anywhere in Ghana.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ 
                padding: '16px 36px', 
                fontSize: '1.05rem', 
                borderRadius: 'var(--radius-full)',
                fontWeight: 700
              }}>
                🛒 Start Shopping
              </button>
            </Link>
            <Link href="#categories" style={{ textDecoration: 'none' }}>
              <button className="btn btn-outline" style={{ 
                padding: '16px 36px', 
                fontSize: '1.05rem', 
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                fontWeight: 700
              }}>
                Explore Categories
              </button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '3rem', 
            marginTop: '4rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            flexWrap: 'wrap'
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>10k+</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Items</p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>24Hr</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Accra Delivery</p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>MoMo</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Secure Payments</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
