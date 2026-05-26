'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Cart = ({ isOpen, onClose, cartItems, onRemove, onClearCart }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Save Order to Firestore
      const orderData = {
        customer: formData,
        items: cartItems,
        totalAmount: total,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);

      // 2. Generate WhatsApp Message
      let message = `*New Order from NBT Global* 🚀\n\n`;
      message += `*Customer Details:*\n`;
      message += `Name: ${formData.name}\n`;
      message += `Phone: ${formData.phone}\n`;
      message += `Address: ${formData.address}\n\n`;
      message += `*Order Items:*\n`;
      
      cartItems.forEach((item, index) => {
        const qtyText = item.qtyInBox > 1 ? ` (${item.qtyInBox} pieces/box)` : '';
        message += `${index + 1}. ${item.name} (${item.size})${qtyText} - GH₵ ${item.price.toLocaleString('en-US')}\n`;
      });
      
      message += `\n*Total Amount:* GH₵ ${total.toLocaleString('en-US')}`;

      // URL Encode the message
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/233246272115?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // 3. Reset and Close
      setIsSubmitting(false);
      setIsCheckout(false);
      setFormData({ name: '', phone: '', address: '' });
      if (onClearCart) onClearCart();
      onClose();

    } catch (error) {
      console.error("Error submitting order: ", error);
      alert("Failed to process order. Please try again or contact us directly.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-drawer" style={{
      animation: 'fadeIn 0.3s ease-out',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{isCheckout ? "Checkout" : "Your Order"}</h2>
        <button onClick={() => { setIsCheckout(false); onClose(); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
      </div>

      {!isCheckout ? (
        <>
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem' }}>
            {cartItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</p>
            ) : (
              cartItems.map((item, index) => (
                <div key={index} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      Size: {item.size} {item.qtyInBox > 1 && `(${item.qtyInBox} pcs/box)`}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>GH₵ {item.price.toLocaleString('en-US')}</p>
                  </div>
                  <button 
                    onClick={() => onRemove(index)}
                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>GH₵ {total.toLocaleString('en-US')}</span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '15px' }}
              onClick={() => setIsCheckout(true)}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}
                placeholder="John Doe"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone Number</label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}
                placeholder="e.g. 0246272115"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Delivery Address</label>
              <textarea 
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', minHeight: '100px' }}
                placeholder="Accra, Ghana..."
              />
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Order Summary</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{cartItems.length} items</p>
              <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: 'var(--primary)' }}>Total: GH₵ {total.toLocaleString('en-US')}</p>
            </div>
          </div>

          <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
            <button 
              type="button"
              className="btn" 
              style={{ padding: '15px', flex: 1, border: '1px solid var(--border)', borderRadius: '8px' }}
              onClick={() => setIsCheckout(false)}
              disabled={isSubmitting}
            >
              Back
            </button>
            <button 
              type="submit"
              className="btn btn-primary" 
              style={{ padding: '15px', flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Order via WhatsApp 💬'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Cart;
