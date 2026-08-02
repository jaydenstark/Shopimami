'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMallMart } from '../hooks/useMallMart';
import { malls, stores, products } from '../data/mallData';
import {
  Check, MapPin, AlertCircle, X,
  ArrowRight, Minus, Plus, Database,
  AlertTriangle, Search,
  Star, Clock, ChevronLeft, MessageSquare, Send, Sparkles
} from 'lucide-react';

const CATEGORIES = ['All', ...Object.keys(products)];
const CATEGORY_ICONS = { All: '✨', groceries: '🛒', electronics: '⚡', fashion: '👗' };
const CATEGORY_LABELS = { All: 'All', groceries: 'Groceries', electronics: 'Electronics', fashion: 'Fashion' };

const STORE_META = {
  shoprite_accra: { rating: 4.9, time: '30-45m', tag: 'Popular', color: '#FF4B4B', emoji: '🛒' },
  game_accra:     { rating: 4.7, time: '35-50m', tag: 'Electronics', color: '#3B82F6', emoji: '🎮' },
  palace_accra:   { rating: 4.6, time: '40-55m', tag: 'Fashion', color: '#8B5CF6', emoji: '👗' },
  melcom_west:    { rating: 4.8, time: '30-45m', tag: 'Popular', color: '#10B981', emoji: '🛒' },
  palace_west:    { rating: 4.5, time: '40-55m', tag: 'Fashion', color: '#F59E0B', emoji: '👗' },
  shoprite_west:  { rating: 4.8, time: '30-45m', tag: 'Popular', color: '#EF4444', emoji: '🛒' },
  melcom_ac:      { rating: 4.7, time: '35-50m', tag: 'Popular', color: '#06B6D4', emoji: '🛒' },
  game_ac:        { rating: 4.6, time: '35-50m', tag: 'Electronics', color: '#6366F1', emoji: '🎮' },
  shoprite_ac:    { rating: 4.9, time: '25-40m', tag: 'Fast Pick', color: '#F97316', emoji: '🛒' },
};

const STAGES = [
  { key: 'Payment Confirmed',         label: 'Paid',        icon: '💳', desc: 'MoMo confirmed' },
  { key: 'Shopper Assigned & Shopping', label: 'Shopping',  icon: '🛒', desc: 'Items being picked' },
  { key: 'Paid at Mall',              label: 'Settled',     icon: '🧾', desc: 'Paid at till' },
  { key: 'Waiting for Rider',         label: 'Packed',      icon: '📦', desc: 'At dispatch desk' },
  { key: 'Out for Delivery',          label: 'On the Way',  icon: '🏍️', desc: 'Rider en route' },
  { key: 'Delivered',                 label: 'Delivered',   icon: '✅', desc: 'Order closed' },
];

function getStageIndex(status) {
  return STAGES.findIndex(s => s.key === status);
}

function getChatMessages(status, shopper, rider) {
  const s = shopper || 'Shopper';
  const r = rider || 'Rider';
  const base = [
    { from: 'system', time: 'Just now', msg: 'Your payment was verified. Order sent to mall desk.' }
  ];
  if (status === 'Payment Confirmed') return base;
  if (status === 'Shopper Assigned & Shopping') return [
    ...base,
    { from: 'staff', name: s, time: '2m ago', msg: `Hi! I'm ${s}, your personal shopper today. I've arrived at the store and will start picking your items now.` },
  ];
  if (status === 'Paid at Mall') return [
    ...base,
    { from: 'staff', name: s, time: '8m ago', msg: `All items picked! Heading to the till now.` },
    { from: 'staff', name: s, time: '5m ago', msg: `Payment confirmed at store. Your order is packaged and ready at the dispatch desk. 📦` },
  ];
  if (status === 'Waiting for Rider') return [
    ...base,
    { from: 'staff', name: s, time: '12m ago', msg: `Order packaged and ready. Waiting for a rider.` },
    { from: 'system', time: 'Just now', msg: 'Logistics ping sent to available riders in your area.' },
  ];
  if (status === 'Out for Delivery') return [
    ...base,
    { from: 'staff', name: s, time: '15m ago', msg: `Handoff to rider complete!` },
    { from: 'staff', name: r, time: '5m ago', msg: `Package secured. GPS active, heading to your address now! 🏍️` },
  ];
  if (status === 'Delivered') return [
    ...base,
    { from: 'staff', name: r, time: '10m ago', msg: `Almost there! ETA ~2 minutes.` },
    { from: 'staff', name: r, time: 'Just now', msg: `Delivered! ✅ Thank you for using SHOPIMAMI. Enjoy your items!` },
  ];
  return base;
}

