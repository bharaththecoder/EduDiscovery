import React, { createContext, useContext, useState, useEffect } from 'react';
import { universities } from '@/data/universities';
import { getRecommendations } from '@/utils/quizAgent';
import type { QuizAnswers } from '@/utils/quizAgent';

import { useAuth } from './AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface CounselorContextType {
  quizContext: any;
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CounselorContext = createContext<CounselorContextType | undefined>(undefined);

export function CounselorProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const initialMessage: Message = {
    id: '1',
    text: "Hi! I'm your AI College Counselor. Based on your quiz results, I can help you decide which college is best for you. What's on your mind?",
    sender: 'ai',
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const clearMessages = () => {
    setMessages([initialMessage]);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get quiz data from localStorage or currentUser profile
  const [quizContext, setQuizContext] = useState<any>(null);

  useEffect(() => {
    const loadContext = () => {
      // Priority 1: localStorage (most recent/immediate)
      const savedAnswers = localStorage.getItem('edu_quiz_answers');
      let answers: QuizAnswers | null = null;
      
      if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
      } 
      // Priority 2: currentUser profile results (persisted across devices)
      else if (currentUser?.quizResults?.answers) {
        answers = currentUser.quizResults.answers as unknown as QuizAnswers;
      }

      if (answers) {
        const { all } = getRecommendations(universities, answers, 8);
        
        // Calculate averages for breakdown
        const branchAvg = Math.round(all.reduce((acc, u) => acc + u.breakdown.branchPct, 0) / (all.length || 1));
        const budgetAvg = Math.round(all.reduce((acc, u) => acc + u.breakdown.budgetPct, 0) / (all.length || 1));
        const locationAvg = Math.round(all.reduce((acc, u) => acc + u.breakdown.locationPct, 0) / (all.length || 1));

        setQuizContext({
          userPreferences: answers,
          topColleges: all.map(u => ({
            name: u.name,
            matchPercent: u.matchPercent,
            category: u.category,
            id: u.id
          })),
          matchBreakdown: {
            branchAvg,
            budgetAvg,
            locationAvg
          }
        });
      }
    };

    loadContext();
    // Also listen for storage changes in case quiz is retaken
    window.addEventListener('storage', loadContext);
    return () => window.removeEventListener('storage', loadContext);
  }, [currentUser]);

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <CounselorContext.Provider
      value={{
        quizContext,
        messages,
        addMessage,
        clearMessages,
        isLoading,
        setIsLoading,
        error,
        setError,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CounselorContext.Provider>
  );
}

export function useCounselor() {
  const context = useContext(CounselorContext);
  if (!context) {
    throw new Error('useCounselor must be used within a CounselorProvider');
  }
  return context;
}
