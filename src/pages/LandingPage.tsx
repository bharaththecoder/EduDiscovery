import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Mail, Eye, EyeOff, Sparkles, GraduationCap, Target, Zap, BookOpen, ArrowRight, Star } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { OrbitRing, FloatingEmoji3D, HolographicBadge, AnimatedCounter3D, GlowButton, NeonCard, WaveDivider, InteractiveFluidParticles, MagneticButton, ConfettiButton, SpotlightCard, BounceIn, VelocityText } from '@/components/Animation3DComponents';

// ─── Animated Floating Particle ─────────────────────────────────
function Particle({ delay, x, size, color }: { delay: number; x: string; size: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute', bottom: '-20px', left: x,
        width: size, height: size, borderRadius: '50%',
        background: color, pointerEvents: 'none',
      }}
      animate={{ y: [0, -window.innerHeight - 40], opacity: [0, 0.8, 0.6, 0] }}
      transition={{ duration: 8 + Math.random() * 6, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

// ─── 3D Tilt Card ───────────────────────────────────────────────
function TiltCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card (3D Neon Enhanced) ────────────────────────────
function FeatureCard({ icon, title, desc, gradient, delay }: {
  icon: string; title: string; desc: string; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10, scale: 1.03, rotateX: 4, rotateY: -2 }}
      style={{
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '28px 24px',
        display: 'flex', flexDirection: 'column', gap: '14px',
        cursor: 'default',
        transformStyle: 'preserve-3d',
        perspective: '800px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="neon-border"
    >
      {/* Subtle gradient glow behind icon */}
      <div style={{
        position: 'absolute', top: '-30px', left: '-30px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: gradient.replace('135deg', 'circle'),
        opacity: 0.12, filter: 'blur(30px)', pointerEvents: 'none',
      }} />
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          boxShadow: `0 8px 24px ${gradient.includes('185') ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`,
          position: 'relative', zIndex: 2,
        }}
      >
        {icon}
      </motion.div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>{title}</h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Stats Counter (3D Flip Enhanced) ────────────────────────────
function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  return <AnimatedCounter3D value={value} suffix={suffix} label={label} />;
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  delay: i * 0.7,
  x: `${Math.random() * 100}%`,
  size: 4 + Math.random() * 8,
  color: i % 3 === 0
    ? 'rgba(16,185,129,0.5)'
    : i % 3 === 1
      ? 'rgba(0,212,255,0.3)'
      : 'rgba(245,158,11,0.35)',
}));

const FEATURES = [
  {
    icon: '🎯',
    title: 'AI Admission Predictor',
    desc: 'Enter your rank and get real-time admission probability across 100+ AP colleges with 94% accuracy.',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    icon: '🤖',
    title: 'AI College Counselor',
    desc: 'Chat with our AI bot 24/7. Ask anything — fees, cutoffs, scholarships, hostel — it knows it all.',
    gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  },
  {
    icon: '⚡',
    title: 'Smart Compare Engine',
    desc: 'Compare up to 3 colleges side-by-side on fees, placements, NAAC grade, branches, and cutoff trends.',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  },
  {
    icon: '📊',
    title: 'Cutoff Trend Analytics',
    desc: 'See 3-year EAPCET/ICET cutoff trends, counselling round data, and seat availability in real-time.',
    gradient: 'linear-gradient(135deg, #06B6D4, #10B981)',
  },
];

const MARQUEE_TAGS = [
  '🎓 100+ AP Colleges', '⚡ EAPCET Cutoffs', '🤖 AI Counselor', '📊 Compare Colleges',
  '🎯 Rank Predictor', '💰 Scholarships Hub', '🏆 NAAC Rankings', '🌟 Free Forever',
  '🎓 100+ AP Colleges', '⚡ EAPCET Cutoffs', '🤖 AI Counselor', '📊 Compare Colleges',
  '🎯 Rank Predictor', '💰 Scholarships Hub', '🏆 NAAC Rankings', '🌟 Free Forever',
];