export default function CustomerApp() {
  const { orders, isFirebase, isLoaded, addOrder } = useMallMart();

  // Main navigation
  const [activeTab, setActiveTab] = useState('shop');

  // Shop flow
  const [selectedMall, setSelectedMall]   = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Cart
  const [cart, setCart] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'form'
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', momoProvider: 'MTN MoMo' });

  // USSD
  const [ussdOpen, setUssdOpen]           = useState(false);
  const [ussdPin, setUssdPin]             = useState('');
  const [pendingOrder, setPendingOrder]   = useState(null);

  // Track
  const [trackingId, setTrackingId]       = useState('');
  const [typedId, setTypedId]             = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  // Support Chat
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessages, setSupportMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your SHOPIMAMI customer support assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [supportInput, setSupportInput] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const handleSendSupportMessage = async (e) => {
    if (e) e.preventDefault();
    if (!supportInput.trim()) return;

    const userMsg = { sender: 'user', text: supportInput, timestamp: new Date() };
    setSupportMessages(prev => [...prev, userMsg]);
    const inputToSend = supportInput;
    setSupportInput('');
    setIsSupportTyping(true);

    try {
      const conversationHistory = supportMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      conversationHistory.push({ role: 'user', content: inputToSend });

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      if (!res.ok) throw new Error("Support API returned an error");
      const data = await res.json();
      
      setSupportMessages(prev => [...prev, {
        sender: 'bot',
        text: data.message,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("Support chat error:", err);
      setSupportMessages(prev => [...prev, {
        sender: 'bot',
        text: "I'm having trouble connecting to the support server right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsSupportTyping(false);
    }
  };

  // Cart helpers
  const cartCount    = cart.reduce((a, c) => a + c.quantity, 0);
  const cartSubtotal = cart.reduce((a, c) => a + c.product.price * c.quantity, 0);
  const deliveryFee  = cart.length > 0 ? 25 : 0;
  const serviceFee   = cart.length > 0 ? Math.max(10, cartSubtotal * 0.05) : 0;
  const cartTotal    = cartSubtotal + deliveryFee + serviceFee;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`${product.name} added!`, 'success');
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const getCartQty = (id) => cart.find(i => i.product.id === id)?.quantity || 0;

  // Filtered products
  const filteredProducts = selectedStore
    ? Object.fromEntries(
        Object.entries(products)
          .filter(([cat]) => activeCategory === 'All' || cat === activeCategory)
          .map(([cat, items]) => [cat, items.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )])
          .filter(([, items]) => items.length > 0)
      )
    : {};

  // Checkout
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      showToast('Please fill in all details.', 'error'); return;
    }
    const orderData = {
      customerName: checkoutForm.name,
      phone: checkoutForm.phone,
      location: checkoutForm.address,
      mallName: selectedMall?.name || 'N/A',
      storeName: selectedStore?.name || 'N/A',
      items: cart.map(c => ({ name: c.product.name, price: c.product.price, quantity: c.quantity, picked: false })),
      subtotal: cartSubtotal, deliveryFee, serviceFee, total: cartTotal,
      momoProvider: checkoutForm.momoProvider,
    };
    setPendingOrder(orderData);
    setUssdPin('');
    setUssdOpen(true);
  };

  const executePayment = async () => {
    if (ussdPin.length < 4) return;
    try {
      const orderId = await addOrder(pendingOrder);
      setCart([]);
      setCheckoutStep('cart');
      setTrackingId(orderId);
      setTypedId(orderId);
      setUssdOpen(false);
      setPendingOrder(null);
      setUssdPin('');
      setActiveTab('track');
      showToast(`Order ${orderId} placed! Tracking now.`, 'success');
    } catch {
      showToast('Payment failed. Please retry.', 'error');
      setUssdOpen(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER SECTIONS
  // ─────────────────────────────────────────────

  const renderShopTab = () => (
    <div className="capp-tab-content">
      {/* Compact Header */}
      <div className="capp-shop-header">
        <div className="capp-shop-header-inner">
          <div>
            <p className="capp-greeting">Good day 👋</p>
            <h2 className="capp-shop-title">Shop Ghanaian Malls</h2>
          </div>
          <div className="capp-header-badge">
            <Database size={10} />
            <span>{isFirebase ? 'Live' : 'Demo'}</span>
          </div>
        </div>
        {/* Search */}
        {selectedStore && (
          <div className="capp-search-bar">
            <Search size={15} className="capp-search-icon" />
            <input
              type="text"
              placeholder={`Search ${selectedStore.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="capp-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="capp-search-clear">
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* STEP 1: Mall chips */}
      {!selectedMall && (
        <div className="capp-section">
          <h3 className="capp-section-title">Choose a Mall</h3>
          <div className="capp-mall-chips">
            {malls.map(mall => (
              <button
                key={mall.id}
                className="capp-mall-chip"
                onClick={() => { setSelectedMall(mall); setCart([]); }}
              >
                <span className="capp-mall-chip-icon">🏬</span>
                <span className="capp-mall-chip-name">{mall.name}</span>
                <span className="capp-mall-chip-loc">
                  <MapPin size={10} /> {mall.location.split(',')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="capp-how-it-works">
            <h4 className="capp-hiw-title">How SHOPIMAMI Works</h4>
            <div className="capp-hiw-steps">
              {[
                { icon: '🛒', title: 'Browse & Order', desc: 'Pick items from your favourite store' },
                { icon: '💳', title: 'Pay via MoMo', desc: 'Secure upfront Mobile Money payment' },
                { icon: '🏍️', title: 'Fast Delivery', desc: 'Rider delivers straight to your door' },
              ].map((step, i) => (
                <div key={i} className="capp-hiw-step">
                  <div className="capp-hiw-step-icon">{step.icon}</div>
                  <div>
                    <p className="capp-hiw-step-title">{step.title}</p>
                    <p className="capp-hiw-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Store grid */}
      {selectedMall && !selectedStore && (
        <div className="capp-section">
          <div className="capp-breadcrumb">
            <button onClick={() => setSelectedMall(null)} className="capp-back-btn">
              <ChevronLeft size={16} /> Malls
            </button>
            <span className="capp-breadcrumb-sep">/</span>
            <span className="capp-breadcrumb-current">{selectedMall.name}</span>
          </div>

          <h3 className="capp-section-title">Stores at {selectedMall.name}</h3>
          <div className="capp-store-grid">
            {stores[selectedMall.id].map(store => {
              const meta = STORE_META[store.id] || { rating: 4.5, time: '35-50m', tag: 'Open', color: '#FF6B00', emoji: '🏪' };
              return (
                <button
                  key={store.id}
                  className="capp-store-card"
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="capp-store-avatar" style={{ background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}44)`, border: `1.5px solid ${meta.color}33` }}>
                    <span className="capp-store-emoji">{meta.emoji}</span>
                    <div className="capp-store-badge" style={{ background: meta.color }}>{meta.tag}</div>
                  </div>
                  <p className="capp-store-name">{store.name}</p>
                  <div className="capp-store-meta">
                    <span className="capp-store-rating"><Star size={9} fill="currentColor" /> {meta.rating}</span>
                    <span className="capp-store-time"><Clock size={9} /> {meta.time}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Products */}
      {selectedMall && selectedStore && (
        <div className="capp-section">
          {/* Breadcrumb */}
          <div className="capp-breadcrumb">
            <button onClick={() => setSelectedStore(null)} className="capp-back-btn">
              <ChevronLeft size={16} /> {selectedMall.name}
            </button>
            <span className="capp-breadcrumb-sep">/</span>
            <span className="capp-breadcrumb-current">{selectedStore.name}</span>
          </div>

          {/* Category Pills */}
          <div className="capp-category-pills no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`capp-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {Object.keys(filteredProducts).length === 0 ? (
            <div className="capp-empty-state">
              <Search size={28} />
              <p>No results for "{searchQuery}"</p>
            </div>
          ) : (
            Object.entries(filteredProducts).map(([cat, items]) => (
              <div key={cat} className="capp-product-section">
                <h4 className="capp-product-cat-label">{CATEGORY_LABELS[cat] || cat}</h4>
                <div className="capp-product-grid">
                  {items.map(product => {
                    const qty = getCartQty(product.id);
                    return (
                      <div key={product.id} className="capp-product-card">
                        <div className="capp-product-img-wrap">
                          <img src={product.image} alt={product.name} className="capp-product-img" />
                          <span className="capp-product-price-badge">GH₵ {product.price.toFixed(0)}</span>
                        </div>
                        <div className="capp-product-body">
                          <p className="capp-product-name">{product.name}</p>
                          {qty === 0 ? (
                            <button onClick={() => addToCart(product)} className="capp-add-btn">
                              <Plus size={14} /> Add
                            </button>
                          ) : (
                            <div className="capp-qty-ctrl">
                              <button onClick={() => updateQty(product.id, -1)} className="capp-qty-btn"><Minus size={11} /></button>
                              <span className="capp-qty-num">{qty}</span>
                              <button onClick={() => updateQty(product.id, 1)} className="capp-qty-btn add"><Plus size={11} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderCartTab = () => (
    <div className="capp-tab-content">
      <div className="capp-cart-header">
        <h2 className="capp-cart-title">Your Cart</h2>
        {selectedStore && (
          <span className="capp-cart-store-label">📍 {selectedStore.name}, {selectedMall?.name}</span>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="capp-empty-cart">
          <div className="capp-empty-cart-icon">🛒</div>
          <h3 className="capp-empty-cart-title">Your cart is empty</h3>
          <p className="capp-empty-cart-desc">Browse a mall to start adding items to your order.</p>
          <button onClick={() => setActiveTab('shop')} className="capp-empty-cart-btn">
            Start Shopping <ArrowRight size={16} />
          </button>
        </div>
      ) : checkoutStep === 'cart' ? (
        <>
          {/* Cart Items */}
          <div className="capp-cart-items">
            {cart.map(item => (
              <div key={item.product.id} className="capp-cart-item">
                <img src={item.product.image} alt={item.product.name} className="capp-cart-item-img" />
                <div className="capp-cart-item-info">
                  <p className="capp-cart-item-name">{item.product.name}</p>
                  <p className="capp-cart-item-price">GH₵ {item.product.price.toFixed(2)}</p>
                </div>
                <div className="capp-qty-ctrl compact">
                  <button onClick={() => updateQty(item.product.id, -1)} className="capp-qty-btn"><Minus size={11} /></button>
                  <span className="capp-qty-num">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="capp-qty-btn add"><Plus size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="capp-price-summary">
            <div className="capp-price-row"><span>Items subtotal</span><span>GH₵ {cartSubtotal.toFixed(2)}</span></div>
            <div className="capp-price-row"><span>Delivery fee</span><span>GH₵ {deliveryFee.toFixed(2)}</span></div>
            <div className="capp-price-row"><span>Service charge</span><span>GH₵ {serviceFee.toFixed(2)}</span></div>
            <div className="capp-price-row total"><span>Total</span><span>GH₵ {cartTotal.toFixed(2)}</span></div>
          </div>

          <button onClick={() => setCheckoutStep('form')} className="capp-checkout-btn">
            Proceed to Checkout · GH₵ {cartTotal.toFixed(2)}
          </button>
        </>
      ) : (
        /* Checkout Form */
        <div className="capp-checkout-form-wrap">
          <button onClick={() => setCheckoutStep('cart')} className="capp-back-btn" style={{ marginBottom: '20px' }}>
            <ChevronLeft size={16} /> Back to Cart
          </button>

          <h3 className="capp-form-title">Delivery & Payment</h3>

          <form onSubmit={handleCheckoutSubmit} className="capp-form">
            <div className="capp-form-group">
              <label className="capp-label">Full Name</label>
              <input required placeholder="e.g. Kwabena Appiah" value={checkoutForm.name}
                onChange={e => setCheckoutForm(p => ({ ...p, name: e.target.value }))}
                className="capp-input" />
            </div>
            <div className="capp-form-group">
              <label className="capp-label">Phone Number</label>
              <input required type="tel" placeholder="e.g. 0244123456" value={checkoutForm.phone}
                onChange={e => setCheckoutForm(p => ({ ...p, phone: e.target.value }))}
                className="capp-input" />
            </div>
            <div className="capp-form-group">
              <label className="capp-label">Delivery Address</label>
              <input required placeholder="e.g. Spintex Road, Accra" value={checkoutForm.address}
                onChange={e => setCheckoutForm(p => ({ ...p, address: e.target.value }))}
                className="capp-input" />
            </div>
            <div className="capp-form-group">
              <label className="capp-label">Mobile Money Network</label>
              <select value={checkoutForm.momoProvider}
                onChange={e => setCheckoutForm(p => ({ ...p, momoProvider: e.target.value }))}
                className="capp-input capp-select">
                <option value="MTN MoMo">📡 MTN MoMo</option>
                <option value="Telecel Cash">📡 Telecel Cash</option>
                <option value="AirtelTigo Money">📡 AirtelTigo Money</option>
              </select>
            </div>

            <div className="capp-amount-box">
              <span className="capp-amount-label">Amount to Pay</span>
              <span className="capp-amount-value">GH₵ {cartTotal.toFixed(2)}</span>
            </div>

            <button type="submit" className="capp-checkout-btn">
              Authorize MoMo Payment 🔐
            </button>
          </form>
        </div>
      )}
    </div>
  );

  const renderTrackTab = () => {
    const trackedOrder = orders.find(o => o.id === trackingId);
    const stageIdx = trackedOrder ? getStageIndex(trackedOrder.status) : -1;
    const chatMsgs = trackedOrder ? getChatMessages(trackedOrder.status, trackedOrder.shopper, trackedOrder.rider) : [];

    return (
      <div className="capp-tab-content">
        <div className="capp-track-header">
          <h2 className="capp-track-title">Track Order</h2>
          <p className="capp-track-subtitle">Enter your order ID to see live updates</p>
        </div>

        {/* Search bar */}
        <div className="capp-track-search">
          <input
            type="text"
            placeholder="e.g. ORD-1005"
            value={typedId}
            onChange={e => setTypedId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setTrackingId(typedId)}
            className="capp-track-input"
          />
          <button onClick={() => setTrackingId(typedId)} className="capp-track-btn">
            Track
          </button>
        </div>

        {/* Quick picks */}
        {orders.length > 0 && !trackedOrder && (
          <div className="capp-recent-orders">
            <p className="capp-recent-label">Recent orders</p>
            <div className="capp-recent-list">
              {orders.slice(-3).reverse().map(o => (
                <button key={o.id} onClick={() => { setTypedId(o.id); setTrackingId(o.id); }} className="capp-recent-order-chip">
                  <span className="capp-recent-id">{o.id}</span>
                  <span className="capp-recent-status" style={{ color: o.status === 'Delivered' ? '#10b981' : '#FF6B00' }}>{o.status}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Not found */}
        {trackingId && !trackedOrder && (
          <div className="capp-track-notfound">
            <AlertCircle size={28} />
            <p>Order <strong>{trackingId}</strong> not found. Check the ID and try again.</p>
          </div>
        )}

        {/* Order found */}
        {trackedOrder && (
          <div className="capp-track-result">
            {/* Order header card */}
            <div className="capp-track-card">
              <div className="capp-track-card-row">
                <div>
                  <p className="capp-track-meta-label">ORDER ID</p>
                  <p className="capp-track-meta-val">{trackedOrder.id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="capp-track-meta-label">TOTAL</p>
                  <p className="capp-track-meta-val orange">GH₵ {trackedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="capp-track-card-row" style={{ marginTop: '10px' }}>
                <div>
                  <p className="capp-track-meta-label">STORE</p>
                  <p className="capp-track-meta-small">{trackedOrder.storeName} · {trackedOrder.mallName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="capp-track-meta-label">CUSTOMER</p>
                  <p className="capp-track-meta-small">{trackedOrder.customerName}</p>
                </div>
              </div>
            </div>

            {/* Flag alert */}
            {trackedOrder.flagged && (
              <div className="capp-flag-alert">
                <AlertTriangle size={16} />
                <p><strong>Flagged by Supervisor:</strong> {trackedOrder.flagNote || 'Order under review.'}</p>
              </div>
            )}

            {/* Progress stepper */}
            <div className="capp-stepper">
              {STAGES.map((stage, i) => {
                const isComplete = i < stageIdx;
                const isActive   = i === stageIdx;
                return (
                  <div key={stage.key} className={`capp-step ${isComplete ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="capp-step-dot">
                      {isComplete ? <Check size={13} /> : <span>{stage.icon}</span>}
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`capp-step-line ${isComplete ? 'done' : ''}`} />
                    )}
                    <p className="capp-step-label">{stage.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Chat feed */}
            <div className="capp-chat-feed">
              <p className="capp-chat-label">⚡ Live Updates</p>
              <div className="capp-chat-messages">
                {chatMsgs.map((msg, i) => (
                  <div key={i} className={`capp-chat-msg ${msg.from === 'system' ? 'system' : 'staff'}`}>
                    {msg.from !== 'system' && (
                      <div className="capp-chat-avatar">{(msg.name || 'S')[0]}</div>
                    )}
                    <div className="capp-chat-bubble">
                      {msg.from !== 'system' && <p className="capp-chat-sender">{msg.name}</p>}
                      <p className="capp-chat-text">{msg.msg}</p>
                      <p className="capp-chat-time">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items receipt */}
            <div className="capp-receipt">
              <p className="capp-receipt-title">Items Ordered</p>
              {trackedOrder.items.map((item, i) => (
                <div key={i} className="capp-receipt-row">
                  <span className={`capp-receipt-dot ${item.picked ? 'picked' : ''}`}>
                    {item.picked ? '✓' : '○'}
                  </span>
                  <span className="capp-receipt-item-name">{item.name} ×{item.quantity}</span>
                  <span className="capp-receipt-item-price">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="capp-root">
      {/* ── TOP NAV BAR ── */}
      <header className="capp-topbar">
        <div className="capp-topbar-brand">
          <img src="/logo.png" alt="Shopimami" style={{ height: '32px', width: 'auto', display: 'block' }} />
          <span className="capp-brand-name">SHOPIMAMI<span className="capp-brand-dot">.</span></span>
        </div>
      </header>

      {/* ── TAB CONTENT ── */}
      <main className="capp-main">
        {!isLoaded ? (
          <div className="capp-loading">
            <div className="capp-spinner" />
            <p>Syncing SHOPIMAMI...</p>
          </div>
        ) : (
          <>
            {activeTab === 'shop'  && renderShopTab()}
            {activeTab === 'cart'  && renderCartTab()}
            {activeTab === 'track' && renderTrackTab()}
          </>
        )}
      </main>

      {/* ── BOTTOM TAB NAV ── */}
      <nav className="capp-bottom-nav">
        {[
          { id: 'shop',  icon: '🛍️', label: 'Shop'  },
          { id: 'cart',  icon: '🛒', label: 'Cart', badge: cartCount },
          { id: 'track', icon: '📍', label: 'Track' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`capp-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="capp-nav-icon">
              {tab.icon}
              {tab.badge > 0 && <span className="capp-nav-badge">{tab.badge}</span>}
            </span>
            <span className="capp-nav-label">{tab.label}</span>
            {activeTab === tab.id && <span className="capp-nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* ── USSD OVERLAY ── */}
      {ussdOpen && (
        <div className="ussd-overlay">
          <div className="ussd-dialog">
            <div className="ussd-title" style={{
              color: pendingOrder?.momoProvider === 'MTN MoMo' ? '#facc15'
                   : pendingOrder?.momoProvider === 'Telecel Cash' ? '#ef4444' : '#06b6d4'
            }}>
              {pendingOrder?.momoProvider || 'Mobile Money'} Prompt
            </div>
            <div className="ussd-body">
              Authorize payment of<br />
              <strong style={{ fontSize: '1.2rem', color: '#fff' }}>GHS {pendingOrder?.total.toFixed(2)}</strong><br />
              to SHOPIMAMI Delivery Services?<br /><br />
              Enter 4-digit Wallet PIN:
            </div>
            <input type="password" maxLength={4} className="ussd-input" placeholder="••••"
              value={ussdPin} onChange={e => setUssdPin(e.target.value.replace(/\D/g, ''))} autoFocus />
            <div className="ussd-buttons">
              <button className="ussd-btn" onClick={() => { setUssdOpen(false); setPendingOrder(null); setUssdPin(''); showToast('Payment cancelled.', 'error'); }}>
                Cancel
              </button>
              <button className="ussd-btn" disabled={ussdPin.length < 4} onClick={executePayment}>
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`capp-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── CUSTOMER SUPPORT CHAT WIDGET ── */}
      {isSupportOpen && (
        <div style={{
          position: 'fixed',
          bottom: '150px',
          right: '20px',
          width: '380px',
          height: '500px',
          maxHeight: 'calc(80vh - 100px)',
          maxWidth: 'calc(100vw - 40px)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          animation: 'capp-chat-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.2))',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>SHOPIMAMI support</h4>
                <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  Grok AI Online
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsSupportOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {supportMessages.map((msg, i) => (
              <div 
                key={i} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #4f46e5, #3b82f6)' : 'rgba(255, 255, 255, 0.05)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 0px 16px' : '16px 16px 16px 0px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', padding: '0 4px' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isSupportTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px 16px', borderRadius: '16px 16px 16px 0px' }}>
                <span className="capp-chat-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'capp-chat-blink 1.4s infinite both' }} />
                <span className="capp-chat-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'capp-chat-blink 1.4s infinite both 0.2s' }} />
                <span className="capp-chat-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'capp-chat-blink 1.4s infinite both 0.4s' }} />
              </div>
            )}
          </div>

          {/* Form */}
          <form 
            onSubmit={handleSendSupportMessage}
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px',
              display: 'flex',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.5)'
            }}
          >
            <input
              type="text"
              placeholder="Ask support..."
              value={supportInput}
              onChange={e => setSupportInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            />
            <button
              type="submit"
              disabled={!supportInput.trim() || isSupportTyping}
              style={{
                background: supportInput.trim() ? 'linear-gradient(135deg, #4f46e5, #06b6d4)' : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '12px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: supportInput.trim() ? 'white' : '#64748b',
                cursor: supportInput.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsSupportOpen(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isSupportOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <style>{`
        @keyframes capp-chat-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes capp-chat-blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
