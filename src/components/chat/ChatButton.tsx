import React from 'react';
import { useCounselor } from '@/contexts/CounselorContext';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatLogo from './ChatLogo';

export default function ChatButton() {
  const { isOpen, setIsOpen } = useCounselor();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
            transition={{ delay: 1 }}
            className="bg-white/90 backdrop-blur-xl px-5 py-3.5 rounded-[1.8rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 mb-1 hidden md:block relative group overflow-hidden"
          >
            {/* Animated Background Highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <Sparkles size={18} className="fill-white" />
              </div>
              <div className="flex flex-col">
                <p className="text-[13px] font-extrabold text-slate-800 leading-tight">Need help deciding?</p>
                <p className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
                  Ask our AI Counselor 
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </p>
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white/90 backdrop-blur-xl border-r border-b border-white/50 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative group p-1"
      >
        {/* Animated Rings */}
        <span className="absolute inset-0 rounded-[2rem] bg-purple-400/20 animate-ping opacity-75"></span>
        <span className="absolute inset-0 rounded-[2rem] border-2 border-purple-500/20 scale-110 animate-pulse"></span>
        
        <div className="relative z-10 transition-all duration-500 hover:rotate-6">
          <ChatLogo size={68} />
        </div>
        
        {/* Status Indicator */}
        <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md z-20">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </motion.button>
    </div>
  );
}
