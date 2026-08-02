'use client';

import { useState } from 'react';
import { useMallMart } from '../hooks/useMallMart';
import { 
  Search, AlertTriangle, X, LogOut, Database, AlertCircle, Check, 
  RotateCcw, Activity 
} from 'lucide-react';

export default function SupervisorApp() {
  const { 
    orders, 
    isFirebase, 
    isLoaded, 
    flagOrder, 
    resolveFlag, 
    resetDemo 
  } = useMallMart();

  // Local state
  const [superSearch, setSuperSearch] = useState('');
  const [superFilter, setSuperFilter] = useState('all');
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagNoteText, setFlagNoteText] = useState('');
  const [selectedFlagOrderId, setSelectedFlagOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetDemo = async () => {
    try {
      await resetDemo();
      setSuperSearch('');
      setSuperFilter('all');
      setSelectedFlagOrderId(null);
      setFlagModalOpen(false);
      showToast("Database reset to standard mock states!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error resetting database.", "error");
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const flaggedOrders = orders.filter(o => o.flagged);

  // Apply search and status filters
  const filtered = orders.filter(order => {
    const searchLower = superSearch.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.mallName.toLowerCase().includes(searchLower) ||
      order.storeName.toLowerCase().includes(searchLower);

    if (superFilter === 'active') return matchesSearch && order.status !== 'Delivered';
    if (superFilter === 'flagged') return matchesSearch && order.flagged;
    return matchesSearch;
  });

  return (
    <div className="main-content-container" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* -------------------- HEADER -------------------- */}
      <header className="role-switcher-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#ffffff',
              borderRadius: '8px',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <img src="/logo.png" alt="Shopimami" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
              SHOPIMAMI<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </div>
          <span style={{
            fontSize: '0.75rem',
            background: isFirebase ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isFirebase ? '#34d399' : '#fbbf24',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isFirebase ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Database size={10} />
            {isFirebase ? 'Cloud Sync Active' : 'LocalStorage Offline Mock'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleResetDemo}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} />
            Reset Seed Data
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login?role=supervisor';
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* -------------------- MAIN PAGE CONTAINER -------------------- */}
      <main className="container main-content-container animate-fade" style={{ padding: '30px 15px 60px' }}>
        {!isLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', gap: '15px' }}>
            <Activity className="animate-spin" size={40} style={{ color: 'var(--secondary)' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing SHOPIMAMI database...</p>
          </div>
        ) : (
          <div className="animate-slide">
            
            {/* Statistics Header Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active In-Flight Orders</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginTop: '8px' }}>{activeOrders.length}</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #f59e0b' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Attention Flags</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', marginTop: '8px' }}>{flaggedOrders.length}</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Settled Today</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '8px' }}>{orders.filter(o => o.status === 'Delivered').length}</div>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
              
              {/* Left search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '10px', width: '350px', maxWidth: '100%' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by ID, customer, mall..." 
                  value={superSearch}
                  onChange={(e) => setSuperSearch(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                />
              </div>

              {/* Right tab switch */}
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'active', label: 'Active In-Flight' },
                  { id: 'flagged', label: 'Flagged Only' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSuperFilter(tab.id)}
                    style={{
                      background: superFilter === tab.id ? 'white' : 'none',
                      border: 'none',
                      boxShadow: superFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: superFilter === tab.id ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Orders Table */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700 }}>
                      <th style={{ padding: '14px 18px' }}>Order ID</th>
                      <th style={{ padding: '14px 18px' }}>Customer Details</th>
                      <th style={{ padding: '14px 18px' }}>Mall / Store</th>
                      <th style={{ padding: '14px 18px' }}>Subtotal / Total</th>
                      <th style={{ padding: '14px 18px' }}>Staff Assigned</th>
                      <th style={{ padding: '14px 18px' }}>Lifecycle Stage</th>
                      <th style={{ padding: '14px 18px' }}>Flag Attention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          No matching orders in the system.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(order => {
                        let badgeBg = '#f1f5f9';
                        let badgeColor = 'var(--text-muted)';
                        
                        if (order.status === 'Payment Confirmed') { badgeBg = '#ecfdf5'; badgeColor = '#065f46'; }
                        else if (order.status === 'Shopper Assigned & Shopping') { badgeBg = '#fff7ed'; badgeColor = '#c2410c'; }
                        else if (order.status === 'Paid at Mall') { badgeBg = '#fdf4ff'; badgeColor = '#86198f'; }
                        else if (order.status === 'Waiting for Rider') { badgeBg = '#e0f2fe'; badgeColor = '#0369a1'; }
                        else if (order.status === 'Out for Delivery') { badgeBg = '#f5f3ff'; badgeColor = '#5b21b6'; }
                        else if (order.status === 'Delivered') { badgeBg = '#f1f5f9'; badgeColor = '#475569'; }

                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="order-row">
                            <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)' }}>{order.id}</td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ display: 'block', fontWeight: 700 }}>{order.customerName}</span>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{order.phone}</span>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>📍 {order.location}</span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ display: 'block', fontWeight: 700 }}>{order.storeName}</span>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{order.mallName}</span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sub: GH₵ {order.subtotal.toFixed(2)}</span>
                              <strong style={{ display: 'block', color: 'var(--secondary)' }}>Tot: GH₵ {order.total.toFixed(2)}</strong>
                            </td>
                            <td style={{ padding: '14px 18px', color: 'var(--text-main)', fontWeight: 600 }}>
                              <span style={{ display: 'block' }}>🛒 S: {order.shopper || <span style={{ color: '#cbd5e1' }}>none</span>}</span>
                              <span style={{ display: 'block' }}>🏍️ R: {order.rider || <span style={{ color: '#cbd5e1' }}>none</span>}</span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{
                                background: badgeBg,
                                color: badgeColor,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                display: 'inline-block'
                              }}>
                                {order.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              {order.flagged ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontWeight: 700, fontSize: '0.75rem' }}>
                                    <AlertTriangle size={12} />
                                    Flagged
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.flagNote}>
                                    "{order.flagNote}"
                                  </span>
                                  <button 
                                    onClick={() => resolveFlag(order.id)}
                                    style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, marginTop: '2px' }}
                                  >
                                    Resolve Flag
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSelectedFlagOrderId(order.id);
                                    setFlagNoteText('');
                                    setFlagModalOpen(true);
                                  }}
                                  style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                                >
                                  Flag Order
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FLAG NOTE MODAL */}
            {flagModalOpen && (
              <div className="bottom-sheet-modal" style={{ zIndex: 3000 }}>
                <div className="bottom-sheet-content" style={{ padding: '24px', position: 'relative' }}>
                  <button 
                    onClick={() => setFlagModalOpen(false)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={18} />
                  </button>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={18} style={{ color: '#d97706' }} />
                    Flag Order {selectedFlagOrderId}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    Specify why this order needs operations attention.
                  </p>

                  <textarea 
                    rows="4"
                    placeholder="e.g. Price mismatch at Shoprite till, client requested item substitution..."
                    value={flagNoteText}
                    onChange={(e) => setFlagNoteText(e.target.value)}
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      padding: '10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      marginBottom: '15px',
                      resize: 'none'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      onClick={() => setFlagModalOpen(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: '8px 16px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        if (flagNoteText.trim()) {
                          await flagOrder(selectedFlagOrderId, flagNoteText);
                          setFlagModalOpen(false);
                          showToast(`Order ${selectedFlagOrderId} flagged.`);
                        }
                      }}
                      style={{
                        background: '#d97706',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm Flag
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          background: toast.type === 'error' ? '#ef4444' : '#1e293b',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} style={{ color: 'var(--secondary)' }} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
