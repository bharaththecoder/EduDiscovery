import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { universities } from '@/data/universities';
import { db } from '@/services/firebase';

export default function AdminSeed() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const seedDatabase = async () => {
    setLoading(true);
    setLogs(['Starting database seed (37 universities)...']);
    
    try {
      for (const college of universities) {
        // Use the hardcoded ID from universities
        const docId = college.id;
        
        await setDoc(doc(db, 'colleges', docId), college);
        
        setLogs(prev => [...prev, `✅ Added: ${college.name}`]);
      }
      setLogs(prev => [...prev, '🎉 Seeding complete!']);
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
        Database Seeding
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
        This utility pushes the local `universities` data (37 real colleges) into your live Firebase Firestore `colleges` collection. 
        It uses an idempotent setDoc operation based on the unique college ID.
      </p>

      <button
        onClick={seedDatabase}
        disabled={loading}
        style={{
          background: 'var(--primary)',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: '16px',
          fontSize: '16px',
          fontWeight: '700',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
          marginBottom: '32px'
        }}
      >
        {loading ? 'Seeding Database...' : 'Run Seed Script'}
      </button>

      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '13px', color: '#334155' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Execution Logs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.length === 0 && <span style={{ color: '#94a3b8' }}>Awaiting execution...</span>}
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
