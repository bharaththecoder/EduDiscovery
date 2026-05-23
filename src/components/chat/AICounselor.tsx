import React from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { useCounselor } from '@/contexts/CounselorContext';
import { AnimatePresence } from 'framer-motion';

export default function AICounselor() {
  const { isOpen, quizContext } = useCounselor();

  // The counselor is now always visible to provide a better user experience
  // Even if quiz results are missing, users can interact with it.

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
