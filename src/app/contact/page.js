'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import FloatingContact from '../../components/layout/FloatingContact';
import { useCart } from '../../hooks/useCart';

export default function ContactPage() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Support',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save Message to Firestore collection 'contact_messages'
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      setIsSubmitted(true);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Support',
        message: ''
      });
    } catch (error) {
      console.error("Error submitting contact message: ", error);
      alert("Failed to submit message. Please check your internet connection and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        cartCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main style={{ flexGrow: 1, background: '#f8fafc', paddingBottom: '80px' }}>
        {/* Banner Section */}
        <section style={{
          background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
          color: 'white',
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <div className="container">
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Customer Support</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.5rem', fontWeight: 800 }}>Connect With Our Laboratory</h1>
            <p style={{ maxWidth: '600px', margin: '15px auto 0', opacity: 0.85, fontSize: '1.05rem' }}>
              Have questions about chemical compositions, dilution ratios, safety standards, or distribution? Speak with our formulation team today.
            </p>
          </div>
        </section>

        {/* Contact content layout */}
        <section className="container" style={{ marginTop: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
            
            {/* Left Column: Detailed Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Direct Support Card */}
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '20px' }}>Direct Communication</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>CALL OR TEXT</span>
                      <a href="tel:0246272115" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>0246272115</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>INSTANT WHATSAPP</span>
                      <a href="https://wa.me/233246272115" target="_blank" rel="noreferrer" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}>+233 24 627 2115</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✉️</div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>EMAIL DISPATCH</span>
                      <a href="mailto:info@neatbrandtrade.com" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>info@neatbrandtrade.com</a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quality Standards Panel */}
              <div style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '30px',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <h4 style={{ color: 'var(--secondary)', margin: '0 0 10px 0', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Laboratory Certified</h4>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>ISO 9001:2015 Registered Plant</h3>
                <p style={{ opacity: 0.85, fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  Our chemical mixtures undergo strict quality control procedures in our central manufacturing laboratory. We assure exact active ingredient levels for maximum sanitation safety.
                </p>
              </div>

            </div>

            {/* Right Column: Dynamic Form */}
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '8px' }}>Send Direct Message</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Fill out the form below to route a ticket directly to our chemical dispatcher.</p>
              
              {isSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', animation: 'scaleUp 0.3s ease-out' }}>
                  <div style={{ fontSize: '2.5rem', background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>✓</div>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '8px' }}>Message Received</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                    Your support inquiry was securely stored in our Firestore queue. A client representative will respond to your corporate email or call you shortly.
                  </p>
                  <button className="btn btn-outline" onClick={() => setIsSubmitted(false)} style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Stark"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Corporate Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="procurement@company.com"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0246272115"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Support Subject</label>
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="General Support">General Chemical Support</option>
                      <option value="Quality Assurance">Quality Assurance / SDS Requests</option>
                      <option value="Dealership/Distributorship">Wholesale Dealership Application</option>
                      <option value="Dilution Support">Chemical Dilution Resource Help</option>
                      <option value="Other">Other Specific Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Message Detail *</label>
                    <textarea 
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your inquiry in detail. Include product names or dilution specs if applicable..."
                      style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ padding: '14px', width: '100%', display: 'flex', justifyContent: 'center', fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Sending Ticket...' : 'Dispatch Message ✓'}
                  </button>
                </form>
              )}

            </div>
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />

      <FloatingContact />
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.75rem',
  color: 'var(--primary)',
  marginBottom: '6px',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  fontSize: '0.9rem',
  color: 'var(--text-main)',
  outline: 'none',
  background: '#ffffff',
  transition: 'border-color 0.2s',
  fontFamily: 'Inter, sans-serif'
};
