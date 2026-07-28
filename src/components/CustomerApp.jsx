'use client';

import { useState } from 'react';
import { useMallMart } from '../hooks/useMallMart';
import { malls, stores, products } from '../data/mallData';
import { 
  ShoppingCart, Check, MapPin, AlertCircle, X, 
  Activity, ArrowRight, Minus, Plus, Home, Database, AlertTriangle 
} from 'lucide-react';

export default function CustomerApp() {
  const { orders, isFirebase, isLoaded, addOrder } = useMallMart();
  
  // Local States
  const [selectedMall, setSelectedMall] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', momoProvider: 'MTN MoMo' });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [typedTrackingId, setTypedTrackingId] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      setTypedTrackingId(orderId);
      setCart([]);
      setCheckoutModalOpen(false);
      showToast(`Order placed successfully! ID: ${orderId}`, "success");
    } catch (e) {
      console.error(e);
      showToast("Error processing checkout. Try again.", "error");
    }
  };

  const isCartEmpty = cart.length === 0;
  const cartSubtotal = cart.reduce((acc, c) => acc + c.product.price * c.quantity, 0);
  const deliveryFee = isCartEmpty ? 0 : 25.00;
  const serviceFee = isCartEmpty ? 0 : Math.max(10.00, cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + deliveryFee + serviceFee;

  return (
    <div className="main-content-container" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* -------------------- HEADER -------------------- */}
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
        <div>
          <a href="/" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
          >
            <Home size={14} />
            Launcher Portal
          </a>
        </div>
      </header>

      {/* -------------------- MAIN PAGE CONTAINER -------------------- */}
      <main className="container main-content-container animate-fade" style={{ padding: '30px 15px 60px' }}>
        {!isLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', gap: '15px' }}>
            <Activity className="animate-spin" size={40} style={{ color: 'var(--secondary)' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing MallMart database...</p>
          </div>
        ) : (
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
                  Customer App Portal
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
                    transition: 'all 0.2s',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Browse Malls
                  </a>
                  <button 
                    onClick={() => {
                      const last = orders.length > 0 ? orders[orders.length - 1].id : '';
                      if (last) {
                        setTrackingOrderId(last);
                        setTypedTrackingId(last);
                      } else {
                        showToast("No orders available in database.", "error");
                      }
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
                      <div className="malls-responsive-flex" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        {malls.map(mall => (
                          <div 
                            key={mall.id}
                            className="mall-responsive-card"
                            onClick={() => {
                              setSelectedMall(mall);
                              setCart([]); // Clear cart if switching malls
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
                          
                          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {items.map(product => (
                              <div 
                                key={product.id}
                                className="product-card"
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
                                <div className="product-image" style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
                                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div className="product-info" style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                  <h5 className="product-name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', lineHeight: '1.3' }}>{product.name}</h5>
                                  <p className="product-desc" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexGrow: 1, marginBottom: '10px' }}>{product.description.slice(0, 60)}...</p>
                                  
                                  <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                                    <span className="product-price" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>GH₵ {product.price.toFixed(2)}</span>
                                    <button 
                                      onClick={() => addToCart(product)}
                                      className="add-to-cart-btn"
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

                  {trackingOrderId ? (
                    (() => {
                      const order = orders.find(o => o.id === trackingOrderId);
                      if (!order) {
                        return (
                          <div style={{ border: '2px dashed #fecaca', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#dc2626', background: '#fef2f2' }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 10px' }} />
                            <strong>Order ID "{trackingOrderId}" not found.</strong> Make sure it is typed correctly or check the database.
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
                      const progressWidth = currentStage === 0 ? 0 : `${(currentStage / (stages.length - 1)) * 90 + 5}%`;

                      return (
                        <div className="animate-slide">
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

                          <div className="timeline-container">
                            <div className="timeline-line">
                              <div className="timeline-line-progress" style={{ '--progress': progressWidth, width: 'var(--progress, 0%)', height: 'var(--progress, 0%)' }}></div>
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
                    })()
                  ) : (
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
              <div className="bottom-sheet-modal" style={{ zIndex: 3000 }}>
                <div className="bottom-sheet-content" style={{ padding: '30px', position: 'relative' }}>
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
