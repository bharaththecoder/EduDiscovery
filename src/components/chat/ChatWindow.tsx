import React, { useState, useRef, useEffect } from 'react';
import { useCounselor } from '@/contexts/CounselorContext';
import { sendChatMessage } from '@/services/api/chatApi';
import { Send, X, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';

const SUGGESTED_QUESTIONS = [
  "💡 Why these colleges?",
  "⭐ Better options?",
  "💰 Low budget colleges?",
];

const cleanText = (text: string) => {
  return text.replace(/[*#`]/g, "");
};

export default function ChatWindow() {
  const {
    messages,
    addMessage,
    isLoading,
    setIsLoading,
    error,
    setError,
    setIsOpen,
    quizContext,
    clearMessages
  } = useCounselor();

  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, streamingText, error]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInput('');
    setError(null);
    addMessage(userMessage, 'user');
    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await sendChatMessage({
        message: userMessage,
        context: quizContext,
        history: messages.map(m => ({ sender: m.sender, text: m.text })),
        onChunk: (chunk: string) => {
          setIsLoading(false); // Stop the bouncing loader as soon as stream starts
          setStreamingText(chunk);
        }
      });

      if (response && response.reply) {
        setIsLoading(false);
        addMessage(response.reply, 'ai');
        setStreamingText('');
      } else {
        throw new Error('Empty response from AI Counselor');
      }
    } catch (err: any) {
      setError(err.message || 'Sorry, I couldn\'t fetch details. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-[380px] h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] max-h-[620px] bg-slate-50 dark:bg-slate-950 md:bg-white/95 md:backdrop-blur-xl rounded-t-[2.2rem] md:rounded-t-[2.2rem] md:rounded-b-[1.5rem] shadow-[0_24px_80px_-15px_rgba(0,135,90,0.15)] dark:shadow-[0_24px_80px_-15px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden z-50 border border-slate-100/80 dark:border-slate-800/80"
    >
      {/* Concept 3: Premium Insta-Style Header */}
      <div 
        className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
      >
        <div className="flex items-center gap-3">
          {/* Circular Glowing Gradient Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-[2.5px] bg-gradient-to-tr from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] flex items-center justify-center shadow-sm">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[var(--primary)] dark:text-[var(--accent)]">
                <Sparkles size={18} className="text-[var(--primary)] dark:text-[var(--accent)] filter drop-shadow(0 0 2px var(--primary-glow))" />
              </div>
            </div>
            {/* Pulsing Active Beacon */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></span>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-tight flex items-center gap-1">
              AI Counselor
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Active Now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Action buttons */}
          <button 
            onClick={clearMessages}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/35 rounded-full text-slate-400 hover:text-[var(--primary)] transition-all"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-2 dark:bg-slate-900"
        style={{
          background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 100%)',
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <Sparkles size={30} className="text-[var(--primary)] dark:text-[var(--accent)] animate-pulse" />
            </div>
            <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100">
              {quizContext ? "Personal Admission Assistant" : "Get Professional Advice"}
            </p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {quizContext 
                ? "Ask anything about your matching colleges, convener fees, and ROI placements." 
                : "Unlock the full AI advisor experience by completing our discovery preferences quiz."}
            </p>
            {!quizContext && (
              <button 
                onClick={() => { setIsOpen(false); window.location.href = '/quiz'; }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-[13px] font-extrabold rounded-full hover:shadow-[0_8px_20px_rgba(0,135,90,0.25)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Start Preference Quiz
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* Suggested Pill Tags (Concept 3) */}
          {messages.length < 4 && quizContext && (
            <div className="flex flex-wrap gap-2 px-3 mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.replace(/[💡⭐💰]\s*/, ''))}
                  className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-full text-[12px] font-bold text-[var(--primary)] dark:text-[var(--accent)] shadow-sm hover:border-[var(--accent)] hover:text-[var(--secondary)] dark:hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                text={msg.sender === 'ai' ? cleanText(msg.text) : msg.text} 
                sender={msg.sender} 
              />
            ))}
            {streamingText && (
              <MessageBubble 
                key="streaming" 
                text={cleanText(streamingText)} 
                sender="ai" 
              />
            )}
          </AnimatePresence>
        </div>

        {/* Loading message typing indicator */}
        {isLoading && (
          <div className="flex gap-1.5 px-4 py-3 ml-12 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 w-fit rounded-2xl shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s]"></span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:150ms]"></span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:300ms]"></span>
          </div>
        )}

        {error && (
          <div className="text-rose-500 text-[11px] font-bold px-6 py-2 text-center italic">
            {cleanText(error)}
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Clean Pill Input Area (Concept 3) */}
      <div className="px-5 pt-4 pb-7 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 shrink-0">
        <div 
          className="rounded-full px-5 py-1.5 flex items-center border transition-all duration-200 dark:bg-slate-900/60 dark:border-slate-800"
          style={{
            background: '#F8FAFC',
            borderColor: '#E2E8F0',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-light)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2 font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 max-h-[100px] no-scrollbar"
            disabled={isLoading}
          />

          <motion.button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-sm shrink-0 dark:disabled:bg-slate-800"
            style={{
              background: input.trim() 
                ? 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)'
                : 'rgba(226, 232, 240, 0.9)',
              color: input.trim() ? '#fff' : '#94A3B8',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              opacity: input.trim() ? 1 : 0.7,
              marginLeft: '8px'
            }}
            whileHover={input.trim() ? { scale: 1.06 } : {}}
            whileTap={input.trim() ? { scale: 0.94 } : {}}
          >
            <Send size={12} className={input.trim() ? "ml-[1px] text-white" : "ml-[1px] text-slate-400"} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
