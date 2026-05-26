'use client';

import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Cart from '../../components/shop/Cart';
import Toast from '../../components/ui/Toast';
import FloatingContact from '../../components/layout/FloatingContact';
import { useCart } from '../../hooks/useCart';
import Link from 'next/link';

// ─── Industry Data ────────────────────────────────────────────────────────────
const INDUSTRIES = [
  {
    id: 'schools',
    icon: '🎓',
    name: 'Schools',
    subtitle: 'Educational Institutions',
    color: '#2B8C8A',
    bgGradient: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
    accentColor: '#00897B',
    headline: 'Safe, Non-Toxic Cleaning for Learning Environments',
    description: 'Schools require chemical products that are effective against germs and viruses yet completely safe for children of all ages. Our education-focused formulations deliver hospital-grade hygiene without harsh fumes or toxic residues.',
    challenges: [
      'High foot traffic spreading germs rapidly across classrooms',
      'Vulnerable children requiring non-toxic, hypoallergenic formulations',
      'Canteen and kitchen areas demanding food-safe sanitizers',
      'Budget constraints requiring high-dilution, cost-effective concentrates',
    ],
    solutions: [
      { icon: '🧴', title: 'Child-Safe Disinfectants', desc: 'Broad-spectrum virucidal action, zero harsh fumes, safe for daily classroom use.' },
      { icon: '🚽', title: 'Washroom Hygiene Systems', desc: 'Toilet bowl cleaners, urinal blocks, and hand soap systems for high-traffic bathrooms.' },
      { icon: '🍽️', title: 'Food-Safe Kitchen Cleaners', desc: 'Non-tainting degreasers and sanitizers certified safe for canteen surfaces.' },
      { icon: '🌿', title: 'Eco-Friendly Floor Cleaners', desc: 'Biodegradable multi-surface cleaners safe for sports halls and corridors.' },
    ],
    badges: ['✓ Non-Toxic', '✓ Child-Safe', '✓ Food-Grade', '✓ Eco-Friendly'],
    products: ['Neat All-Purpose Cleaner', 'Neat Hand Sanitizer', 'Deva Toilet Bowl Cleaner', 'Neat Floor Cleaner'],
    testimonial: {
      quote: 'Since switching to NBT, our school infirmary has seen a 40% reduction in stomach-related illnesses. The products are safe, effective, and the kids don\'t even notice the smell.',
      author: 'Mr. Adjei K.',
      role: 'Head of Facilities, Accra International School',
    },
  },
  {
    id: 'hospitals',
    icon: '🏥',
    name: 'Hospitals',
    subtitle: 'Healthcare & Medical Centers',
    color: '#1565C0',
    bgGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    accentColor: '#1976D2',
    headline: 'Clinical-Grade Disinfection That Meets WHO Standards',
    description: 'Healthcare settings demand zero compromise on hygiene. Our medical-grade disinfectants, surgical sanitizers, and ward cleaning systems are formulated to eliminate hospital-acquired infections and maintain clinical compliance.',
    challenges: [
      'Hospital-acquired infections (HAIs) threatening patient safety',
      'Multi-drug resistant organisms requiring broad-spectrum disinfection',
      'Surgical theatres requiring sterile, surface-safe disinfectants',
      'Continuous usage requiring large-volume, cost-effective bulk supplies',
    ],
    solutions: [
      { icon: '🧪', title: 'Broad-Spectrum Disinfectants', desc: 'Kills 99.999% of bacteria, viruses, and fungi including MRSA and HIV.' },
      { icon: '✋', title: 'Surgical Hand Antiseptics', desc: 'Alcohol-based hand rubs meeting EN 1500 standards for surgical scrub protocols.' },
      { icon: '🛏️', title: 'Ward Surface Cleaners', desc: 'Low-residue, quick-drying surface disinfectants for beds, rails, and equipment.' },
      { icon: '🚿', title: 'Biohazard Waste Management', desc: 'Chlorine-based solutions for effective biohazard area decontamination.' },
    ],
    badges: ['✓ WHO Compliant', '✓ Kills 99.999%', '✓ Non-Corrosive', '✓ Surgical Grade'],
    products: ['Neat Disinfectant Concentrate', 'Deva Hand Sanitizer 5L', 'Neat Surface Disinfectant', 'Industrial Chlorine Solution'],
    testimonial: {
      quote: 'NBT\'s disinfectants are the backbone of our infection control programme. The concentration ratios are precise, the documentation is thorough, and delivery is always on time.',
      author: 'Dr. Evelyn Hanson',
      role: 'Director of Facilities, Ridge Hospital',
    },
  },
  {
    id: 'hotels',
    icon: '🏨',
    name: 'Hotels',
    subtitle: 'Hospitality & Lodging',
    color: '#6A1B9A',
    bgGradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    accentColor: '#7B1FA2',
    headline: 'Premium Hygiene Products That Elevate Guest Experiences',
    description: 'Five-star hospitality demands products that leave rooms spotless and fragrant. Our hospitality line includes high-fragrance laundry systems, luxury hand soaps, and multi-surface glass cleaners tailored to premium hotel standards.',
    challenges: [
      'Maintaining consistent fragrance and freshness across 100s of rooms',
      'Laundry operations requiring powerful yet fabric-gentle detergents',
      'Pool and spa areas needing pH-balanced water treatment chemicals',
      'Restaurants and kitchen hygiene meeting health authority inspections',
    ],
    solutions: [
      { icon: '🛁', title: 'Luxury Room Amenity Cleaners', desc: 'Premium bathroom cleaners with pleasant scents for guest-facing areas.' },
      { icon: '👔', title: 'Commercial Laundry Systems', desc: 'High-efficiency detergents, fabric softeners, and optical brighteners for linen care.' },
      { icon: '🍽️', title: 'Commercial Kitchen Degreasers', desc: 'Powerful restaurant-grade degreasers for grills, ovens, and kitchen surfaces.' },
      { icon: '🌊', title: 'Pool & Spa Chemicals', desc: 'Balanced chlorine, pH adjusters, and algaecides for crystal-clear water maintenance.' },
    ],
    badges: ['✓ High-Fragrance', '✓ Fabric-Safe', '✓ Food-Grade', '✓ 5-Star Quality'],
    products: ['Deva Fabric Softener', 'Neat Bathroom Cleaner', 'NBT Kitchen Degreaser', 'Pool Chlorine Granules'],
    testimonial: {
      quote: 'NBT\'s laundry detergents and fabric softeners have transformed our housekeeping. Guest satisfaction scores around room freshness went from 82% to 96% in three months.',
      author: 'Akosua Mensah',
      role: 'Procurement Lead, Golden Tulip Accra',
    },
  },
  {
    id: 'restaurants',
    icon: '🍽️',
    name: 'Restaurants',
    subtitle: 'Food Service & Catering',
    color: '#E65100',
    bgGradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    accentColor: '#F57C00',
    headline: 'Food-Safe Cleaning Solutions for Commercial Kitchens',
    description: 'Restaurant kitchens face the most demanding hygiene standards in any industry. Our food-service range tackles heavy grease, oil build-up, and cross-contamination risk with powerful degreasers and food-contact-safe sanitizers.',
    challenges: [
      'Heavy grease and carbon build-up on grills, ovens, and fryers',
      'Cross-contamination risk requiring food-contact surface sanitizers',
      'Drain blockages from oil accumulation in kitchen pipework',
      'Pest prevention requiring strong disinfectants in waste areas',
    ],
    solutions: [
      { icon: '🔥', title: 'Heavy-Duty Oven & Grill Degreasers', desc: 'High-alkaline formula that dissolves stubborn carbonized grease without scrubbing.' },
      { icon: '🫧', title: 'Food-Contact Surface Sanitizers', desc: 'No-rinse sanitizers certified safe for cutting boards, prep surfaces, and fridges.' },
      { icon: '🚰', title: 'Drain & Grease Trap Cleaners', desc: 'Enzymatic and caustic options to keep kitchen drains free-flowing.' },
      { icon: '🧼', title: 'Dishwash & Glasswash Compounds', desc: 'Streak-free commercial dishwash detergents and rinse aids for sparkling tableware.' },
    ],
    badges: ['✓ Food-Safe', '✓ No-Rinse Options', '✓ HACCP Compliant', '✓ NSF Listed'],
    products: ['NBT Industrial Degreaser', 'Neat No-Rinse Sanitizer', 'Drain Enzyme Treatment', 'Commercial Dishwash Detergent'],
    testimonial: {
      quote: 'Our kitchen passed its Ghana Health Service inspection with zero issues for the first time ever. The NBT degreaser actually works — one application and the oven looks brand new.',
      author: 'Chef Yaw Darko',
      role: 'Head Chef, Buka Restaurant Accra',
    },
  },
  {
    id: 'factories',
    icon: '🏭',
    name: 'Factories',
    subtitle: 'Manufacturing & Industrial Plants',
    color: '#37474F',
    bgGradient: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)',
    accentColor: '#455A64',
    headline: 'Heavy-Duty Industrial Chemicals for Maximum Uptime',
    description: 'Factories and manufacturing plants demand aggressive chemical solutions that can handle heavy machinery grease, raw material build-up, and large-scale surface cleaning without equipment damage or safety incidents.',
    challenges: [
      'Heavy grease, hydraulic oil, and lubricant contamination on machinery',
      'Large surface areas requiring high-volume, high-concentration solutions',
      'Worker safety requiring pH-neutral or skin-compatible formulations',
      'Environmental compliance requiring biodegradable industrial chemicals',
    ],
    solutions: [
      { icon: '⚙️', title: 'Machinery & Equipment Degreasers', desc: 'Solvent-based and alkaline degreasers that dissolve industrial oil without corrosion.' },
      { icon: '🧱', title: 'Concrete & Floor Treatment', desc: 'Industrial floor cleaners and concrete degreasers for factory floor maintenance.' },
      { icon: '🔩', title: 'Metal Parts Cleaners', desc: 'Non-corrosive alkaline cleaners for metal components, tools, and assemblies.' },
      { icon: '💧', title: 'Cooling Tower Water Treatment', desc: 'Scale inhibitors, biocides, and corrosion inhibitors for industrial water systems.' },
    ],
    badges: ['✓ High-Alkaline', '✓ IBC Tonnages', '✓ ISO Certified', '✓ Bulk Drums'],
    products: ['NBT Industrial Degreaser 200L', 'Floor Treatment Concentrate', 'Metal Safe Cleaner', 'Water Treatment Chemical'],
    testimonial: {
      quote: 'We order 1,000L of NBT\'s industrial degreaser every quarter. It\'s the only product that handles our CNC machine oil contamination effectively. Delivery is always prompt.',
      author: 'Kwame Boateng',
      role: 'Quality Assurance Manager, Ghana Breweries Limited',
    },
  },
  {
    id: 'offices',
    icon: '🏢',
    name: 'Offices',
    subtitle: 'Commercial & Corporate Spaces',
    color: '#1B5E20',
    bgGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    accentColor: '#2E7D32',
    headline: 'Clean, Fresh Workspaces That Boost Productivity',
    description: 'Modern offices need versatile, pleasant-smelling cleaning solutions that create a healthy working environment. Our office range covers everything from glass and surface cleaners to washroom hygiene systems and air fresheners.',
    challenges: [
      'Air quality and odour control in enclosed air-conditioned spaces',
      'High-touch surfaces spreading germs across large workforces',
      'Washroom hygiene maintenance for staff and visitor facilities',
      'Sustainable, eco-conscious products for green office certifications',
    ],
    solutions: [
      { icon: '🪟', title: 'Glass & Surface Cleaners', desc: 'Streak-free glass cleaners and multi-surface sprays for desks, screens, and partitions.' },
      { icon: '🌸', title: 'Air Fresheners & Odour Control', desc: 'Long-lasting fragrance systems and odour neutralizers for reception and common areas.' },
      { icon: '🚻', title: 'Washroom Hygiene Products', desc: 'Hand soaps, sanitizer dispensers, urinal blocks, and toilet bowl cleaners.' },
      { icon: '🧹', title: 'Daily Floor & Carpet Care', desc: 'Non-slip floor cleaners and carpet fresheners for daily maintenance routines.' },
    ],
    badges: ['✓ Pleasant Fragrance', '✓ Eco-Friendly', '✓ Non-Toxic', '✓ Multi-Surface'],
    products: ['Neat Glass Cleaner', 'Deva Air Freshener', 'Neat Hand Soap 5L', 'Multi-Surface Disinfectant'],
    testimonial: {
      quote: 'Our office cleaning team loves the NBT products. The all-purpose cleaner handles everything in one spray and the fragrance stays fresh all day. Bulk ordering is very simple.',
      author: 'Abena Mensah',
      role: 'Office Manager, Accra Business Hub',
    },
  },
];

