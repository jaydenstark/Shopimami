'use client';
import { useState } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ onAddToCart, products = [] }) => {
  const [catalogType, setCatalogType] = useState('retail');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique categories dynamically from products
  const categories = ['All', ...new Set(products.filter(p => p.type === catalogType && p.category).map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesType = p.type === catalogType;
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <section id="products" className="section" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Product Catalog</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Choose between our premium retail products or heavy-duty industrial solutions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          marginBottom: '2rem',
          padding: '0.5rem',
          background: '#f1f5f9',
          borderRadius: '12px',
          width: 'fit-content',
          margin: '0 auto 2rem'
        }}>
          <button 
            onClick={() => { setCatalogType('retail'); setFilterCategory('All'); setSearchTerm(''); }}
            className={catalogType === 'retail' ? 'btn btn-primary' : 'btn'}
            style={{ 
              borderRadius: '8px', 
              padding: '10px 30px',
              boxShadow: catalogType === 'retail' ? '0 4px 12px rgba(11, 35, 57, 0.2)' : 'none',
              background: catalogType === 'retail' ? 'var(--primary)' : 'transparent',
              color: catalogType === 'retail' ? 'white' : 'var(--text-muted)'
            }}
          >
            🛍️ Retail Products
          </button>
          <button 
            onClick={() => { setCatalogType('industrial'); setFilterCategory('All'); setSearchTerm(''); }}
            className={catalogType === 'industrial' ? 'btn btn-primary' : 'btn'}
            style={{ 
              borderRadius: '8px', 
              padding: '10px 30px',
              boxShadow: catalogType === 'industrial' ? '0 4px 12px rgba(11, 35, 57, 0.2)' : 'none',
              background: catalogType === 'industrial' ? 'var(--primary)' : 'transparent',
              color: catalogType === 'industrial' ? 'white' : 'var(--text-muted)'
            }}
          >
            🏗️ Industrial Solutions
          </button>
        </div>

        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          marginBottom: '3rem', 
          alignItems: 'center',
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          maxWidth: '800px',
          margin: '0 auto 4rem'
        }}>
          <div style={{ width: '100%', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search products by name or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 45px',
                borderRadius: '12px',
                border: '2px solid #f1f5f9',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--secondary)'}
              onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.75rem', opacity: 0.5, letterSpacing: '1px' }}>CATEGORIES</span>
            {categories.map(c => (
              <button 
                key={c} 
                onClick={() => setFilterCategory(c)}
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.85rem', 
                  borderRadius: '30px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: filterCategory === c ? 'var(--primary)' : '#f8fafc',
                  color: filterCategory === c ? 'white' : 'var(--text-main)',
                  border: filterCategory === c ? 'none' : '1px solid #e2e8f0',
                  boxShadow: filterCategory === c ? '0 4px 12px rgba(11, 35, 57, 0.15)' : 'none'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No Products Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We couldn't find anything matching "{searchTerm}" in the {catalogType} catalog.</p>
            <button 
              className="btn btn-outline"
              onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
              style={{ padding: '10px 30px', borderRadius: '10px' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
            />
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