export default function Landing() {
  const navigate = useNavigate();
  const { loginWithGoogle, login, signup } = useAuth();                       
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typedText, setTypedText] = useState('');
  const fullText = 'College Discovery';
  const typeRef = useRef(0);

  // Typewriter effect for hero heading
  useEffect(() => {
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        typeRef.current += 1;
        setTypedText(fullText.slice(0, typeRef.current));
        if (typeRef.current >= fullText.length) clearInterval(timer);
      }, 70);
      return () => clearInterval(timer);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  const handleGoogle = async () => {
    try { setLoading(true); await loginWithGoogle(); navigate('/home'); }
    catch { setError('Google sign-in failed. Try email login.'); }
    finally { setLoading(false); }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isSignup) await signup(form.email, form.password, form.name);
      else await login(form.email, form.password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '')?.replace(/\(auth\/.*\)\.?/, '') || 'Auth failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 24px 60px',
      }} className="hero-animated-bg">

        {/* Floating particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
        </div>
        <InteractiveFluidParticles count={30} color="rgba(16,185,129,0.18)" />

        {/* Morphing blob decorations */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
          animation: 'orb-float-1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
          animation: 'orb-float-2 18s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left: Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Badge */}
              <HolographicBadge style={{ alignSelf: 'flex-start' }}>
                <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)' }}>NEXT GEN COLLEGE COUNSELING</span>
              </HolographicBadge>

              {/* Heading with typewriter */}
              <BounceIn delay={0.15}>
                <h1
                  style={{
                    fontSize: 'clamp(36px, 5vw, 58px)',
                    fontWeight: '900',
                    color: 'var(--text-main)',
                    lineHeight: 1.08,
                    letterSpacing: '-2px',
                    margin: 0,
                  }}
                >
                  The Future of <br />
                  <span style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }} className="typewriter-cursor">
                    {typedText}
                  </span>
                  <br />
                  <span style={{ WebkitTextFillColor: 'var(--text-main)' }}>Starts Here.</span>
                </h1>
              </BounceIn>

              <BounceIn delay={0.3}>
                <p
                  style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '480px', margin: 0 }}
                >
                  Navigate your academic journey with AI-powered matching for top-tier universities in Andhra Pradesh. Filter by rank, branches, fees, and location.
                </p>
              </BounceIn>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px' }}
              >
                <MagneticButton
                  onClick={handleGoogle}
                  disabled={loading}
                  className="btn btn-primary shine-on-hover animate-glow-breathe"
                  style={{ padding: '16px 24px', fontWeight: '800', fontSize: '15px', gap: '12px', borderRadius: 'var(--radius-full)', boxShadow: '0 12px 30px rgba(5,150,105,0.3)' }}
                >
                  <Globe size={18} /> Continue with Google <ArrowRight size={16} />
                </MagneticButton>
                <MagneticButton
                  onClick={() => { setShowEmailModal(true); setIsSignup(false); }}
                  className="btn btn-ghost"
                  style={{ padding: '16px 24px', fontWeight: '800', fontSize: '15px', gap: '12px', borderRadius: 'var(--radius-full)' }}
                >
                  <Mail size={18} /> Continue with Email
                </MagneticButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{ display: 'flex', alignItems: 'center', gap: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '4px' }}
              >
                <StatCounter value={100} label="AP Colleges" suffix="+" />
                <div style={{ width: '1px', height: '36px', background: 'var(--border)' }} />
                <StatCounter value={94} label="Match Accuracy" suffix="%" />
                <div style={{ width: '1px', height: '36px', background: 'var(--border)' }} />
                <StatCounter value={50} label="Active Students" suffix="K+" />
              </motion.div>
            </div>

            {/* Right: 3D Showcase (Production Level) */}
            <div className="hidden md:flex" style={{ position: 'relative', justifyContent: 'center', alignItems: 'center', minHeight: '420px' }}>

              {/* Orbit ring decoration */}
              <div style={{ position: 'absolute', zIndex: 1 }}>
                <OrbitRing size={380} color="rgba(16,185,129,0.2)" duration={15} thickness={1}>
                  <OrbitRing size={300} color="rgba(0,212,255,0.15)" duration={10} thickness={1} reverse />
                </OrbitRing>
              </div>

              {/* Central morphing glow */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%'] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', width: '320px', height: '320px',
                  background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Main 3D card */}
              <div style={{ width: '320px', position: 'relative', zIndex: 5 }}>
                <NeonCard color="rgba(16,185,129,0.3)" style={{ borderRadius: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '999px',
                    }}>98% MATCH RATING</span>
                    <FloatingEmoji3D emoji="🌟" size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '6px' }}>VIT-AP University</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Amravati, Andhra Pradesh</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {[['Estimated Tuition', '₹1.95 Lakhs/Yr'], ['Cutoff (CSE)', '4,800 Rank'], ['NAAC Grade', 'A++']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                        <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: '1px', background: 'var(--border)', marginBottom: '14px' }} />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['CSE Core', 'Autonomous', 'A++ NAAC'].map(t => (
                      <span key={t} className="tag" style={{ fontSize: '10px' }}>{t}</span>
                    ))}
                  </div>
                </NeonCard>
              </div>

              {/* Floating chip 1 — AI counselor (holographic) */}
              <motion.div
                animate={{ y: [0, -14, 0], rotateY: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="glass-morph-3d"
                style={{
                  position: 'absolute', top: '6%', left: '-16px',
                  borderRadius: '16px', padding: '12px 16px',
                  zIndex: 6, width: '200px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FloatingEmoji3D emoji="💬" size={20} style={{ filter: 'none' }} />
                  <div>
                    <div style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>AI COUNSELOR</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>"You qualify for a fee waiver!"</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating chip 2 — odds */}
              <motion.div
                animate={{ y: [0, 14, 0], rotateX: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 1 }}
                className="glass-morph-3d"
                style={{
                  position: 'absolute', bottom: '6%', right: '-24px',
                  borderRadius: '16px', padding: '14px 18px',
                  zIndex: 6,
                }}
              >
                <div style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission Odds</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>High 🎉</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Rank 8,500 → Safe Zone</div>
              </motion.div>

              {/* Floating chip 3 — quiz (neon) */}
              <motion.div
                animate={{ y: [-6, 8, -6], x: [0, 4, 0], rotateZ: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.5 }}
                style={{
                  position: 'absolute', top: '40%', right: '-32px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  borderRadius: '12px', padding: '10px 14px',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.35), 0 0 20px rgba(16,185,129,0.2)', zIndex: 6,
                  color: '#fff',
                }}
              >
                <div style={{ fontSize: '9.5px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.85 }}>Quiz Result</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#fff" color="#fff" />)}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAVE DIVIDER ──────────────────────────────────────────── */}
      <WaveDivider />

      {/* ── MARQUEE TICKER ────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', background: 'var(--surface)', overflow: 'hidden' }}>
        <div className="marquee-track">
          <div className="marquee-content">
            {MARQUEE_TAGS.map((tag, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)',
                padding: '0 20px', borderRight: '1px solid var(--border)',
                whiteSpace: 'nowrap',
              }}>
                {tag}
              </span>
            ))}
          </div>
          <div className="marquee-content" aria-hidden>
            {MARQUEE_TAGS.map((tag, i) => (
              <span key={`b-${i}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)',
                padding: '0 20px', borderRight: '1px solid var(--border)',
                whiteSpace: 'nowrap',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE CARDS ─────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>What We Offer</span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '900', color: 'var(--text-main)', margin: '10px 0 0', letterSpacing: '-1px' }}>
            Built for Students,<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Powered by AI
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.1} />
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          style={{
            marginTop: '40px',
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '28px 24px',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="gradient-border"
        >
          {/* Quote decoration */}
          <div style={{
            position: 'absolute', top: '-10px', left: '20px',
            fontSize: '80px', color: 'var(--primary)', opacity: 0.08,
            fontFamily: 'Georgia, serif', lineHeight: 1,
            pointerEvents: 'none', userSelect: 'none',
          }}>❝</div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
          </div>
          <p style={{ fontSize: '15px', lineHeight: 1.75, color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '20px' }}>
            "EduDiscovery helped me discover VIT-AP when I thought I could only afford a local college. Got a merit scholarship worth ₹2.5 Lakhs thanks to the app's counselling guide!"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'var(--gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '900', fontSize: '16px',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}>S</div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>Sarah J.</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>VIT-AP University, Batch '26</div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ textAlign: 'center', marginTop: '48px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConfettiButton
              onClick={() => { setShowEmailModal(true); setIsSignup(true); }}
              className="btn btn-primary shine-on-hover animate-glow-breathe"
              style={{ padding: '18px 36px', fontSize: '16px', fontWeight: '800', gap: '10px', borderRadius: '999px', boxShadow: '0 16px 40px rgba(5,150,105,0.3)', width: '100%', minWidth: '300px' }}
            >
              <GraduationCap size={20} />
              Get Started for Free
              <ArrowRight size={18} />
            </ConfettiButton>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500' }}>
            No credit card required · 100% Free · Instant Access
          </p>
        </motion.div>
      </section>

      {/* ── EMAIL MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="modal-sheet"
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative' }}
            >
              <button onClick={() => setShowEmailModal(false)} style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'var(--primary-light)', color: 'var(--primary)',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                border: 'none', cursor: 'pointer',
              }}>×</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px var(--primary-glow)',
                }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                {isSignup ? 'Start your university discovery journey' : 'Sign in to continue your journey'}
              </p>

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isSignup && (
                  <div className="input-wrap">
                    <input type="text" placeholder="Full Name" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                )}
                <div className="input-wrap">
                  <input type="email" placeholder="Email Address" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="input-wrap">
                  <input type={showPass ? 'text' : 'password'} placeholder="Password"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required style={{ flex: 1 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ padding: '0 16px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '600' }}>{error}</p>}
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn btn-primary btn-full shine-on-hover"
                  style={{ marginTop: '8px', padding: '16px', fontWeight: '800', fontSize: '15px' }}
                >
                  {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                </motion.button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button onClick={() => setIsSignup(!isSignup)} style={{ color: 'var(--primary)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
