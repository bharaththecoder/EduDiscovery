import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  {
    q: "Which branch of learning excites you most?",
    options: ['Computer Science & AI', 'Mechanical & Robotics', 'Civil & Architecture', 'Electrical & Electronics'],
    key: 'branch'
  },
  {
    q: "What is your primary goal after graduation?",
    options: ['Top MNC Placements', 'Higher Studies & Research', 'Startup & Entrepreneurship', 'Core Engineering & PSUs'],
    key: 'goal'
  },
  {
    q: "Preferred campus environment?",
    options: ['Bustling Metro City (IT Hub)', 'Serene Green Campus', 'Coastal / Beach City', 'Historic & Cultural Town'],
    key: 'env'
  },
  {
    q: "What's your estimated annual budget?",
    options: ['Under ₹1L (Budget Friendly)', '₹1L - ₹2.5L (Mid Range)', '₹2.5L - ₹5L (Premium)', '₹5L+ (Global Standard)'],
    key: 'budget'
  },
  {
    q: "Your current or expected EAPCET rank?",
    options: ['Top 2000', '2000 - 10000', '10000 - 30000', '30000+'],
    key: 'rank'
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const progress = ((step) / QUESTIONS.length) * 100;
  const current = QUESTIONS[step];

  const handleOption = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = { ...answers, [step]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Save and navigate to result
      localStorage.setItem('edu_quiz_answers', JSON.stringify(newAnswers));
      navigate('/quiz-result', { state: { answers: newAnswers } });
    }
  };

  const handleBack = () => {
    if (step === 0) { navigate(-1); return; }
    setStep(step - 1);
    setSelected(answers[step - 1] || null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px', marginBottom: '24px', gap: '12px' }}>
        <button onClick={handleBack} style={{
          background: 'var(--primary-light)', color: 'var(--primary)',
          width: '40px', height: '40px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', marginBottom: '20px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {['🎓', '📍', '⭐', '💰', '📊'][step]}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', lineHeight: 1.3, marginBottom: '8px' }}>
          {current.q}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Choose the option that best fits your goals.
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {current.options.map(opt => (
          <button
            key={opt}
            className={`quiz-option ${selected === opt ? 'selected' : ''}`}
            onClick={() => handleOption(opt)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: `2px solid ${selected === opt ? '#fff' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selected === opt && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              {opt}
            </div>
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={selected === null}
        className="btn btn-primary btn-full"
        style={{ padding: '16px', fontSize: '16px', opacity: selected === null ? 0.5 : 1 }}
      >
        {step === QUESTIONS.length - 1 ? 'See My Results 🎉' : 'Next Question →'}
      </button>
    </div>
  );
}
