'use client';

import { useState, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';

const ROLES = [
  { id: 'admin',      label: 'Admin',      icon: '📊', color: '#6366f1', desc: 'Performance & Ledger' },
  { id: 'supervisor', label: 'Supervisor',  icon: '🎯', color: '#0ea5e9', desc: 'Operations & Flags' },
  { id: 'shopper',    label: 'Shopper',     icon: '🛒', color: '#10b981', desc: 'Picking Checklist' },
  { id: 'rider',      label: 'Rider',       icon: '🏍️', color: '#f59e0b', desc: 'Delivery Console' },
];

export default function LoginApp() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const queryRole = searchParams.get('role');
  const nextPath  = searchParams.get('next');
  const errParam  = searchParams.get('err');

  const defaultRole = ROLES.find(r => r.id === queryRole) ? queryRole : null;
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(
    errParam === 'misconfigured' ? 'Server misconfigured — contact the administrator.' : null
  );

  const activeRole = ROLES.find(r => r.id === selectedRole);

  // Clear error on input change handled inline

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please choose your role first.'); return; }
    if (!password)     { setError('Please enter your password.');    return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role: selectedRole, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // Redirect to the page they were trying to reach, or the role's home
        router.push(nextPath || `/${selectedRole}`);
      } else {
        setError(data.error || 'Login failed. Check your password.');
        setPassword('');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedRole, password, nextPath, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F16 0%, #0f172a 40%, #1a1033 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(255,107,0,0.08)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-80px', left: '-80px', width: '250px', height: '250px', background: 'rgba(99,102,241,0.07)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '36px 28px 32px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src="/logo.png" 
            alt="Shopimami Logo" 
            style={{ 
              height: '56px', 
              width: 'auto', 
              margin: '0 auto 12px', 
              display: 'block',
              filter: 'drop-shadow(0 6px 16px rgba(255,107,0,0.4))'
            }} 
          />
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
            SHOPIMAMI<span style={{ color: '#FFD100' }}>.</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            Staff Portal — Authorised Access Only
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role selector */}
          <div style={{ marginBottom: '22px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
              Select Your Role
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {ROLES.map(role => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setSelectedRole(role.id); setError(null); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '3px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? `1.5px solid ${role.color}` : '1.5px solid rgba(255,255,255,0.08)',
                      background: isSelected ? `${role.color}18` : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{role.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? 'white' : 'rgba(255,255,255,0.55)' }}>
                      {role.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: isSelected ? role.color : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                      {role.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password input */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              Password
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: error ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0 14px',
              transition: 'all 0.2s',
            }}>
              <Lock size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={selectedRole ? `Enter ${activeRole?.label} password` : 'Select a role first'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                disabled={!selectedRole}
                autoComplete="current-password"
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: '13px 10px',
                  fontSize: '0.9rem',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif",
                  opacity: selectedRole ? 1 : 0.4,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              fontWeight: 600,
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !selectedRole}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: selectedRole
                ? `linear-gradient(135deg, ${activeRole?.color}, ${activeRole?.color}cc)`
                : 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: selectedRole && !loading ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.25s',
              boxShadow: selectedRole ? `0 6px 20px ${activeRole?.color}44` : 'none',
              letterSpacing: '0.2px',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={16} />
                {selectedRole ? `Sign in as ${activeRole?.label}` : 'Select a Role'}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px' }}>
          <ShieldCheck size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontWeight: 500 }}>
            Sessions expire after 8 hours · Secured with HMAC-SHA256
          </p>
        </div>

        {/* Customer link */}
        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          Looking to shop?{' '}
          <a href="/customer" style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'none' }}>
            Customer App →
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
