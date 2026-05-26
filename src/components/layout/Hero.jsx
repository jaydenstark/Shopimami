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
        background: 'linear-gradient(135deg, rgba(11, 35, 57, 0.95) 0%, rgba(15, 45, 75, 0.8) 50%, rgba(43, 140, 138, 0.4) 100%)',
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
            color: 'var(--secondary)', 
            fontWeight: 800, 
            letterSpacing: '3px', 
            textTransform: 'uppercase', 
            fontSize: '0.85rem',
            display: 'inline-block',
            marginBottom: '1rem',
            background: 'rgba(43, 140, 138, 0.15)',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(43, 140, 138, 0.3)'
          }}>
            🧪 LABORATORY CERTIFIED FORMULATIONS
          </span>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', 
            lineHeight: '1.15', 
            fontWeight: 800, 
            marginBottom: '1.5rem',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-1px'
          }}>
            Industrial Cleaning & <br />
            <span style={{ 
              background: 'linear-gradient(to right, #ffffff, #a5f3fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Hygiene Solutions</span> You Can Trust
          </h1>

          <p style={{ 
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', 
            opacity: 0.9, 
            marginBottom: '2.5rem', 
            lineHeight: 1.6,
            fontWeight: '400',
            color: '#e2e8f0'
          }}>
            Professional cleaning products for homes, offices, schools, restaurants, factories and businesses. Engineered for ultimate active ingredient concentration.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ 
                padding: '16px 36px', 
                fontSize: '1.05rem', 
                borderRadius: '12px',
                background: 'var(--secondary)',
                color: 'white',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(43, 140, 138, 0.4)',
                fontWeight: 700
              }}>
                🛒 Shop Now
              </button>
            </Link>
            <Link href="/bulk-orders" style={{ textDecoration: 'none' }}>
              <button className="btn btn-outline" style={{ 
                padding: '16px 36px', 
                fontSize: '1.05rem', 
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(8px)',
                fontWeight: 700
              }}>
                📋 Request Bulk Quote
              </button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '2.5rem', 
            marginTop: '4rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            flexWrap: 'wrap'
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>100%</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active Concentration</p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>ISO 9001</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Certified Quality</p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>Direct</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Wholesale Pricing</p>
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
