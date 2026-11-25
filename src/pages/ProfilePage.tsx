import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { useCounselingPreferences } from '@/hooks/useCounselingPreferences';
import { useVerificationChecklist } from '@/hooks/useVerificationChecklist';
import { 
  ChevronDown, ChevronUp, Bell, Shield, HelpCircle, Edit3, Camera, FileText, Heart, 
  CheckCircle2, ShieldCheck, Megaphone, GraduationCap, FolderHeart, Sun, Moon, 
  LogOut, Smartphone, RefreshCw, SlidersHorizontal, Award, Sparkles, Target, ArrowRight,
  ExternalLink, Layers, CheckSquare, Square, RotateCcw, User, Phone, MapPin, BookOpen,
  Briefcase, Plus, X
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { CURRENT_APP_VERSION, checkForAppUpdate } from '@/services/appUpdateService';
import UniversityCard from '@/components/cards/UniversityCard';
import { getFirebaseStorage } from '@/services/firebase';
import { universities } from '@/data/universities';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/Animation3DComponents';

const FAQS = [
  { q: 'How does the Candidate Counseling Vault synchronize?', a: 'Any changes to your rank, category, region, budget, or preferred branches are saved immediately to local storage and your cloud profile. They immediately power your personalized Homepage recommendations, Web-Options priority choices, and University Detail admission probabilities.' },
  { q: 'How do I check JVD 100% Fee Reimbursement eligibility?', a: 'Students belonging to SC, ST, BC, EWS, or Minority categories with family income under ₹2.5 Lakhs/year (or White Ration Card holders) admitted through AP EAPCET Convenor quota Category-A seats qualify for 100% statutory fee waiver under Jagananna Vidya Deevena.' },
  { q: 'Why is Certificate Verification Readiness important?', a: 'APSCHE requires physical or online verification of SSC, Intermediate, Study (Class 6-Inter), and MeeSeva Caste/Income certificates at designated Helpline Centers (HLC) before option entry is unlocked.' },
  { q: 'Can I change my web-options after generating them?', a: 'Yes! You can reorder, promote, demote, or add custom colleges to your priority choice list anytime before the APSCHE official freezing deadline.' },
  { q: 'Is the college data verified?', a: 'Yes, all colleges and fee structures are audited from official APSCHE seat allotment ledgers and APHERMC statutory fee gazettes.' },
];

const AVAILABLE_TAGS = [
  'Early Action', 'Stem Scholar', 'Sports Quota', 'First Gen', 
  'Merit Student', 'Research Focused', 'Entrepreneurial', 'AP EAPCET 2026'
];

const CATEGORY_OPTIONS = [
  { value: 'OC', label: 'OC (Open Competition)' },
  { value: 'OC_EWS', label: 'OC-EWS (Economically Weaker Section)' },
  { value: 'BCA', label: 'BC-A (Backward Class Group A)' },
  { value: 'BCB', label: 'BC-B (Backward Class Group B)' },
  { value: 'BCC', label: 'BC-C (Backward Class Group C)' },
  { value: 'BCD', label: 'BC-D (Backward Class Group D)' },
  { value: 'BCE', label: 'BC-E (Backward Class Group E)' },
  { value: 'SC', label: 'SC (Scheduled Caste)' },
  { value: 'ST', label: 'ST (Scheduled Tribe)' },
];

const BRANCH_OPTIONS = [
  { code: 'CSE', label: 'Computer Science (CSE)' },
  { code: 'CSM', label: 'AI & Machine Learning (CSM)' },
  { code: 'CSD', label: 'Data Science (CSD)' },
  { code: 'INF', label: 'Information Tech (INF)' },
  { code: 'ECE', label: 'Electronics & Comm (ECE)' },
  { code: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { code: 'MEC', label: 'Mechanical Engg (MEC)' },
  { code: 'CIV', label: 'Civil Engg (CIV)' }
];

const AP_CITIES = [
  'Amaravati', 'Anantapur', 'Bapatla', 'Bhimavaram', 'Gudlavalleru', 'Guntur', 
  'Kadapa', 'Kakinada', 'Kuppam', 'Kurnool', 'Machilipatnam', 'Mylavaram', 
  'Narasaraopeta', 'Nellore', 'Nuzvid', 'Ongole', 'Prasanthi Nilayam', 'Puttur', 
  'Rajam', 'Rajamahendravaram', 'Rajampet', 'Sri City', 'Surampalem', 
  'Tadepalligudem', 'Tekkali', 'Tirupati', 'Vijayawada', 'Visakhapatnam', 'Vizianagaram'
];

function EditModal({ currentUser, onClose }: { currentUser: any; onClose: () => void }) {
  const { updateUserDoc } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    city: currentUser?.city || '',
    phone: currentUser?.phone || '',
    hallTicketNumber: currentUser?.hallTicketNumber || '',
    targetBranch: currentUser?.targetBranch || 'Computer Science (CSE)',
    educationBoard: currentUser?.educationBoard || 'BIEAP (Andhra Pradesh State Board)',
    interGroup: currentUser?.interGroup || 'MPC (Mathematics, Physics, Chemistry)'
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(currentUser?.tags || []);
  const [customTagInput, setCustomTagInput] = useState('');
  
  const { showToast } = useToast();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: string[]) => 
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags(prev => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserDoc({
        name: form.name,
        bio: form.bio,
        city: form.city,
        phone: form.phone,
        hallTicketNumber: form.hallTicketNumber,
        targetBranch: form.targetBranch,
        educationBoard: form.educationBoard,
        interGroup: form.interGroup,
        tags: selectedTags
      });
      showToast('Profile and academic records synced to cloud', 'success');
      onClose();
    } catch {
      showToast('Failed to sync profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', zIndex: 10 }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Edit Profile & Scholar Details</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Personalize your candidate identity, academic records, and professional interest tags.
        </p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Candidate Identity */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} className="text-primary" /> Candidate Identity
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Display Name</span>
                <div className="input-wrap">
                  <input 
                    type="text" 
                    placeholder="e.g. Bharath Raavi" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Student Bio</span>
                <div className="input-wrap">
                  <input 
                    type="text" 
                    placeholder="e.g. Aspiring AI & Data Engineer • AP Student" 
                    value={form.bio} 
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Home City / District</span>
                  <select
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: 'var(--bg)', border: '1.5px solid var(--border)',
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    <option value="">Select City / Town</option>
                    {AP_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Contact Phone (Optional)</span>
                  <div className="input-wrap">
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AP EAPCET & Academic Background */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={15} className="text-primary" /> Academic & Hall Ticket Records
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>AP EAPCET Hall Ticket Number</span>
                <div className="input-wrap">
                  <input 
                    type="text" 
                    placeholder="e.g. 2650123456" 
                    value={form.hallTicketNumber} 
                    onChange={e => setForm({ ...form, hallTicketNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Intermediate Board</span>
                  <select
                    value={form.educationBoard}
                    onChange={e => setForm({ ...form, educationBoard: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: 'var(--bg)', border: '1.5px solid var(--border)',
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    <option value="BIEAP (Andhra Pradesh State Board)">BIEAP (AP State Board)</option>
                    <option value="TSBIE (Telangana Board)">TSBIE (Telangana Board)</option>
                    <option value="CBSE (Central Board)">CBSE (Central Board)</option>
                    <option value="ICSE / ISC">ICSE / ISC</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Stream / Group</span>
                  <select
                    value={form.interGroup}
                    onChange={e => setForm({ ...form, interGroup: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: 'var(--bg)', border: '1.5px solid var(--border)',
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    <option value="MPC (Mathematics, Physics, Chemistry)">MPC Group (Engineering)</option>
                    <option value="BiPC (Biology, Physics, Chemistry)">BiPC Group (Agri / Pharmacy)</option>
                    <option value="MBiPC (Both)">MBiPC (Dual Stream)</option>
                  </select>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Primary Target Engineering Branch</span>
                <select
                  value={form.targetBranch}
                  onChange={e => setForm({ ...form, targetBranch: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    background: 'var(--bg)', border: '1.5px solid var(--border)',
                    fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                  }}
                >
                  <option value="Computer Science (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="AI & Machine Learning (CSM)">Artificial Intelligence & ML (CSM)</option>
                  <option value="Data Science (CSD)">Data Science & Big Data (CSD)</option>
                  <option value="Information Tech (INF)">Information Technology (IT / INF)</option>
                  <option value="Electronics & Comm (ECE)">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics (EEE)">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engg (MEC)">Mechanical Engineering (MEC)</option>
                  <option value="Civil Engg (CIV)">Civil Engineering (CIV)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Professional & Scholar Tags */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={15} className="text-primary" /> Scholar & Professional Tags
            </label>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
              Select badges or add custom keywords that reflect your candidate profile.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--primary)' : 'var(--bg)',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      transition: 'all 0.15s',
                      cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
              {selectedTags.filter(t => !AVAILABLE_TAGS.includes(t)).map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1.5px solid var(--primary)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)', display: 'flex' }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="input-wrap" style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Add custom tag (e.g. Robotics Club, Coding Enthusiast)"
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  style={{ fontSize: '12px' }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomTag}
                style={{
                  padding: '8px 14px', borderRadius: '10px',
                  background: 'var(--bg)', border: '1.5px solid var(--border)',
                  color: 'var(--text-main)', fontSize: '12px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: '14px', marginTop: '6px', fontSize: '14px', fontWeight: '800' }}>
            {loading ? 'Syncing to Cloud...' : 'Save & Sync Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

function NotificationsModal({ onClose }: { onClose: () => void }) {
  const notifications = [
    { icon: <Megaphone size={24} color="var(--primary)" />, text: 'AP EAPCET 2026: Official choice-filling verification centers announced by APSCHE.', time: 'Just now', color: 'var(--primary)' },
    { icon: <FileText size={24} color="var(--accent)" />, text: 'Jnanabhumi Portal open for statutory JVD fee reimbursement registration.', time: '3 hours ago', color: 'var(--accent)' },
    { icon: <GraduationCap size={24} color="#8b5cf6" />, text: 'Govt Model Colleges: 100% tuition-free seats available for top regional rankers.', time: 'Yesterday', color: '#8b5cf6' },
  ];
  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Educational Updates</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: `1px solid ${n.color}44` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.icon}</div>
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

function PrivacyModal({ onClose }: { onClose: () => void }) {
  const [toggles, setToggles] = useState({ activity: true, emails: false, personalized: true, share: false });
  const toggle = (key: keyof typeof toggles) => setToggles(p => ({ ...p, [key]: !p[key] }));
  const labels = { activity: 'Share Activity Data', emails: 'Marketing Emails', personalized: 'Personalised Recommendations', share: 'Share with Partner Colleges' };
  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>×</button>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Privacy & Security</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {Object.entries(labels).map(([key, label]) => {
            const toggleKey = key as keyof typeof toggles;
            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px' }}>{label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {toggles[toggleKey] ? 'Currently enabled' : 'Currently disabled'}
                  </p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={toggles[toggleKey]} onChange={() => toggle(toggleKey)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 99999 }}>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, logout, updateUserDoc } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  // Integrated Candidate Counseling State
  const {
    preferences,
    parsedRank,
    setRank,
    setCategory,
    setGender,
    setRegion,
    setBudget,
    setBranches
  } = useCounselingPreferences();

  // Interactive Document Verification State
  const {
    documents,
    completedCount,
    totalCount,
    readinessPercentage,
    toggleDocument,
    markAll
  } = useVerificationChecklist();

  const [modal, setModal] = useState<string | null>(null); // 'edit' | 'notifications' | 'privacy' | 'help'
  const [uploading, setUploading] = useState(false);
  
  const profile = {
    name: currentUser?.name || 'Scholar',
    bio: currentUser?.bio || 'Aspiring Engineer • AP Student',
    avatar: currentUser?.photoURL || null,
    tags: currentUser?.tags || ["Early Action", "Stem Scholar"],
    city: currentUser?.city || ''
  };

  const appliedCount = (currentUser?.appliedCount as number) || 0;
  
  // Calculate Statutory JVD Fee Reimbursement Eligibility
  const isJvdEligible = React.useMemo(() => {
    const cat = preferences.category.toUpperCase();
    return (
      cat.includes('SC') ||
      cat.includes('ST') ||
      cat.includes('BC') ||
      cat.includes('EWS')
    );
  }, [preferences.category]);
  
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large (max 2MB)', 'error');
        return;
      }
      setUploading(true);
      try {
        const storageInstance = await getFirebaseStorage();
        if (!storageInstance) {
          showToast('Storage unavailable', 'error');
          return;
        }
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const fileRef = ref(storageInstance, `profile_pictures/${currentUser.id}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        await updateUserDoc({ photoURL: url });
        showToast('Profile picture synced to cloud', 'success');
      } catch {
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
    { icon: <Edit3 size={20} />, label: 'Edit Profile Info', color: 'var(--primary)', bg: 'var(--primary-light)', modal: 'edit' },
    { icon: <Bell size={20} />, label: 'Counseling Alerts', color: '#f59e0b', bg: '#fef3c7', modal: 'notifications' },
    { icon: <Shield size={20} />, label: 'Privacy & Security', color: '#10b981', bg: '#d1fae5', modal: 'privacy' },
    { icon: <ShieldCheck size={20} />, label: 'Privacy Policy', color: '#059669', bg: '#ecfdf5', route: '/privacy' },
    { icon: <FileText size={20} />, label: 'Terms of Service', color: '#0284c7', bg: '#e0f2fe', route: '/terms' },
    { icon: <HelpCircle size={20} />, label: 'Help Center & FAQs', color: '#8b5cf6', bg: '#ede9fe', modal: 'help' },
  ];

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '40px' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Profile Header */}
      <div style={{ background: 'var(--gradient)', padding: '48px 24px 32px', textAlign: 'center', position: 'relative' }}>
        <motion.div 
          onClick={handleAvatarClick}
          whileHover={{ scale: 1.05, rotateY: 10 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: '#fff', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: '900', color: 'var(--primary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2), 0 0 30px rgba(16,185,129,0.2)',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.3)',
            opacity: uploading ? 0.6 : 1,
            transformStyle: 'preserve-3d',
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
        </motion.div>
        
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '6px' }}>{profile.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '20px', maxWidth: '320px', margin: '0 auto 20px' }}>
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
          
          {/* Left Column: Interactive Counseling Vault & Cockpit Panels */}
          <div>
            
            {/* Quick Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              {[
                { label: 'Verified Rank', value: parsedRank > 0 ? `#${parsedRank.toLocaleString()}` : '#25,000', icon: <Award size={26} color="var(--primary)" /> },
                { label: 'Saved Choices', value: wishlist.length, icon: <Heart size={26} color="#e11d48" /> },
                { label: 'Doc Readiness', value: `${readinessPercentage}%`, icon: <CheckCircle2 size={26} color="#10b981" /> },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginBottom: '2px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── 1. CANDIDATE COUNSELING VAULT ── */}
            <SpotlightCard style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px',
              boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border)', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: 'var(--text-main)' }}>
                      Candidate Counseling Vault
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Live preferences powering your dynamic Web-Options and Cutoff engines across EduDiscovery
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '4px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}>
                  <Sparkles size={12} /> Real-Time Cloud Sync
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                
                {/* AP EAPCET Rank */}
                <div>
                  <label htmlFor="vault-rank-input" style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                    AP EAPCET Rank
                  </label>
                  <div className="input-wrap">
                    <input
                      id="vault-rank-input"
                      type="text"
                      inputMode="numeric"
                      value={preferences.rank}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/[^0-9]/g, '');
                        setRank(sanitized);
                      }}
                      onBlur={() => showToast(`Rank updated to #${parsedRank.toLocaleString()}`, 'success')}
                      placeholder="e.g. 25000"
                      style={{ fontSize: '14px', fontWeight: '700' }}
                    />
                  </div>
                  {/* Rank Shortcut Chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['5000', '15000', '30000', '50000', '80000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setRank(preset);
                          showToast(`Rank set to #${Number(preset).toLocaleString()}`, 'info');
                        }}
                        style={{
                          fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px',
                          background: preferences.rank === preset ? 'var(--primary)' : 'var(--bg)',
                          color: preferences.rank === preset ? '#fff' : 'var(--text-muted)',
                          border: '1px solid var(--border)', cursor: 'pointer'
                        }}
                      >
                        {Number(preset) >= 1000 ? `${Number(preset) / 1000}k` : preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reservation Category */}
                <div>
                  <label htmlFor="vault-category-select" style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                    Reservation Category
                  </label>
                  <select
                    id="vault-category-select"
                    value={preferences.category.replace('_BOYS', '').replace('_GIRLS', '')}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      showToast(`Category set to ${e.target.value}`, 'success');
                    }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      background: 'var(--bg)', border: '1.5px solid var(--border)',
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Gender Quota */}
                <div>
                  <label htmlFor="vault-gender-select" style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                    Gender Pool
                  </label>
                  <select
                    id="vault-gender-select"
                    value={preferences.gender}
                    onChange={(e) => {
                      const val = e.target.value as 'General' | 'Female';
                      setGender(val);
                      showToast(`Gender pool set to ${val === 'Female' ? 'Girls Quota' : 'Boys / General'}`, 'info');
                    }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      background: 'var(--bg)', border: '1.5px solid var(--border)',
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    <option value="General">Boys / General (Open)</option>
                    <option value="Female">Girls (33.33% Horizontal Quota)</option>
                  </select>
                </div>

                {/* Candidate Region */}
                <div>
                  <label htmlFor="vault-region-select" style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                    Local Candidate Region
                  </label>
                  <select
                    id="vault-region-select"
                    value={preferences.region}
                    onChange={(e) => {
                      const val = e.target.value as 'AU' | 'SVU' | 'All';
                      setRegion(val);
                      showToast(`Region set to ${val}`, 'info');
                    }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      background: 'var(--bg)', border: '1.5px solid var(--border)',
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                    }}
                  >
                    <option value="AU">AU Region (Andhra Univ - Coastal AP)</option>
                    <option value="SVU">SVU Region (Sri Venkateswara Univ - Rayalaseema)</option>
                    <option value="All">All Regions (Statewide Merit)</option>
                  </select>
                </div>

              </div>

              {/* Target Engineering Branches */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>
                    Target Engineering Branches
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Selected: {preferences.branches.length} of {BRANCH_OPTIONS.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {BRANCH_OPTIONS.map((branch) => {
                    const isSelected = preferences.branches.includes(branch.code);
                    return (
                      <button
                        key={branch.code}
                        type="button"
                        onClick={() => {
                          let next: string[];
                          if (isSelected) {
                            next = preferences.branches.filter(b => b !== branch.code);
                            if (next.length === 0) next = ['CSE']; // preserve minimum
                          } else {
                            next = [...preferences.branches, branch.code];
                          }
                          setBranches(next);
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                          background: isSelected ? 'var(--primary)' : 'var(--bg)',
                          color: isSelected ? '#fff' : 'var(--text-main)',
                          border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {branch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* APHERMC Annual Fee Ceiling */}
              <div style={{ marginTop: '16px' }}>
                <label htmlFor="vault-budget-select" style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                  APHERMC Annual Tuition Budget Ceiling
                </label>
                <select
                  id="vault-budget-select"
                  value={preferences.budget || '0'}
                  onChange={(e) => {
                    const val = e.target.value === '0' ? undefined : e.target.value;
                    setBudget(val);
                    showToast(val ? `Budget ceiling set to ₹${Number(val).toLocaleString()}` : 'Budget filter cleared', 'info');
                  }}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    background: 'var(--bg)', border: '1.5px solid var(--border)',
                    fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', outline: 'none'
                  }}
                >
                  <option value="0">Any Budget (All APHERMC statutory fee brackets)</option>
                  <option value="35000">Govt / University Subsidized Only (≤ ₹35,000 / year)</option>
                  <option value="75000">Affordable Merit Tier (Under ₹75,000 / year)</option>
                  <option value="85000">Mid-Range Private Tier (Under ₹85,000 / year)</option>
                </select>
              </div>

            </SpotlightCard>

            {/* ── 2. JVD STATUTORY FEE REIMBURSEMENT STATUS ── */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '20px',
              border: `1.5px solid ${isJvdEligible ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)'}`,
              boxShadow: 'var(--shadow-sm)', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: isJvdEligible ? 'rgba(16, 185, 129, 0.15)' : 'var(--primary-light)',
                    color: isJvdEligible ? '#059669' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                      Jagananna Vidya Deevena (JVD) Scheme
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Andhra Pradesh Statutory 100% Tuition Fee Reimbursement Eligibility
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '12px', fontWeight: '800',
                  padding: '4px 12px', borderRadius: '999px',
                  background: isJvdEligible ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg)',
                  color: isJvdEligible ? '#059669' : 'var(--text-muted)',
                  border: `1px solid ${isJvdEligible ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`
                }}>
                  {isJvdEligible ? 'Eligible for 100% Waiver' : 'Subject to Income Criteria'}
                </span>
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                {isJvdEligible ? (
                  <span>
                    Based on your selected category (<strong>{preferences.category.replace('_BOYS', '').replace('_GIRLS', '')}</strong>), you qualify for full 100% tuition reimbursement across all Category-A convenor seats provided family annual income is &le; ₹2.5 Lakhs (or holding a White Ration Card / MeeSeva Income Certificate).
                  </span>
                ) : (
                  <span>
                    OC candidates with annual family income &le; ₹2.5 Lakhs and possessing an official MeeSeva EWS certificate qualify for 100% tuition waiver under the state welfare scheme.
                  </span>
                )}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Administered via official <strong>Jnanabhumi (jnanabhumi.ap.gov.in)</strong> portal
                </span>
                <a
                  href="https://jnanabhumi.ap.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none'
                  }}
                >
                  Jnanabhumi Portal <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* ── 3. INTERACTIVE ADMISSIONS & VERIFICATION CHECKLIST ── */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <ShieldCheck size={20} color="var(--primary)" />
                    Certificate Verification Readiness Checklist
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Mandatory documentation required by APSCHE Helpline Centers (HLC) before option entry
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => markAll(true)}
                    style={{
                      fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                      background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer'
                    }}
                  >
                    Mark All Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => markAll(false)}
                    style={{
                      fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                      background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer'
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                
                {/* Readiness Progress Bar */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
                      Verification Readiness Score
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: readinessPercentage === 100 ? '#059669' : 'var(--primary)' }}>
                      {readinessPercentage}% ({completedCount} of {totalCount} Ready)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div
                      style={{
                        width: `${readinessPercentage}%`, height: '100%',
                        background: readinessPercentage === 100 ? '#059669' : 'var(--primary)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  {readinessPercentage === 100 ? (
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                      All mandatory certificates ready! You are eligible for frictionless Helpline Center (HLC) verification.
                    </p>
                  ) : (
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Click on items as you gather original certificates and 2 sets of attested photocopies.
                    </p>
                  )}
                </div>

                {/* Document Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocument(doc.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        padding: '12px 14px', background: doc.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg)',
                        borderRadius: '12px', border: `1.5px solid ${doc.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ color: doc.completed ? '#059669' : 'var(--text-muted)', marginTop: '2px' }}>
                          {doc.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '13.5px', fontWeight: '700',
                              color: doc.completed ? 'var(--text-main)' : 'var(--text-main)',
                              textDecoration: doc.completed ? 'none' : 'none'
                            }}>
                              {doc.label}
                            </span>
                            <span style={{
                              fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                              background: doc.category === 'Mandatory' ? 'rgba(239, 68, 68, 0.1)' : 'var(--chip-bg)',
                              color: doc.category === 'Mandatory' ? '#ef4444' : 'var(--text-muted)',
                              border: '1px solid var(--border)'
                            }}>
                              {doc.category}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                            {doc.description}
                          </p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.8, display: 'block', marginTop: '2px' }}>
                            Authority: {doc.issuingAuthority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 4. WISHLIST SECTION ── */}
            {wishlist.length > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={20} fill="#e11d48" color="#e11d48" /> My Saved Colleges ({wishlist.length})
                  </h2>
                  <span onClick={() => navigate('/wishlist')} style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>See All</span>
                </div>
                <div className="scroll-row">
                  {wishlist.map(uni => (
                    <SpotlightCard key={uni.id}>
                      <UniversityCard university={uni} compact />
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={20} fill="#e11d48" color="#e11d48" /> My Saved Colleges
                  </h2>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', border: '1.5px dashed var(--border)' }}>
                  <FolderHeart size={48} strokeWidth={1} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '16px', fontWeight: '600' }}>Your wishlist is empty. Start exploring!</p>
                  <button onClick={() => navigate('/search')} className="btn btn-ghost" style={{ marginTop: '12px', fontSize: '13px' }}>Explore Colleges</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Fast Actions, Settings, and Jump CTA */}
          <div>

            {/* ── WEB-OPTIONS GENERATOR QUICK JUMP CARD ── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(14, 165, 233, 0.08))',
              borderRadius: 'var(--radius-lg)', padding: '20px', border: '1.5px solid var(--primary-glow)',
              marginBottom: '24px', boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: 'var(--text-main)' }}>
                    Web-Options Assistant
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    Official AP EAPCET Option Sequence
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                Your rank (<strong>#{parsedRank > 0 ? parsedRank.toLocaleString() : '25,000'}</strong>) is ready to generate an optimized <strong>Dream ➔ Target ➔ Safe</strong> option entry sequence.
              </p>

              <button
                type="button"
                onClick={() => navigate(`/web-options?rank=${parsedRank > 0 ? parsedRank : 25000}`)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'var(--primary)', color: '#fff', fontWeight: '800',
                  fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
                }}
              >
                Launch Web-Options <ArrowRight size={15} />
              </button>
            </div>

            {/* Quick Actions / Settings */}
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '14px' }}>Account Settings</h2>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', border: '1px solid var(--border)' }}>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => action.route ? navigate(action.route) : setModal(action.modal || null)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px', borderBottom: i < quickActions.length - 1 ? '1px solid var(--border)' : 'none',
                    textAlign: 'left', background: 'none', cursor: 'pointer',
                    transition: 'background 0.2s', fontFamily: 'inherit',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ background: action.bg, color: action.color, width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>{action.label}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                </button>
              ))}
            </div>
     
            {/* Visual Customization Card */}
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '14px', marginTop: '24px' }}>Theme Style</h2>
            <div style={{ 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '20px 24px', 
              boxShadow: 'var(--shadow-sm)', 
              marginBottom: '24px', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Personalise your EduDiscovery interface style. Toggle between light and dark themes.
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
                    background: theme === 'light' ? 'var(--primary-light)' : 'transparent',
                    color: theme === 'light' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <Sun size={16} /> Light
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
                    background: theme === 'dark' ? 'var(--primary-light)' : 'transparent',
                    color: theme === 'dark' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>

            {/* App Version & Manual Update Checker */}
            <div style={{
              background: 'var(--bg)', borderRadius: '16px', padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid var(--border)', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                    EduDiscovery App
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Version {CURRENT_APP_VERSION} (Native Build)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  showToast('Checking for updates...', 'info');
                  const info = await checkForAppUpdate(true);
                  if (info?.hasUpdate) {
                    showToast(`Update Available: v${info.latestVersion}!`, 'success');
                    window.open(info.apkDownloadUrl, '_system');
                  } else {
                    showToast('App is up to date (v' + CURRENT_APP_VERSION + ')', 'success');
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '8px 14px', borderRadius: '999px', fontSize: '12px',
                  fontWeight: 700, color: 'var(--primary)', cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Check Update
              </button>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              style={{
                width: '100%', padding: '16px', background: 'var(--color-destructive-light, #fee2e2)', color: 'var(--color-destructive)',
                borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-destructive-border, #fecaca)',
                fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--color-destructive-hover, #fecaca)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--color-destructive-light, #fee2e2)'}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {modal === 'edit' && <EditModal currentUser={currentUser} onClose={() => setModal(null)} />}
            {modal === 'notifications' && <NotificationsModal onClose={() => setModal(null)} />}
            {modal === 'privacy' && <PrivacyModal onClose={() => setModal(null)} />}
            {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
          </>,
          document.body
        )}
    </div>
  );
}
