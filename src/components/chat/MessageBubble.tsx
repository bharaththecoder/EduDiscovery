import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'ai';
}

export default function MessageBubble({ text, sender }: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 30 : -30, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 300, mass: 0.8 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-3 px-2 items-end gap-2`}
    >
      {!isUser && (
        <div 
          className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 mb-0.5"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
          }}
        >
          <Sparkles size={12} className="text-white animate-pulse" />
        </div>
      )}
      <div
        style={{
          maxWidth: '80%',
          padding: isUser ? '10px 16px' : '12px 16px',
          fontSize: '13.5px',
          fontWeight: '550',
          lineHeight: '1.45',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser 
            ? 'var(--gradient)' 
            : 'var(--surface)',
          color: isUser ? '#FFFFFF' : 'var(--text-main)',
          border: isUser ? 'none' : '1.5px solid var(--border)',
          boxShadow: isUser 
            ? '0 6px 16px rgba(0, 135, 90, 0.15)' 
            : 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        className={!isUser ? "bg-white dark:bg-slate-900/60" : ""}
      >
        <div>{text}</div>
      </div>
    </motion.div>
  );
}