// ─── Industry Card ────────────────────────────────────────────────────────────
function IndustryCard({ industry, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const active = isSelected || hovered;

  return (
    <button
      onClick={onClick}
      className="industry-card-btn"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? industry.bgGradient : 'white',
        border: `2px solid ${active ? industry.accentColor : 'var(--border)'}`,
        borderRadius: '20px',
        padding: '32px 24px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: active ? 'translateY(-8px)' : 'none',
        boxShadow: active ? `0 20px 40px ${industry.accentColor}25` : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: industry.accentColor,
          color: 'white',
          fontSize: '0.7rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
        }}>✓</span>
      )}

      {/* Icon */}
      <span style={{
        fontSize: '3rem',
        display: 'block',
        filter: active ? 'none' : 'grayscale(20%)',
        transition: 'all 0.3s ease',
        transform: active ? 'scale(1.15)' : 'scale(1)',
      }}>
        {industry.icon}
      </span>

      {/* Name */}
      <div>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: active ? industry.accentColor : 'var(--primary)',
          fontFamily: 'Outfit, sans-serif',
          transition: 'color 0.2s ease',
        }}>
          {industry.name}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: active ? industry.accentColor : 'var(--text-muted)',
          fontWeight: 500,
          marginTop: '3px',
          transition: 'color 0.2s ease',
        }}>
          {industry.subtitle}
        </div>
      </div>

      {/* Click hint */}
      <span style={{
        fontSize: '0.72rem',
        color: active ? industry.accentColor : 'var(--text-muted)',
        fontWeight: 600,
        opacity: active ? 1 : 0.7,
        transition: 'all 0.2s ease',
      }}>
        {isSelected ? '▲ Showing solutions' : 'Click to explore →'}
      </span>
    </button>
  );
}

