'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

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

    // 4. Detect iOS safely
    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window).MSStream;
    
    // 5. Listen for Android / Chrome install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    if (iosDevice) {
      // Defer state update to next frame to avoid synchronous effect setState lint rule
      requestAnimationFrame(() => {
        setIsIOS(true);
        setShowBanner(true);
      });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed Shopimami PWA');
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSTip(false);
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
          {isIOS ? <Share size={12} /> : <Download size={12} />}
          {isIOS ? 'Add to Home' : 'Install'}
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

      {/* iOS Instructions Modal */}
      {showIOSTip && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0A0F16',
            border: '1px solid rgba(255,107,0,0.4)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '320px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{
              width: '48px', height: '48px', background: '#ffffff', borderRadius: '12px',
              margin: '0 auto 12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/icon-192x192.png" alt="Shopimami" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800 }}>Install on iPhone / iPad</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px' }}>
              1. Tap Safari's <strong>Share</strong> button <Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /><br />
              2. Scroll down & select <strong>"Add to Home Screen" ➕</strong>
            </p>
            <button
              onClick={() => setShowIOSTip(false)}
              style={{
                background: 'var(--secondary, #FF6B00)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '10px 20px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', width: '100%'
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
