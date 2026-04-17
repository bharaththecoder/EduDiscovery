import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { ChevronDown, ChevronUp, Bell, Shield, HelpCircle, Edit3, LogOut, Camera } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import UniversityCard from '@/components/cards/UniversityCard';
import { storage } from '@/services/firebase';

const FAQS = [
  { q: 'How does the completion score work?', a: 'Your profile score is calculated based on how much information you have shared. A complete profile (Photo, Bio, Tags, and Base Info) helps us provide better college recommendations.' },
  { q: 'Can I apply to multiple universities?', a: 'Yes! You can apply to as many universities as you like from the EduDiscovery app. We recommend shortlisting 3-5 colleges and applying to all simultaneously.' },
  { q: 'How do I check scholarship eligibility?', a: 'Complete your profile with income, caste, and rank details. The app will automatically match you to applicable scholarships in the Scholarship Hub section.' },
  { q: 'Is the college data on this app accurate?', a: 'Yes, all university data is verified from official NAAC records, university websites, and SCHE-AP announcements.' },
  { q: 'How do I contact a counselor?', a: 'Click "Contact Counselors" on any university detail page or use the "Help Center" for general guidance.' },
];

const AVAILABLE_TAGS = [
  'Early Action', 'Stem Scholar', 'Sports Quota', 'First Gen', 
  'Merit Student', 'Research Focused', 'Entrepreneurial', 'AP EAPCET 2024'
];

function EditModal({ currentUser, onClose }) {
  const { updateUserDoc } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    city: currentUser?.city || '',
  });
  const [selectedTags, setSelectedTags] = useState(currentUser?.tags || []);
  
  const { showToast } = useToast();

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserDoc({
        name: form.name,
        bio: form.bio,
        city: form.city,
        tags: selectedTags
      });
      showToast('Profile updated in cloud! ☁️', 'success');
      onClose();
    } catch (err) {
      showToast('Failed to sync profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', zIndex: 10 }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Edit Profile</h2>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Basic Information</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { placeholder: 'Display Name', key: 'name', type: 'text' },
                { placeholder: 'Bio (e.g. Aspiring Engineer)', key: 'bio', type: 'text' },
                { placeholder: 'Current City', key: 'city', type: 'text' },
              ].map(({ placeholder, key, type }) => (
                <div key={key} className="input-wrap">
                  <input 
                    type={type} 
                    placeholder={placeholder} 
                    value={form[key]} 
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Professional Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid var(--primary)',
                    background: selectedTags.includes(tag) ? 'var(--primary)' : 'transparent',
                    color: selectedTags.includes(tag) ? '#fff' : 'var(--primary)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: '15px', marginTop: '10px' }}>
            {loading ? 'Syncing...' : 'Save to Cloud'}
          </button>
        </form>
      </div>
    </div>
  );
}

