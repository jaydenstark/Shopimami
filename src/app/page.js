'use client';

import { useState } from 'react';
import { useMallMart } from '../hooks/useMallMart';
import { 
  Smartphone, ShoppingBag, Truck, ClipboardList, 
  TrendingUp, Database, RotateCcw, 
  Sparkles, ShieldCheck, AlertCircle, Check 
} from 'lucide-react';

export default function EntryPage() {
  const { orders, isFirebase, isLoaded, resetDemo } = useMallMart();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetDemo = async () => {
    try {
      await resetDemo();
      showToast("All system mock tables re-seeded successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error resetting database seed data.", "error");
    }
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered').length;
  const flaggedCount = orders.filter(o => o.flagged).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #111827, #030712)',
      fontFamily: "'Inter', sans-serif",
      color: '#f3f4f6',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Background blobs for premium glassmorphism */}
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: '300px', height: '300px', background: 'var(--secondary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: '250px', height: '250px', background: '#3b82f6', opacity: 0.08, borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: '1000px', width: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* Header Block */}
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 14px', borderRadius: 'var(--radius-full)', marginBottom: '15px' }}>
            <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
              Multi-Actor Shopping & Delivery System
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', fontWeight: 900, lineHeight: '1.1', letterSpacing: '-1px', color: 'white', marginBottom: '15px' }}>
            MallMart Workspace<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            A decoupled 5-in-1 serverless platform connecting customers, shoppers, and riders with direct Mobile Money till settlements.
          </p>

          {/* Database state details */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.75rem',
              background: isFirebase ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isFirebase ? '#34d399' : '#fbbf24',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${isFirebase ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Database size={12} />
              {isFirebase ? 'Supabase Sync Active' : 'LocalStorage Mode'}
            </span>

            <button
              onClick={handleResetDemo}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <RotateCcw size={12} />
              Reset Demo Seeds
            </button>
          </div>
        </header>

        {/* Apps Selection Deck Grid - Dense Compact Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          {[
            {
              id: 'customer',
              name: 'Customer Portal',
              role: 'Buyer App',
              icon: <Smartphone size={24} />,
              color: 'var(--secondary)',
              href: '/customer',
              badge: 'Shopping UI'
            },
            {
              id: 'shopper',
              name: 'Shopper App',
              role: 'Store Picker',
              icon: <ShoppingBag size={24} />,
              color: '#3b82f6',
              href: '/shopper',
              badge: 'Checklist'
            },
            {
              id: 'rider',
              name: 'Rider App',
              role: 'Logistics',
              icon: <Truck size={24} />,
              color: '#10b981',
              href: '/rider',
              badge: 'GPS Route'
            },
            {
              id: 'supervisor',
              name: 'Supervisor',
              role: 'Audit Control',
              icon: <ClipboardList size={24} />,
              color: '#d97706',
              href: '/supervisor',
              badge: flaggedCount > 0 ? `${flaggedCount} Flags` : 'Normal',
              badgeColor: flaggedCount > 0 ? '#ef4444' : '#64748b'
            },
            {
              id: 'admin',
              name: 'Admin Dashboard',
              role: 'Ledger Ledger',
              icon: <TrendingUp size={24} />,
              color: '#8b5cf6',
              href: '/admin',
              badge: 'Revenue Charts'
            }
          ].map(app => (
            <a
              key={app.id}
              href={app.href}
              className="workspace-portal-card"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                aspectRatio: '1 / 1'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = app.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 20px -6px ${app.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Radial gradient glow behind tile icon */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '40px', height: '40px', background: app.color, opacity: 0.12, borderRadius: '50%', filter: 'blur(12px)', pointerEvents: 'none' }}></div>
              
              <div style={{ background: `${app.color}20`, color: app.color, padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                {app.icon}
              </div>

              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: app.color, letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>{app.role}</span>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', margin: 0 }}>{app.name}</h3>
              
              <span style={{
                fontSize: '0.6rem',
                background: app.badgeColor || 'rgba(255,255,255,0.06)',
                color: app.badgeColor ? 'white' : '#94a3b8',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginTop: '8px',
                display: 'inline-block'
              }}>
                {app.badge}
              </span>
            </a>
          ))}
        </div>

        {/* Footer Statistics */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', textAlign: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', color: '#64748b', fontSize: '0.8rem' }}>
          <div>
            📍 Active Zones: <strong>Accra Mall, West Hills, A&C Mall</strong>
          </div>
          <div>
            System State: <strong>{isLoaded ? `Online (${activeOrdersCount} in-flight tasks)` : 'Syncing...'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            Direct MoMo Till Integration Active
          </div>
        </footer>
      </div>

      {/* Stunning Toast */}
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
