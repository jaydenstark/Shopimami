'use client';

import { useEffect } from 'react';

const Toast = ({ message, isOpen, onClose, onViewCart }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideUp {
          from {
            transform: translateY(30px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .nbt-toast-container {
          animation: toastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <div className="nbt-toast-container" style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'rgba(11, 35, 57, 0.95)',
        backdropFilter: 'blur(12px)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        zIndex: 3000,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '380px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ 
          fontSize: '1.5rem',
          background: 'rgba(43, 140, 138, 0.2)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--secondary, #2B8C8A)'
        }}>
          🛒
        </div>
        <div style={{ flexGrow: 1 }}>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Added to Cart</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={onViewCart}
            style={{
              background: 'var(--secondary, #2B8C8A)',
              border: 'none',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(43, 140, 138, 0.2)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#32a09e';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'var(--secondary, #2B8C8A)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            View Cart
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              fontSize: '1.4rem',
              padding: '0 4px',
              transition: 'color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'white'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
};

export default Toast;
