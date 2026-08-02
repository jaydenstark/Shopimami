'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, MoreVertical, PlusSquare, Play } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [browserType, setBrowserType] = useState('unknown'); 
  const [showBanner, setShowBanner] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ios'); // 'ios' | 'android'
  const [animStep, setAnimStep] = useState(1); // 1 | 2

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('PWA ServiceWorker registered:', reg.scope))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    }

    // 2. Check if already installed / standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 3. Check if user recently dismissed
    const dismissed = localStorage.getItem('shopimami_pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 4. Detect Browser & OS environment
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(ua) && !(window).MSStream;
    const isSafari = isIOS && /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    const isSamsung = /samsungbrowser/.test(ua);
    const isFirefox = /firefox|fxios/.test(ua);
    const isAndroid = /android/.test(ua);

    let detected = 'other';
    if (isIOS) {
      detected = isSafari ? 'ios-safari' : 'ios-other';
    } else if (isSamsung) {
      detected = 'android-samsung';
    } else if (isFirefox) {
      detected = 'android-firefox';
    } else if (isAndroid) {
      detected = 'android-chrome';
    }

    // 5. Listen for Android / Chrome install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const isMobile = isIOS || isAndroid || /mobile/.test(ua);
    if (isMobile) {
      requestAnimationFrame(() => {
        setBrowserType(detected);
        setActiveTab(isIOS ? 'ios' : 'android');
        setShowBanner(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Loop step animation in tutorial modal
  useEffect(() => {
    if (!showVideoModal) return;
    const interval = setInterval(() => {
      setAnimStep(prev => (prev === 1 ? 2 : 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [showVideoModal]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User installed Shopimami PWA via prompt');
        }
        setDeferredPrompt(null);
        setShowBanner(false);
        return;
      } catch (err) {
        console.log('Native prompt failed, opening video modal:', err);
      }
    }

    setShowVideoModal(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowVideoModal(false);
    localStorage.setItem('shopimami_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0F16 0%, #1A2230 100%)',
      borderBottom: '1px solid rgba(255, 107, 0, 0.3)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      color: 'white',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      zIndex: 101,
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      animation: 'capp-fade-in 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#ffffff',
          padding: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          <img src="/icon-192x192.png" alt="Shopimami App Icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            Install SHOPIMAMI App
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>
            Instant 1-tap shopping & live tracking
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF8C00)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full, 20px)',
            padding: '6px 14px',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(255,107,0,0.35)',
            whiteSpace: 'nowrap'
          }}
        >
          {deferredPrompt ? <Download size={12} /> : browserType.startsWith('ios') ? <Share size={12} /> : <PlusSquare size={12} />}
          {deferredPrompt ? 'Install' : browserType.startsWith('ios') ? 'Add to Home' : 'Install App'}
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Animated Video Tutorial Modal */}
      {showVideoModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0A0F16',
            border: '1px solid rgba(255,107,0,0.4)',
            borderRadius: '24px',
            padding: '20px',
            maxWidth: '360px',
            width: '100%',
            color: 'white',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowVideoModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                color: '#94a3b8', borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                background: 'rgba(255,107,0,0.2)', border: '1px solid rgba(255,107,0,0.4)',
                borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.7rem', fontWeight: 800, color: '#FF6B00'
              }}>
                <Play size={10} fill="#FF6B00" /> VIDEO GUIDE
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                Add to Home Screen
              </h4>
            </div>

            {/* Platform Tabs */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px',
              background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3px',
              width: '100%', marginBottom: '16px'
            }}>
              <button
                onClick={() => { setActiveTab('ios'); setAnimStep(1); }}
                style={{
                  background: activeTab === 'ios' ? 'linear-gradient(135deg, #FF6B00, #FF8C00)' : 'transparent',
                  color: activeTab === 'ios' ? 'white' : '#94a3b8',
                  border: 'none', borderRadius: '10px', padding: '7px', fontSize: '0.78rem',
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                 iPhone / iPad
              </button>
              <button
                onClick={() => { setActiveTab('android'); setAnimStep(1); }}
                style={{
                  background: activeTab === 'android' ? 'linear-gradient(135deg, #FF6B00, #FF8C00)' : 'transparent',
                  color: activeTab === 'android' ? 'white' : '#94a3b8',
                  border: 'none', borderRadius: '10px', padding: '7px', fontSize: '0.78rem',
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                🤖 Android / Chrome
              </button>
            </div>

            {/* Simulated Animated Mobile Phone Interface */}
            <div style={{
              width: '100%',
              height: '240px',
              background: '#F4F6FB',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}>
              {/* iOS Viewport Mockup */}
              {activeTab === 'ios' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Shopimami Custom Mobile Header */}
                  <div style={{
                    background: 'linear-gradient(90deg, #0A0F16 0%, #1E293B 100%)',
                    padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                    borderBottom: '1.5px solid #FF6B00'
                  }}>
                    <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center' }}>
                      <img src="/logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', letterSpacing: '-0.3px', fontFamily: "'Outfit'" }}>
                      SHOPIMAMI
                    </span>
                  </div>

                  {/* Shopimami Product Card / Mall Chips Mock Grid */}
                  <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 800, color: '#0a0f16' }}>Choose a Mall</p>
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🏬</span>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0a0f16', display: 'block' }}>Accra Mall</span>
                        <span style={{ fontSize: '0.52rem', color: '#64748b' }}>📍 Tetteh Quarshie</span>
                      </div>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🏬</span>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0a0f16', display: 'block' }}>West Hills Mall</span>
                        <span style={{ fontSize: '0.52rem', color: '#64748b' }}>📍 Weija, Accra</span>
                      </div>
                    </div>
                  </div>

                  {/* Safari Bottom Browser Bar (Always shows in Safari on iOS) */}
                  <div style={{
                    background: '#f8fafc', borderTop: '1px solid #cbd5e1',
                    padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>‹</span>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>›</span>
                    
                    {/* Pulsing Safari Share Icon Container */}
                    <div style={{ position: 'relative' }}>
                      <Share size={18} color="#007AFF" style={{ display: 'block', cursor: 'pointer' }} />
                      {animStep === 1 && (
                        <div style={{
                          position: 'absolute', top: '-12px', left: '-12px',
                          width: '42px', height: '42px', borderRadius: '50%',
                          background: 'rgba(255, 107, 0, 0.4)', border: '2.5px solid #FF6B00',
                          animation: 'capp-tap-pulse 1.2s infinite'
                        }} />
                      )}
                    </div>
                    
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📖</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>⎕</span>

                    {/* Step 2: Safari Share Action sheet slide-up mockup */}
                    {animStep === 2 && (
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
                        borderTop: '2px solid #cbd5e1', padding: '12px 14px', zIndex: 10,
                        boxShadow: '0 -6px 20px rgba(0,0,0,0.15)',
                        animation: 'capp-sheet-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          background: '#ffffff', padding: '8px 12px', borderRadius: '10px',
                          border: '1.5px solid #FF6B00', position: 'relative'
                        }}>
                          <PlusSquare size={16} color="#FF6B00" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>
                            Add to Home Screen
                          </span>
                          <div style={{
                            position: 'absolute', top: '-10px', left: 'calc(50% - 15px)',
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: 'rgba(255, 107, 0, 0.5)', border: '2px solid #FF6B00',
                            animation: 'capp-tap-pulse 1.2s infinite'
                          }} />
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: '0.62rem', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
                          Tap "Add to Home Screen" to install
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Android / Chrome Viewport Mockup */}
              {activeTab === 'android' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Chrome top address bar with 3 dots menu */}
                  <div style={{
                    background: '#ffffff', borderBottom: '1px solid #e2e8f0',
                    padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>shopimami.com/customer</span>
                    
                    {/* Pulsing Android Chrome Menu Icon */}
                    <div style={{ position: 'relative' }}>
                      <MoreVertical size={16} color="#475569" />
                      {animStep === 1 && (
                        <div style={{
                          position: 'absolute', top: '-12px', left: '-12px',
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: 'rgba(255, 107, 0, 0.4)', border: '2.5px solid #FF6B00',
                          animation: 'capp-tap-pulse 1.2s infinite'
                        }} />
                      )}
                    </div>

                    {/* Step 2: Chrome Dropdown menu mockup */}
                    {animStep === 2 && (
                      <div style={{
                        position: 'absolute', top: '38px', right: '8px',
                        background: '#ffffff', border: '1.5px solid #FF6B00',
                        borderRadius: '10px', padding: '6px', width: '150px', zIndex: 10,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        animation: 'capp-fade-in 0.3s ease-out'
                      }}>
                        <div style={{
                          padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,107,0,0.15)',
                          display: 'flex', alignItems: 'center', gap: '6px', position: 'relative'
                        }}>
                          <PlusSquare size={13} color="#FF6B00" />
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1e293b' }}>
                            Install app
                          </span>
                          <div style={{
                            position: 'absolute', top: '-6px', left: 'calc(50% - 15px)',
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: 'rgba(255, 107, 0, 0.5)', border: '2.5px solid #FF6B00',
                            animation: 'capp-tap-pulse 1.2s infinite'
                          }} />
                        </div>
                        <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                        <span style={{ fontSize: '0.62rem', color: '#94a3b8', padding: '0 8px', display: 'block' }}>
                          Add to Home Screen
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shopimami Brand Body Area */}
                  <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Mini Shopimami Header */}
                    <div style={{
                      background: 'linear-gradient(90deg, #0A0F16 0%, #1E293B 100%)',
                      padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ width: '14px', height: '14px', background: '#fff', borderRadius: '3px', padding: '1px', display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" />
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', letterSpacing: '-0.3px' }}>
                        SHOPIMAMI
                      </span>
                    </div>

                    {/* Mall chips grid preview */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', display: 'block' }}>🏬</span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#0a0f16' }}>Accra Mall</span>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', display: 'block' }}>🏬</span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#0a0f16' }}>A&C Mall</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Android Bottom Navigation */}
                  <div style={{ height: '36px', background: '#0A0F16', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '0.78rem' }}>🛍️</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>🛒</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>📍</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step Label Summary info below player */}
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '0.78rem',
              lineHeight: '1.5',
              color: '#cbd5e1',
              marginBottom: '16px'
            }}>
              {animStep === 1 ? (
                <>
                  <strong>Step 1:</strong> Tap the highlighted {activeTab === 'ios' ? 'Share button' : 'Menu button'} in your browser bar.
                </>
              ) : (
                <>
                  <strong>Step 2:</strong> Tap <strong>"Add to Home Screen" ➕</strong> or <strong>"Install app"</strong> to launch.
                </>
              )}
            </div>

            <button
              onClick={() => setShowVideoModal(false)}
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #FF8C00)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(255,107,0,0.35)'
              }}
            >
              Got It, Install Now!
            </button>
          </div>

          <style>{`
            @keyframes capp-tap-pulse {
              0% { transform: scale(0.7); opacity: 0.3; }
              50% { transform: scale(1.2); opacity: 0.8; }
              100% { transform: scale(0.7); opacity: 0.3; }
            }
            @keyframes capp-sheet-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
