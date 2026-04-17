import React from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { useCounselor } from '@/contexts/CounselorContext';
import { AnimatePresence } from 'framer-motion';

export default function AICounselor() {
  const { isOpen, quizContext } = useCounselor();

  // Only show the counselor if the user has completed the quiz
  if (!quizContext) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <ChatWindow key="window" />
      ) : (
        <ChatButton key="button" />
      )}
    </AnimatePresence>
  );
}
