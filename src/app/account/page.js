'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import FloatingContact from '../../components/layout/FloatingContact';
import { useCart } from '../../hooks/useCart';
import InvoiceModal from '../../components/shop/InvoiceModal';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AccountPage() {
  const { cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart, clearCart } = useCart();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Auth States
  const [activeUser, setActiveUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [authState, setAuthState] = useState('form'); // 'form' | 'recaptcha' | 'verify' | 'success'
  
  // Registration Form inputs
  const [repName, setRepName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP Verification State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecaptchaChecked, setIsRecaptchaChecked] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // 7-Tab B2B Customer Portal Dashboard State Hooks
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [wishlist, setWishlist] = useState([
    { id: 'w1', name: 'Neat Stark Premium Floral Sanitizer', size: '25L Drum', price: 1200, spec: 'Benzalkonium Chloride (2.0% w/v) Active Matrix', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300' },
    { id: 'w2', name: 'Neat Industrial Floor Degreaser', size: 'IBC 1-Ton', price: 8500, spec: 'Heavy Industrial Alkaline (30% Active Matter)', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300' }
  ]);
  const [customAddresses, setCustomAddresses] = useState([
    { id: 'addr-1', name: 'Accra Central Hub (Primary Depot)', address: 'Plot 12, Industrial Area, Accra', coordinator: 'Emma Mensah', phone: '+233 24 456 7890', isPrimary: true },
    { id: 'addr-2', name: 'Tema Port Customs Hub', address: 'Berth 3, Tema Harbour, Tema', coordinator: 'Kwame Mensah', phone: '+233 20 876 5432', isPrimary: false }
  ]);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddr, setNewSiteAddr] = useState('');
  const [newSiteCoord, setNewSiteCoord] = useState('');
  const [newSitePhone, setNewSitePhone] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({
    'sp-1': '25L Drum',
    'sp-2': '25L Drum',
    'sp-3': '25L Drum'
  });
  const [trackedOrderId, setTrackedOrderId] = useState('ORD-9912');

  const savedProductsList = [
    {
      id: 'sp-1',
      name: 'Deva Softener Premium',
      description: 'High-concentration fabric softening formulation with long-lasting active encapsulated scent matrices.',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=300',
      pricing: {
        '5L Container': 150,
        '25L Drum': 650,
        '1-Ton IBC Container': 7200
      }
    },
    {
      id: 'sp-2',
      name: 'Neat Bleach Concentrated',
      description: 'Hospital-grade sodium hypochlorite active bleach formulation stabilizer for sanitation and wholesale bottling.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      pricing: {
        '5L Container': 120,
        '25L Drum': 520,
        '1-Ton IBC Container': 6000
      }
    },
    {
      id: 'sp-3',
      name: 'Multi-Purpose Cleaner Floral',
      description: 'Super-dilution active surfactant detergent for heavy commercial sanitation and factory floor applications.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
      pricing: {
        '5L Container': 180,
        '25L Drum': 780,
        '1-Ton IBC Container': 8500
      }
    }
  ];

  const trackingData = {
    'ORD-9842': {
      id: 'ORD-9842',
      carrier: 'NBT Central Logistics Fleet (Truck #A382)',
      status: 'Delivered',
      origin: 'Accra Manufacturing Facility',
      destination: 'Stark Chemical Depot, Accra',
      steps: [
        { title: 'Order Placed', time: 'May 14, 2026 - 08:30 AM', desc: 'Distributor credit approved and manufacturing batch allocated.', status: 'complete' },
        { title: 'Laboratory Prep', time: 'May 14, 2026 - 11:15 AM', desc: 'Active dilution formulas synthesized and containerized.', status: 'complete' },
        { title: 'Cargo In Transit', time: 'May 14, 2026 - 02:45 PM', desc: 'Heavy transport logistics truck departed central facility.', status: 'complete' },
        { title: 'Delivered', time: 'May 15, 2026 - 10:30 AM', desc: 'Offloaded and signed off by Accra Hub site coordinator Emma.', status: 'complete' }
      ]
    },
    'ORD-9912': {
      id: 'ORD-9912',
      carrier: 'NBT Coastal Freight Services (Truck #T902)',
      status: 'In Transit',
      origin: 'Accra Manufacturing Facility',
      destination: 'Tema Port Gate Customs Hub',
      steps: [
        { title: 'Order Placed', time: 'May 20, 2026 - 10:00 AM', desc: 'B2B order authorized. Batch formulas queued.', status: 'complete' },
        { title: 'Laboratory Prep', time: 'May 21, 2026 - 09:30 AM', desc: 'Formulations containerized into 25L drums and sealed.', status: 'complete' },
        { title: 'Cargo In Transit', time: 'May 22, 2026 - 07:15 AM', desc: 'En route to Tema Harbour under coastal customs escort.', status: 'active' },
        { title: 'Delivered', time: 'Est: May 23, 2026 - 03:00 PM', desc: 'Awaiting site delivery confirmation at Tema Port Customs Hub.', status: 'pending' }
      ]
    }
  };

  const handleRemoveFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const handleAddWishlistToCart = (item) => {
    if (typeof addToCart === 'function') {
      addToCart({
        id: item.id,
        name: `${item.name} (${item.size})`,
        price: item.price,
        image: item.image || '/NBT Logo_.png'
      }, 1);
      alert(`${item.name} (${item.size}) added to wholesale order dispatch cart.`);
    } else {
      alert("Cart connection active. Please use the product catalog to purchase.");
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newSiteName || !newSiteAddr || !newSiteCoord || !newSitePhone) {
      alert("Please fill in all coordinator site inputs.");
      return;
    }
    const newAddr = {
      id: `addr-${Date.now()}`,
      name: newSiteName,
      address: newSiteAddr,
      coordinator: newSiteCoord,
      phone: `+233 ${newSitePhone}`,
      isPrimary: false
    };
    setCustomAddresses(prev => [...prev, newAddr]);
    setNewSiteName('');
    setNewSiteAddr('');
    setNewSiteCoord('');
    setNewSitePhone('');
  };

  const handleAddSavedProductToCart = (prod) => {
    const size = selectedSizes[prod.id];
    const price = prod.pricing[size];
    if (typeof addToCart === 'function') {
      addToCart({
        id: `${prod.id}-${size.replace(/\s+/g, '')}`,
        name: `${prod.name} (${size})`,
        price: price,
        image: prod.image
      }, 1);
      alert(`Wholesale batch ${prod.name} (${size}) added to checkout cart.`);
    } else {
      alert("Cart connection active. Please use the product catalog to purchase.");
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '💖' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'saved-products', label: 'Saved Products', icon: '🧪' },
    { id: 'track-shipment', label: 'Track Shipment', icon: '🚚' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  // Fallback defaults for newly created wholesale credit parameters
  const standardCreditLimit = 50000;
  const standardCreditUsed = 0;
  const standardTier = 'Tier 2 Bulk Wholesaler';

  // Load session from localStorage on mount safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nbt_active_user');
      setTimeout(() => {
        if (stored) {
          try {
            setActiveUser(JSON.parse(stored));
          } catch (e) {
            console.error("Error parsing stored session", e);
          }
        }
        setIsLoaded(true);
      }, 0);
    }
  }, []);

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if (authState === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [authState, resendTimer]);

  // Handle Form Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setVerificationError('');

    if (authMode === 'register') {
      if (!repName || !companyName || !email || !phone) {
        setVerificationError('Please complete all standard fields.');
        return;
      }
    } else {
      if (!phone) {
        setVerificationError('Please provide your registered phone number.');
        return;
      }
    }

    // Advance to ReCAPTCHA simulation
    setAuthState('recaptcha');
    setRecaptchaLoading(true);
    setTimeout(() => {
      setRecaptchaLoading(false);
    }, 1200);
  };

  // Confirm ReCAPTCHA Check
  const handleRecaptchaConfirm = () => {
    setIsRecaptchaChecked(true);
    setTimeout(() => {
      // Transition to OTP Code verification and trigger SMS
      setAuthState('verify');
      setResendTimer(60);
      setOtpCode(['', '', '', '', '', '']);
    }, 800);
  };

  // Handle individual OTP digit inputs
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtpCode(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace auto-focus previous field
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Perform SMS verification check
  const handleVerifyCode = async () => {
    const code = otpCode.join('');
    setVerificationError('');
    
    if (code.length < 6) {
      setVerificationError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);

    // Simulate network latency
    setTimeout(async () => {
      // High-fidelity standard verification test code: 192837
      if (code !== '192837') {
        setVerificationError('Invalid security verification code. Please try again.');
        setIsVerifying(false);
        return;
      }

      try {
        if (authMode === 'register') {
          // Format standard values
          const cleanPhone = phone.trim();
          const cleanEmail = email.toLowerCase().trim();
          const cleanCompany = companyName.trim();
          const cleanRep = repName.trim();
          const uniqueDiscount = `NBT-${cleanCompany.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)}-15`;

          // Check if user already exists in Firestore by phone
          const q = query(collection(db, 'wholesale_clients'), where('phone', '==', cleanPhone));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setVerificationError('An account with this mobile number already exists. Please Log In.');
            setIsVerifying(false);
            setAuthMode('login');
            setAuthState('form');
            return;
          }

          // Build premium B2B client details
          const clientData = {
            company: cleanCompany,
            representative: cleanRep,
            email: cleanEmail,
            phone: cleanPhone,
            discountCode: uniqueDiscount,
            tier: standardTier,
            creditLimit: standardCreditLimit,
            creditUsed: standardCreditUsed,
            orders: [
              { 
                id: 'ORD-9842', 
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
                total: 4200, 
                items: '12x All-Purpose Floral (5L), 5x Neat Bleach (25L)', 
                status: 'Delivered' 
              }
            ]
          };

          // Save client details to Firestore
          await addDoc(collection(db, 'wholesale_clients'), {
            ...clientData,
            createdAt: serverTimestamp()
          });

          // Set active session
          localStorage.setItem('nbt_active_user', JSON.stringify(clientData));
          setActiveUser(clientData);

        } else {
          // Log In flow: Query Firestore for existing account by phone
          const cleanPhone = phone.trim();
          const q = query(collection(db, 'wholesale_clients'), where('phone', '==', cleanPhone));
          const snap = await getDocs(q);

          if (snap.empty) {
            // Fallback: If Stark Distributors default, log in with Stark
            if (cleanPhone.includes('244123456') || cleanPhone.includes('246272115')) {
              const starkDefault = {
                company: 'Stark Chemical Distributors',
                representative: 'Jayden Stark',
                email: 'jayden@starkchemicals.com',
                tier: 'Tier 2 Bulk Wholesaler',
                discountCode: 'NBT-STARK-15',
                creditLimit: 50000,
                creditUsed: 12450,
                orders: [
                  { id: 'ORD-9842', date: 'May 14, 2026', total: 4200, items: '12x All-Purpose Floral (5L), 5x Neat Bleach (25L)', status: 'Delivered' },
                  { id: 'ORD-9751', date: 'April 28, 2026', total: 8250, items: '2x Neat Industrial Detergent IBC (1 Ton)', status: 'Delivered' },
                  { id: 'ORD-9533', date: 'March 11, 2026', total: 11200, items: '40x Floral Disinfectant (25L), 20x Handwash (5L)', status: 'Delivered' }
                ]
              };
              localStorage.setItem('nbt_active_user', JSON.stringify(starkDefault));
              setActiveUser(starkDefault);
            } else {
              setVerificationError('No wholesale account found matching this mobile number. Please register first.');
              setIsVerifying(false);
              return;
            }
          } else {
            // Found matched user profile in database
            const matchedUser = snap.docs[0].data();
            localStorage.setItem('nbt_active_user', JSON.stringify(matchedUser));
            setActiveUser(matchedUser);
          }
        }

        // Complete Verification
        setAuthState('success');
        setIsVerifying(false);
      } catch (err) {
        console.error("Authentication/Database Sync failed", err);
        setVerificationError('Synchronization failed. Please check internet connection.');
        setIsVerifying(false);
      }
    }, 1500);
  };

  // Sign out corporate user
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nbt_active_user');
      setActiveUser(null);
      setAuthState('form');
      setAuthMode('register');
      setRepName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
    }
  };

  const remainingCredit = activeUser ? activeUser.creditLimit - activeUser.creditUsed : 0;
  const creditPercent = activeUser ? (activeUser.creditUsed / activeUser.creditLimit) * 100 : 0;

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B2339' }}>
        <div style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.15)', borderTop: '3px solid #2B8C8A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span>Securing Corporate Connection...</span>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        cartCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      {/* GATEKEEPER SIGNUP & VERIFICATION SCREEN */}
      {!activeUser ? (
        <main style={{ flexGrow: 1, background: 'linear-gradient(135deg, #0B2339 0%, #0d3152 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            color: 'white',
            fontFamily: 'Inter, sans-serif'
          }}>
            
            {/* LOGO AREA */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img 
                src="/NBT Logo_.png" 
                alt="NBT Logo" 
                style={{ height: '56px', width: 'auto', background: 'rgba(11, 35, 57, 0.65)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
              />
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 850, fontSize: '1.65rem', marginTop: '15px', color: 'white', letterSpacing: '-0.5px', marginBottom: '5px' }}>
                Neat Brand Trade
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2.5px' }}>
                Wholesale Portal Gateway
              </span>
            </div>

            {/* PHASE 1: ACCOUNT DETAILS FORM */}
            {authState === 'form' && (
              <div>
                {/* Form Mode Selector tabs */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', marginBottom: '25px' }}>
                  <button 
                    onClick={() => { setAuthMode('register'); setVerificationError(''); }}
                    style={{
                      flex: 1,
                      background: authMode === 'register' ? '#2B8C8A' : 'transparent',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    📝 Create Wholesale Account
                  </button>
                  <button 
                    onClick={() => { setAuthMode('login'); setVerificationError(''); }}
                    style={{
                      flex: 1,
                      background: authMode === 'login' ? '#2B8C8A' : 'transparent',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔑 Member Log In
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label style={labelStyle}>REPRESENTATIVE FULL NAME</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Jayden Stark" 
                          value={repName}
                          onChange={e => setRepName(e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>COMPANY / BUSINESS NAME</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Stark Chemical Distributors" 
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CORPORATE EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          placeholder="e.g. jayden@starkchemicals.com" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={labelStyle}>MOBILE NUMBER (SMS VERIFICATION CODE TARGET)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ 
                        background: 'rgba(0,0,0,0.25)', 
                        border: '1px solid rgba(255,255,255,0.15)', 
                        padding: '12px 14px', 
                        borderRadius: '12px', 
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        🇬🇭 <span>+233</span>
                      </div>
                      <input 
                        type="tel" 
                        placeholder="e.g. 24 412 3456" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  </div>

                  {verificationError && (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', padding: '10px 15px', borderRadius: '10px', fontSize: '0.8rem', color: '#ff8888', fontWeight: 600 }}>
                      ⚠️ {verificationError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    style={submitButtonStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#2B8C8A'}
                  >
                    {authMode === 'register' ? 'Submit Registration' : 'Secure Log In'}
                  </button>
                </form>
              </div>
            )}

            {/* PHASE 2: reCAPTCHA CHALLENGE */}
            {authState === 'recaptcha' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '15px', fontWeight: 700 }}>Security Verification</h4>
                <p style={{ fontSize: '0.82rem', opacity: 0.75, lineHeight: 1.5, marginBottom: '25px' }}>
                  Please solve the reCAPTCHA to request the secure SMS transaction code for verification.
                </p>

                {/* reCAPTCHA Box container */}
                <div style={{
                  background: '#f9f9f9',
                  border: '1px solid #d3d3d3',
                  borderRadius: '6px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '310px',
                  margin: '0 auto 30px auto',
                  color: '#333',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {recaptchaLoading ? (
                      <div style={{ width: '26px', height: '26px', border: '3px solid #f3f3f3', borderTop: '3px solid #4a90e2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <input 
                        type="checkbox" 
                        checked={isRecaptchaChecked} 
                        onChange={handleRecaptchaConfirm}
                        style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                      />
                    )}
                    <span style={{ fontSize: '0.88rem', fontWeight: 550, fontFamily: 'Roboto, sans-serif', color: '#555' }}>
                      I'm not a robot
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img 
                      src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
                      alt="recaptcha" 
                      style={{ height: '30px', width: '30px' }} 
                    />
                    <span style={{ fontSize: '0.55rem', opacity: 0.6, marginTop: '2px', color: '#555' }}>Privacy - Terms</span>
                  </div>
                </div>

                <button 
                  onClick={() => setAuthState('form')}
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Back to Details
                </button>
              </div>
            )}

            {/* PHASE 3: SMS OTP VERIFICATION INPUT */}
            {authState === 'verify' && (
              <div>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '10px', fontWeight: 800, textAlign: 'center' }}>
                  Enter Verification Code
                </h4>
                <p style={{ fontSize: '0.82rem', opacity: 0.75, lineHeight: 1.6, textAlign: 'center', marginBottom: '25px' }}>
                  We have dispatched a secure 6-digit OTP to <strong style={{ color: 'var(--secondary)' }}>+233 {phone}</strong>. Enter it below to authorize.
                </p>

                {/* 6 digital inputs box */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '25px' }}>
                  {otpCode.map((digit, idx) => (
                    <input 
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      ref={el => otpInputsRef.current[idx] = el}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '46px',
                        height: '52px',
                        background: 'rgba(0,0,0,0.25)',
                        border: digit ? '2px solid #2B8C8A' : '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        textAlign: 'center',
                        color: 'white',
                        transition: 'all 0.2s',
                        boxShadow: digit ? '0 0 10px rgba(43, 140, 138, 0.4)' : 'none'
                      }}
                    />
                  ))}
                </div>

                {verificationError && (
                  <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', padding: '10px 15px', borderRadius: '10px', fontSize: '0.8rem', color: '#ff8888', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
                    ⚠️ {verificationError}
                  </div>
                )}

                {/* Companion Sandbox test notice */}
                <div style={{
                  background: 'rgba(43, 140, 138, 0.12)',
                  border: '1px dashed rgba(43, 140, 138, 0.3)',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  textAlign: 'center',
                  marginBottom: '25px',
                  color: 'rgba(255,255,255,0.85)'
                }}>
                  💡 <strong>Sandbox SMS Simulator:</strong> Enter security key <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--secondary)', fontSize: '0.88rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>192837</span> to verify.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <button 
                    onClick={handleVerifyCode}
                    disabled={isVerifying}
                    style={submitButtonStyle}
                  >
                    {isVerifying ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.15)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span>Authorizing Credentials...</span>
                      </div>
                    ) : 'Verify & Activate Account'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0 5px' }}>
                    <span style={{ opacity: 0.6 }}>Didn't receive SMS?</span>
                    {resendTimer > 0 ? (
                      <span style={{ fontWeight: 650, color: 'var(--secondary)' }}>Resend OTP in {resendTimer}s</span>
                    ) : (
                      <button 
                        onClick={() => { setResendTimer(60); setVerificationError(''); }}
                        style={{ background: 'transparent', border: 'none', color: '#2B8C8A', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 4: SUCCESS VERIFIED ANIMATION */}
            {authState === 'success' && (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  background: 'rgba(22, 163, 74, 0.15)',
                  border: '3px solid #16a34a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  fontSize: '2.5rem',
                  animation: 'pulseGreen 1.5s infinite'
                }}>
                  ✅
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', marginBottom: '8px' }}>
                  Mobile Verified Successfully
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px' }}>
                  B2B Credentials Active
                </span>
                <p style={{ fontSize: '0.85rem', opacity: 0.75, lineHeight: 1.5, marginBottom: '20px' }}>
                  Welcome to Neat Brand Trade. Syncing wholesale ledger records and loading account workspace...
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid rgba(43, 140, 138, 0.2)', borderTop: '2px solid #2B8C8A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span>Configuring Account Vault...</span>
                </div>
                
                {/* Auto redirect mechanism */}
                {setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('nbt_active_user');
                    if (stored) {
                      setActiveUser(JSON.parse(stored));
                    }
                  }
                }, 2200) && null}
              </div>
            )}

          </div>
          <style>{`
            @keyframes pulseGreen {
              0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
              70% { box-shadow: 0 0 0 15px rgba(22, 163, 74, 0); }
              100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
            }
          `}</style>
        </main>
      ) : (
        /* Dynamic Verified Dashboard */
        <main style={{ flexGrow: 1, background: '#f8fafc', paddingBottom: '80px' }}>
          {/* Banner Section */}
          <section style={{
            background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
            color: 'white',
            padding: '50px 0'
          }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Customer Portal</span>
                <h1 style={{ fontSize: '2.4rem', marginTop: '0.5rem', fontWeight: 800 }}>Welcome Back, {activeUser.representative}</h1>
                <p style={{ margin: '5px 0 0', opacity: 0.85, fontSize: '1rem' }}>{activeUser.company} • {activeUser.tier}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', display: 'block' }}>Active Discount Code</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '1px' }}>{activeUser.discountCode}</span>
              </div>
            </div>
          </section>

          {/* 7-Tab B2B Customer Portal Dashboard Grid */}
          <section className="container" style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', gap: '30px' }} className="account-grid-layout">
              
              {/* Left Column: Desktop Navigation Sidebar */}
              <div className="desktop-sidebar" style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                width: '260px',
                padding: '20px 15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignSelf: 'flex-start',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0
              }}>
                {tabs.map((tab) => {
                  const active = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      style={{
                        background: active ? 'rgba(43, 140, 138, 0.08)' : 'transparent',
                        color: active ? '#2B8C8A' : '#0B2339',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (!active) e.currentTarget.style.background = 'rgba(43, 140, 138, 0.04)';
                      }}
                      onMouseLeave={e => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile top capsule horizontal navigation bar (Touch Target >= 48px comfortable padding) */}
              <div className="mobile-capsules" style={{
                display: 'none',
                gap: '8px',
                overflowX: 'auto',
                padding: '5px 0 15px 0',
                width: '100%',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}>
                {tabs.map((tab) => {
                  const active = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      style={{
                        background: active ? '#2B8C8A' : 'white',
                        color: active ? 'white' : 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        padding: '10px 18px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '40px',
                        flexShrink: 0
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Tab View Workspace content */}
              <div className="tab-content-panel" style={{ flexGrow: 1, minWidth: 0 }}>
                
                {/* 1. DASHBOARD TAB */}
                {activeSubTab === 'dashboard' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', marginBottom: '20px', color: 'var(--primary)' }}>📊 Corporate Ledger Overview</h2>
                    
                    {/* Credit warning Alert */}
                    {creditPercent >= 80 && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid #ef4444',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        marginBottom: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        color: '#ef4444'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                          <strong>High Credit Utilization Warning:</strong> Your wholesale account has utilized <strong>{creditPercent.toFixed(1)}%</strong> of the allocated GH₵ {activeUser.creditLimit.toLocaleString()} credit limit. Please settle outstanding invoices under the Orders tab to resume priority manufacturing dispatch.
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                      <div style={{ ...ledgerBoxStyle, padding: '24px', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>💳 CREDIT LIMIT</span>
                        <strong style={{ fontSize: '1.55rem', color: 'var(--primary)', display: 'block', marginTop: '8px', fontFamily: 'Outfit' }}>GH₵ {activeUser.creditLimit.toLocaleString('en-US')}</strong>
                      </div>
                      <div style={{ ...ledgerBoxStyle, padding: '24px', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>⚠️ OUTSTANDING CREDIT</span>
                        <strong style={{ fontSize: '1.55rem', color: '#ff4444', display: 'block', marginTop: '8px', fontFamily: 'Outfit' }}>GH₵ {activeUser.creditUsed.toLocaleString('en-US')}</strong>
                      </div>
                      <div style={{ ...ledgerBoxStyle, padding: '24px', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>✓ AVAILABLE CREDIT</span>
                        <strong style={{ fontSize: '1.55rem', color: 'var(--secondary)', display: 'block', marginTop: '8px', fontFamily: 'Outfit' }}>GH₵ {remainingCredit.toLocaleString('en-US')}</strong>
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 600 }}>Credit Utilization Ratio</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{creditPercent.toFixed(1)}% Used</span>
                      </div>
                      <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${creditPercent}%`, background: creditPercent >= 80 ? '#ff4444' : 'var(--secondary)', borderRadius: '5px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '30px',
                      borderRadius: '20px',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <h4 style={{ color: 'var(--secondary)', margin: '0 0 8px 0', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 800 }}>Laboratory Dispatch Notice</h4>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', fontFamily: 'Outfit' }}>Rapid Batch Shipments Active</h3>
                      <p style={{ opacity: 0.85, fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                        All bulk wholesale formulation matching is prioritized. Standard dispatch is scheduled within 12 hours from our central manufacturing warehouse. Ensure your credit limits remain under 80% to avoid laboratory formulation dispatch holds.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. ORDERS TAB */}
                {activeSubTab === 'orders' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', color: 'var(--primary)', margin: 0 }}>📦 Wholesale Order History</h2>
                      <span style={{ fontSize: '0.85rem', background: '#e2e8f0', padding: '4px 10px', borderRadius: '30px', fontWeight: 650 }}>{activeUser.orders ? activeUser.orders.length : 0} Orders Total</span>
                    </div>

                    {/* Table view for Desktop */}
                    <div className="desktop-orders-table" style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', background: '#f8fafc' }}>
                              <th style={{ padding: '16px 20px' }}>ORDER ID</th>
                              <th style={{ padding: '16px 20px' }}>DISPATCH DATE</th>
                              <th style={{ padding: '16px 20px' }}>FORMULATIONS ORDERED</th>
                              <th style={{ padding: '16px 20px' }}>TOTAL COST</th>
                              <th style={{ padding: '16px 20px' }}>STATUS</th>
                              <th style={{ padding: '16px 20px', textAlign: 'right' }}>ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeUser.orders && activeUser.orders.map((o) => (
                              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', transition: 'background 0.2s' }}>
                                <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--primary)' }}>{o.id}</td>
                                <td style={{ padding: '18px 20px', color: 'var(--text-muted)' }}>{o.date}</td>
                                <td style={{ padding: '18px 20px', color: 'var(--text-main)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.items}</td>
                                <td style={{ padding: '18px 20px', fontWeight: 700 }}>GH₵ {o.total.toLocaleString('en-US')}</td>
                                <td style={{ padding: '18px 20px' }}>
                                  <span style={{ background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '30px' }}>{o.status}</span>
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                                  <button 
                                    onClick={() => setSelectedInvoiceOrder(o)}
                                    style={{
                                      background: 'rgba(11, 35, 57, 0.06)',
                                      color: 'var(--primary)',
                                      border: 'none',
                                      padding: '8px 14px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      transition: 'var(--transition)'
                                    }}
                                  >
                                    🧾 View Invoice
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Card view for Mobile (to guarantee no side scroll!) */}
                    <div className="mobile-orders-cards" style={{ display: 'none', flexDirection: 'column', gap: '15px' }}>
                      {activeUser.orders && activeUser.orders.map((o) => (
                        <div key={o.id} style={{
                          background: 'white',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{o.id}</strong>
                            <span style={{ background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '30px' }}>{o.status}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>📅 Date: {o.date}</div>
                            <div style={{ color: 'var(--text-main)', fontWeight: 550 }}>🧪 {o.items}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>GH₵ {o.total.toLocaleString('en-US')}</strong>
                            <button 
                              onClick={() => setSelectedInvoiceOrder(o)}
                              style={{
                                background: 'rgba(11, 35, 57, 0.06)',
                                color: 'var(--primary)',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 700
                              }}
                            >
                              🧾 View Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. WISHLIST TAB */}
                {activeSubTab === 'wishlist' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', marginBottom: '20px', color: 'var(--primary)' }}>💖 Saved Wholesale Formulation Watchlists</h2>
                    
                    {wishlist.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                        <span style={{ fontSize: '3rem' }}>🔬</span>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginTop: '10px', color: 'var(--text-main)' }}>Your formulation watchlist is empty.</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>Save custom chemical blends from the products library to monitor bulk prices.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {wishlist.map((item) => (
                          <div key={item.id} style={{
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <div style={{ height: '140px', background: '#f8fafc', position: 'relative' }}>
                              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(11, 35, 57, 0.8)', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>
                                {item.size}
                              </div>
                            </div>
                            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', color: 'var(--primary)', margin: 0, minHeight: '44px' }}>{item.name}</h4>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SPEC: {item.spec}</span>
                              <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WHOLESALE PRICE:</span>
                                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>GH₵ {item.price.toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => handleAddWishlistToCart(item)}
                                    style={{
                                      flex: 1,
                                      background: '#2B8C8A',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    🛒 Order Batch
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveFromWishlist(item.id)}
                                    style={{
                                      background: 'rgba(255, 68, 68, 0.08)',
                                      color: '#ff4444',
                                      border: '1px solid rgba(255, 68, 68, 0.15)',
                                      width: '36px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ADDRESSES TAB */}
                {activeSubTab === 'addresses' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', marginBottom: '20px', color: 'var(--primary)' }}>📍 Ship-To Site & Coordinator Registry</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                      {customAddresses.map((site) => (
                        <div key={site.id} style={{
                          background: 'white',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: 'var(--shadow-sm)',
                          position: 'relative'
                        }}>
                          {site.isPrimary && (
                            <span style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(43, 140, 138, 0.12)', color: 'var(--secondary)', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              Primary
                            </span>
                          )}
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '8px' }}>🏢 {site.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px', lineHeight: 1.4 }}>📍 {site.address}</p>
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.78rem' }}>
                            <div style={{ color: 'var(--text-muted)' }}>SITE COORDINATOR</div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>👤 {site.coordinator}</div>
                            <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>📞 {site.phone}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '15px', fontWeight: 800 }}>➕ Register New Delivery Warehouse Site</h3>
                      <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="address-form-grid">
                        <div>
                          <label style={{ ...labelStyle, color: 'var(--text-muted)' }}>WAREHOUSE / SITE NAME</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Kumasi Distribution Depot" 
                            value={newSiteName}
                            onChange={e => setNewSiteName(e.target.value)}
                            required
                            style={{ ...inputStyle, background: '#f8fafc', border: '1px solid #d1d5db', color: '#0B2339' }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, color: 'var(--text-muted)' }}>SHIPPING ADDRESS</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Plot 45, Airport Residential, Kumasi" 
                            value={newSiteAddr}
                            onChange={e => setNewSiteAddr(e.target.value)}
                            required
                            style={{ ...inputStyle, background: '#f8fafc', border: '1px solid #d1d5db', color: '#0B2339' }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, color: 'var(--text-muted)' }}>SITE COORDINATOR FULL NAME</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Felix Boateng" 
                            value={newSiteCoord}
                            onChange={e => setNewSiteCoord(e.target.value)}
                            required
                            style={{ ...inputStyle, background: '#f8fafc', border: '1px solid #d1d5db', color: '#0B2339' }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, color: 'var(--text-muted)' }}>COORDINATOR PHONE (EXCL. +233)</label>
                          <input 
                            type="tel" 
                            placeholder="e.g. 24 999 8888" 
                            value={newSitePhone}
                            onChange={e => setNewSitePhone(e.target.value)}
                            required
                            style={{ ...inputStyle, background: '#f8fafc', border: '1px solid #d1d5db', color: '#0B2339' }}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 2' }} className="address-form-submit">
                          <button 
                            type="submit" 
                            style={{
                              background: '#2B8C8A',
                              color: 'white',
                              border: 'none',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              transition: 'all 0.2s',
                              boxShadow: '0 4px 10px rgba(43, 140, 138, 0.15)'
                            }}
                          >
                            ➕ Register Site Coordinate
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 5. SAVED PRODUCTS TAB */}
                {activeSubTab === 'saved-products' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', marginBottom: '20px', color: 'var(--primary)' }}>🧪 Stark Bulk Formulation Library</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                      {savedProductsList.map((product) => {
                        const activeSize = selectedSizes[product.id];
                        const activePrice = product.pricing[activeSize];
                        return (
                          <div key={product.id} style={{
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <div style={{ height: '160px', position: 'relative' }}>
                              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(43, 140, 138, 0.9)', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '30px' }}>
                                ✓ Stark Specs Match
                              </div>
                            </div>
                            <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', color: 'var(--primary)', margin: 0 }}>{product.name}</h4>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{product.description}</p>
                              
                              <div>
                                <label style={{ ...labelStyle, color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: '4px' }}>CONTAINER PACKAGING SIZE</label>
                                <select 
                                  value={activeSize} 
                                  onChange={(e) => setSelectedSizes(prev => ({ ...prev, [product.id]: e.target.value }))}
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    background: '#f8fafc',
                                    color: 'var(--primary)',
                                    fontWeight: 650,
                                    fontSize: '0.85rem',
                                    outline: 'none'
                                  }}
                                >
                                  {Object.keys(product.pricing).map(sz => (
                                    <option key={sz} value={sz}>{sz}</option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                  <div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>WHOLESALE VALUE</span>
                                    <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700 }}>Margin saved 15%</span>
                                  </div>
                                  <strong style={{ fontSize: '1.35rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>GH₵ {activePrice.toLocaleString()}</strong>
                                </div>
                                
                                <button 
                                  onClick={() => handleAddSavedProductToCart(product)}
                                  style={{
                                    width: '100%',
                                    background: '#2B8C8A',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                  }}
                                >
                                  🛒 Add Wholesale Batch to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. TRACK SHIPMENT TAB */}
                {activeSubTab === 'track-shipment' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                      <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', color: 'var(--primary)', margin: 0 }}>🚚 Active Dispatch Cargo Tracking</h2>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>SELECT DISPATCH:</span>
                        <select 
                          value={trackedOrderId}
                          onChange={(e) => setTrackedOrderId(e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        >
                          <option value="ORD-9912">ORD-9912 (In Transit - Cargo Active)</option>
                          <option value="ORD-9842">ORD-9842 (Delivered - Archive Log)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', boxShadow: 'var(--shadow-sm)', marginBottom: '25px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Dispatch Status</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <strong style={{ fontSize: '1.2rem', color: trackingData[trackedOrderId].status === 'Delivered' ? '#16a34a' : 'var(--secondary)' }}>
                              {trackingData[trackedOrderId].status}
                            </strong>
                            {trackingData[trackedOrderId].status === 'In Transit' && (
                              <div style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', animation: 'pulseGreen 1.5s infinite' }} />
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', textAlign: 'right' }}>Active Logistics Carrier</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>{trackingData[trackedOrderId].carrier}</strong>
                        </div>
                      </div>

                      {/* Logistical timeline stepper */}
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', paddingLeft: '30px' }}>
                        
                        {/* Dynamic line connector */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '9px',
                          bottom: '12px',
                          width: '3px',
                          background: '#e2e8f0',
                          zIndex: 1
                        }} />

                        {trackingData[trackedOrderId].steps.map((st, idx) => {
                          let isDone = st.status === 'complete';
                          let isActive = st.status === 'active';
                          return (
                            <div key={idx} style={{ position: 'relative', zIndex: 2 }}>
                              {/* Step dot */}
                              <div style={{
                                position: 'absolute',
                                left: '-28px',
                                top: '2px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: isDone ? '#16a34a' : isActive ? 'var(--secondary)' : '#e2e8f0',
                                border: isActive ? '4px solid rgba(43, 140, 138, 0.25)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isActive ? '0 0 10px rgba(43, 140, 138, 0.4)' : 'none'
                              }}>
                                {isDone && <span style={{ color: 'white', fontSize: '0.55rem', fontWeight: 900 }}>✓</span>}
                              </div>
                              
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '5px' }}>
                                  <strong style={{ fontSize: '0.92rem', color: isDone || isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{st.title}</strong>
                                  <span style={{ fontSize: '0.75rem', color: isActive ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 650 }}>{st.time}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{st.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px 20px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Logistics Route Details</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', flexWrap: 'wrap', gap: '10px' }}>
                        <div>🏭 <strong>FROM:</strong> {trackingData[trackedOrderId].origin}</div>
                        <div>🏢 <strong>TO:</strong> {trackingData[trackedOrderId].destination}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. PROFILE TAB */}
                {activeSubTab === 'profile' && (
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', marginBottom: '20px', color: 'var(--primary)' }}>👤 Company & Rep Profile</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="account-grid-layout">
                      <div style={{ background: 'white', padding: '25px', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '20px', fontWeight: 800 }}>Representative Specs</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.88rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '1px' }}>REPRESENTATIVE NAME</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 650, fontSize: '0.98rem', display: 'block', marginTop: '4px' }}>{activeUser.representative}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '1px' }}>COMPANY / BUSINESS NAME</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 650, fontSize: '0.98rem', display: 'block', marginTop: '4px' }}>{activeUser.company}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '1px' }}>VERIFIED EMAIL ADDRESS</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 650, fontSize: '0.98rem', display: 'block', marginTop: '4px' }}>{activeUser.email}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '1px' }}>SECURE VERIFICATION PHONE</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 650, fontSize: '0.98rem', display: 'block', marginTop: '4px' }}>+233 {activeUser.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'white', padding: '25px', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '15px', fontWeight: 800 }}>Account Audit & Tier</h3>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 750 }}>PORTFOLIO CLASSIFICATION</span>
                              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '1rem', display: 'block', marginTop: '4px' }}>{activeUser.tier}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 750 }}>IDENTITY VERIFICATION</span>
                              <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                                ✓ Verified via Secure OTP SMS
                              </span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 750 }}>DYNAMIC DISCOUNT PARTNER CODE</span>
                              <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-block', marginTop: '4px', border: '1px solid #e2e8f0' }}>
                                {activeUser.discountCode}
                              </code>
                            </div>
                          </div>
                        </div>

                        <div style={{ background: 'white', padding: '25px', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                          <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem', padding: '10px 12px', fontWeight: 700 }} onClick={() => alert("Corporate details update is locked during active billing cycle. Contact NBT Admin.")}>
                            ⚙️ Request Portal Updates
                          </button>
                          <button 
                            onClick={handleSignOut}
                            style={{
                              width: '100%',
                              background: 'rgba(255, 68, 68, 0.08)',
                              color: '#ff4444',
                              border: '1px solid rgba(255, 68, 68, 0.2)',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              transition: 'all 0.2s',
                              marginTop: '10px'
                            }}
                          >
                            🚪 Secure Portal Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>
        </main>
      )}

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />

      <FloatingContact />

      {/* enterprise VAT Tax Invoice modal overlay */}
      <InvoiceModal 
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />

      <style>{`
        @media (max-width: 768px) {
          div.account-grid-layout {
            flex-direction: column !important;
            gap: 15px !important;
          }
          .account-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-capsules {
            display: flex !important;
          }
          .mobile-capsules::-webkit-scrollbar {
            display: none !important;
          }
          .desktop-orders-table {
            display: none !important;
          }
          .mobile-orders-cards {
            display: flex !important;
          }
          .address-form-grid {
            grid-template-columns: 1fr !important;
          }
          .address-form-submit {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

const ledgerBoxStyle = {
  background: '#f8fafc',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid var(--border)'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 750,
  letterSpacing: '1.5px',
  color: 'rgba(255, 255, 255, 0.7)',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  padding: '12px 16px',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.92rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'Inter, sans-serif'
};

const submitButtonStyle = {
  width: '100%',
  background: '#2B8C8A',
  color: 'white',
  border: 'none',
  padding: '14px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.95rem',
  transition: 'all 0.2s',
  fontFamily: 'Outfit, sans-serif',
  boxShadow: '0 4px 12px rgba(43, 140, 138, 0.25)'
};
