import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '20px', fontWeight: '600' }}>Privacy & Security</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0', textAlign: 'center' }}>
         <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
           <Shield size={40} />
         </div>
         <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Your Data is Safe</h2>
         <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', lineHeight: '1.5' }}>
           EduDiscovery is committed to your privacy. We process your application preferences securely via Firebase Auth.
         </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Data Collection Policy</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
          We collect your Name, Email, Target Stream, and Location exclusively to filter your college matches visually. We do NOT share or sell your data to third-party institutions.
        </p>

        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Account Security</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Your password is cryptographically hashed by Google Firebase. Our developers do not have access to your raw credentials or session tokens.
        </p>
      </div>
    </div>
  );
}
