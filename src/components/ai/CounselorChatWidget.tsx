import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  Bot,
  RefreshCw,
  ExternalLink,
  ListOrdered,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { University } from '@/types';
import { useCounselingPreferences } from '@/hooks/useCounselingPreferences';
import { askAiCounselor, ChatMessage } from '@/services/aiCounselorService';

interface CounselorChatWidgetProps {
  universities: University[];
}

const STARTER_PROMPTS = [
  'Best CSE colleges for my rank?',
  'CSE vs AI/ML & Data Science scope?',
  'How to order Dream, Target & Safe?',
  'Am I eligible for JVD fee reimbursement?',
];

/** Renders inline **bold** and *italic* segments cleanly without raw asterisks */
function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: 600 }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/** Lightweight markdown renderer for headings, bold/italic text, and lists */
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-main)' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: '4px' }} />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)', margin: '4px 0 2px' }}>
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '4px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800, marginTop: '1px' }}>•</span>
              <span style={{ flex: 1 }}>{renderInlineMarkdown(trimmed.slice(2))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '4px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800, minWidth: '18px' }}>{numMatch[1]}.</span>
              <span style={{ flex: 1 }}>{renderInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={i} style={{ margin: 0 }}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

/** Finds up to 3 universities mentioned in the AI reply for quick navigation */
function extractMentionedUniversities(text: string, universities: University[]): University[] {
  const lower = text.toLowerCase();
  const matched: University[] = [];
  for (const uni of universities) {
    if (matched.length >= 3) break;
    const nameMatch = uni.name && lower.includes(uni.name.toLowerCase());
    const shortMatch =
      uni.shortName &&
      uni.shortName.length >= 3 &&
      new RegExp(`\\b${uni.shortName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower);
    if (nameMatch || shortMatch) {
      matched.push(uni);
    }
  }
  return matched;
}

export default function CounselorChatWidget({ universities }: CounselorChatWidgetProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { preferences } = useCounselingPreferences();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    if (window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!promptText) setInput('');
    setIsLoading(true);

    const res = await askAiCounselor(text, nextHistory, preferences, universities);

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: res.reply,
      source: res.source,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const handleRegenerate = async () => {
    if (isLoading || messages.length === 0) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[actualIdx];
    const trimmedHistory = messages.slice(0, actualIdx + 1);

    setMessages(trimmedHistory);
    setIsLoading(true);

    const res = await askAiCounselor(lastUserMsg.content, trimmedHistory, preferences, universities);
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        source: res.source,
        timestamp: Date.now(),
      },
    ]);
    setIsLoading(false);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard?.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      {/* Floating Trigger Button (HomePage Only, above mobile BottomNav) */}
      {!isOpen && (
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open EduAI Counselor"
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '999px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
          }}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 font-bold text-sm border border-white/20 cursor-pointer"
        >
          <Sparkles size={18} />
          <span>Ask EduAI</span>
        </motion.button>
      )}

      {/* Gemini-Style Conversational Drawer (Portaled above Navbar & BottomNav on mobile) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border)',
                  zIndex: 99999,
                  height: '100dvh',
                }}
                className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[440px] md:!h-[640px] md:max-h-[84vh] flex flex-col md:rounded-3xl border shadow-2xl overflow-hidden box-border"
              >
            {/* Header */}
            <div
              style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.25 }}>
                    EduAI Counselor
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Rank #{preferences.rank} · {preferences.category} · {preferences.region}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMessages([])}
                    title="New Chat"
                    style={{ padding: '8px', borderRadius: '10px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close EduAI Counselor"
                  style={{ padding: '8px', borderRadius: '10px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '22px',
                minHeight: 0,
              }}
            >
              {messages.length === 0 ? (
                <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 8px', gap: '18px' }}>
                  <div
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Bot size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
                      How can I help with EAPCET 2026?
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                      Ask about college cutoffs for your rank, JVD fee reimbursement, or B.Tech branch career guidance.
                    </p>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '14px',
                          padding: '11px 14px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isLastAssistant =
                    msg.role === 'assistant' && idx === messages.length - 1 && !isLoading;
                  const mentioned =
                    msg.role === 'assistant' ? extractMentionedUniversities(msg.content, universities) : [];

                  if (msg.role === 'user') {
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div
                          style={{
                            background: 'var(--primary)',
                            color: '#ffffff',
                            padding: '10px 16px',
                            borderRadius: '20px 20px 4px 20px',
                            maxWidth: '82%',
                            fontSize: '13.5px',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Sparkles size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FormattedMessage text={msg.content} />

                        {/* Interactive College Links & Web-Options Shortcut */}
                        {(mentioned.length > 0 || msg.content.toLowerCase().includes('web option')) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {mentioned.map((uni) => (
                              <button
                                key={uni.id}
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/university/${uni.id}`);
                                }}
                                style={{
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  padding: '6px 12px',
                                  borderRadius: '999px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  border: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  cursor: 'pointer',
                                }}
                              >
                                <span>{uni.shortName || uni.code || uni.name}</span>
                                <ExternalLink size={11} />
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                navigate('/web-options');
                              }}
                              style={{
                                background: 'var(--surface)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border)',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                              }}
                            >
                              <ListOrdered size={11} />
                              <span>Web Options</span>
                            </button>
                          </div>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid var(--border)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span>{msg.source === 'huggingface' ? 'ZeroGPU AI' : 'Verified Local Engine'}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isLastAssistant && (
                              <button
                                type="button"
                                onClick={handleRegenerate}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}
                              >
                                <RefreshCw size={11} />
                                <span>Regenerate</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}
                            >
                              {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={14} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 4px' }}>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Gemini-Style Floating Pill Input Bar */}
            <div style={{ padding: '10px 16px calc(16px + env(safe-area-inset-bottom, 0px))', flexShrink: 0, background: 'var(--bg)' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '999px',
                  padding: '6px 6px 6px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about rank, colleges, or branches..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '13.5px',
                    color: 'var(--text-main)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                    opacity: !input.trim() || isLoading ? 0.45 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
