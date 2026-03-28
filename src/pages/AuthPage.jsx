import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used in signup
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError('Google Sign-In failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: '30px', margin: '0 auto', width: '100%', maxWidth: '400px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="title-gradient" style={{ fontSize: '24px', letterSpacing: '-1px' }}>EduDiscovery</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            {isLogin ? 'Welcome back, student.' : 'Start your college journey.'}
          </p>
        </div>

        <button 
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '500', marginBottom: '20px' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', fontWeight: '500' }}>OR YOUR EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>FULL NAME</label>
              <input type="text" placeholder="John Doe" value={name} onChange={r => setName(r.target.value)} required />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="name@email.com" value={email} onChange={r => setEmail(r.target.value)} required />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>
              <span>PASSWORD</span>
              {isLogin && <a href="#" style={{ color: 'var(--primary)' }}>Forgot?</a>}
            </label>
            <input type="password" placeholder="••••••••" value={password} onChange={r => setPassword(r.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account yet? " : "Already have an account? "}
          <span 
            onClick={() => {setIsLogin(!isLogin); setError('');}}
            style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
