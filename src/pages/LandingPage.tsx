import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Globe,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Target,
  Zap,
  BookOpen,
  ArrowRight,
  Star,
  Search,
  ShieldCheck,
  ArrowLeftRight,
  BarChart3,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

// Authentic Verified Metrics from EduDiscovery's curated database
const METRICS = [
  { value: '7,267', label: 'Verified Cutoffs', subtext: 'APSCHE Allotments (2024-2022)' },
  { value: '60+', label: 'Top Universities', subtext: 'NAAC A++ to B Accredited' },
  { value: '100%', label: 'Statutory Fee Transparency', subtext: 'APHERMC G.O.Ms.17 & 48' },
  { value: '3-Tier', label: 'Web Options Engine', subtext: 'Dream • Target • Safe Ranks' },
];

const CORE_CAPABILITIES = [
  {
    icon: Target,
    tag: 'DECISION INTELLIGENCE',
    title: 'AP EAPCET Web-Options Priority Assistant',
    description: 'Algorithmic probability clustering segregates college branch options into Dream (ambitious reach), Target (competitive match), and Safe (statistical certainty) tiers based on your exact category rank.',
    highlight: 'Category & Region specific',
    color: '#10B981',
  },
  {
    icon: ShieldCheck,
    tag: 'GOVERNMENT PROVENANCE',
    title: '3-Year Official APSCHE Last Rank Gazettes',
    description: 'Zero guesswork or crowd-sourced estimates. Directly inspect audited closing ranks across General, BC-A/B/C/D/E, SC, ST, EWS, and gender quotas across multiple counseling rounds.',
    highlight: '7,267 authentic records',
    color: '#059669',
  },
  {
    icon: ArrowLeftRight,
    tag: 'SIDE-BY-SIDE EVALUATION',
    title: 'Multi-College Comparative Matrix',
    description: 'Evaluate up to three engineering institutions at once across statutory tuition fees, NAAC cycles, campus infrastructure, hostel standards, and verified median placement packages.',
    highlight: 'Unified comparison matrix',
    color: '#00D4FF',
  },
  {
    icon: BarChart3,
    tag: 'REGULATORY COMPLIANCE',
    title: 'Statutory APHERMC Fee Schedule',
    description: 'Strict adherence to Andhra Pradesh Higher Education Regulatory and Monitoring Commission gazette notifications (G.O.Ms.No.17 & G.O.Ms.No.48) with full convenor vs management fee breakdowns.',
    highlight: 'Official G.O. verified',
    color: '#F59E0B',
  },
];

