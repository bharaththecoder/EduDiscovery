import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>Terms of Service</h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Last updated: November 25, 2026 · EduDiscovery</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '20px' }}>
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>EduDiscovery</strong> (Web or Android APK), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>2. Educational &amp; Counseling Disclaimer</h2>
            <p>
              EduDiscovery provides AP EAPCET historical cutoff analytics, APHERMC fee references, Web-Options priority tools, and AI-assisted guidance for informational purposes only. Official seat allotments are governed strictly by <strong>APSCHE</strong>. Always verify final college codes and fee structures on the official APSCHE counseling portal.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>3. Acceptable Use</h2>
            <p>
              You agree not to misuse the platform, attempt unauthorized access to backend APIs, or scrape data in a manner that disrupts service availability for other students.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>4. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of EduDiscovery after updates constitutes acceptance of the revised Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
