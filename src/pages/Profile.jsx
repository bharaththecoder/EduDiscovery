import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ChevronDown, ChevronUp, Bell, Shield, HelpCircle, Edit3, LogOut } from 'lucide-react';
import UniversityCard from '../components/UniversityCard';
import BottomNav from '../components/BottomNav';

const FAQS = [
  { q: 'How does the match score work?', a: 'Our algorithm analyses your rank, preferred branch, city, and budget against each university\'s admission criteria and program offerings to calculate a personalised match percentage.' },
  { q: 'Can I apply to multiple universities?', a: 'Yes! You can apply to as many universities as you like from the EduDiscovery app. We recommend shortlisting 3-5 colleges and applying to all simultaneously.' },
  { q: 'How do I check scholarship eligibility?', a: 'Complete your profile with income, caste, and rank details. The app will automatically match you to applicable scholarships in the Scholarship Hub section.' },
  { q: 'Is the college data on this app accurate?', a: 'Yes, all university data is verified from official NAAC records, university websites, and SCHE-AP announcements. Fee structures are approximate and subject to change.' },
  { q: 'How do I contact a counselor?', a: 'Click "Contact Counselors" on any university detail page. Our trained counselors will call you within 24 hours to guide you through the admission process.' },
];

function EditModal({ currentUser, onClose }) {
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    bio: localStorage.getItem('edu_bio') || '',
    branch: localStorage.getItem('edu_branch') || '',
    city: localStorage.getItem('edu_city') || '',
  });
  const { showToast } = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('edu_bio', form.bio);
    localStorage.setItem('edu_branch', form.branch);
    localStorage.setItem('edu_city', form.city);
    showToast('Profile saved! ✅', 'success');
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Edit Profile</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { placeholder: 'Your Name', key: 'name', type: 'text' },
            { placeholder: 'Bio (e.g. Aspiring Engineer from AP)', key: 'bio', type: 'text' },
            { placeholder: 'Preferred Branch (e.g. CSE)', key: 'branch', type: 'text' },
            { placeholder: 'Home City (e.g. Guntur)', key: 'city', type: 'text' },
          ].map(({ placeholder, key, type }) => (
            <div key={key} className="input-wrap">
              <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full" style={{ padding: '15px', marginTop: '8px' }}>Save Profile</button>
        </form>
      </div>
    </div>
  );
}

function NotificationsModal({ onClose }) {
  const notifications = [
    { icon: '🔔', text: 'APCET 2024 counselling starts April 15', time: '2 hours ago', color: 'var(--accent)' },
    { icon: '🎓', text: 'New scholarship: SRM AP merit award deadline approaching', time: 'Yesterday', color: 'var(--primary)' },
  ];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Notifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: `1px solid ${n.color}22` }}>
              <div style={{ fontSize: '24px' }}>{n.icon}</div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{n.text}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacyModal({ onClose }) {
  const [toggles, setToggles] = useState({ activity: true, emails: false, personalized: true, share: false });
  const toggle = (key) => setToggles(p => ({ ...p, [key]: !p[key] }));
  const labels = { activity: 'Share Activity Data', emails: 'Marketing Emails', personalized: 'Personalised Recommendations', share: 'Share with Partner Colleges' };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Privacy & Security</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {Object.entries(labels).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                  {toggles[key] ? 'Currently enabled' : 'Currently disabled'}
                </p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={toggles[key]} onChange={() => toggle(key)} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HelpModal({ onClose }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Help Center & FAQs</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="faq-item">
            <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              {openFaq === i ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} />}
            </div>
            {openFaq === i && <p className="faq-answer">{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();

  const [modal, setModal] = useState(null); // 'edit' | 'notifications' | 'privacy' | 'help'

  const name = currentUser?.name || 'Scholar';
  const bio = localStorage.getItem('edu_bio') || 'Aspiring Engineer • AP Student';
  const branch = localStorage.getItem('edu_branch') || 'Engineering';
  const appliedCount = parseInt(localStorage.getItem('edu_applied') || '0', 10);
  const matchScore = 87;

  const handleSignOut = async () => {
    await logout();
    localStorage.removeItem('edu_bio');
    localStorage.removeItem('edu_branch');
    localStorage.removeItem('edu_city');
    showToast('Signed out successfully. See you soon!', 'info');
    navigate('/');
  };

  const quickActions = [
    { icon: <Edit3 size={20} />, label: 'Edit Profile', color: 'var(--primary)', bg: 'var(--primary-light)', modal: 'edit' },
    { icon: <Bell size={20} />, label: 'Notifications', color: '#f59e0b', bg: '#fef3c7', modal: 'notifications' },
    { icon: <Shield size={20} />, label: 'Privacy', color: '#10b981', bg: '#d1fae5', modal: 'privacy' },
    { icon: <HelpCircle size={20} />, label: 'Help Center', color: '#8b5cf6', bg: '#ede9fe', modal: 'help' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Profile Header */}
      <div style={{ background: 'var(--gradient)', padding: '48px 24px 32px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: '#fff', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: '900', color: 'var(--primary)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {name[0]?.toUpperCase()}
        </div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', marginBottom: '4px' }}>{name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '16px' }}>{bio}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.3)' }}>
            ⚡ EARLY ACTION
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.3)' }}>
            🔬 STEM SCHOLAR
          </span>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '24px' }}>
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Colleges Applied', value: appliedCount, icon: '🏛️' },
            { label: 'Wishlist', value: wishlist.length, icon: '❤️' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Match Score */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px' }}>Profile Match Score</span>
            <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>{matchScore}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${matchScore}%` }} />
          </div>
        </div>

        {/* Wishlist */}
        {wishlist.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>❤️ My Wishlist</h2>
            <div className="scroll-row">
              {wishlist.map(uni => (
                <UniversityCard key={uni.id} university={uni} compact />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>Quick Actions</h2>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setModal(action.modal)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '18px 20px', borderBottom: i < quickActions.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'left', background: 'none', cursor: 'pointer',
                transition: 'background 0.15s', fontFamily: 'inherit',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ background: action.bg, color: action.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </div>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{action.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '16px', background: '#fef2f2', color: 'var(--accent)',
            borderRadius: 'var(--radius-md)', border: '1.5px solid #fecaca',
            fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', cursor: 'pointer',
          }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <BottomNav />

      {modal === 'edit' && <EditModal currentUser={currentUser} onClose={() => setModal(null)} />}
      {modal === 'notifications' && <NotificationsModal onClose={() => setModal(null)} />}
      {modal === 'privacy' && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
    </div>
  );
}
