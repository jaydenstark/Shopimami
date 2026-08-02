'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, MoreVertical, PlusSquare, Play, RefreshCw, Check } from 'lucide-react';

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
    }, 3200);
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

  const isIOS = browserType.startsWith('ios');

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
          {deferredPrompt ? <Download size={12} /> : isIOS ? <Share size={12} /> : <PlusSquare size={12} />}
          {deferredPrompt ? 'Install' : isIOS ? 'Add to Home' : 'Install App'}
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
            {/* Modal Header */}
            <button
              onClick={() => setShowVideoModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                color: '#94a3b8', borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
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

            {/* Platform Selector Tabs */}
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

            {/* Simulated Animated Phone Screen Player */}
            <div style={{
              width: '100%',
              height: '210px',
              background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
              borderRadius: '16px',
              border: '1.5px solid rgba(255,255,255,0.12)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: '16px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}>
              {/* Phone Status Bar Mock */}
              <div style={{
                padding: '6px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.4)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span>9:41</span>
                <span>SHOPIMAMI.COM</span>
                <span>100%</span>
              </div>

              {/* Phone Content Screen View */}
              <div style={{
                flex: 1,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Step 1 Simulation */}
                {animStep === 1 && (
                  <div style={{
                    textAlign: 'center',
                    animation: 'capp-fade-in 0.4s ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', background: 'rgba(255,107,0,0.15)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '8px', border: '1px solid rgba(255,107,0,0.4)'
                    }}>
                      {activeTab === 'ios' ? <Share size={20} color="#FF6B00" /> : <MoreVertical size={20} color="#FF6B00" />}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'white' }}>
                      Step 1: Tap {activeTab === 'ios' ? 'Share Icon' : 'Menu Icon'}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                      {activeTab === 'ios' ? 'Located at the bottom of Safari' : 'Located at top-right of Chrome / browser'}
                    </p>

                    {/* Animated Tap Pointer */}
                    <div style={{
                      position: 'absolute',
                      bottom: activeTab === 'ios' ? '8px' : 'auto',
                      top: activeTab === 'ios' ? 'auto' : '8px',
                      right: activeTab === 'ios' ? 'calc(50% - 12px)' : '16px',
                      width: '24px', height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(255, 107, 0, 0.6)',
                      boxShadow: '0 0 15px #FF6B00',
                      animation: 'capp-tap-pulse 1.2s infinite'
                    }} />
                  </div>
                )}

                {/* Step 2 Simulation */}
                {animStep === 2 && (
                  <div style={{
                    width: '100%',
                    maxWidth: '220px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,107,0,0.5)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    animation: 'capp-fade-in 0.4s ease-out',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255,107,0,0.2)',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #FF6B00'
                    }}>
                      <PlusSquare size={16} color="#FF6B00" />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white' }}>
                        Add to Home Screen
                      </span>
                      <Check size={14} color="#10B981" style={{ marginLeft: 'auto' }} />
                    </div>

                    <p style={{ margin: '8px 0 0', fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center' }}>
                      Step 2: Tap "Add to Home Screen" to install!
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Step Indicator */}
              <div style={{
                padding: '8px 14px',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.6)'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{
                    width: '18px', height: '4px', borderRadius: '2px',
                    background: animStep === 1 ? '#FF6B00' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s'
                  }} />
                  <span style={{
                    width: '18px', height: '4px', borderRadius: '2px',
                    background: animStep === 2 ? '#FF6B00' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s'
                  }} />
                </div>
                <button
                  onClick={() => setAnimStep(prev => (prev === 1 ? 2 : 1))}
                  style={{
                    background: 'none', border: 'none', color: '#FF6B00',
                    fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                >
                  <RefreshCw size={10} /> Replay
                </button>
              </div>
            </div>

            {/* Text Steps Summary */}
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
              {activeTab === 'ios' ? (
                <>
                  <strong>1.</strong> Tap Safari Share button <Share size={12} style={{ verticalAlign: 'middle', color: '#FF6B00' }} /> at bottom.<br />
                  <strong>2.</strong> Tap <strong>"Add to Home Screen" ➕</strong>.
                </>
              ) : (
                <>
                  <strong>1.</strong> Tap Chrome Menu <MoreVertical size={12} style={{ verticalAlign: 'middle', color: '#FF6B00' }} /> in top right.<br />
                  <strong>2.</strong> Tap <strong>"Install app"</strong> or <strong>"Add to Home screen" ➕</strong>.
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
              0% { transform: scale(0.8); opacity: 0.4; }
              50% { transform: scale(1.3); opacity: 0.9; }
              100% { transform: scale(0.8); opacity: 0.4; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
