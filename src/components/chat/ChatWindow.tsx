  import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCounselor } from '@/contexts/CounselorContext';
import { sendChatMessage } from '@/services/api/chatApi';
import { Send, X, Sparkles, Trash2, Cpu, Cloud, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';

const SUGGESTED_QUESTIONS = [
  "Why these college recommendations?",
  "Alternative higher-value options?",
  "Low budget statutory fee colleges?",
  "How to order my web-options?"
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
    predictorContext,
    clearMessages,
    pendingPrompt,
    setPendingPrompt,
    enginePreference,
    setEnginePreference,
    webLlmState,
    initializeLocalModel
  } = useCounselor();

  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [showEngineMenu, setShowEngineMenu] = useState(false);
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

  // Close chat on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  const handleSend = useCallback(async (text: string) => {
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
        enginePreference,
        predictorResults: predictorContext?.results,
        candidateRank: predictorContext?.rank,
        onChunk: (chunk: string) => {
          setIsLoading(false);
          setStreamingText(chunk);
        }
      });

      if (response && response.reply) {
        setIsLoading(false);
        addMessage(response.reply, 'ai', {
          source: response.source,
          engineModel: response.engineModel
        });
        setStreamingText('');
      } else {
        throw new Error('Empty response from AI Counselor');
      }
    } catch (err: any) {
      setError(err.message || "Sorry, I couldn't fetch details. Please try again.");
      setIsLoading(false);
    }
  }, [addMessage, isLoading, messages, quizContext, predictorContext, enginePreference, setError, setIsLoading]);

  useEffect(() => {
    if (pendingPrompt) {
      handleSend(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, handleSend, setPendingPrompt]);

  const isLocalReady = webLlmState.status === 'ready';
  const isDownloading = webLlmState.status === 'downloading' || webLlmState.status === 'initializing';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-[410px] h-[calc(100dvh-70px)] md:h-[calc(100vh-140px)] max-h-[660px] bg-slate-50 dark:bg-slate-950 md:bg-white/95 md:backdrop-blur-xl rounded-t-[2.2rem] md:rounded-t-[2.2rem] md:rounded-b-[1.5rem] shadow-[0_24px_80px_-15px_rgba(0,135,90,0.25)] dark:shadow-[0_24px_80px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-[1000] border border-slate-100/80 dark:border-slate-800/80"
    >
      {/* Mobile Drag Handle */}
      <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 md:hidden opacity-60 shrink-0" />

      {/* Header */}
      <div 
        className="px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-[2.5px] bg-gradient-to-tr from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] flex items-center justify-center shadow-sm">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[var(--primary)] dark:text-[var(--accent)]">
                <Sparkles size={18} className="text-[var(--primary)] dark:text-[var(--accent)] filter drop-shadow(0 0 2px var(--primary-glow))" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-tight">
                AI Counselor
              </h2>
              {/* Engine Status Pill */}
              <button
                onClick={() => {
                  setShowEngineMenu(!showEngineMenu);
                  checkAiBackendHealth().then(h => {
                    if (h) setBackendHealth(h);
                  });
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  backendHealth?.selfHosted?.available
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                    : isLocalReady && enginePreference !== 'cloud'
                    ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                    : isDownloading
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 animate-pulse'
                    : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                }`}
                title="Click to view inference engine options"
              >
                {backendHealth?.selfHosted?.available ? (
                  <>
                    <Server size={10} /> Self-Hosted AI
                  </>
                ) : isLocalReady && enginePreference !== 'cloud' ? (
                  <>
                    <Cpu size={10} /> Local WebGPU
                  </>
                ) : isDownloading ? (
                  <>
                    <Download size={10} /> Loading {webLlmState.progressPercent}%
                  </>
                ) : (
                  <>
                    <Cloud size={10} /> Cloud Fast
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {predictorContext ? `Rank ${predictorContext.rank.toLocaleString('en-IN')} (${predictorContext.category} • ${predictorContext.region})` : 'AP Admissions Specialist'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={clearMessages}
            aria-label="Clear chat history"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/35 rounded-full text-slate-400 hover:text-[var(--primary)] transition-all cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close AI Counselor chat"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Engine Menu Dropdown */}
      <AnimatePresence>
        {showEngineMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[12px] space-y-2 z-20"
          >
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5"><Cpu size={14} /> Inference Engine Mode</span>
              <button onClick={() => setShowEngineMenu(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  setEnginePreference('cloud');
                  setShowEngineMenu(false);
                }}
                className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                  backendHealth?.selfHosted?.available
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Server size={12} className={backendHealth?.selfHosted?.available ? "text-emerald-600" : "text-slate-400"} />
                  <span>Self-Hosted AI</span>
                  {backendHealth?.selfHosted?.available && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-auto" />}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {backendHealth?.selfHosted?.available
                    ? `${backendHealth.selfHosted.model} (Online)`
                    : 'Ollama/vLLM (:11434)'}
                </div>
              </button>

              <button
                onClick={() => {
                  setEnginePreference('cloud');
                  setShowEngineMenu(false);
                }}
                className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                  enginePreference === 'cloud' && !backendHealth?.selfHosted?.available
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Cloud size={12} className="text-blue-500" />
                  <span>Cloud Fast</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Groq qwen3.8-27b stream</div>
              </button>

              <button
                onClick={async () => {
                  setEnginePreference('webgpu');
                  setShowEngineMenu(false);
                  if (webLlmState.status !== 'ready') {
                    await initializeLocalModel();
                  }
                }}
                className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                  enginePreference === 'webgpu' && isLocalReady
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Cpu size={12} className="text-purple-500" />
                  <span>On-Device GPU</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Private WebGPU in browser</div>
              </button>
            </div>

            {webLlmState.status === 'unsupported' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> Device lacks WebGPU. Cloud engine automatically selected.
              </p>
            )}
            {webLlmState.status === 'downloading' && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span>Downloading {webLlmState.activeModel}</span>
                  <span>{webLlmState.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${webLlmState.progressPercent}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">{webLlmState.progressText}</p>
              </div>
            )}
            <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Student privacy: Rank data is only used for admissions calculations.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-2 dark:bg-slate-900"
        style={{
          background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 100%)',
        }}
      >
        {isDownloading && (
          <div className="mx-2 mb-3 p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[12px] space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Cpu size={14} className="animate-pulse text-emerald-600" /> Initializing On-Device AI ({webLlmState.activeModel})
              </span>
              <span>{webLlmState.progressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-200/80 dark:bg-emerald-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${webLlmState.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-emerald-700 dark:text-emerald-400">
              <span className="truncate max-w-[230px]">{webLlmState.progressText || 'Preparing WebGPU runtime...'}</span>
              <button
                onClick={() => setEnginePreference('cloud')}
                className="underline hover:text-emerald-900 dark:hover:text-emerald-200 cursor-pointer shrink-0 font-bold"
              >
                Use Cloud Now
              </button>
            </div>
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <Sparkles size={30} className="text-[var(--primary)] dark:text-[var(--accent)] animate-pulse" />
            </div>
            <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100">
              {predictorContext ? "Admissions Strategy Counselor" : (quizContext ? "Personal Admission Assistant" : "Get Professional Advice")}
            </p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {predictorContext 
                ? `Ready to generate your Round 1 Web-Options list for rank ${predictorContext.rank.toLocaleString('en-IN')}.`
                : (quizContext 
                    ? "Ask anything about your matching colleges, convener fees, and ROI placements." 
                    : "Unlock the full AI advisor experience with our rank predictor or discovery quiz.")}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {messages.length < 4 && (
            <div className="flex flex-wrap gap-2 px-3 mb-4 animate-fade-in-up">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-full text-[12px] font-bold text-[var(--primary)] dark:text-[var(--accent)] shadow-sm hover:border-[var(--accent)] hover:text-[var(--secondary)] dark:hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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

        {/* Loading Indicator */}
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

      {/* Input Box */}
      <div
        className="px-5 pt-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 shrink-0"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div 
          className="rounded-full px-5 py-1.5 flex items-center border transition-all duration-200"
          style={{
            background: 'var(--chip-bg)',
            borderColor: 'var(--border)',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.background = 'var(--surface)';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-light)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.background = 'var(--chip-bg)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            id="chat-counselor-input"
            name="counselor-message"
            aria-label="Ask AI Counselor a question"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder={isLocalReady ? "Ask on-device AI counselor..." : "Ask AI counselor..."}
            className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2 font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 max-h-[100px] no-scrollbar"
            disabled={isLoading}
          />

          <motion.button
            onClick={() => handleSend(input)}
            aria-label="Send question"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-sm shrink-0 tap-target-44"
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
