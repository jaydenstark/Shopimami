'use client';

import { useState } from 'react';
import { useMallMart } from '../hooks/useMallMart';
import { Truck, MapPin, LogOut, Database, AlertCircle, Check, Activity } from 'lucide-react';

export default function RiderApp() {
  const { 
    orders, 
    isFirebase, 
    isLoaded, 
    acceptDelivery, 
    markDelivered 
  } = useMallMart();

  // Local state
  const [selectedRider, setSelectedRider] = useState("Yaw Preko");
  const [activeRiderOrderId, setActiveRiderOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const activeRiderOrder = orders.find(o => o.id === activeRiderOrderId);
  const readyOrders = orders.filter(o => o.status === 'Waiting for Rider');

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
              window.location.href = '/login?role=rider';
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
            
            {/* Profile panel */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🏍️
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE DISPATCH RIDER</label>
                  <select 
                    value={selectedRider} 
                    onChange={(e) => setSelectedRider(e.target.value)}
                    style={{ background: 'none', border: 'none', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Yaw Preko">Yaw Preko</option>
                    <option value="Kwame Boadu">Kwame Boadu</option>
                    <option value="Kojo Nduom">Kojo Nduom</option>
                  </select>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status: <strong>Active & Riding</strong></span>
            </div>

            {/* Active delivery */}
            {activeRiderOrder ? (
              <div className="animate-slide" style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {activeRiderOrder.status}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
                      Active Job: {activeRiderOrder.id}
                    </h3>
                  </div>
                  
                  <button 
                    onClick={() => setActiveRiderOrderId(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ← Back to pickups
                  </button>
                </div>

                {/* Client Address */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>PICKUP FROM</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>{activeRiderOrder.mallName}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Store till: {activeRiderOrder.storeName} desk</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>DELIVER TO</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>{activeRiderOrder.customerName}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeRiderOrder.location} ({activeRiderOrder.phone})</span>
                  </div>
                </div>

                {/* Visual Map Placeholder */}
                <div style={{
                  height: '200px',
                  background: 'linear-gradient(45deg, #e2e8f0 25%, #cbd5e1 25%, #cbd5e1 50%, #e2e8f0 50%, #e2e8f0 75%, #cbd5e1 75%, #cbd5e1 100%)',
                  backgroundSize: '40px 40px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '24px'
                }}>
                  {/* Map routes overlays */}
                  <div style={{ position: 'absolute', width: '2px', height: '100%', background: '#64748b', left: '40%' }}></div>
                  <div style={{ position: 'absolute', height: '2px', width: '100%', background: '#64748b', top: '50%' }}></div>
                  <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: 'blue', left: '40%', top: '50%', border: '2px solid white' }}></div>
                  <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: 'red', left: '60%', top: '30%', border: '2px solid white' }}></div>

                  <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid var(--border)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', zIndex: 10 }}>
                    <MapPin size={18} style={{ color: 'red', margin: '0 auto 4px' }} />
                    <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block' }}>Map Route Navigation</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{activeRiderOrder.mallName} ➔ {activeRiderOrder.location}</span>
                  </div>
                </div>

                {/* Action button */}
                {activeRiderOrder.status === 'Out for Delivery' ? (
                  <button 
                    onClick={async () => {
                      await markDelivered(activeRiderOrder.id);
                      setActiveRiderOrderId(null);
                      showToast("Order marked as Delivered successfully!");
                    }}
                    style={{
                      width: '100%',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Delivered to Customer ✓
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    This delivery task is closed (Status: {activeRiderOrder.status}).
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px', color: 'var(--primary)' }}>
                  Available pickups at Mall Counters
                </h3>

                {readyOrders.length === 0 ? (
                  <div style={{ background: 'white', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Truck size={40} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                    <strong>No packed orders waiting for pickup right now.</strong>
                    <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      Once a Mall Shopper finishes picking items and marks "Hand Over", the order will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {readyOrders.map(order => (
                      <div 
                        key={order.id}
                        style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{order.id}</span>
                            <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>{order.mallName}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            <strong>Delivery:</strong> {order.location}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Items from: <strong>{order.storeName}</strong>
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dist: <strong>5-10 km</strong></span>
                          <button 
                            onClick={async () => {
                              await acceptDelivery(order.id, selectedRider);
                              setActiveRiderOrderId(order.id);
                              showToast(`Accepted delivery ${order.id}. Safe riding!`);
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
                            Accept Delivery Job
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
