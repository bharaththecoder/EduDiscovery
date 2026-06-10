import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '')?.replace(/\(auth\/.*\)\.?/, '') || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* Hero */}
      <div className="hero-section" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--bg) 0%, rgba(5, 150, 105, 0.05) 50%, rgba(16, 185, 129, 0.1) 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 24px 60px',
      }}>
        {/* Subtle mesh glowing elements in the background */}
        <div style={{
          position: 'absolute', top: '-10%', left: '10%',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 2,
        }}>
          
          {/* Left Column: Copy & Actions */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              alignSelf: 'flex-start',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--primary-light)', padding: '8px 16px',
              borderRadius: '999px', fontSize: '13px', fontWeight: '700',
              color: 'var(--primary)',
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <Sparkles size={14} className="text-primary animate-pulse" />
              <span>NEXT GEN COLLEGE COUNSELING</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(38px, 5vw, 56px)',
              fontWeight: '900',
              color: 'var(--text-main)',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
            }}>
              The Future of <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>College Discovery</span> <br />
              Starts Here.
            </h1>

            <p style={{
              fontSize: '16px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '480px',
            }}>
              Navigate your academic journey with AI-powered matching for top-tier universities in Andhra Pradesh. Filter by rank, branches, fees, and location.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '380px', marginTop: '8px' }}>
              <button onClick={handleGoogle} disabled={loading} className="btn btn-primary" style={{
                padding: '16px 24px', fontWeight: '800',
                fontSize: '15px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '12px', cursor: 'pointer',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 10px 25px rgba(5, 150, 105, 0.25)',
              }}>
                <Globe size={18} />
                Continue with Google
              </button>
              <button onClick={() => { setShowEmailModal(true); setIsSignup(false); }} className="btn btn-ghost" style={{
                padding: '16px 24px', fontWeight: '800',
                fontSize: '15px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '12px', cursor: 'pointer',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-glass)',
                border: '1.5px solid var(--border)',
              }}>
                <Mail size={18} />
                Continue with Email
              </button>
            </div>
            
            {/* Quick stats / social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>100+</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>AP Colleges</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', height: '32px' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>94%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Match Accuracy</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', height: '32px' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>50K+</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Active Students</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '380px' }} className="hidden md:flex">
            
            {/* Central glowing background circle */}
            <div style={{
              position: 'absolute',
              width: '300px', height: '300px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              opacity: 0.15,
              filter: 'blur(30px)',
            }} />

            {/* Main Interactive Mockup Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              style={{
                width: '320px',
                background: 'var(--surface)',
                borderRadius: '24px',
                border: '1.5px solid var(--border)',
                padding: '24px',
                boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 5,
              }}
              whileHover={{ rotateY: 8, rotateX: 8, scale: 1.02 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  letterSpacing: '0.5px'
                }}>98% MATCH RATING</span>
                <span style={{ fontSize: '20px' }}>🌟</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>VIT-AP University</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Amravati, Andhra Pradesh</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Tuition:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹1.95 Lakhs/Yr</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cutoff (CSE):</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>4,800 Rank</span>
                </div>
              </div>
              
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '16px' }} />
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="tag" style={{ fontSize: '10px' }}>CSE Core</span>
                <span className="tag" style={{ fontSize: '10px' }}>Autonomous</span>
                <span className="tag" style={{ fontSize: '10px' }}>A++ NAAC</span>
              </div>
            </motion.div>

            {/* Smaller Floating Card 1: AI Prompt */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '10%',
                left: '-10px',
                width: '200px',
                background: 'var(--surface-glass)',
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 6,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💬</span>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)' }}>AI COUNSELOR</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>"You qualify for fee waiver!"</div>
                </div>
              </div>
            </motion.div>

            {/* Smaller Floating Card 2: Admission Odds */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                bottom: '10%',
                right: '-20px',
                width: '180px',
                background: 'var(--surface-glass)',
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 6,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission Odds</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#059669' }}>High</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Rank 8,500)</span>
              </div>
            </motion.div>
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
          <div className="card glow-up" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px' }}>📈</div>
            <div>
              <h3 style={{ fontWeight: '800', marginBottom: '6px' }}>Predictive Success Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Our AI analyses your rank, preferences, and budget to predict admission probability across 100+ colleges with 94% accuracy.
              </p>
            </div>
          </div>
          <div className="card glow-up" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px' }}>🌐</div>
            <div>
              <h3 style={{ fontWeight: '800', marginBottom: '6px' }}>Global Network</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Connect with 50,000+ alumni, current students, and faculty across Andhra Pradesh's top universities.
              </p>
            </div>
          </div>
          <div className="glow-up" style={{
            background: 'var(--dark-card)', borderRadius: 'var(--radius-md)',
            padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start',
            border: '1px solid rgba(255,255,255,0.1)'
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
        <div className="glow-up" style={{ marginTop: '32px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
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
