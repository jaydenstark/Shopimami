'use client';
const CatalogPage = ({ onClose, products = [] }) => {
  const printCatalog = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      background: 'white', 
      zIndex: 5000, 
      overflowY: 'auto',
      padding: '40px 0'
    }}>
      <div className="container">
        {/* Header - Hidden in Print handled by CSS or just kept simple */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <img src="/NBT Logo_.png" alt="NBT Logo" style={{ height: '80px', marginBottom: '1rem' }} />
            <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)' }}>Official Product Catalog</h1>
            <p style={{ color: 'var(--text-muted)' }}>Neat Brand Trade | Premium Industrial & Retail Solutions</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
            <button onClick={printCatalog} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📄</span> Export to PDF / Print
            </button>
            <button onClick={onClose} className="btn btn-outline">Close Catalog</button>
          </div>
        </div>

        <div className="catalog-content">
          <h2 style={{ borderBottom: '2px solid var(--secondary)', paddingBottom: '10px', marginBottom: '2rem' }}>Retail Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {products.filter(p => p.type === 'retail').map(product => (
              <div key={product.id} className="catalog-item" style={{ 
                display: 'flex', 
                gap: '2rem', 
                padding: '20px', 
                border: '1px solid #eee', 
                borderRadius: '12px' 
              }}>
                <img src={product.image} alt={product.name} style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{product.description}</p>
                  <div style={{ display: 'flex', gap: '2rem' }}>

                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.7rem', color: 'var(--secondary)' }}>PRICING</span>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {product.sizes.map(s => (
                          <div key={s.size} style={{ fontSize: '0.9rem' }}>
                            <strong>{s.size}:</strong> GH₵ {s.price.toLocaleString('en-US')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ borderBottom: '2px solid var(--secondary)', paddingBottom: '10px', marginTop: '4rem', marginBottom: '2rem' }}>Industrial Solutions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {products.filter(p => p.type === 'industrial').map(product => (
              <div key={product.id} className="catalog-item" style={{ 
                display: 'flex', 
                gap: '2rem', 
                padding: '20px', 
                border: '1px solid #eee', 
                borderRadius: '12px' 
              }}>
                <img src={product.image} alt={product.name} style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{product.description}</p>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.7rem', color: 'var(--secondary)' }}>INDUSTRIAL PRICING</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '5px' }}>
                        {product.sizes.map(s => (
                          <div key={s.size} style={{ fontSize: '0.9rem', background: '#f8fafc', padding: '5px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <strong>{s.size}:</strong> GH₵ {s.price.toLocaleString('en-US')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid #eee', padding: '2rem 0' }}>
          <p style={{ fontWeight: 600 }}>Neat Brand Trade | Contact us for Bulk Inquiries</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISO 9001 Certified Manufacturing Standards</p>
        </div>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CatalogPage;