function NotificationsModal({ onClose }) {
  const notifications = [
    { icon: '📢', text: 'AP EAPCET 2024: Final phase allotment results are out. Check your status now.', time: 'Just now', color: 'var(--primary)' },
    { icon: '📜', text: 'Jnanabhumi Portal open for 2024-25 Fee Reimbursement applications.', time: '3 hours ago', color: 'var(--accent)' },
    { icon: '🎓', text: 'Vidyadhan Scholarship: Meritorious students (10th/Inter) can apply via Sarojini Damodaran Foundation.', time: 'Yesterday', color: '#8b5cf6' },
  ];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Educational Updates</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: `1px solid ${n.color}44` }}>
              <div style={{ fontSize: '24px' }}>{n.icon}</div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', lineHeight: '1.4' }}>{n.text}</p>
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
  const fileInputRef = useRef(null);
  const { currentUser, logout, updateUserDoc, profileStrength: completionScore } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();

  const [modal, setModal] = useState(null); // 'edit' | 'notifications' | 'privacy' | 'help'
  const [uploading, setUploading] = useState(false);
  
  const profile = {
    name: currentUser?.name || 'Scholar',
    bio: currentUser?.bio || 'Aspiring Engineer • AP Student',
    avatar: currentUser?.photoURL || null,
    tags: currentUser?.tags || ["Early Action", "Stem Scholar"],
    city: currentUser?.city || ''
  };

  const appliedCount = currentUser?.appliedCount || 0;
  

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large (max 2MB)', 'error');
        return;
      }
      setUploading(true);
      try {
        const fileRef = ref(storage, `profile_pictures/${currentUser.id}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        await updateUserDoc({ photoURL: url });
        showToast('Profile picture synced to cloud! ☁️', 'success');
      } catch (err) {
        showToast('Upload failed', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSignOut = async () => {
    await logout();
    showToast('Signed out from cloud. See you soon!', 'info');
    navigate('/');
  };

  const quickActions = [
    { icon: <Edit3 size={20} />, label: 'Edit Profile', color: 'var(--primary)', bg: 'var(--primary-light)', modal: 'edit' },
    { icon: <Bell size={20} />, label: 'Notifications', color: '#f59e0b', bg: '#fef3c7', modal: 'notifications' },
    { icon: <Shield size={20} />, label: 'Privacy', color: '#10b981', bg: '#d1fae5', modal: 'privacy' },
    { icon: <HelpCircle size={20} />, label: 'Help Center', color: '#8b5cf6', bg: '#ede9fe', modal: 'help' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '40px' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Profile Header */}
      <div style={{ background: 'var(--gradient)', padding: '48px 24px 32px', textAlign: 'center', position: 'relative' }}>
        <div 
          onClick={handleAvatarClick}
          style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: '#fff', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: '900', color: 'var(--primary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.3)',
            opacity: uploading ? 0.6 : 1
          }}
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profile.name[0]?.toUpperCase()
          )}
          <div style={{
            position: 'absolute', bottom: 0, width: '100%', height: '30%',
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Camera size={14} color="#fff" />
          </div>
          {uploading && (
            <div className="spinner" style={{ position: 'absolute', width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          )}
        </div>
        
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '6px' }}>{profile.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '20px', maxWidth: '280px', margin: '0 auto 20px' }}>
          {profile.bio}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {profile.tags.map(tag => (
            <span key={tag} style={{ 
              background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '10px', 
              fontWeight: '800', padding: '5px 12px', borderRadius: '999px', 
              border: '1px solid rgba(255,255,255,0.3)', textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="page" style={{ paddingTop: '24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8">
          
          {/* Left Column: Stats and Info */}
          <div>
            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Applications', value: appliedCount, icon: '📜' },
            { label: 'Wishlist', value: wishlist.length, icon: '❤️' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

            {wishlist.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '900' }}>❤️ My Wishlist</h2>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>See All</span>
                </div>
                <div className="scroll-row">
                  {wishlist.map(uni => (
                    <UniversityCard key={uni.id} university={uni} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Settings and Actions */}
          <div>
            {/* Quick Actions */}
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '14px' }}>Account Settings</h2>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', border: '1px solid var(--border)' }}>
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setModal(action.modal)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '18px 24px', borderBottom: i < quickActions.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'left', background: 'none', cursor: 'pointer',
                transition: 'background 0.2s', fontFamily: 'inherit',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ background: action.bg, color: action.color, width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)', display: 'block' }}>{action.label}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '20px' }}>›</span>
            </button>
          ))}
        </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              style={{
                width: '100%', padding: '18px', background: '#fff1f2', color: '#e11d48',
                borderRadius: 'var(--radius-lg)', border: '1.5px solid #fecdd3',
                fontWeight: '900', fontSize: '15px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#ffe4e6'}
              onMouseOut={e => e.currentTarget.style.background = '#fff1f2'}
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {modal === 'edit' && <EditModal currentUser={currentUser} onClose={() => setModal(null)} />}
      {modal === 'notifications' && <NotificationsModal onClose={() => setModal(null)} />}
      {modal === 'privacy' && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
    </div>
  );
}
