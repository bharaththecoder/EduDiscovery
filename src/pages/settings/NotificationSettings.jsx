import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Smartphone, Mail } from 'lucide-react';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [deadlineReminders, setDeadlineReminders] = useState(true);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '20px', fontWeight: '600' }}>Notifications</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Control how you want to be notified about college admissions and profile matches.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Toggle 1 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}><Mail size={18} /></div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>Email Alerts</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Get weekly digest of top matched colleges</p>
            </div>
          </div>
          <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
        </div>

        {/* Toggle 2 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}><Smartphone size={18} /></div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>Push Notifications</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Urgent alerts sent to your device</p>
            </div>
          </div>
          <input type="checkbox" checked={pushAlerts} onChange={() => setPushAlerts(!pushAlerts)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
        </div>

        {/* Toggle 3 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '50%', color: 'var(--accent)' }}><Bell size={18} /></div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>Admission Deadlines</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Never miss an application deadline</p>
            </div>
          </div>
          <input type="checkbox" checked={deadlineReminders} onChange={() => setDeadlineReminders(!deadlineReminders)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
        </div>
      </div>
    </div>
  );
}
