'use client';

const FloatingContact = () => {
  const phoneNumber = "233246272115";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20NBT%20Global,%20I%20would%20like%20to%20make%20an%20inquiry.`;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      zIndex: 999
    }}>
      {/* Call Button */}
      <a 
        href={`tel:+${phoneNumber}`}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--secondary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s',
          fontSize: '1.2rem'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Call Us"
      >
        📞
      </a>
      
      {/* WhatsApp Button */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25D366', // WhatsApp Green
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
          transition: 'transform 0.2s',
          fontSize: '2rem'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat on WhatsApp"
      >
        💬
      </a>
    </div>
  );
};

export default FloatingContact;
