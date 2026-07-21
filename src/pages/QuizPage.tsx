import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizAnswers } from '@/utils/quizAgent';
import { FloatingEmoji3D, OrbitRing, InteractiveFluidParticles, MagneticButton } from '@/components/Animation3DComponents';

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
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [animating, setAnimating] = useState(false);

  const progress = ((step) / QUESTIONS.length) * 100;
  const current = QUESTIONS[step];
  const currentSelection = answers[current.key as string] || [];

  const handleOptionSelect = (optionLabel: string) => {
    if (animating) return;
    
    let updatedSelection = [...currentSelection];
    if (updatedSelection.includes(optionLabel)) {
      updatedSelection = updatedSelection.filter(lbl => lbl !== optionLabel);
    } else {
      updatedSelection.push(optionLabel);
    }
    
    setAnswers({ ...answers, [current.key as string]: updatedSelection });
  };

  const handleNext = () => {
    if (animating || currentSelection.length === 0) return;

    if (step < QUESTIONS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 250);
    } else {
      setAnimating(true);
      setTimeout(() => {
        localStorage.setItem('edu_quiz_answers', JSON.stringify(answers));
        navigate('/quiz-result', { state: { answers } });
      }, 250);
    }
  };

  const handleBack = () => {
    if (step === 0) { navigate(-1); return; }
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
    <div style={{ minHeight: '100vh', background: 'transparent', animation: 'fadeIn 0.25s ease', position: 'relative', overflow: 'hidden' }}>
      <InteractiveFluidParticles count={20} color="rgba(16,185,129,0.15)" />
      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '20px 20px 0',
        maxWidth: '680px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <MagneticButton
            onClick={handleBack}
            style={{
              background: 'var(--primary-light)', color: 'var(--primary)',
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} />
          </MagneticButton>
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
        padding: '0 16px 100px',
        maxWidth: '680px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(e, info) => {
              if (info.offset.x > 120) {
                handleBack();
              }
            }}
            initial={{ opacity: 0, x: 80, rotateY: 12 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -80, rotateY: -12 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: 'preserve-3d', perspective: '800px', cursor: 'grab' }}
            whileDrag={{ scale: 0.98, cursor: 'grabbing' }}
          >
        {/* Question Header */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: 'var(--gradient)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '16px',
                boxShadow: 'var(--shadow-md)',
              }}>
                {current.icon}
              </div>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '900', lineHeight: 1.25, marginBottom: '8px', color: 'var(--text-main)' }}>
                {current.q}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.5 }}>
                {current.subtitle}
              </p>
            </div>
            
            {/* 3D Floating Emoji with orbit (Hidden on small screens for max readability) */}
            <div className="hidden sm:flex" style={{
              width: '90px', height: '90px',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
            }}>
              <OrbitRing size={90} color="rgba(16,185,129,0.2)" duration={8} thickness={1}>
                <FloatingEmoji3D emoji={current.emoji} size={44} />
              </OrbitRing>
            </div>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {current.options.map((opt, optIdx) => {
            const isSelected = currentSelection.includes(opt.label);
            return (
              <motion.button
                key={opt.label}
                onClick={() => handleOptionSelect(opt.label)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: optIdx * 0.05 }}
                className={`quiz-option ${isSelected ? 'selected neon-border' : ''}`}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--gradient)' : 'var(--surface)',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: isSelected ? '0 4px 16px rgba(16,185,129,0.25)' : 'none',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Radio indicator */}
                  <div
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${isSelected ? '#fff' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                    }}
                  >
                    {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '700', fontSize: '14px',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      marginBottom: '2px',
                    }}>
                      {opt.label}
                    </div>
                    <div style={{
                      fontSize: '11.5px',
                      color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
                    }}>
                      {opt.desc}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <div style={{ display: 'flex', justifyContent: 'stretch', marginTop: '16px' }}>
          <MagneticButton
            onClick={handleNext}
            className="w-full sm:w-auto"
            style={{
              background: currentSelection.length > 0 ? 'var(--primary)' : 'var(--surface-disabled)',
              color: currentSelection.length > 0 ? '#fff' : 'var(--text-muted)',
              padding: '14px 28px',
              borderRadius: '999px',
              fontWeight: '800',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: currentSelection.length > 0 ? 1 : 0.6,
              cursor: currentSelection.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'var(--transition)',
              boxShadow: currentSelection.length > 0 ? '0 8px 24px rgba(16,185,129,0.3)' : 'none',
              marginLeft: 'auto'
            }}
          >
            {step === QUESTIONS.length - 1 ? 'See Matches' : 'Next'} <ChevronRight size={18} />
          </MagneticButton>
        </div>

        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
