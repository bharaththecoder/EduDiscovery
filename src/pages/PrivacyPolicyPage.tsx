import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '8px 14px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text-main)',
          cursor: 'pointer',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px 28px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>Privacy Policy</h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Last updated: November 25, 2026 · EduDiscovery</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '20px' }}>
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>1. Information We Collect</h2>
            <p>
              When you sign in with Google on <strong>EduDiscovery</strong> (<code>https://edu-discovery.vercel.app</code>), we collect your basic profile information (name, email address, and profile photo) solely to personalize your AP EAPCET counseling experience, save your college wishlist, and sync your rank &amp; branch preferences.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>2. How We Use Your Data</h2>
            <p>
              Your counseling preferences (EAPCET rank, reservation category, local region, and target branches) are used exclusively to compute admission probabilities, generate Dream/Target/Safe Web-Options lists, and power the EduAI Counselor. We never sell or share your personal data with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>3. Data Storage &amp; Security</h2>
            <p>
              Account data is securely stored using Google Firebase Authentication and Cloud Firestore with strict user-scoped access rules. Local preferences may also be cached in your browser&apos;s <code>localStorage</code> for fast offline/mobile performance.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>4. Your Rights &amp; Contact</h2>
            <p>
              You may delete your saved preferences or request account deletion at any time from your Profile settings or by contacting us at <strong>support@edudiscovery.app</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
