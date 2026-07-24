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

export interface CounselorContextType {
  quizContext: Record<string, unknown> | null;
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
}

const defaultCounselorContext: CounselorContextType = {
  quizContext: null,
  messages: [],
  addMessage: () => {},
  clearMessages: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  isOpen: false,
  setIsOpen: () => {},
  pendingPrompt: null,
  setPendingPrompt: () => {},
};

const CounselorContext = createContext<CounselorContextType>(defaultCounselorContext);

export function CounselorProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const initialMessage: Message = {
    id: '1',
    text: "Hi! I'm your AI College Counselor. Based on your quiz results, I can help you decide which college is best for you. What's on your mind?",
    sender: 'ai',
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = localStorage.getItem('edudiscovery_counselor_chat');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        return list.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        console.warn('Failed to parse cached chat messages:', e);
      }
    }
    return [initialMessage];
  });

  useEffect(() => {
    localStorage.setItem('edudiscovery_counselor_chat', JSON.stringify(messages));
  }, [messages]);

  const clearMessages = () => {
    setMessages([initialMessage]);
    localStorage.removeItem('edudiscovery_counselor_chat');
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [quizContext, setQuizContext] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const loadContext = () => {
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
        pendingPrompt,
        setPendingPrompt,
      }}
    >
      {children}
    </CounselorContext.Provider>
  );
}

export function useCounselor() {
  const context = useContext(CounselorContext);
  return context || defaultCounselorContext;
}
