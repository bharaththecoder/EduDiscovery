import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { universities } from '@/data/universities';
import { getRecommendations } from '@/utils/quizAgent';
import type { QuizAnswers } from '@/utils/quizAgent';
import { PredictionResult } from '@/utils/predictorEngine';
import { webLlmService, WebLlmProgressState } from '@/services/webLlmService';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  source?: 'webgpu' | 'cloud' | 'fallback';
  engineModel?: string;
}

export interface PredictorContextData {
  exam: string;
  rank: number;
  category: string;
  gender: string;
  region: string;
  preferredBranch: string;
  results: PredictionResult[];
}

export interface CounselorContextType {
  quizContext: Record<string, unknown> | null;
  predictorContext: PredictorContextData | null;
  setPredictorContext: (data: PredictorContextData | null) => void;
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'ai', meta?: { source?: 'webgpu' | 'cloud' | 'fallback'; engineModel?: string }) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  enginePreference: 'auto' | 'webgpu' | 'cloud';
  setEnginePreference: (pref: 'auto' | 'webgpu' | 'cloud') => void;
  webLlmState: WebLlmProgressState;
  initializeLocalModel: () => Promise<boolean>;
  openWithPredictor: (prompt: string, contextData: PredictorContextData) => void;
  openCounselor: (prompt?: string) => void;
}

const defaultCounselorContext: CounselorContextType = {
  quizContext: null,
  predictorContext: null,
  setPredictorContext: () => {},
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
  enginePreference: 'auto',
  setEnginePreference: () => {},
  webLlmState: webLlmService.getState(),
  initializeLocalModel: async () => false,
  openWithPredictor: () => {},
  openCounselor: () => {},
};

const CounselorContext = createContext<CounselorContextType>(defaultCounselorContext);

export function CounselorProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const initialMessage: Message = {
    id: '1',
    text: "Hi! I'm your AI College Counselor. Whether you want to simulate AP EAPCET web options, evaluate closing cutoffs, or check scholarships, I'm here to help. What's on your mind?",
    sender: 'ai',
    timestamp: new Date(),
    source: 'cloud'
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = localStorage.getItem('edudiscovery_counselor_chat');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        return list.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        console.warn('Failed to parse cached chat messages:', e);
      }
    }
    return [initialMessage];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [quizContext, setQuizContext] = useState<Record<string, unknown> | null>(null);
  const [predictorContext, setPredictorContext] = useState<PredictorContextData | null>(null);
  const [enginePreference, setEnginePreference] = useState<'auto' | 'webgpu' | 'cloud'>('webgpu');
  const [webLlmState, setWebLlmState] = useState<WebLlmProgressState>(webLlmService.getState());

  useEffect(() => {
    // Detect client WebGPU capabilities on startup
    webLlmService.detectGpuProfile();
    const unsubscribe = webLlmService.subscribe(setWebLlmState);
    return () => unsubscribe();
  }, []);

  // Proactively initialize on-device local model when counselor opens
  useEffect(() => {
    if (isOpen && enginePreference !== 'cloud') {
      const state = webLlmService.getState();
      if (state.status === 'idle') {
        webLlmService.initializeEngine();
      }
    }
  }, [isOpen, enginePreference]);

  useEffect(() => {
    localStorage.setItem('edudiscovery_counselor_chat', JSON.stringify(messages));
  }, [messages]);

  const clearMessages = () => {
    setMessages([initialMessage]);
    localStorage.removeItem('edudiscovery_counselor_chat');
  };

  useEffect(() => {
    const loadContext = () => {
      const savedAnswers = localStorage.getItem('edu_quiz_answers');
      let answers: QuizAnswers | null = null;

      if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
      } else if (currentUser?.quizResults?.answers) {
        answers = currentUser.quizResults.answers as unknown as QuizAnswers;
      }

      if (answers) {
        const { all } = getRecommendations(universities, answers, 8);
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
    window.addEventListener('storage', loadContext);
    return () => window.removeEventListener('storage', loadContext);
  }, [currentUser]);

  const addMessage = useCallback((
    text: string,
    sender: 'user' | 'ai',
    meta?: { source?: 'webgpu' | 'cloud' | 'fallback'; engineModel?: string }
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
        source: meta?.source,
        engineModel: meta?.engineModel
      },
    ]);
  }, []);

  const initializeLocalModel = useCallback(async () => {
    return await webLlmService.initializeEngine();
  }, []);

  const openWithPredictor = useCallback((prompt: string, contextData: PredictorContextData) => {
    setPredictorContext(contextData);
    setPendingPrompt(prompt);
    setIsOpen(true);
  }, []);

  const openCounselor = useCallback((prompt?: string) => {
    setIsOpen(true);
    if (prompt) setPendingPrompt(prompt);
  }, []);

  return (
    <CounselorContext.Provider
      value={{
        quizContext,
        predictorContext,
        setPredictorContext,
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
        enginePreference,
        setEnginePreference,
        webLlmState,
        initializeLocalModel,
        openWithPredictor,
        openCounselor,
      }}
    >
      {children}
    </CounselorContext.Provider>
  );
}

export function useCounselor() {
  try {
    const context = useContext(CounselorContext);
    return context || defaultCounselorContext;
  } catch (err) {
    console.warn('[useCounselor] Context resolution fallback:', err);
    return defaultCounselorContext;
  }
}
