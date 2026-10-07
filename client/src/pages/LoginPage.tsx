import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, MapPin } from 'lucide-react';
import { login, register } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('demo@voyage.ai');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [homeCity, setHomeCity] = useState('Hyderabad');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isRegister
        ? await register(name, email, password, homeCity)
        : await login(email, password);

      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        localStorage.setItem('voyage_token', result.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#FFFDF9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', color: '#5E6282',
          cursor: 'pointer', marginBottom: '32px', fontSize: '14px',
        }}>
          <ArrowLeft size={16} /> Back to home
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #DF6951, #F1A501)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '22px',
            margin: '0 auto 16px',
          }}>V</div>
          <h1 style={{
            fontFamily: "'Volkhov', serif", fontSize: '28px', color: '#181E4B',
          }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: '#5E6282', fontSize: '14px', marginTop: '4px' }}>
            {isRegister ? 'Join VoyageAI for personalized trips' : 'Sign in to your VoyageAI account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            border: '1px solid #ECE5D8', boxShadow: '0 8px 32px rgba(24,30,75,0.04)',
          }}>
            {isRegister && (
              <>
                <label style={labelStyle}>
                  <User size={14} color="#5E6282" /> Full Name
                  <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="Aarav Sharma" />
                </label>
                <label style={labelStyle}>
                  <MapPin size={14} color="#5E6282" /> Home City
                  <input value={homeCity} onChange={e => setHomeCity(e.target.value)} style={inputStyle} placeholder="Hyderabad" />
                </label>
              </>
            )}
            <label style={labelStyle}>
              <Mail size={14} color="#5E6282" /> Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="demo@voyage.ai" />
            </label>
            <label style={labelStyle}>
              <Lock size={14} color="#5E6282" /> Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="Password123!" />
            </label>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: '#fef2f2', color: '#dc2626', fontSize: '13px',
                marginBottom: '12px',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #DF6951, #F1A501)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: '15px', fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <p style={{
              textAlign: 'center', fontSize: '13px', color: '#5E6282',
              marginTop: '16px',
            }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{ color: '#DF6951', fontWeight: 600, cursor: 'pointer' }}
              >
                {isRegister ? 'Sign In' : 'Register'}
              </span>
            </p>

            {!isRegister && (
              <p style={{
                textAlign: 'center', fontSize: '11px', color: '#94a3b8',
                marginTop: '12px',
              }}>
                Demo: demo@voyage.ai / Password123!
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '6px',
  fontSize: '12px', fontWeight: 600, color: '#5E6282',
  marginBottom: '14px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1px solid #ECE5D8', fontSize: '14px', color: '#181E4B',
  fontWeight: 500, outline: 'none', background: '#FAFAF5',
};
