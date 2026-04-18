import React from 'react';
import { Sparkles, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'ai';
}

export default function MessageBubble({ text, sender }: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-1`}
    >
      <div
        className={`px-4 py-3 rounded-[20px] text-[14.5px] leading-relaxed transition-all duration-200 max-w-[85%] shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm ml-12'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm mr-12'
        }`}
      >
        <div className="font-medium whitespace-pre-wrap">{text}</div>
      </div>
    </motion.div>
  );
}
