import React from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'ai';
}

export default function MessageBubble({ text, sender }: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-2.5 px-3`}
    >
      <div
        style={{
          maxWidth: '82%',
          padding: isUser ? '10px 16px' : '12px 16px',
          fontSize: '14.5px',
          fontWeight: '550',
          lineHeight: '1.45',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser 
            ? 'var(--gradient)' 
            : '#FFFFFF',
          color: isUser ? '#FFFFFF' : '#1E293B',
          border: isUser ? 'none' : '1.5px solid rgba(16, 185, 129, 0.1)',
          boxShadow: isUser 
            ? '0 6px 16px rgba(16, 185, 129, 0.18)' 
            : '0 4px 16px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.2s ease',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        <div>{text}</div>
      </div>
    </motion.div>
  );
}