const COUNSELING_STEPS = [
  {
    step: '01',
    title: 'Enter Your EAPCET Rank & Category',
    desc: 'Select your reservation category (OC, BC, SC, ST, EWS), region (AU, SVU), and gender quota.',
  },
  {
    step: '02',
    title: 'Explore Probability Spectrum',
    desc: 'Our engine parses historical allotment shifts to categorize seats into Dream, Target, and Safe.',
  },
  {
    step: '03',
    title: 'Export Official Web Options Order',
    desc: 'Generate an ordered list with official 4-letter counseling college codes ready for the APSCHE portal.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle, login, signup } = useAuth();
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // If user is already authenticated, redirect to /home
  useEffect(() => {
    if (currentUser) {
      navigate('/home', { replace: true });
    }
  }, [currentUser, navigate]);

  // Handle escape key modal dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmailModal) {
        setShowEmailModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmailModal]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/home');
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in was interrupted. Please try again or use email sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      navigate('/home');
    } catch (err: any) {
      setAuthError(err.message?.replace('Firebase: ', '')?.replace(/\(auth\/.*\)\.?/, '') || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] selection:bg-emerald-500/20 selection:text-emerald-500 overflow-x-clip">
      
      {/* ── TOP NAV BAR ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[var(--text-main)]">
                Edu<span className="text-emerald-500">Discovery</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AP EAPCET 2025
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors px-3 py-1.5"
            >
              Browse Colleges
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsSignup(false); setShowEmailModal(true); }}
              className="rounded-full text-xs font-bold"
            >
              Sign In
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="hidden sm:flex rounded-full text-xs font-bold gap-1.5 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" /> Continue with Google
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Mission & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE DEFINITIVE AP ENGINEERING COUNSELING PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-main)] leading-[1.12]">
              Discover, Predict & Secure Your <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Engineering Seat</span> in Andhra Pradesh.
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Eliminate guesswork with 7,267 verified APSCHE closing ranks, statutory APHERMC fee schedules, and algorithmic Web-Options priority sequencing tailored to your category rank.
            </p>

            {/* Error banner if login was interrupted */}
            {authError && (
              <div className="w-full max-w-xl p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{authError}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Tip: If using Brave or strict private browsing, tap the shield icon to enable state storage, or sign in below with your email.
                  </p>
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="rounded-full font-bold text-sm sm:text-base py-3.5 px-6 shadow-lg shadow-emerald-500/25 justify-center"
              >
                <Globe className="w-4 h-4 mr-2" />
                {loading ? 'Connecting...' : 'Continue with Google'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => { setIsSignup(true); setShowEmailModal(true); }}
                className="rounded-full font-bold text-sm sm:text-base py-3.5 px-6 border border-[var(--border)] justify-center"
              >
                <Mail className="w-4 h-4 mr-2" /> Create Free Account
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/search')}
                className="rounded-full font-bold text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] justify-center"
              >
                <Search className="w-4 h-4 mr-1.5" /> Guest Mode
              </Button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% Free for Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Official APSCHE Provenance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Offline Native PWA & APK</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Live Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md w-full">
              
              {/* Glass container with preview of Web-Options Priority */}
              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                      Counseling Simulation
                    </span>
                  </div>
                  <Badge variant="emerald" className="text-[11px] font-bold">
                    Rank #12,450 • AU / OC Boys
                  </Badge>
                </div>

                <div className="space-y-3.5 mt-5">
                  {/* Option 1: Dream */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                          Dream Tier
                        </span>
                        <span className="text-xs font-bold font-mono text-[var(--text-muted)]">AUCE (Andhra Univ)</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--text-main)] mt-1">Computer Science & Engineering</p>
                      <p className="text-[11px] text-[var(--text-muted)]">2024 Cutoff: 4,890 • Ambitious Reach</p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">#01</span>
                  </div>

                  {/* Option 2: Target */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          Target Tier
                        </span>
                        <span className="text-xs font-bold font-mono text-[var(--text-muted)]">GMRIT (Rajam)</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--text-main)] mt-1">CSE (Artificial Intelligence & ML)</p>
                      <p className="text-[11px] text-[var(--text-muted)]">2024 Cutoff: 13,200 • High Probability Match</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">#02</span>
                  </div>

                  {/* Option 3: Safe */}
                  <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-400">
                          Safe Tier
                        </span>
                        <span className="text-xs font-bold font-mono text-[var(--text-muted)]">MVGR (Vizianagaram)</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--text-main)] mt-1">Information Technology (IT)</p>
                      <p className="text-[11px] text-[var(--text-muted)]">2024 Cutoff: 18,500 • Guaranteed Safety</p>
                    </div>
                    <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">#03</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Gazetted Fee: ₹77,000 / yr</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> G.O.Ms.17 Certified
                  </span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Accreditation</div>
                  <div className="text-xs font-bold text-[var(--text-main)]">NAAC A++ Verified Database</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── LIVE DATA METRICS BANNER ──────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {METRICS.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {item.value}
              </span>
              <span className="text-sm font-extrabold text-[var(--text-main)] mt-1">
                {item.label}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">
                {item.subtext}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CORE CAPABILITIES ─────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="emerald" className="font-extrabold tracking-wider uppercase text-xs">
            Purpose-Built for AP Students
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-main)]">
            Everything You Need to Navigate Engineering Admissions Confidently
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            We transformed dense government PDF records into an interactive, lightning-fast counseling intelligence portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CORE_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/40 transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                      {cap.tag}
                    </span>
                    <Badge variant="slate" className="text-[10px] font-mono">
                      {cap.highlight}
                    </Badge>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-main)] mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <button
                    onClick={() => navigate('/search')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Explore feature <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3-STEP COUNSELING WORKFLOW ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--surface)]/50 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              How It Works
            </span>
            <h2 className="text-3xl font-black text-[var(--text-main)]">
              Three Simple Steps to Your College Choice
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COUNSELING_STEPS.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                <span className="text-3xl font-black text-emerald-500/40 font-mono">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold text-[var(--text-main)]">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CALL TO ACTION ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <GraduationCap className="w-8 h-8" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-main)]">
          Ready to Make an Informed Counseling Decision?
        </h2>

        <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
          Join thousands of Andhra Pradesh engineering aspirants using EduDiscovery to prioritize web options accurately.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="emerald"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="rounded-full font-bold px-8 py-3.5 shadow-lg shadow-emerald-500/25"
          >
            <Globe className="w-4 h-4 mr-2" /> Start with Google
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/search')}
            className="rounded-full font-bold px-8 py-3.5"
          >
            Explore Guest Catalog
          </Button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Governed by official AP EAPCET / APSCHE allotment criteria • Free forever
        </p>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-main)]">EduDiscovery</span>
            <span>•</span>
            <span>Andhra Pradesh Higher Education Discovery</span>
          </div>
          <div>
            Data sourced from official gazettes (APSCHE & APHERMC G.O.Ms.No.17/48).
          </div>
        </div>
      </footer>

      {/* ── EMAIL AUTH MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {showEmailModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 rounded-full hover:bg-[var(--surface-hover)]"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">
                    {isSignup ? 'Create Student Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isSignup ? 'Access personalized counseling recommendations' : 'Sign in to access your saved options'}
                  </p>
                </div>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bharath"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="emerald"
                  size="lg"
                  disabled={loading}
                  className="w-full rounded-xl font-bold text-sm mt-2 shadow-md shadow-emerald-500/20"
                >
                  {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setAuthError(null); }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
