  import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Save, Book, Calendar, Navigation } from 'lucide-react';
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
  const [age, setAge] = useState(currentUser?.age || '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      const userDocRef = doc(db, 'users', currentUser.id);
      await setDoc(userDocRef, { location, stream, age, gender }, { merge: true });
      
      alert('Profile successfully updated!');
      navigate('/profile');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="var(--text-main)" />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '24px', fontWeight: '800' }}>Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '15px', color: 'var(--text-main)', outline: 'none' }} 
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>AGE</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input 
                type="number" 
                value={age} 
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 18"
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '15px', color: 'var(--text-main)', outline: 'none' }} 
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>GENDER</label>
            <div style={{ position: 'relative' }}>
              <Navigation size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <select 
                value={gender}
                onChange={e => setGender(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '15px', color: 'var(--text-main)', outline: 'none' }}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>CURRENT CITY/STATE</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <input 
              type="text" 
              value={location} 
              placeholder="e.g. Amaravati, Andhra Pradesh"
              onChange={e => setLocation(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '15px', color: 'var(--text-main)', outline: 'none' }} 
            />
          </div>
        </div>
        
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>TARGET EDUCATIONAL STREAM</label>
          <div style={{ position: 'relative' }}>
            <Book size={18} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <select 
              value={stream}
              onChange={e => setStream(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '15px', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">Select Stream</option>
              <option value="Engineering (B.Tech)">Engineering (B.Tech)</option>
              <option value="Medical (MBBS)">Medical (MBBS)</option>
              <option value="Architecture (B.Arch)">Architecture (B.Arch)</option>
              <option value="Arts & Humanities">Arts & Humanities</option>
              <option value="Commerce (B.Com)">Commerce (B.Com)</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ width: '100%', marginTop: '32px', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Updates'}
        </button>
      </form>
    </div>
  );
}
