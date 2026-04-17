import React, { useState, useRef, useEffect } from 'react';
import { useCounselor } from '@/contexts/CounselorContext';
import { sendChatMessage } from '@/services/api/chatApi';
import { Send, X, Bot, Sparkles, AlertCircle, Trash2, Paperclip, Smile, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import ChatLogo from './ChatLogo';

const SUGGESTED_QUESTIONS = [
  "Why these colleges?",
  "Better options?",
  "Low budget colleges?",
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
        history: messages.map(m => ({ sender: m.sender, text: m.text }))
      });

      if (response && response.reply) {
        setIsLoading(false); // Stop thinking indicator
        
        // Character-by-character streaming simulation
        const reply = response.reply;
        let currentText = '';
        for (let i = 0; i < reply.length; i++) {
          currentText += reply[i];
          setStreamingText(currentText);
          await new Promise(resolve => setTimeout(resolve, 15)); // 15ms delay
        }
        
        addMessage(reply, 'ai');
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
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed bottom-6 right-6 w-[380px] h-[640px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden z-50 border border-slate-200/60"
    >
      {/* Header (Minimalist) */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
            AI
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-[15px]">AI Counselor</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[11px] font-semibold text-slate-400">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-800 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#FAFAFA]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
            <ChatLogo size={70} />
            <p className="text-[15px] font-bold mt-5 text-slate-600">How can I help you?</p>
            <p className="text-[12px] text-slate-400 mt-1 max-w-[200px]">Ask about colleges, budgets, or your career path.</p>
          </div>
        )}

        <div className="flex flex-col gap-1">
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

        {isLoading && (
          <div className="flex gap-1.5 px-6 py-3 bg-white w-fit rounded-full shadow-sm border border-slate-100 animate-fade-in-up">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-duration:0.6s]"></span>
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:150ms]"></span>
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:300ms]"></span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 text-[12px] p-4 rounded-2xl flex items-center gap-3 border border-rose-100 animate-fade-in-up mx-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-bold">{cleanText(error)}</span>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area (Pill Style) */}
      <div className="px-4 py-4 bg-white border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200 rounded-[1.8rem] px-5 py-2 flex items-center transition-all focus-within:border-purple-400 focus-within:bg-white focus-within:shadow-sm">
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
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none resize-none text-[14.5px] py-2 font-medium text-slate-700 placeholder:text-slate-400"
            disabled={isLoading}
          />

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className={`font-bold text-[14px] px-2 transition-all ${
              !input.trim() || isLoading
                ? 'text-purple-300 cursor-not-allowed'
                : 'text-purple-600 hover:text-purple-800'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
