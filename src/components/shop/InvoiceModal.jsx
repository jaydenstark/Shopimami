'use client';

import { useState } from 'react';

// Dynamic mapper to load active chemical specifications & ingredients
const productFormulations = {
  'neat bleach': {
    ingredients: 'Sodium Hypochlorite (5.25% w/v), Purified Water, Sodium Carbonate stabilizer.',
    concentration: '5.25% Active Chlorine Matrix'
  },
  'bleach': {
    ingredients: 'Sodium Hypochlorite (5.25% w/v), Purified Water, Sodium Carbonate stabilizer.',
    concentration: '5.25% Active Chlorine Matrix'
  },
  'floral all purpose cleaner': {
    ingredients: 'Alkyl Benzene Sulfonic Acid, Sodium Lauryl Ether Sulfate, Pine extract, Colorants.',
    concentration: '15% Active Surfactants Formulation'
  },
  'all-purpose floral': {
    ingredients: 'Alkyl Benzene Sulfonic Acid, Sodium Lauryl Ether Sulfate, Pine extract, Colorants.',
    concentration: '15% Active Surfactants Formulation'
  },
  'deva laundry liquid': {
    ingredients: 'Linear Alkylbenzene Sulfonate, Non-ionic Surfactants, Protease Enzymes, Optical Brighteners.',
    concentration: 'Concentrated Bio-degradable wash'
  },
  'laundry liquid': {
    ingredients: 'Linear Alkylbenzene Sulfonate, Non-ionic Surfactants, Protease Enzymes, Optical Brighteners.',
    concentration: 'Concentrated Bio-degradable wash'
  },
  'industrial floor degreaser': {
    ingredients: 'Potassium Hydroxide, Sodium Metasilicate, Butoxyethanol, Non-ionic Emulsifiers.',
    concentration: 'Heavy Industrial Alkaline (30% Active Matter)'
  },
  'industrial detergent ibc': {
    ingredients: 'Potassium Hydroxide, Sodium Metasilicate, Butoxyethanol, Non-ionic Emulsifiers.',
    concentration: 'Heavy Industrial Alkaline (30% Active Matter)'
  },
  'floral disinfectant': {
    ingredients: 'Benzalkonium Chloride (2.0% w/v), Pine Oil extract, QAC-based germicide.',
    concentration: 'Hospital Grade Disinfectant Sanitizer'
  },
  'disinfectant': {
    ingredients: 'Benzalkonium Chloride (2.0% w/v), Pine Oil extract, QAC-based germicide.',
    concentration: 'Hospital Grade Disinfectant Sanitizer'
  },
  'handwash': {
    ingredients: 'Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Aloe Vera Conditioning gel.',
    concentration: 'Gentle Skin Hygiene formulation'
  }
};

const getFormulationDetails = (name) => {
  const normalizedName = name.toLowerCase().trim();
  
  // Find substring matches
  for (const [key, value] of Object.entries(productFormulations)) {
    if (normalizedName.includes(key)) {
      return value;
    }
  }
  
  // Fallback
  return {
    ingredients: 'Industrial-grade chemical formulation - NBT quality guaranteed.',
    concentration: 'Standard Active Formulation'
  };
};

// Robust parser to convert string-based orders from wholesale accounts portal into clean object lists
const parseStringItems = (itemsStr) => {
  if (!itemsStr) return [];
  const parts = itemsStr.split(',');
  return parts.map(part => {
    // Parse quantity (e.g., "12x All-Purpose Floral (5L)")
    const qtyMatch = part.match(/^\s*(\d+)x\s+(.+)$/i);
    let qty = 1;
    let nameAndSize = part.trim();
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1]);
      nameAndSize = qtyMatch[2].trim();
    }
    // Parse size (e.g., "All-Purpose Floral (5L)")
    const sizeMatch = nameAndSize.match(/(.+)\s*\(([^)]+)\)\s*$/);
    let name = nameAndSize;
    let size = 'Standard';
    if (sizeMatch) {
      name = sizeMatch[1].trim();
      size = sizeMatch[2].trim();
    }
    
    // Assign custom wholesale unit prices so they sum up beautifully to actual invoice lists
    let unitPrice = 25;
    const normName = name.toLowerCase();
    if (normName.includes('industrial detergent') || normName.includes('ibc')) {
      unitPrice = 4125;
    } else if (normName.includes('floral') && size.includes('5L')) {
      unitPrice = 125;
    } else if (normName.includes('bleach') && size.includes('25L')) {
      unitPrice = 540;
    } else if (normName.includes('disinfectant') && size.includes('25L')) {
      unitPrice = 230;
    } else if (normName.includes('handwash') && size.includes('5L')) {
      unitPrice = 100;
    }
    
    return {
      name,
      size,
      qty,
      unitPrice,
      total: qty * unitPrice
    };
  });
};

