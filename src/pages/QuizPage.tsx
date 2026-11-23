import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Award, Compass, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversities } from '@/contexts/UniversityContext';
import { getRecommendations, QuizAnswers } from '@/utils/quizAgent';

interface QuestionOption {
  value: string;
  label: string;
  desc: string;
  icon: string;
}

interface QuizQuestion {
  key: keyof QuizAnswers | 'priority';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: QuestionOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    key: 'priority',
    title: 'What matters most to you in choosing a college?',
    subtitle: 'This will weight and prioritize your recommendations.',
    icon: <Sparkles className="text-emerald-500" size={24} />,
    options: [
      { value: 'best placements & salary package', label: 'Top Placements & Highest CTC', desc: 'Focus on campus recruiters, MNCs, and salary packages', icon: '💼' },
      { value: 'affordable fees / low budget', label: 'Affordable Fees / Low Budget', desc: 'Focus on minimal tuition and high ROI', icon: '💰' },
      { value: 'top college ranking / naac grade', label: 'Accreditation & Reputation', desc: 'Premier NIRF ranking and NAAC A++ grades', icon: '🏆' },
      { value: 'my preferred city / location', label: 'Location & Campus Proximity', desc: 'Study close to your home district or preferred metro', icon: '📍' },
      { value: 'course / branch specialization', label: 'Branch & Tech Specialization', desc: 'Institutions known specifically for your chosen branch', icon: '🎓' },
    ],
  },
  {
    key: 'branch',
    title: 'Which engineering branch are you targeting?',
    subtitle: 'We will match colleges with strong accredited departments in this field.',
    icon: <Compass className="text-cyan-500" size={24} />,
    options: [
      { value: 'CSE / AI & Data Science', label: 'Computer Science, AI & Data Science', desc: 'Software, Machine Learning, Cloud & Cybersecurity', icon: '💻' },
      { value: 'ECE / VLSI / Embedded', label: 'Electronics & Communication (ECE / VLSI)', desc: 'Hardware, Embedded Systems, IoT, Semiconductor', icon: '📡' },
      { value: 'Mechanical & Robotics', label: 'Mechanical & Robotics Engineering', desc: 'Automotive, Industrial Automation, Mechatronics', icon: '⚙️' },
      { value: 'Electrical & Power Systems', label: 'Electrical & Electronics (EEE)', desc: 'Power Systems, Renewable Energy, EV Tech', icon: '⚡' },
      { value: 'Civil & Architecture', label: 'Civil & Infrastructure Engineering', desc: 'Smart Cities, Structural Design, Construction Tech', icon: '🏗️' },
      { value: 'Biotech / Pharma / Medical', label: 'Biotechnology & Chemical Engineering', desc: 'Bioinformatics, Pharma, Biochemical Process', icon: '🧬' },
    ],
  },
  {
    key: 'rank',
    title: 'What is your actual or expected AP EAPCET rank?',
    subtitle: 'Helps us calculate authentic admission probabilities using 7,267 closing ranks.',
    icon: <Award className="text-amber-500" size={24} />,
    options: [
      { value: '3000', label: 'Top 5,000 (Very Competitive)', desc: 'Qualifies for top NIRF and premier university campuses', icon: '🥇' },
      { value: '15000', label: '5,000 – 20,000 (Strong Merit)', desc: 'Targets prestigious NAAC A++ / A+ autonomous institutions', icon: '🥈' },
      { value: '35000', label: '20,000 – 50,000 (Mid-Range)', desc: 'Wide selection of reputable regional private & state colleges', icon: '🥉' },
      { value: '75000', label: '50,000 – 1,00,000 (Broad Scope)', desc: 'Balanced convenor and emerging campus opportunities', icon: '🎖️' },
      { value: '120000', label: 'Above 1,00,000 (Open / Management)', desc: 'Convenor branches and category-B management admissions', icon: '🎯' },
    ],
  },
  {
    key: 'budget',
    title: "What is your annual tuition fee comfort zone?",
    subtitle: 'We cross-reference this against audited APHERMC fee gazettes.',
    icon: <Sparkles className="text-emerald-500" size={24} />,
    options: [
      { value: 'under ₹75k (very budget friendly)', label: 'Under ₹75,000 / year', desc: 'State university campuses and subsidized fees', icon: '🟢' },
      { value: '₹75k – ₹1.5l (budget)', label: '₹75,000 – ₹1.5 Lakh / year', desc: 'Standard autonomous and state-affiliated colleges', icon: '🔵' },
      { value: '₹1.5l – ₹2.5l (mid range)', label: '₹1.5 Lakh – ₹2.5 Lakh / year', desc: 'Premier private colleges with top-tier infrastructure', icon: '🟡' },
      { value: '₹2.5l – ₹4l (premium)', label: '₹2.5 Lakh – ₹4 Lakh / year', desc: 'Deemed universities and specialized tech programs', icon: '🟠' },
      { value: '₹4l+ (top tier / global)', label: '₹4 Lakh+ / year', desc: 'Elite research and international private institutions', icon: '🔴' },
    ],
  },
  {
    key: 'location',
    title: 'Which region of Andhra Pradesh do you prefer?',
    subtitle: 'We apply local quota boundaries (AU vs SVU region) and city proximity.',
    icon: <Compass className="text-cyan-500" size={24} />,
    options: [
      { value: 'visakhapatnam / vizag (north coastal)', label: 'Visakhapatnam / Vizag (North Coastal)', desc: 'Coastal AP tech capital, metropolitan universities', icon: '🌊' },
      { value: 'amaravati / vijayawada (capital region)', label: 'Vijayawada / Guntur (Capital Region)', desc: 'Central educational hub, premier autonomous clusters', icon: '🏙️' },
      { value: 'tirupati / chittoor (temple city)', label: 'Tirupati / Chittoor (South AP / SVU)', desc: 'Prominent educational centers in Rayalaseema/South AP', icon: '🛕' },
      { value: 'anantapur / kurnool (rayalaseema)', label: 'Anantapur / Kurnool (Rayalaseema)', desc: 'JNTUA territory and regional government institutions', icon: '🌵' },
      { value: 'kakinada / rajahmundry (godavari)', label: 'Kakinada / Rajahmundry (Godavari)', desc: 'JNTUK hub and esteemed coastal institutions', icon: '🏞️' },
      { value: 'anywhere in andhra pradesh (no preference)', label: 'Anywhere in Andhra Pradesh', desc: 'Show me the highest quality institutions state-wide', icon: '🌏' },
    ],
  },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const { currentUser, updateUserDoc } = useAuth();
  const { universities } = useUniversities();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = QUESTIONS[currentStep];
  const totalSteps = QUESTIONS.length;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleSelectOption = (value: string) => {
    const updatedAnswers = { ...answers, [currentQ.key]: value };
    setAnswers(updatedAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      // Calculate top matching universities using quizAgent
      const { all } = getRecommendations(universities, finalAnswers as unknown as QuizAnswers, 15);
      const topMatches = all.slice(0, 10).map((u) => ({
        id: u.id,
        name: u.name,
        match: u.matchPercent,
      }));

      // Persist results to user document
      if (currentUser?.id) {
        await updateUserDoc({
          quizResults: {
            answers: finalAnswers,
            topMatches,
            completedAt: new Date().toISOString(),
          },
        });
      }

      // Save to localStorage as immediate offline cache
      localStorage.setItem('edudiscovery_quiz_answers', JSON.stringify(finalAnswers));
      localStorage.setItem('edudiscovery_quiz_completed', 'true');

      navigate('/quiz-results');
    } catch (err) {
      console.error('Failed to save quiz results:', err);
      navigate('/quiz-results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (currentUser?.id) {
      await updateUserDoc({
        quizResults: {
          skipped: true,
          completedAt: new Date().toISOString(),
          answers: { rank: '20000', budget: '₹75k – ₹1.5l (budget)' },
          topMatches: [],
        },
      });
    }
    navigate('/home');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '720px' }}>
        {/* Navigation & Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            onClick={() => (currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/home'))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>{currentStep > 0 ? 'Previous' : 'Cancel'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'var(--border)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '36px',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #00d4ff 100%)',
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Question Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '24px',
              padding: '32px 28px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentQ.icon}
              </div>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                    letterSpacing: '0.5px',
                  }}
                >
                  Question {currentStep + 1}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)', margin: '2px 0 0' }}>
                  {currentQ.title}
                </h2>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px 56px' }}>
              {currentQ.subtitle}
            </p>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    disabled={isSubmitting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                    }}
                    className="glow-up"
                  >
                    <span style={{ fontSize: '24px', flexShrink: 0 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {opt.desc}
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    ) : (
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
