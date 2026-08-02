'use client';

import { useState } from 'react';
import { useMallMart } from '../hooks/useMallMart';
import { ShoppingBag, Check, Lock, LogOut, Database, AlertCircle, Activity } from 'lucide-react';

export default function ShopperApp() {
  const { 
    orders, 
    isFirebase, 
    isLoaded, 
    acceptOrder, 
    toggleItemChecked, 
    payStore, 
    handOffToRider 
  } = useMallMart();

  // Local state
  const [selectedShopper, setSelectedShopper] = useState("Ekow Appiah");
  const [shopperMallId, setShopperMallId] = useState("accra_mall");
  const [activeShopperOrderId, setActiveShopperOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const activeShopperOrder = orders.find(o => o.id === activeShopperOrderId);
  
  const mallNameMap = {
    accra_mall: 'Accra Mall',
    west_hills: 'West Hills Mall',
    ac_mall: 'A&C Mall'
  };
  const shopperMallName = mallNameMap[shopperMallId];

  // Available orders: Payment Confirmed and at this mall
  const availableOrders = orders.filter(
    o => o.status === 'Payment Confirmed' && o.mallName === shopperMallName
  );

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
        <div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login?role=shopper';
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
          <div className="animate-slide" style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Profile / Settings Bar */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  👨‍💼
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE MALL SHOPPER</label>
                  <select 
                    value={selectedShopper} 
                    onChange={(e) => setSelectedShopper(e.target.value)}
                    style={{ background: 'none', border: 'none', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Ekow Appiah">Ekow Appiah</option>
                    <option value="Adjoa Sarfo">Adjoa Sarfo</option>
                    <option value="Kofi Owusu">Kofi Owusu</option>
                    <option value="Ama Koomson">Ama Koomson</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>ASSIGNED LOCATION</label>
                <select 
                  value={shopperMallId} 
                  onChange={(e) => {
                    setShopperMallId(e.target.value);
                    setActiveShopperOrderId(null);
                  }}
                  style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 800, color: 'var(--secondary)', outline: 'none', cursor: 'pointer', textAlign: 'right' }}
                >
                  <option value="accra_mall">Accra Mall</option>
                  <option value="west_hills">West Hills Mall</option>
                  <option value="ac_mall">A&C Mall</option>
                </select>
              </div>
            </div>

            {/* If shopping on an order */}
            {activeShopperOrder ? (
              <div className="animate-slide" style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                {/* Checklist Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {activeShopperOrder.status}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
                      Checklist for {activeShopperOrder.id}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Store: <strong>{activeShopperOrder.storeName}</strong> ({activeShopperOrder.mallName})</p>
                  </div>
                  
                  <button 
                    onClick={() => setActiveShopperOrderId(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ← Back to Queue
                  </button>
                </div>

                {/* Item checklist cards */}
                <div style={{ marginBottom: '24px' }}>
                  {activeShopperOrder.items.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => toggleItemChecked(activeShopperOrder.id, item.name)}
                      className={`checklist-item ${item.picked ? 'checked' : ''}`}
                    >
                      <div className="checklist-checkbox">
                        {item.picked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <span className="checklist-text">{item.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Action Panel based on sub-stages */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  {activeShopperOrder.status === 'Shopper Assigned & Shopping' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {activeShopperOrder.items.filter(i => i.picked).length} of {activeShopperOrder.items.length} items checked
                      </span>
                      <button 
                        disabled={!activeShopperOrder.items.every(item => item.picked)}
                        onClick={async () => {
                          await payStore(activeShopperOrder.id);
                          showToast("Till Mobile Money payment authorized & paid!");
                        }}
                        style={{
                          background: activeShopperOrder.items.every(item => item.picked) ? '#10b981' : '#cbd5e1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px 24px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: activeShopperOrder.items.every(item => item.picked) ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Lock size={14} />
                        Pay store subtotal (GH₵ {activeShopperOrder.subtotal.toFixed(2)})
                      </button>
                    </div>
                  )}

                  {activeShopperOrder.status === 'Paid at Mall' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <p style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '15px', fontWeight: 600 }}>
                        ✓ Store has been successfully paid via direct MoMo transfer. Pack the items neatly.
                      </p>
                      <button 
                        onClick={async () => {
                          await handOffToRider(activeShopperOrder.id);
                          setActiveShopperOrderId(null);
                          showToast("Order handed over to Dispatch Counter!");
                        }}
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px 30px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        Hand Over to Dispatch Desk
                      </button>
                    </div>
                  )}

                  {activeShopperOrder.status !== 'Shopper Assigned & Shopping' && activeShopperOrder.status !== 'Paid at Mall' && (
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Order is currently at stage: <strong>{activeShopperOrder.status}</strong>. Your part as Shopper is completed!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px', color: 'var(--primary)' }}>
                  Order Queue at <span style={{ color: 'var(--secondary)' }}>{shopperMallName}</span>
                </h3>
                
                {availableOrders.length === 0 ? (
                  <div style={{ background: 'white', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ShoppingBag size={40} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                    <strong>No newly paid orders at {shopperMallName} right now.</strong>
                    <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      Orders placed by the Customer App with MTN MoMo/Telecel payments will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {availableOrders.map(order => (
                      <div 
                        key={order.id}
                        style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{order.id}</span>
                            <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>{order.storeName}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            <strong>Customer:</strong> {order.customerName} ({order.items.length} items)
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            📍 {order.location}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>GH₵ {order.total.toFixed(2)}</span>
                          <button 
                            onClick={async () => {
                              await acceptOrder(order.id, selectedShopper);
                              setActiveShopperOrderId(order.id);
                              showToast(`Assigned yourself to ${order.id}. Happy picking!`);
                            }}
                            style={{
                              background: 'var(--secondary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Accept Shopping Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
