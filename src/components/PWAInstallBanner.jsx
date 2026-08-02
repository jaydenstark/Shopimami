'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, MoreVertical, Menu, PlusSquare } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [browserType, setBrowserType] = useState('unknown'); // 'ios-safari' | 'ios-other' | 'android-chrome' | 'android-samsung' | 'android-firefox' | 'other'
  const [showBanner, setShowBanner] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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

    // 5. Listen for Android / Chrome native prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner on mobile/tablet devices
    const isMobile = isIOS || isAndroid || /mobile/.test(ua);
    if (isMobile) {
      requestAnimationFrame(() => {
        setBrowserType(detected);
        setShowBanner(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // If native browser prompt is available, trigger 1-tap install
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
        console.log('Native prompt failed, opening help modal:', err);
      }
    }

    // Otherwise, show universal browser step-by-step instructions modal
    setShowHelpModal(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowHelpModal(false);
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

      {/* Universal Browser Installation Instructions Modal */}
      {showHelpModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
            padding: '24px',
            maxWidth: '340px',
            width: '100%',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: '52px', height: '52px', background: '#ffffff', borderRadius: '14px',
              margin: '0 auto 14px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255,107,0,0.3)'
            }}>
              <img src="/icon-192x192.png" alt="Shopimami" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              Add to Home Screen
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 18px', fontWeight: 500 }}>
              Follow these simple steps for your browser:
            </p>

            {/* Steps based on browser */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '20px',
              fontSize: '0.82rem',
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}>
              {browserType === 'ios-safari' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff', fontWeight: 700 }}>
                    <Share size={16} color="#FF6B00" /> <span>iOS Safari:</span>
                  </div>
                  1. Tap Safari's <strong>Share</strong> button <Share size={13} style={{ verticalAlign: 'middle', color: '#3b82f6' }} /> at the bottom.<br />
                  2. Scroll down & select <strong>"Add to Home Screen" ➕</strong>.
                </>
              )}

              {browserType === 'ios-other' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff', fontWeight: 700 }}>
                    <Share size={16} color="#FF6B00" /> <span>iOS Chrome / Edge / Firefox:</span>
                  </div>
                  1. Tap the <strong>Share</strong> icon <Share size={13} style={{ verticalAlign: 'middle', color: '#3b82f6' }} /> or Menu <strong>···</strong>.<br />
                  2. Select <strong>"Add to Home Screen" ➕</strong>.
                </>
              )}

              {browserType === 'android-chrome' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff', fontWeight: 700 }}>
                    <MoreVertical size={16} color="#FF6B00" /> <span>Android Chrome:</span>
                  </div>
                  1. Tap the <strong>Three Dots Menu ⋮</strong> in top right.<br />
                  2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </>
              )}

              {browserType === 'android-samsung' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff', fontWeight: 700 }}>
                    <Menu size={16} color="#FF6B00" /> <span>Samsung Internet:</span>
                  </div>
                  1. Tap the <strong>Menu ≡</strong> in bottom right.<br />
                  2. Tap <strong>"+ Add page to"</strong> → select <strong>"Home screen"</strong>.
                </>
              )}

              {browserType === 'android-firefox' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff', fontWeight: 700 }}>
                    <MoreVertical size={16} color="#FF6B00" /> <span>Firefox Android:</span>
                  </div>
                  1. Tap the <strong>Menu ⋮</strong> next to address bar.<br />
                  2. Select <strong>"Install"</strong> / <strong>"Add to Home screen"</strong>.
                </>
              )}

              {(browserType === 'other' || !['ios-safari', 'ios-other', 'android-chrome', 'android-samsung', 'android-firefox'].includes(browserType)) && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff', fontWeight: 700 }}>
                    <PlusSquare size={16} color="#FF6B00" /> <span>Universal Instructions:</span>
                  </div>
                  1. Open your browser's <strong>Menu</strong> (top right or bottom bar).<br />
                  2. Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen" ➕</strong>.
                </>
              )}
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #FF8C00)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 20px',
                fontSize: '0.875rem',
                fontWeight: 800,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(255,107,0,0.35)'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