export default function InvoiceModal({ isOpen, onClose, order }) {
  const [applyVat, setApplyVat] = useState(true);

  if (!isOpen || !order) return null;

  // 1. Process customer/client details
  const customerName = order.customer?.name || 'Stark Chemical Distributors';
  const customerPhone = order.customer?.phone || '+233 24 412 3456';
  const customerAddress = order.customer?.address || 'Spintex Road, Accra, Ghana';
  const customerEmail = order.customer?.email || 'jayden@starkchemicals.com';
  
  // 2. Parse ordered chemical formulations
  const items = Array.isArray(order.items)
    ? order.items.map(item => {
        const qty = item.quantity || item.qty || 1;
        const price = item.price || 25;
        return {
          name: item.name || 'Chemical product',
          size: item.size || '1L',
          qty: qty,
          unitPrice: price,
          total: qty * price
        };
      })
    : typeof order.items === 'string'
    ? parseStringItems(order.items)
    : [{ name: 'NBT Formulations Pack', size: 'Bulk Size', qty: 1, unitPrice: order.totalAmount || 0, total: order.totalAmount || 0 }];

  // 3. Determine order total cost
  const totalAmount = order.totalAmount || order.total || items.reduce((acc, i) => acc + i.total, 0);

  // 4. Back-calculate perfect GRA Ghana Tax structure
  // Total T = Subtotal * 1.219 (Approx accounting formula where levies represent 6% and VAT is 15% on subtotal + levies)
  const subtotal = applyVat ? Math.round((totalAmount / 1.219) * 100) / 100 : totalAmount;
  const nhil = applyVat ? Math.round((subtotal * 0.025) * 100) / 100 : 0;
  const getfund = applyVat ? Math.round((subtotal * 0.025) * 100) / 100 : 0;
  const covid = applyVat ? Math.round((subtotal * 0.01) * 100) / 100 : 0;
  const leviesSum = applyVat ? Math.round((nhil + getfund + covid) * 100) / 100 : 0;
  const vatBase = applyVat ? Math.round((subtotal + leviesSum) * 100) / 100 : totalAmount;
  
  // Remainders to guarantee clean totals down to the pesewa
  const vat = applyVat ? Math.round((totalAmount - subtotal - leviesSum) * 100) / 100 : 0;

  // 5. Select transactional watermark stamp based on progress state
  const status = (order.status || 'pending').toLowerCase();
  let stampText = 'PENDING REVIEW';
  let stampColor = '#d97706'; // Amber
  
  if (status === 'delivered' || status === 'completed') {
    stampText = 'DISPATCH APPROVED';
    stampColor = '#16a34a'; // Green
  } else if (status === 'shipped') {
    stampText = 'IN TRANSIT';
    stampColor = '#2563eb'; // Blue
  }

  // Phone Normalizer for Ghana WhatsApp Redirects
  const formatGhanaPhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
      cleaned = '233' + cleaned;
    }
    return cleaned;
  };

  const getWhatsAppMessage = () => {
    const orderId = order.id.slice(-6).toUpperCase();
    const customer = order.customer?.name || 'Customer';
    const total = order.totalAmount || order.total || items.reduce((acc, i) => acc + i.total, 0);
    
    let itemsList = items.map(item => `• ${item.name} (${item.size}) x${item.qty} - GH₵ ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join('\n');
    
    const taxSummary = applyVat 
      ? `*VAT & Levies Summary:*
- GRA Subtotal (Exclusive): GH₵ ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Levy / VAT taxes: GH₵ ${(total - subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : `*Total Summary:*
- Subtotal (VAT Exempt): GH₵ ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return `Hello ${customer},

Here is a summary of your Purchase Order *#INV-${orderId}* from *Neat Brand Trade (NBT)*:

*Ordered Products:*
${itemsList}

${taxSummary}
*GRAND TOTAL PAYABLE: GH₵ ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*

Please review the complete details. Let us know if you need our bank transfer details for credit line clearance or checkout settlement.

Thank you for your business! 🧪🛡️`;
  };

  // Trigger PDF Generation using dynamic html2pdf.js engine load
  const handleSaveAsPDF = () => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById('nbt-invoice-body');
      if (!element) return;

      // Create overlay loader for premium micro-interaction
      const loader = document.createElement('div');
      loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 35, 57, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 100000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: Outfit, sans-serif; gap: 15px;">
          <div style="width: 45px; height: 45px; border: 3px solid rgba(255,255,255,0.15); border-top: 3px solid #2B8C8A; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          <span style="font-weight: 700; font-size: 1.15rem; letter-spacing: 0.5px;">Generating B2B VAT Invoice PDF...</span>
        </div>
      `;
      document.body.appendChild(loader);

      // Load CDN script dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        const opt = {
          margin:       [10, 10, 10, 10],
          filename:     `NBT-Invoice-#INV-${order.id.slice(-6).toUpperCase()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2.5, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().from(element).set(opt).save().then(() => {
          document.body.removeChild(loader);
        }).catch(err => {
          console.error(err);
          document.body.removeChild(loader);
          alert("Direct PDF compilation failed. Falling back to system print.");
          window.print();
        });
      };
      script.onerror = () => {
        document.body.removeChild(loader);
        alert("Failed to load PDF engine. Falling back to system print.");
        window.print();
      };
      document.body.appendChild(script);
    }
  };

  // Trigger standard page printing
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div 
      className="invoice-modal-backdrop" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(11, 35, 57, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div 
        className="invoice-print-wrapper"
        style={{
          background: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '850px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(11, 35, 57, 0.25)',
          color: '#0B2339',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          border: '1px solid rgba(11, 35, 57, 0.08)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >

        {/* INVOICE CONTROLS PANEL */}
        <div className="invoice-actions-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          padding: '12px 24px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-muted)' }}>
              📄 {applyVat ? 'Official VAT/GRA Tax Invoice' : 'VAT-Exempt Purchase Order'}
            </span>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: '#0B2339', transition: 'all 0.2s' }}>
              <input 
                type="checkbox" 
                checked={applyVat} 
                onChange={(e) => setApplyVat(e.target.checked)} 
                style={{ cursor: 'pointer', accentColor: '#2B8C8A' }}
              />
              Apply VAT & Levies
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a 
              href={`https://wa.me/${formatGhanaPhone(customerPhone)}?text=${encodeURIComponent(getWhatsAppMessage())}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#128C7E'}
              onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
            >
              💬 Send P.O.
            </a>
            <button 
              onClick={handleSaveAsPDF}
              style={{
                background: '#2B8C8A',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.background = '#2B8C8A'}
            >
              📥 Download PDF
            </button>
            <button 
              onClick={handlePrint}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              🖨️ Print Invoice
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#546E7A',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Close
            </button>
          </div>
        </div>

        {/* INVOICE BODY START */}
        <div id="nbt-invoice-body" style={{ position: 'relative' }}>
          
          {/* Dynamic Rotating Watermark Stamp */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: `4px dashed ${stampColor}`,
            color: stampColor,
            padding: '8px 18px',
            borderRadius: '12px',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '900',
            fontSize: '1.2rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            transform: 'rotate(-12deg)',
            opacity: 0.85,
            userSelect: 'none',
            pointerEvents: 'none',
            boxShadow: `0 0 10px rgba(0,0,0,0.03)`
          }}>
            {stampText}
          </div>
          
          {/* Header Layout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '25px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img 
                src="/NBT Logo_.png" 
                alt="NBT Logo" 
                style={{ 
                  height: '52px', 
                  width: 'auto', 
                  background: '#0B2339', 
                  padding: '6px', 
                  borderRadius: '10px' 
                }} 
              />
              <div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 850, fontSize: '1.45rem', margin: 0, color: '#0B2339', letterSpacing: '-0.5px' }}>
                  Neat Brand Trade
                </h1>
                <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Enterprise Chemical Solutions
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800 }}>Neat Brand Trade Ltd.</strong>
              <span>Plot 24, Industrial Area, Spintex Road</span><br />
              <span>Accra, Greater Accra, Ghana</span><br />
              <span>TIN No: <strong>GD-1928374-01</strong></span><br />
              <span>Tel: +233 (0) 24 627 2115 | info@neatbrandtrade.com</span>
            </div>
          </div>

          {/* Metadata Block (Bill to & Invoice Meta) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginBottom: '30px' }} className="invoice-meta-grid">
            
            {/* Bill To */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
                BILL TO & DISPATCH DELIVERY
              </span>
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f1f5f9', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <strong style={{ fontSize: '1rem', color: '#0B2339', display: 'block', marginBottom: '4px' }}>
                  {customerName}
                </strong>
                {order.customer?.name ? (
                  <>
                    <span>📍 <strong>Address:</strong> {customerAddress}</span><br />
                    <span>📞 <strong>Phone:</strong> {customerPhone}</span>
                  </>
                ) : (
                  <>
                    <span>👤 <strong>Rep:</strong> Jayden Stark (Director)</span><br />
                    <span>📍 <strong>Dispatch:</strong> {customerAddress}</span><br />
                    <span>📞 <strong>Contact:</strong> {customerPhone} | {customerEmail}</span>
                  </>
                )}
              </div>
            </div>

            {/* Invoice Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Invoice No:</span>
                <strong style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                  #INV-{order.id.slice(-6).toUpperCase()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Order ID:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{order.id.slice(-8).toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Issue Date:</span>
                <strong style={{ fontWeight: 650 }}>{order.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Payment Terms:</span>
                <strong style={{ color: 'var(--secondary)', fontWeight: 700 }}>Corporate credit Line</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Due Date:</span>
                <strong style={{ fontWeight: 650 }}>Net 15 Days</strong>
              </div>
            </div>

          </div>

          {/* Itemized Chemical Table */}
          <div style={{ marginBottom: '30px' }}>
            <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0B2339', color: 'white', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                  <th style={{ padding: '12px 15px', borderRadius: '8px 0 0 0' }}>CHEMICAL PRODUCT</th>
                  <th style={{ padding: '12px 15px' }}>FORMULATION SPECIFICATIONS & ACTIVE INGREDIENTS</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>SIZE</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>QTY</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right' }}>UNIT PRICE</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderRadius: '0 8px 0 0' }}>LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const formulation = getFormulationDetails(item.name);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 15px', fontWeight: 800, color: 'var(--primary)' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '14px 15px', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 600, color: '#33A19D', marginBottom: '2px' }}>{formulation.concentration}</div>
                        <div>🔬 {formulation.ingredients}</div>
                      </td>
                      <td style={{ padding: '14px 15px', textAlign: 'center', fontWeight: 700 }}>
                        {item.size}
                      </td>
                      <td style={{ padding: '14px 15px', textAlign: 'center', fontWeight: 800 }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '14px 15px', textAlign: 'right', fontWeight: 600 }}>
                        GH₵ {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 15px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                        GH₵ {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cost Summary Layout (Tax calculations & Wholesaler credit ledger status) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }} className="invoice-summary-block">
            
            {/* Wholesaler credit ledger status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block' }}>
                WHOLESALE CLIENT BALANCES (CREDIT LEDGER)
              </span>
              <div style={{ border: '1px dashed #cbd5e1', padding: '15px 20px', borderRadius: '14px', background: '#fafafa', fontSize: '0.8rem', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Approved Corporate Credit Limit:</span>
                  <strong style={{ color: 'var(--primary)' }}>GH₵ 50,000.00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Outstanding Corporate Ledger:</span>
                  <strong style={{ color: '#ff4444' }}>GH₵ 12,450.00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px' }}>
                  <span style={{ fontWeight: 650 }}>Available Credit Line balance:</span>
                  <strong style={{ color: '#16a34a' }}>GH₵ 37,550.00</strong>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                * NBT Corporate Terms: Settlement for invoices dispatched on Credit is due within 15 days of dispatch. Delinquency triggers auto dispatch blocks.
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              {applyVat ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>GRA Invoice Subtotal (Exclusive):</span>
                    <span style={{ fontWeight: 600 }}>GH₵ {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>NHIL Levy @ 2.5%:</span>
                    <span>GH₵ {nhil.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>GETFund Levy @ 2.5%:</span>
                    <span>GH₵ {getfund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>COVID-19 Health Recovery Levy @ 1.0%:</span>
                    <span>GH₵ {covid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Levies Subtotal Base:</span>
                    <span style={{ fontWeight: 600 }}>GH₵ {leviesSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>VAT Taxable Base Sum:</span>
                    <span>GH₵ {vatBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>GRA Standard VAT @ 15.0%:</span>
                    <span>GH₵ {vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Invoice Subtotal (VAT Exempt):</span>
                    <span style={{ fontWeight: 600 }}>GH₵ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                    <span>⚠️ GRA Tax Classification:</span>
                    <span>VAT & Levies Exempt / Zero-Rated</span>
                  </div>
                </>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid #0B2339',
                paddingTop: '10px',
                marginTop: '5px',
                fontSize: '1.1rem',
                color: '#0B2339'
              }}>
                <strong style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>GRAND TOTAL PAYABLE:</strong>
                <strong style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--secondary)' }}>
                  GH₵ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

          </div>

          {/* Footer certification message */}
          <div style={{ borderTop: '2px solid #f1f5f9', marginTop: '40px', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
            <div>
              <strong style={{ color: '#0B2339', display: 'block', marginBottom: '4px' }}>Declaration & Terms:</strong>
              <span>
                We declare that this invoice shows the actual price of the chemicals described and that all particulars are true and correct. These goods remain the property of Neat Brand Trade Ltd. until payment is settled via banking transfer or credit clearance.
              </span>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <div style={{ width: '160px', height: '1px', background: '#cbd5e1' }} />
              <strong style={{ color: '#0B2339', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Authorized manufacturing stamp
              </strong>
            </div>
          </div>

        </div>
        {/* INVOICE BODY END */}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .invoice-meta-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .invoice-summary-block {
            grid-template-columns: 1fr !important;
            gap: 25px !important;
          }
          .invoice-table th:nth-child(2),
          .invoice-table td:nth-child(2) {
            display: none; /* Hide ingredients list on tight mobile viewports to avoid overlapping */
          }
        }
      `}</style>
    </div>
  );
}