// ─── Solution Card ────────────────────────────────────────────────────────────
function SolutionCard({ sol, color }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderTop: `4px solid ${color}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s ease',
    }}>
      <span style={{ fontSize: '2rem' }}>{sol.icon}</span>
      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
        {sol.title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
        {sol.desc}
      </p>
    </div>
  );
}

// ─── Industry Detail Panel ────────────────────────────────────────────────────
function IndustryDetail({ industry }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      border: `1px solid ${industry.accentColor}33`,
      boxShadow: `0 20px 60px ${industry.accentColor}18`,
      overflow: 'hidden',
      animation: 'slideDown 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Header banner */}
      <div style={{
        background: `linear-gradient(135deg, #0B2339 0%, #153a5c 60%, ${industry.accentColor}55 100%)`,
        padding: '40px clamp(24px, 5vw, 56px)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '9rem', opacity: 0.07, pointerEvents: 'none', userSelect: 'none' }}>
          {industry.icon}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.5rem' }}>{industry.icon}</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: industry.color === '#2B8C8A' ? '#80cbc4' : '#b0bec5', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Industry Solutions
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
                {industry.name}
              </h2>
            </div>
          </div>
          <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: '680px', lineHeight: 1.65, marginBottom: '20px' }}>
            {industry.headline}
          </p>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {industry.badges.map(b => (
              <span key={b} style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '5px 12px',
                borderRadius: '30px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '40px clamp(24px, 5vw, 56px)' }}>

        {/* Two-column: description + challenges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>
              Why NBT for {industry.name}?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: 1.75 }}>
              {industry.description}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>
              Key Challenges We Solve
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {industry.challenges.map((c, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  <span style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: industry.accentColor, color: 'white', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginTop: '1px' }}>
                    {i + 1}
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Solutions grid */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>
            Our {industry.name} Product Solutions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {industry.solutions.map(sol => (
              <SolutionCard key={sol.title} sol={sol} color={industry.accentColor} />
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{
          background: industry.bgGradient,
          borderRadius: '16px',
          padding: '28px 32px',
          border: `1px solid ${industry.accentColor}22`,
          marginBottom: '32px',
        }}>
          <p style={{ fontSize: '1rem', color: '#37474F', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '16px' }}>
            "{industry.testimonial.quote}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: industry.accentColor,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem',
            }}>
              {industry.testimonial.author[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{industry.testimonial.author}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{industry.testimonial.role}</div>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="industries-cta-row" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            href={`/products?category=${encodeURIComponent(industry.solutions[0]?.title || industry.name)}`}
            className="btn btn-primary"
            style={{ padding: '13px 28px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            🛍️ Shop {industry.name} Products
          </Link>
          <Link
            href="/bulk-orders"
            className="btn btn-outline"
            style={{ padding: '13px 28px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            📦 Request Bulk Quote
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IndustriesPage() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart, toastMessage, setToastMessage } = useCart();
  const [selectedId, setSelectedId] = useState(null);

  const selectedIndustry = INDUSTRIES.find(i => i.id === selectedId);

  const handleCardClick = (id) => {
    setSelectedId(prev => prev === id ? null : id);
    // Scroll to detail panel after selection
    if (selectedId !== id) {
      setTimeout(() => {
        document.getElementById('industry-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar cartCount={cartItems.length} onCartClick={() => setIsCartOpen(true)} />

      <main style={{ flexGrow: 1, paddingBottom: '100px' }}>

        {/* ── HERO BANNER ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0B2339 0%, #153a5c 100%)',
          color: 'white',
          padding: 'clamp(60px, 10vw, 100px) 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,140,138,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,140,138,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Tailored for Every Sector
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginTop: '12px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1.15 }}>
              Industries We Serve
            </h1>
            <p style={{ maxWidth: '600px', margin: '20px auto 0', opacity: 0.8, fontSize: '1.08rem', lineHeight: 1.7 }}>
              We engineer specialized hygiene and cleaning solutions optimized for the unique safety requirements, compliance standards, and operational demands of each sector.
            </p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {INDUSTRIES.map(ind => (
                <span key={ind.id} style={{ fontSize: '1.4rem', cursor: 'pointer' }} title={ind.name} onClick={() => handleCardClick(ind.id)}>
                  {ind.icon}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── INDUSTRY CARDS GRID ── */}
        <section className="container" style={{ marginTop: '56px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Select an industry below to view tailored product solutions
            </p>
          </div>
          <div className="industries-grid">
            {INDUSTRIES.map(industry => (
              <IndustryCard
                key={industry.id}
                industry={industry}
                isSelected={selectedId === industry.id}
                onClick={() => handleCardClick(industry.id)}
              />
            ))}
          </div>
        </section>

        {/* ── INDUSTRY DETAIL PANEL ── */}
        {selectedIndustry && (
          <section className="container" style={{ marginTop: '40px' }} id="industry-detail">
            <IndustryDetail industry={selectedIndustry} />
          </section>
        )}

        {/* ── EMPTY PROMPT (no selection) ── */}
        {!selectedIndustry && (
          <section className="container" style={{ marginTop: '32px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '2px dashed var(--border)',
              padding: '60px 24px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👆</span>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '8px' }}>
                Select an Industry Above
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '400px', margin: '0 auto' }}>
                Click any industry card to view the specific cleaning and hygiene challenges we solve, our product solutions, and real customer testimonials.
              </p>
            </div>
          </section>
        )}

        {/* ── STATS STRIP ── */}
        <section className="container" style={{ marginTop: '70px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
          }}>
            {[
              { num: '6+', label: 'Industries Served', icon: '🏢' },
              { num: '14,000+', label: 'Happy Customers', icon: '😊' },
              { num: '100+', label: 'Product Formulations', icon: '🧪' },
              { num: '16', label: 'Regions Covered', icon: '🇬🇭' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '28px 20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{stat.icon}</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{stat.num}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="container" style={{ marginTop: '70px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #153a5c 100%)',
            borderRadius: '24px',
            padding: 'clamp(32px, 6vw, 56px)',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,140,138,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, marginBottom: '10px' }}>
                Don't See Your Industry?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.97rem', maxWidth: '520px', lineHeight: 1.65 }}>
                Our laboratory team custom-formulates solutions for any commercial or industrial application. Tell us your challenge — we'll engineer the solution.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <Link href="/contact" className="btn" style={{ background: 'var(--secondary)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem' }}>
                📞 Talk to a Chemist
              </Link>
              <Link href="/bulk-orders" className="btn btn-outline" style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem' }}>
                📦 Custom Bulk Quote
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ background: '#0B2339', color: '#cbd5e1', padding: '60px 0 32px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '1rem', fontWeight: 800, fontSize: '1rem' }}>NEAT BRAND TRADE</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6' }}>Your trusted partner in industrial chemical distribution and hygiene solutions across all 16 regions of Ghana.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Industries</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {INDUSTRIES.map(ind => (
                <li key={ind.id}><button onClick={() => { handleCardClick(ind.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{ind.icon} {ind.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>Quick Links</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['/', 'Home'], ['/products', 'Products'], ['/bulk-orders', 'Bulk Orders'], ['/about', 'About'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}><Link href={href} style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        {/* Footer bottom bar */}
        <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: '#64748b' }}>
          <span>
            © 2026 Neat Brand Trade (NBT). All Rights Reserved<Link href="/admin" style={{ color: 'inherit', cursor: 'default', textDecoration: 'none', userSelect: 'none', display: 'inline-block', padding: '12px 10px', margin: '-12px -10px', position: 'relative', zIndex: 10 }}>.</Link>
          </span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <span 
                className="btn" 
                style={{ 
                  padding: '8px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.85rem', 
                  borderRadius: '20px', 
                  color: '#cbd5e1', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--secondary)';
                  e.currentTarget.style.borderColor = 'var(--secondary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                👤 Admin
              </span>
            </Link>
          </div>
        </div>
      </footer>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} onRemove={removeFromCart} onClearCart={clearCart} />
      {toastMessage && <Toast isOpen={!!toastMessage} message={toastMessage} onClose={() => setToastMessage('')} onViewCart={() => { setToastMessage(''); setIsCartOpen(true); }} />}
      <FloatingContact />

      <style>{`
        .industries-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }
        @media (max-width: 1100px) {
          .industries-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .industries-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .industries-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .industry-card-btn {
            padding: 16px 10px !important;
            border-radius: 12px !important;
            gap: 6px !important;
          }
          .industry-card-btn span:first-of-type {
            font-size: 2.2rem !important;
          }
          .industry-card-btn div div:first-child {
            font-size: 0.95rem !important;
          }
          .industry-card-btn div div:last-child {
            font-size: 0.68rem !important;
          }
          .industry-card-btn span:last-child {
            font-size: 0.62rem !important;
          }
        }
        @media (max-width: 600px) {
          .industries-cta-row {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .industries-cta-row a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
