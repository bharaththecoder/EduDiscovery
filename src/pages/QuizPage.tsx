import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { QuizAnswers } from '@/utils/quizAgent';

interface Question {
  key: keyof QuizAnswers | 'priority';
  q: string;
  subtitle: string;
  icon: string;
  emoji: string;
  options: { label: string; desc: string; icon: string }[];
}

const QUESTIONS: Question[] = [
  {
    key: 'priority',
    q: 'What matters most to you in a college?',
    subtitle: 'This personalizes the weight of every other answer you give.',
    icon: '⭐',
    emoji: '🎯',
    options: [
      { label: 'Best Placements & Salary Package',  desc: 'Campus recruiters, MNCs, highest CTC',         icon: '💼' },
      { label: 'Affordable Fees / Low Budget',       desc: 'Minimize total cost of education',              icon: '💰' },
      { label: 'Top College Ranking / NAAC Grade',   desc: 'NIRF, NAAC accreditation, reputation',           icon: '🏆' },
      { label: 'My Preferred City / Location',       desc: 'Stay close to home or preferred city',          icon: '📍' },
      { label: 'Course / Branch Specialization',     desc: 'Only show colleges strong in my field',         icon: '🎓' },
      { label: 'Research & Higher Studies',          desc: 'PhD pathways, international exposure, labs',    icon: '🔬' },
    ],
  },
  {
    key: 'branch',
    q: 'What field do you want to study?',
    subtitle: 'Your course preference will heavily influence your match.',
    icon: '🎓',
    emoji: '📚',
    options: [
      { label: 'CSE / AI & Data Science',       desc: 'Software, Machine Learning, Cloud, Cybersecurity', icon: '💻' },
      { label: 'ECE / VLSI / Embedded',          desc: 'Electronics, Communication, Chip Design', icon: '📡' },
      { label: 'Mechanical & Robotics',          desc: 'Machines, Manufacturing, Automation', icon: '⚙️' },
      { label: 'Civil & Architecture',           desc: 'Construction, Urban Planning, Structures', icon: '🏗️' },
      { label: 'Electrical & Power Systems',     desc: 'Energy, Power Grid, EEE', icon: '⚡' },
      { label: 'Biotech / Pharma / Medical',     desc: 'Life Sciences, Pharmacy, MBBS, Biotech', icon: '🧬' },
      { label: 'Business / Management',          desc: 'BBA, MBA, Commerce, Finance', icon: '📊' },
      { label: 'Law & Humanities',               desc: 'LLB, BA, History, Political Science', icon: '⚖️' },
    ],
  },
  {
    key: 'budget',
    q: "What's your annual fee budget?",
    subtitle: 'We will only show colleges within your financial comfort zone.',
    icon: '💰',
    emoji: '💳',
    options: [
      { label: 'Under ₹75K (Very Budget Friendly)', desc: 'Government colleges, subsidised institutions', icon: '🟢' },
      { label: '₹75K – ₹1.5L (Budget)',            desc: 'Autonomous, state-affiliated colleges', icon: '🔵' },
      { label: '₹1.5L – ₹2.5L (Mid Range)',        desc: 'Well-known private institutes', icon: '🟡' },
      { label: '₹2.5L – ₹4L (Premium)',            desc: 'Deemed/private universities with top facilities', icon: '🟠' },
      { label: '₹4L+ (Top Tier / Global)',          desc: 'Elite ranking private/international colleges', icon: '🔴' },
    ],
  },
  {
    key: 'location',
    q: 'Which region of AP do you prefer?',
    subtitle: 'Choose based on where you want to live and study.',
    icon: '📍',
    emoji: '🗺️',
    options: [
      { label: 'Visakhapatnam / Vizag (North Coastal)',    desc: 'Tech hub, port city, metropolitan area', icon: '🌊' },
      { label: 'Amaravati / Vijayawada (Capital Region)',   desc: 'Capital territory, central AP, major city', icon: '🏙️' },
      { label: 'Tirupati / Chittoor (Temple City)',         desc: 'Cultural, spiritual city in South AP', icon: '🛕' },
      { label: 'Anantapur / Kurnool (Rayalaseema)',         desc: 'Rayalaseema region, emerging educational hub', icon: '🌵' },
      { label: 'Kakinada / Rajahmundry (Godavari)',         desc: 'Riverbank city, East Godavari region', icon: '🏞️' },
      { label: 'Anywhere in Andhra Pradesh (No Preference)', desc: 'Open to all — show best match regardless', icon: '🌏' },
    ],
  },
  {
    key: 'type',
    q: 'What type of institution suits you?',
    subtitle: 'Institution type affects culture, fees, research, and placements.',
    icon: '🏛️',
    emoji: '🎯',
    options: [
      { label: 'Private University (Best Placements)',      desc: 'Industry partnerships, MNC placements, modern campus', icon: '🏢' },
      { label: 'Government / State University (Affordable)', desc: 'Low fees, government recognition, research base', icon: '🏫' },
      { label: 'Autonomous Engineering College (Focused)',  desc: 'Specialized, industry-aligned, flexible curriculum', icon: '🔧' },
      { label: 'Deemed University (Research Focused)',      desc: 'Research culture, PhD programs, innovation labs', icon: '🔬' },
    ],
  },
  {
    key: 'rank',
    q: 'What is your expected EAPCET rank?',
    subtitle: 'Your rank helps us match you with realistic cutoffs.',
    icon: '📊',
    emoji: '🏆',
    options: [
      { label: 'Top 5,000 (Very Competitive)',                   desc: 'Top NAAC A++ / NIRF-ranked institutions', icon: '🥇' },
      { label: '5,000 – 20,000 (Good Rank)',                     desc: 'NAAC A+ and A grade colleges', icon: '🥈' },
      { label: '20,000 – 60,000 (Average Rank)',                 desc: 'Good autonomous colleges, NAAC A grade', icon: '🥉' },
      { label: '60,000+ (Wide Cutoff / Management Quota)',       desc: 'Management/NRI quota, self-financed seats', icon: '🎖️' },
    ],
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const progress = ((step) / QUESTIONS.length) * 100;
  const current = QUESTIONS[step];

  const handleNext = () => {
    if (!selected || animating) return;
    const newAnswers = { ...answers, [current.key]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (step < QUESTIONS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 200);
    } else {
      localStorage.setItem('edu_quiz_answers', JSON.stringify(newAnswers));
      navigate('/quiz-result', { state: { answers: newAnswers } });
    }
  };

  const handleBack = () => {
    if (step === 0) { navigate(-1); return; }
    const prevKey = QUESTIONS[step - 1].key;
    setSelected((answers as any)[prevKey] || null);
    setStep(step - 1);
  };

  const stepColors = [
    'from-violet-600 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        maxWidth: '680px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={handleBack} style={{
            background: 'var(--primary-light)', color: 'var(--primary)',
            width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>
                Question {step + 1} of {QUESTIONS.length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {QUESTIONS.map((q, i) => (
            <div key={i} style={{
              flex: 1, height: '4px', borderRadius: '99px',
              background: i <= step ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      <div style={{
        padding: '0 20px 40px',
        maxWidth: '680px',
        margin: '0 auto',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateX(20px)' : 'translateX(0)',
        transition: 'all 0.2s ease',
      }}>
        {/* Question Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'var(--gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', marginBottom: '20px',
            boxShadow: 'var(--shadow-md)',
          }}>
            {current.icon}
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', lineHeight: 1.25, marginBottom: '8px', color: 'var(--text-main)' }}>
            {current.q}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            {current.subtitle}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {current.options.map(opt => {
            const isSelected = selected === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => setSelected(opt.label)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--primary)' : 'var(--surface)',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: isSelected ? '0 4px 16px var(--primary-glow)' : 'var(--shadow-sm)',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Radio indicator */}
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isSelected ? '#fff' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }}>
                    {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '700', fontSize: '15px',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      marginBottom: '2px',
                    }}>
                      {opt.label}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: isSelected ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
                    }}>
                      {opt.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next / Submit */}
        <button
          onClick={handleNext}
          disabled={!selected}
          className="btn btn-primary btn-full"
          style={{
            padding: '16px', fontSize: '16px', fontWeight: '800',
            opacity: !selected ? 0.45 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          {step === QUESTIONS.length - 1 ? '✨ Find My Best Colleges' : <>Next <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}
