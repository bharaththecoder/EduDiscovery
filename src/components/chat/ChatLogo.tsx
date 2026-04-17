import React from 'react';
import { motion } from 'framer-motion';

export default function ChatLogo({ size = 40, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer Glow / Pulse */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute inset-0 rounded-2xl bg-indigo-400 blur-xl"
      />
      
      {/* Main Container */}
      <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
        {/* Animated Background Shapes */}
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute inset-0 opacity-30"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[conic-gradient(from_0deg,transparent,white,transparent)]" />
        </motion.div>

        {/* AI Icon / Symbol */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-1/2 h-1/2 text-white relative z-10"
        >
          <motion.path 
            d="M12 4L14.5 9L20 10L16 14L17 19.5L12 17L7 19.5L8 14L4 10L9.5 9L12 4Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.circle 
            cx="12" cy="12" r="2" 
            fill="currentColor"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>

        {/* Reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </div>
  );
}
