import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Download, ExternalLink, Users, Building2, Award, BookOpen } from 'lucide-react';
import { getUniversityById } from '../data/universities';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import BottomNav from '../components/BottomNav';

function ApplyModal({ university, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', branch: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { onClose(); onSuccess(); }, 1500);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'var(--primary-light)', color: 'var(--primary)',
          width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontWeight: '800', marginBottom: '8px' }}>Application Sent!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Your application to {university.name} has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Apply Now</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{university.name}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-wrap">
                <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="input-wrap">
                <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="input-wrap">
                <select
                  value={form.branch}
                  onChange={e => setForm({ ...form, branch: e.target.value })}
                  required
                  style={{ flex: 1, padding: '14px 16px', fontSize: '15px', color: form.branch ? 'var(--text-main)' : 'var(--text-muted)', background: 'transparent', border: 'none', outline: 'none', appearance: 'none' }}
                >
                  <option value="">Select Branch Preference</option>
                  {university.programs.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '16px', marginTop: '8px' }}>
                Submit Application
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function UniversityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [showApply, setShowApply] = useState(false);
  const [showApply2, setShowApply2] = useState(false);

  const university = getUniversityById(id);
  if (!university) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <h2>University not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>Back to Search</button>
      </div>
    );
  }

  const saved = isWishlisted(university.id);

  const handleWishlist = () => {
    toggleWishlist(university);
    showToast(saved ? 'Removed from wishlist' : 'Saved to wishlist! ❤️', saved ? 'info' : 'success');
  };

  const handleBrochure = () => showToast('📄 Brochure downloaded!', 'success');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '280px' }}>
        <img
          src={university.image}
          alt={university.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }} />

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '20px', left: '16px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <ArrowLeft size={20} />
        </button>

        {/* Heart */}
        <button onClick={handleWishlist} style={{
          position: 'absolute', top: '20px', right: '16px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Heart size={20} fill={saved ? '#FF6B6B' : 'none'} color={saved ? '#FF6B6B' : '#fff'} />
        </button>

        {/* Name overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <div className="match-badge" style={{ marginBottom: '8px', display: 'inline-flex' }}>
            {university.match}% MATCH
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {university.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
            📍 {university.city}, {university.state}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: '10px' }}>
        <button onClick={() => setShowApply(true)} className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>
          Apply Now
        </button>
        <button onClick={handleBrochure} className="btn btn-ghost" style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Download size={16} /> Brochure
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px', marginBottom: '24px',
          background: 'var(--surface)', borderRadius: 'var(--radius-md)',
          padding: '16px', boxShadow: 'var(--shadow-sm)',
        }}>
          {[
            { icon: <Building2 size={20} color="var(--primary)" />, value: university.established, label: 'Founded' },
            { icon: '🌿', value: university.acres, label: 'Acres' },
            { icon: <Users size={20} color="var(--primary)" />, value: university.ratio, label: 'S:F Ratio' },
            { icon: <Award size={20} color="var(--primary)" />, value: university.naac, label: 'NAAC' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
                {typeof stat.icon === 'string' ? <span style={{ fontSize: '20px' }}>{stat.icon}</span> : stat.icon}
              </div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>About</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{university.about}</p>
          {university.website && (
            <a href={university.website} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '12px', color: 'var(--primary)', fontWeight: '600', fontSize: '13px',
            }}>
              <ExternalLink size={14} /> Visit Official Website
            </a>
          )}
        </div>

        {/* Academic Programs */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>🎓 Academic Programs</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="programs-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Duration</th>
                  <th>Fees/Year</th>
                </tr>
              </thead>
              <tbody>
                {university.programs.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.duration}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{p.fees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Faculty */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>🏛️ Guided by Pioneers</h2>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {university.faculty.map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                padding: '20px 16px', textAlign: 'center', flexShrink: 0, width: '160px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gradient)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px',
                  margin: '0 auto 12px',
                }}>
                  {f.avatar}
                </div>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{f.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.4 }}>{f.designation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>🌳 The Living Ecosystem</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {university.facilities.map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                padding: '16px', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{f.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          background: 'var(--dark-card)', borderRadius: 'var(--radius-lg)',
          padding: '28px 20px', textAlign: 'center',
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
            Ready to Ignite Your Future?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px' }}>
            Over 2,000 students joined {university.shortName} last year.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setShowApply2(true)} className="btn btn-primary btn-full">
              Apply for Admission
            </button>
            <button
              onClick={() => showToast('📞 Counselor will call you within 24 hours!', 'success')}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '999px', padding: '14px', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                width: '100%',
              }}
            >
              Contact Counselors
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
      {showApply && <ApplyModal university={university} onClose={() => setShowApply(false)} onSuccess={() => showToast('✅ Application submitted successfully!', 'success')} />}
      {showApply2 && <ApplyModal university={university} onClose={() => setShowApply2(false)} onSuccess={() => showToast('✅ Application submitted successfully!', 'success')} />}
    </div>
  );
}
