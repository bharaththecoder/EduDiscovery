import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { loginWithGoogle, login, signup } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/home');
    } catch (e) {
      setError('Google sign-in failed. Try email login.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      navigate('/home');
    } catch (e) {
      setError(e.message?.replace('Firebase: ', '')?.replace(/\(auth\/.*\)\.?/, '') || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="hero-section">
        <div className="floating-card" style={{
          position: 'absolute', top: '40px', right: '20px',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
          padding: '12px 16px', width: '220px', zIndex: 2,
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px', fontWeight: '700' }}>98% MATCH</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>SRM University AP • CSE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {['S', 'R', 'M'].map((l, i) => (
              <div key={i} style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: `hsl(${i * 60 + 240}, 70%, 70%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '800', color: '#fff',
                marginLeft: i > 0 ? '-6px' : 0, border: '2px solid white',
              }}>{l}</div>
            ))}
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginLeft: '6px' }}>Joining Now</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '400px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.2)', padding: '6px 16px',
            borderRadius: '999px', fontSize: '12px', fontWeight: '700',
            color: '#fff', marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <Sparkles size={12} /> NEXT GEN SCHOLARS
          </div>

          <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#fff', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
            The Future<br />Starts Here.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px', lineHeight: 1.6 }}>
            Navigate your academic journey with AI-powered matching for universities in Andhra Pradesh.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleGoogle} disabled={loading} style={{
              background: '#fff', color: 'var(--text-main)', border: 'none',
              borderRadius: '999px', padding: '15px 24px', fontWeight: '700',
              fontSize: '15px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '10px', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              <Globe size={18} color="#4285F4" />
              Continue with Google
            </button>
            <button onClick={() => { setShowEmailModal(true); setIsSignup(false); }} style={{
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '999px', padding: '15px 24px', fontWeight: '700',
              fontSize: '15px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '10px', cursor: 'pointer',
            }}>
              <Mail size={18} />
              Continue with Email
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ padding: '40px 20px' }}>
        <p className="label" style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '8px' }}>What We Offer</p>
        <h2 style={{ fontSize: '26px', textAlign: 'center', marginBottom: '24px', fontWeight: '800' }}>
          Redefining Discovery
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px' }}>📈</div>
            <div>
              <h3 style={{ fontWeight: '800', marginBottom: '6px' }}>Predictive Success Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Our AI analyses your rank, preferences, and budget to predict admission probability across 100+ colleges with 94% accuracy.
              </p>
            </div>
          </div>
          <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px' }}>🌐</div>
            <div>
              <h3 style={{ fontWeight: '800', marginBottom: '6px' }}>Global Network</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Connect with 50,000+ alumni, current students, and faculty across Andhra Pradesh's top universities.
              </p>
            </div>
          </div>
          <div style={{
            background: 'var(--dark-card)', borderRadius: 'var(--radius-md)',
            padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: '28px' }}>🎓</div>
            <div>
              <h3 style={{ fontWeight: '800', marginBottom: '6px', color: '#fff' }}>Scholarship Hub</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6 }}>
                Discover 50+ active scholarships tailored to your caste, income, and merit. Save up to ₹5 Lakhs on tuition.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ marginTop: '32px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: '900', marginBottom: '12px' }}>❝</div>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '16px' }}>
            "EduDiscovery helped me discover VIT-AP when I thought I could only afford a local college. Got a merit scholarship worth ₹2.5 Lakhs thanks to the app's counselling guide!"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '800', fontSize: '16px',
            }}>S</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>Sarah J.</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>VIT-AP University '26</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setShowEmailModal(true); setIsSignup(true); }}
          className="btn btn-primary btn-full"
          style={{ marginTop: '32px', fontSize: '16px', padding: '16px' }}
        >
          Get Started for Free →
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setShowEmailModal(false)} style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'var(--primary-light)', color: 'var(--primary)',
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            }}>×</button>

            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              {isSignup ? 'Start your university discovery journey' : 'Sign in to continue your journey'}
            </p>

            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {isSignup && (
                <div className="input-wrap">
                  <input
                    type="text" placeholder="Full Name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="input-wrap">
                <input
                  type="email" placeholder="Email Address"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-wrap">
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ padding: '0 16px', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '600' }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '8px', padding: '16px' }}>
                {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => setIsSignup(!isSignup)} style={{ color: 'var(--primary)', fontWeight: '700' }}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
