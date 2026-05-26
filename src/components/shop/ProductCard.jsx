'use client';
import { useState } from 'react';
import Link from 'next/link';

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const startingSize = product.sizes[0];
  const rating = product.rating || 5.0;

  const renderStars = (score) => {
    const rounded = Math.round(score);
    return (
      <div style={{ color: '#F59E0B', display: 'flex', gap: '3px', alignItems: 'center' }}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 600 }}>
          ({score.toFixed(1)})
        </span>
      </div>
    );
  };

  const slug = product.slug || product.name?.replace(/\s+/g, '-').toLowerCase();

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails ? onViewDetails(product) : null}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 40px rgba(11, 35, 57, 0.12)' : 'var(--shadow-sm)',
        background: 'var(--white)',
        borderRadius: '20px',
        overflow: 'hidden',
        border: isHovered ? '1px solid var(--secondary)' : '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Dynamic Availability Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: product.availability === 'In Stock' 
          ? 'rgba(34, 197, 94, 0.12)' 
          : product.availability === 'Direct Manufacture'
            ? 'rgba(245, 158, 11, 0.12)'
            : 'rgba(59, 130, 246, 0.12)',
        color: product.availability === 'In Stock' 
          ? '#16a34a' 
          : product.availability === 'Direct Manufacture'
            ? '#d97706'
            : '#2563eb',
        padding: '4px 10px',
        borderRadius: '30px',
        fontSize: '0.7rem',
        fontWeight: 700,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        border: `1px solid ${
          product.availability === 'In Stock' 
            ? 'rgba(34, 197, 94, 0.2)' 
            : product.availability === 'Direct Manufacture'
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(59, 130, 246, 0.2)'
        }`
      }}>
        <span style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          background: product.availability === 'In Stock' 
            ? '#22c55e' 
            : product.availability === 'Direct Manufacture'
              ? '#f59e0b'
              : '#3b82f6'
        }} />
        {product.availability}
      </div>

      {/* Product Image Section */}
      <div className="product-image" style={{ 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <img 
          src={product.image} 
          alt={product.name} 
          style={{ 
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }} 
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 35, 57, 0.02), transparent)',
          pointerEvents: 'none'
        }}></div>
      </div>

      {/* Product Info Section */}
      <div className="product-info" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span className="product-brand" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>
          {product.brand}
        </span>
        <h3 className="product-name" style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700, lineHeight: 1.35, minHeight: '2.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        
        <p className="product-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flexGrow: 1, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description || 'Precision-formulated chemical compound engineered for ultimate purity, strength, and reliable cleaning performance.'}
        </p>

        {/* Pricing and Stars Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(0,0,0,0.04)'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              GH₵ {startingSize?.price?.toLocaleString('en-US')}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              ({startingSize?.size})
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', textAlign: 'right', marginBottom: '4px' }}>Rating</span>
            {renderStars(rating)}
          </div>
        </div>

        {/* Side-by-Side Action CTAs */}
        <div 
          className="product-actions" 
          onClick={(e) => e.stopPropagation()} // Prevent card viewDetails trigger
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px', 
            width: '100%' 
          }}
        >
          <button 
            className="btn btn-primary" 
            style={{ 
              padding: '10px 4px', 
              fontSize: '0.82rem',
              borderRadius: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'var(--transition)'
            }}
            onClick={() => onAddToCart(product, startingSize)}
          >
            🛒 Add to Cart
          </button>
          
          <Link
            href={`/products/${slug}`}
            className="btn btn-outline"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              padding: '10px 4px', 
              fontSize: '0.82rem',
              borderRadius: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              background: 'transparent',
              transition: 'var(--transition)',
              textDecoration: 'none',
            }}
          >
            👁️ View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

