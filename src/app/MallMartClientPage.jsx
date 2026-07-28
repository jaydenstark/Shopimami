'use client';

import { useState } from 'react';
import { malls, stores, products } from '../data/mallData';
import { useMallMart } from '../hooks/useMallMart';
import {
  Smartphone,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Truck,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  RotateCcw,
  FileText,
  Database,
  MapPin,
  AlertCircle,
  X,
  Lock,
  Activity,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export default function MallMartClientPage() {
  const {
    orders,
    isFirebase,
    isLoaded,
    addOrder,
    acceptOrder,
    toggleItemChecked,
    payStore,
    handOffToRider,
    acceptDelivery,
    markDelivered,
    flagOrder,
    resolveFlag,
    resetDemo
  } = useMallMart();

  // Active Role switcher state: 'customer' | 'shopper' | 'rider' | 'supervisor' | 'admin'
  const [activeRole, setActiveRole] = useState('customer');

  // Common UI State
  const [toast, setToast] = useState(null);

  // -------------------- CUSTOMER APP STATES --------------------
  const [selectedMall, setSelectedMall] = useState(null); // mall object
  const [selectedStore, setSelectedStore] = useState(null); // store object
  const [cart, setCart] = useState([]); // array of { product, quantity }
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', momoProvider: 'MTN MoMo' });
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [typedTrackingId, setTypedTrackingId] = useState('');

  // -------------------- SHOPPER APP STATES --------------------
  const [selectedShopper, setSelectedShopper] = useState('Ekow Appiah');
  const [shopperMallId, setShopperMallId] = useState('accra_mall');
  const [activeShopperOrderId, setActiveShopperOrderId] = useState(null);

  // -------------------- RIDER APP STATES --------------------
  const [selectedRider, setSelectedRider] = useState('Yaw Preko');
  const [activeRiderOrderId, setActiveRiderOrderId] = useState(null);

  // -------------------- SUPERVISOR STATES --------------------
  const [superSearch, setSuperSearch] = useState('');
  const [superFilter, setSuperFilter] = useState('all'); // 'all' | 'active' | 'flagged'
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedFlagOrderId, setSelectedFlagOrderId] = useState('');
  const [flagNoteText, setFlagNoteText] = useState('');

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Calculate Order stages progress
  const getStageIndex = (status) => {
    const stages = [
      'Payment Confirmed',
      'Shopper Assigned & Shopping',
      'Paid at Mall',
      'Waiting for Rider',
      'Out for Delivery',
      'Delivered'
    ];
    return stages.indexOf(status);
  };

  // Reset helper
  const handleResetDemo = async () => {
    await resetDemo();
    setSelectedMall(null);
    setSelectedStore(null);
    setCart([]);
    setTrackingOrderId('');
    setActiveShopperOrderId(null);
    setActiveRiderOrderId(null);
    showToast("Demo orders reset to initial seed states!", "success");
  };

  // ==========================================
  // CUSTOMER FLOW ACTIONS
  // ==========================================
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart!`);
  };

  const updateCartQty = (productId, change) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + change;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      showToast("Please fill in all checkout details.", "error");
      return;
    }

    const itemsSubtotal = cart.reduce((acc, c) => acc + c.product.price * c.quantity, 0);
    const deliveryFee = 25.00;
    const serviceFee = Math.max(10.00, itemsSubtotal * 0.05);
    const totalAmount = itemsSubtotal + deliveryFee + serviceFee;

    const orderData = {
      customerName: checkoutForm.name,
      phone: checkoutForm.phone,
      location: checkoutForm.address,
      mallName: selectedMall.name,
      storeName: selectedStore.name,
      items: cart.map(c => ({
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        picked: false
      })),
      subtotal: itemsSubtotal,
      deliveryFee,
      serviceFee,
      total: totalAmount,
      momoProvider: checkoutForm.momoProvider
    };

    try {
      const orderId = await addOrder(orderData);
      setTrackingOrderId(orderId);
      setCart([]);
      setCheckoutModalOpen(false);
      showToast(`Order placed successfully! ID: ${orderId}`, "success");
    } catch (e) {
      console.error(e);
      showToast("Error processing checkout. Try again.", "error");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* -------------------- ROLE SWITCHER HEADER -------------------- */}
      <header className="role-switcher-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--secondary)', color: 'white', padding: '6px', borderRadius: '8px' }}>
              <ShoppingCart size={20} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
              MallMart<span style={{ color: 'var(--accent)' }}>.</span>
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

        {/* Switch Buttons */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '65%' }}>
          {[
            { id: 'customer', label: 'Customer App', icon: <Smartphone size={14} /> },
            { id: 'shopper', label: 'Mall Shopper App', icon: <UserCheck size={14} /> },
            { id: 'rider', label: 'Dispatch Rider App', icon: <Truck size={14} /> },
            { id: 'supervisor', label: 'Supervisor Console', icon: <ClipboardList size={14} /> },
            { id: 'admin', label: 'Admin Dashboard', icon: <TrendingUp size={14} /> }
          ].map(role => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`switcher-btn ${activeRole === role.id ? 'active' : ''}`}
            >
              {role.icon}
              {role.label}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={handleResetDemo}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <RotateCcw size={12} />
            Reset Seed Data
          </button>
        </div>
      </header>

      {/* -------------------- MAIN PAGE CONTAINER -------------------- */}
      <main className="container animate-fade" style={{ padding: '30px 15px 60px' }}>
        
        {/* Loading Spinner */}
        {!isLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', gap: '15px' }}>
            <Activity className="animate-spin text-orange-500" size={40} style={{ color: 'var(--secondary)' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing MallMart database...</p>
          </div>
        ) : (
          <>
            {/* 1. CUSTOMER INTERFACE */}
            {activeRole === 'customer' && renderCustomerApp()}

            {/* 2. MALL SHOPPER INTERFACE */}
            {activeRole === 'shopper' && renderShopperApp()}

            {/* 3. DISPATCH RIDER INTERFACE */}
            {activeRole === 'rider' && renderRiderApp()}

            {/* 4. SUPERVISOR CONSOLE INTERFACE */}
            {activeRole === 'supervisor' && renderSupervisorConsole()}

            {/* 5. OWNER / ADMIN INTERFACE */}
            {activeRole === 'admin' && renderAdminDashboard()}
          </>
        )}
      </main>

      {/* -------------------- STUNNING ELEVATED TOASTS -------------------- */}
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

  // ==========================================
  // CUSTOMER INTERFACE LAYOUT
  // ==========================================
  function renderCustomerApp() {
    const isCartEmpty = cart.length === 0;
    const cartSubtotal = cart.reduce((acc, c) => acc + c.product.price * c.quantity, 0);
    const deliveryFee = isCartEmpty ? 0 : 25.00;
    const serviceFee = isCartEmpty ? 0 : Math.max(10.00, cartSubtotal * 0.05);
    const cartTotal = cartSubtotal + deliveryFee + serviceFee;

    return (
      <div className="animate-slide">
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0A0F16 0%, #1A2230 100%)',
          borderRadius: '24px',
          padding: '40px 30px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '30px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', background: 'var(--secondary)', opacity: 0.15, borderRadius: '50%', filter: 'blur(30px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '120px', height: '120px', background: 'var(--accent)', opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }}></div>

          <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
              On-Demand Shopping & Delivery
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: '1.2', marginBottom: '15px' }}>
              Shop Ghanaian Malls, <br/>Delivered to Your Doorstep.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
              We buy directly from physical mall stores with your upfront Mobile Money payment. No trust loops, fully secure, and tracked end-to-end.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#mall-selector" style={{
                background: 'var(--secondary)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Browse Malls
              </a>
              <button 
                onClick={() => {
                  const last = orders.length > 0 ? orders[orders.length - 1].id : 'ORD-1005';
                  setTrackingOrderId(last);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Track Last Order
              </button>
            </div>
          </div>
        </div>

        {/* Outer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* MALL / STORE / PRODUCT BROWSER */}
            <section id="mall-selector" style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Browser Header with breadcrumbs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  <span 
                    onClick={() => { setSelectedMall(null); setSelectedStore(null); }} 
                    style={{ cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    Malls
                  </span>
                  {selectedMall && (
                    <>
                      <ArrowRight size={12} />
                      <span 
                        onClick={() => setSelectedStore(null)} 
                        style={{ cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        {selectedMall.name}
                      </span>
                    </>
                  )}
                  {selectedStore && (
                    <>
                      <ArrowRight size={12} />
                      <span style={{ color: 'var(--secondary)' }}>{selectedStore.name}</span>
                    </>
                  )}
                </div>
                {selectedMall && (
                  <button 
                    onClick={() => { setSelectedMall(null); setSelectedStore(null); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Change Mall
                  </button>
                )}
              </div>

              {/* Browse State: Choose Mall */}
              {!selectedMall && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'var(--primary)' }}>Select a Mall to start shopping</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {malls.map(mall => (
                      <div 
                        key={mall.id}
                        onClick={() => {
                          setSelectedMall(mall);
                          setCart([]); // Clear cart if switching malls to maintain strict same-mall cart rule
                        }}
                        style={{
                          background: 'white',
                          border: '2px solid var(--border)',
                          borderRadius: '16px',
                          padding: '24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏬</div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>{mall.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {mall.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse State: Choose Store */}
              {selectedMall && !selectedStore && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'var(--primary)' }}>
                    Stores inside <span style={{ color: 'var(--secondary)' }}>{selectedMall.name}</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {stores[selectedMall.id].map(store => (
                      <div 
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        style={{
                          background: 'white',
                          border: '2px solid var(--border)',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏪</div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{store.name}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'white', background: '#3b82f6', padding: '3px 8px', borderRadius: '10px', marginTop: '10px', fontWeight: 700 }}>
                          Verified Store
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse State: Shop Products */}
              {selectedMall && selectedStore && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '25px', color: 'var(--primary)' }}>
                    Products catalog at <span style={{ color: 'var(--secondary)' }}>{selectedStore.name}</span>
                  </h3>
                  
                  {/* Category Layout */}
                  {Object.entries(products).map(([categoryName, items]) => (
                    <div key={categoryName} style={{ marginBottom: '30px' }}>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '8px',
                        marginBottom: '15px',
                        letterSpacing: '1px'
                      }}>
                        {categoryName}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {items.map(product => (
                          <div 
                            key={product.id}
                            style={{
                              background: 'white',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%'
                            }}
                          >
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', lineHeight: '1.3' }}>{product.name}</h5>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexGrow: 1, marginBottom: '10px' }}>{product.description.slice(0, 60)}...</p>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>GH₵ {product.price.toFixed(2)}</span>
                                <button 
                                  onClick={() => addToCart(product)}
                                  style={{
                                    background: 'var(--secondary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* LIVE ORDER TRACKER */}
            <section style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} style={{ color: 'var(--secondary)' }} />
                Live Order Tracker
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Enter your order Reference ID to track the real-time status of your shopping and delivery.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input 
                  type="text" 
                  placeholder="e.g. ORD-1005" 
                  value={typedTrackingId}
                  onChange={(e) => setTypedTrackingId(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button 
                  onClick={() => setTrackingOrderId(typedTrackingId)}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Track Order
                </button>
              </div>

              {trackingOrderId ? renderTrackingStatus(trackingOrderId) : (
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Enter an order ID above to see the live tracking timeline.
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Cart Panel */}
          <aside style={{
            background: 'white',
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '85px'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <ShoppingCart size={18} />
              Shopping Cart
              {selectedMall && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>({selectedMall.name})</span>}
            </h3>

            {isCartEmpty ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem' }}>Your cart is empty. Browse mall stores to add items!</p>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #f1f5f9', paddingBottom: '8px' }}>
                      <div style={{ maxWidth: '60%' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{item.product.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GH₵ {item.product.price.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => updateCartQty(item.product.id, -1)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Minus size={10} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '15px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.product.id, 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                    <span style={{ fontWeight: 600 }}>GH₵ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Delivery Fee (Flat)</span>
                    <span style={{ fontWeight: 600 }}>GH₵ {deliveryFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Service Charge (5%, Min 10)</span>
                    <span style={{ fontWeight: 600 }}>GH₵ {serviceFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--secondary)' }}>GH₵ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setCheckoutModalOpen(true)}
                  style={{
                    width: '100%',
                    background: 'var(--secondary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Pay via Mobile Money
                </button>
              </div>
            )}
          </aside>
        </div>

        {/* CHECKOUT MOMO MODAL */}
        {checkoutModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              width: '450px',
              maxWidth: '90%',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}>
              <button 
                onClick={() => setCheckoutModalOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📱</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Mobile Money Checkout</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirm your details and authorize payment on your phone.</p>
              </div>

              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px' }}>Customer Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kwabena Appiah" 
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 0244123456" 
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px' }}>Delivery Address</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Spintex Road, Accra" 
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '5px' }}>MoMo Network</label>
                  <select 
                    value={checkoutForm.momoProvider}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, momoProvider: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                  >
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Telecel Cash">Telecel Cash</option>
                    <option value="AirtelTigo Money">AirtelTigo Money</option>
                  </select>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', marginTop: '5px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYMENT TOTAL</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>GH₵ {cartTotal.toFixed(2)}</div>
                </div>

                <button 
                  type="submit"
                  style={{
                    background: 'var(--secondary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Pay & Authorize Prompt 🔓
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER LIVE TRACKING TIMELINE
  // ==========================================
  function renderTrackingStatus(orderId) {
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return (
        <div style={{ border: '2px dashed #fecaca', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#dc2626', background: '#fef2f2' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 10px' }} />
          <strong>Order ID "{orderId}" not found.</strong> Make sure it is typed correctly or check the database.
        </div>
      );
    }

    const currentStage = getStageIndex(order.status);
    const stages = [
      { key: 'Payment Confirmed', label: 'Paid', desc: 'MoMo Confirmed', icon: '💰' },
      { key: 'Shopper Assigned & Shopping', label: 'Shopping', desc: 'Picking Items', icon: '🛒' },
      { key: 'Paid at Mall', label: 'Settled', desc: 'Paid at Till', icon: '🧾' },
      { key: 'Waiting for Rider', label: 'Packed', desc: 'Waiting at Desk', icon: '📦' },
      { key: 'Out for Delivery', label: 'Dispatched', desc: 'Rider en Route', icon: '🏍️' },
      { key: 'Delivered', label: 'Delivered', desc: 'Order Closed', icon: '✅' }
    ];

    // Progress bar width
    const progressWidth = currentStage === 0 ? 0 : `${(currentStage / (stages.length - 1)) * 90 + 5}%`;

    return (
      <div className="animate-slide">
        {/* Order Details Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORDER REFERENCE</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{order.id}</h4>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>MALL & STORE</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>{order.storeName} ({order.mallName})</h4>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>TOTAL AMOUNT</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)', textAlign: 'right' }}>GH₵ {order.total.toFixed(2)}</h4>
          </div>
        </div>

        {/* Flag warning if flagged */}
        {order.flagged && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '16px',
            borderRadius: '12px',
            color: '#b45309',
            display: 'flex',
            gap: '10px',
            alignItems: 'start',
            marginBottom: '25px',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontWeight: 800 }}>FLAGGED BY SUPERVISOR: </strong>
              {order.flagNote || "This order is being reviewed by the operations center."}
            </div>
          </div>
        )}

        {/* Shared order routing info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '0.85rem', marginBottom: '30px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Staff Assigned</span>
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>🛒 <strong>Shopper:</strong> {order.shopper || <span style={{ color: 'var(--text-muted)' }}>Waiting for assignment...</span>}</span>
              <span>🏍️ <strong>Rider:</strong> {order.rider || <span style={{ color: 'var(--text-muted)' }}>Waiting for dispatch...</span>}</span>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Recipient Details</span>
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>👤 <strong>Name:</strong> {order.customerName} ({order.phone})</span>
              <span>📍 <strong>Location:</strong> {order.location}</span>
            </div>
          </div>
        </div>

        {/* Timeline graphics */}
        <div className="timeline-container">
          <div className="timeline-line">
            <div className="timeline-line-progress" style={{ width: progressWidth }}></div>
          </div>

          {stages.map((stage, idx) => {
            const isActive = idx === currentStage;
            const isCompleted = idx < currentStage;
            let statusClass = '';
            if (isActive) statusClass = 'active';
            if (isCompleted) statusClass = 'completed';

            return (
              <div key={stage.key} className={`timeline-step ${statusClass}`}>
                <div className="timeline-dot">
                  {isCompleted ? '✓' : stage.icon}
                </div>
                <span className="timeline-label">{stage.label}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: 'center' }}>{stage.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Subtotal breakdown list of items */}
        <div style={{ marginTop: '30px', border: '1px solid var(--border)', borderRadius: '16px', background: 'white', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '12px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
            Order Items Checklist
          </div>
          <div style={{ padding: '8px 18px' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx !== order.items.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: item.picked ? '#10b981' : '#cbd5e1' }}>
                    {item.picked ? '●' : '○'}
                  </span>
                  <span style={{ textDecoration: item.picked && order.status !== 'Payment Confirmed' ? 'line-through' : 'none', color: item.picked && order.status !== 'Payment Confirmed' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 600 }}>
                    {item.name} (x{item.quantity})
                  </span>
                </div>
                <span style={{ fontWeight: 700 }}>GH₵ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MALL SHOPPER INTERFACE LAYOUT
  // ==========================================
  function renderShopperApp() {
    const activeShopperOrder = orders.find(o => o.id === activeShopperOrderId);
    // Filter orders waiting for shopping assignment at the shopper's chosen mall
    const mallNameMap = {
      accra_mall: 'Accra Mall',
      west_hills: 'West Hills Mall',
      ac_mall: 'A&C Mall'
    };
    const shopperMallName = mallNameMap[shopperMallId];

    const availableOrders = orders.filter(o => o.status === 'Payment Confirmed' && o.mallName === shopperMallName);

    return (
      <div className="animate-slide" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Profile / Settings Bar */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justify_content: 'center', fontSize: '1.5rem' }}>
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
        {activeShopperOrder ? renderActiveShoppingPanel(activeShopperOrder) : (
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
    );
  }

  // ==========================================
  // RENDER ACTIVE SHOPPING CHECKLIST VIEW
  // ==========================================
  function renderActiveShoppingPanel(order) {
    const allChecked = order.items.every(item => item.picked);

    return (
      <div className="animate-slide" style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Checklist Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {order.status}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
              Checklist for {order.id}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Store: <strong>{order.storeName}</strong> ({order.mallName})</p>
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
          {order.items.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => toggleItemChecked(order.id, item.name)}
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
          
          {/* Step 1: Picking */}
          {order.status === 'Shopper Assigned & Shopping' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {order.items.filter(i => i.picked).length} of {order.items.length} items checked
              </span>
              <button 
                disabled={!allChecked}
                onClick={async () => {
                  await payStore(order.id);
                  showToast("Till Mobile Money payment authorized & paid!");
                }}
                style={{
                  background: allChecked ? '#10b981' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: allChecked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={14} />
                Pay store subtotal (GH₵ {order.subtotal.toFixed(2)})
              </button>
            </div>
          )}

          {/* Step 2: Paid, Handover to Rider desk */}
          {order.status === 'Paid at Mall' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '15px', fontWeight: 600 }}>
                ✓ Store has been successfully paid via direct MoMo transfer. Pack the items neatly.
              </p>
              <button 
                onClick={async () => {
                  await handOffToRider(order.id);
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

          {/* Fallback info */}
          {order.status !== 'Shopper Assigned & Shopping' && order.status !== 'Paid at Mall' && (
            <div style={{ textAlign: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Order is currently at stage: <strong>{order.status}</strong>. Your part as Shopper is completed!
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // DISPATCH RIDER INTERFACE LAYOUT
  // ==========================================
  function renderRiderApp() {
    const activeRiderOrder = orders.find(o => o.id === activeRiderOrderId);
    const readyOrders = orders.filter(o => o.status === 'Waiting for Rider');

    return (
      <div className="animate-slide" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Profile panel */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justify_content: 'center', fontSize: '1.5rem' }}>
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
        {activeRiderOrder ? renderActiveDeliveryPanel(activeRiderOrder) : (
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
    );
  }

  // ==========================================
  // RENDER ACTIVE DELIVERY ROUTE
  // ==========================================
  function renderActiveDeliveryPanel(order) {

    return (
      <div className="animate-slide" style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {order.status}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
              Active Job: {order.id}
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
            <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>{order.mallName}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Store till: {order.storeName} desk</span>
          </div>
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>DELIVER TO</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>{order.customerName}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.location} ({order.phone})</span>
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
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>A&C Mall ➔ East Legon (Est. Distance: 4.8 km)</span>
          </div>
        </div>

        {/* Action button */}
        {order.status === 'Out for Delivery' ? (
          <button 
            onClick={async () => {
              await markDelivered(order.id);
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
            This delivery task is closed (Status: {order.status}).
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // SUPERVISOR CONSOLE INTERFACE
  // ==========================================
  function renderSupervisorConsole() {
    const activeOrders = orders.filter(o => o.status !== 'Delivered');
    const flaggedOrders = orders.filter(o => o.flagged);

    // Apply search and status filters
    const filtered = orders.filter(order => {
      // search match
      const searchLower = superSearch.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.mallName.toLowerCase().includes(searchLower) ||
        order.storeName.toLowerCase().includes(searchLower);

      // filter match
      if (superFilter === 'active') return matchesSearch && order.status !== 'Delivered';
      if (superFilter === 'flagged') return matchesSearch && order.flagged;
      return matchesSearch;
    });

    return (
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

        {/* FLAG NOTE MODAL */}
        {flagModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              width: '400px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
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

              <div style={{ display: 'flex', justify_content: 'flex-end', gap: '10px' }}>
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
    );
  }

  // ==========================================
  // OWNER / ADMIN DASHBOARD INTERFACE
  // ==========================================
  function renderAdminDashboard() {
    // 1. Calculate aggregated financial metrics
    // Calculate total order value (all subtotal + delivery + service fees)
    const baseRevenue = 15450; // Historical base
    const totalOrderValue = orders.reduce((acc, o) => acc + o.total, 0) + baseRevenue * 1.5;
    
    // Delivery + Service Revenue (company profit/revenue share)
    const baseProfit = 2300;
    const platformRevenue = orders.reduce((acc, o) => acc + o.deliveryFee + o.serviceFee, 0) + baseProfit;

    const activeCount = orders.filter(o => o.status !== 'Delivered').length;
    const flaggedCount = orders.filter(o => o.flagged).length;

    // Staff details list
    const shoppers = [
      { name: 'Ekow Appiah', status: 'Shopping ORD-1002', zone: 'Accra Mall' },
      { name: 'Adjoa Sarfo', status: 'Idle', zone: 'West Hills Mall' },
      { name: 'Kofi Owusu', status: 'Idle', zone: 'West Hills Mall' },
      { name: 'Ama Koomson', status: 'Idle', zone: 'A&C Mall' }
    ];

    const riders = [
      { name: 'Yaw Preko', status: 'Delivering ORD-1005', zone: 'East Legon' },
      { name: 'Kwame Boadu', status: 'Idle', zone: 'Kasoa' },
      { name: 'Kojo Nduom', status: 'Idle', zone: 'Spintex' }
    ];

    return (
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', marginBottom: '30px', alignItems: 'start' }}>
          
          {/* Revenue Ledger panel */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} />
                Settlement Order Ledger
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SHOWING {orders.length} TOTAL REcords</span>
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
            {/* Custom SVG Trend line */}
            <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
              
              {/* Chart Line Path */}
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
              
              {/* Data points */}
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
    );
  }
}
