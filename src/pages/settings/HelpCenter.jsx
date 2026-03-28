import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    { q: "How does the Fit Score work?", a: "Our AI matches your personal preferences (stream, location, budget) against the college's historical placement stats, average fees, and campus location to generate an artificial match percentage." },
    { q: "Is the data perfectly accurate?", a: "We curate the data for the Top 20 Premier Institutions to be 100% accurate. For other colleges, we rely on the Hipolabs open-source index which provides accurate names and domains, but uses placeholder imagery." },
    { q: "Does adding to Wishlist actually apply me?", a: "No! The Wishlist is just a personal bookmarking tool. You must visit the college website and submit their official forms." },
    { q: "How can I change my email address?", a: "Currently, email addresses are locked to your Firebase Auth token. If you need to switch, please create a new account or sign in with another Google Provider." }
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '20px', fontWeight: '600' }}>Help & FAQ</h1>
      </div>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Find answers to common questions about using EduDiscovery.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: '600', fontSize: '15px' }}
            >
              {faq.q}
              {openIdx === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIdx === idx && (
              <div style={{ padding: '0 20px 20px 20px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>{faq.a}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
