'use client';

import { useMallMart } from '../hooks/useMallMart';
import { TrendingUp, UserCheck, Truck, FileText, LogOut, Database, Activity } from 'lucide-react';

export default function AdminApp() {
  const { orders, isFirebase, isLoaded } = useMallMart();

  // Aggregated financial metrics
  const baseRevenue = 15450; // Historical base
  const totalOrderValue = orders.reduce((acc, o) => acc + o.total, 0) + baseRevenue * 1.5;
  
  const baseProfit = 2300;
  const platformRevenue = orders.reduce((acc, o) => acc + o.deliveryFee + o.serviceFee, 0) + baseProfit;

  const activeCount = orders.filter(o => o.status !== 'Delivered').length;
  const flaggedCount = orders.filter(o => o.flagged).length;

  const shoppers = [
    { name: 'Ekow Appiah', status: 'Shopping', zone: 'Accra Mall' },
    { name: 'Adjoa Sarfo', status: 'Idle', zone: 'West Hills Mall' },
    { name: 'Kofi Owusu', status: 'Idle', zone: 'West Hills Mall' },
    { name: 'Ama Koomson', status: 'Idle', zone: 'A&C Mall' }
  ];

  const riders = [
    { name: 'Yaw Preko', status: 'Riding', zone: 'East Legon' },
    { name: 'Kwame Boadu', status: 'Idle', zone: 'Kasoa' },
    { name: 'Kojo Nduom', status: 'Idle', zone: 'Spintex' }
  ];

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
              window.location.href = '/login?role=admin';
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
            
            {/* KPI Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gross Order Value</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginTop: '8px' }}>GH₵ {totalOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'block', marginTop: '6px' }}>↑ 14.2% from last week</span>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Platform Service Revenue</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--secondary)', marginTop: '8px' }}>GH₵ {platformRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Fee model: 25 GHS + 5% subtotal</span>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Orders Queue</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginTop: '8px' }}>{activeCount}</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Orders currently in-flight</span>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #f59e0b' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Attention Flags</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', marginTop: '8px' }}>{flaggedCount}</div>
                <span style={{ fontSize: '0.7rem', color: flaggedCount > 0 ? '#dc2626' : 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                  {flaggedCount > 0 ? 'Requires immediate action' : 'All systems normal'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', marginBottom: '30px', alignItems: 'start' }} className="mobile-hide-sidebar-grid">
              
              {/* Revenue Ledger panel */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} />
                    Settlement Order Ledger
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SHOWING {orders.length} TOTAL RECORDS</span>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px' }}>Order ID</th>
                        <th style={{ padding: '12px 16px' }}>Mall Source</th>
                        <th style={{ padding: '12px 16px' }}>MoMo Provider</th>
                        <th style={{ padding: '12px 16px' }}>Customer Paid</th>
                        <th style={{ padding: '12px 16px' }}>Store Settled</th>
                        <th style={{ padding: '12px 16px' }}>Platform Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800 }}>{o.id}</td>
                          <td style={{ padding: '12px 16px' }}>{o.mallName}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.momoProvider}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>GH₵ {o.total.toFixed(2)}</td>
                          <td style={{ padding: '12px 16px' }}>GH₵ {o.subtotal.toFixed(2)}</td>
                          <td style={{ padding: '12px 16px', color: '#059669', fontWeight: 700 }}>
                            GH₵ {(o.deliveryFee + o.serviceFee).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Roster / Ratios */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Shoppers on Duty */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={16} />
                    Shoppers on Duty
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {shoppers.map((shopper, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: idx !== shoppers.length - 1 ? '1px dashed #f1f5f9' : 'none', paddingBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 700, display: 'block', color: 'var(--primary)' }}>{shopper.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📍 {shopper.zone}</span>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          background: shopper.status === 'Idle' ? '#e0f2fe' : '#fff7ed',
                          color: shopper.status === 'Idle' ? '#0369a1' : '#c2410c',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 600
                        }}>
                          {shopper.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Riders on Duty */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={16} />
                    Riders on Duty
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {riders.map((rider, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: idx !== riders.length - 1 ? '1px dashed #f1f5f9' : 'none', paddingBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 700, display: 'block', color: 'var(--primary)' }}>{rider.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Zone: {rider.zone}</span>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          background: rider.status === 'Idle' ? '#e0f2fe' : '#fff7ed',
                          color: rider.status === 'Idle' ? '#0369a1' : '#c2410c',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 600
                        }}>
                          {rider.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            {/* Custom SVG Trend Graph */}
            <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} />
                Daily Revenue Trend (July 2026)
              </h4>
              
              <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
                  
                  <path 
                    d="M 0 90 Q 50 80 100 85 T 200 60 T 300 45 T 400 30 T 500 15" 
                    fill="none" 
                    stroke="var(--secondary)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 0 90 Q 50 80 100 85 T 200 60 T 300 45 T 400 30 T 500 15 L 500 100 L 0 100 Z" 
                    fill="url(#chartGrad)"
                  />
                  
                  <circle cx="100" cy="85" r="3.5" fill="var(--primary)" stroke="white" strokeWidth="1" />
                  <circle cx="200" cy="60" r="3.5" fill="var(--primary)" stroke="white" strokeWidth="1" />
                  <circle cx="300" cy="45" r="3.5" fill="var(--primary)" stroke="white" strokeWidth="1" />
                  <circle cx="400" cy="30" r="3.5" fill="var(--primary)" stroke="white" strokeWidth="1" />
                  <circle cx="500" cy="15" r="3.5" fill="var(--secondary)" stroke="white" strokeWidth="1" />
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '10px', fontWeight: 600 }}>
                <span>July 23</span>
                <span>July 24</span>
                <span>July 25</span>
                <span>July 26</span>
                <span>July 27 (Today)</span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
