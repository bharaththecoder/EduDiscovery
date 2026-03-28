import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Save, Book } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [stream, setStream] = useState(currentUser?.stream || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    
    try {
      // Update Auth Profile for displayName
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      // Update extension data in Firestore
      const userDocRef = doc(db, 'users', currentUser.id);
      await setDoc(userDocRef, { location, stream }, { merge: true });
      
      alert('Profile successfully updated!');
      navigate('/profile');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '20px', fontWeight: '600' }}>Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="form-input" 
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.1)', background: '#fff' }} 
              required
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>YOUR CURRENT CITY/STATE</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <input 
              type="text" 
              value={location} 
              placeholder="e.g. Amaravati, Andhra Pradesh"
              onChange={e => setLocation(e.target.value)}
              className="form-input" 
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.1)', background: '#fff' }} 
            />
          </div>
        </div>
        
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>TARGET EDUCATIONAL STREAM</label>
          <div style={{ position: 'relative' }}>
            <Book size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <select 
              value={stream}
              onChange={e => setStream(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '15px' }}
            >
              <option value="">Select Stream</option>
              <option value="Engineering (B.Tech)">Engineering (B.Tech)</option>
              <option value="Medical (MBBS)">Medical (MBBS)</option>
              <option value="Arts & Humanities">Arts & Humanities</option>
              <option value="Commerce (B.Com)">Commerce (B.Com)</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Details'}
        </button>
      </form>
    </div>
  );
}
