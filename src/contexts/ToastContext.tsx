import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'success' | 'error', duration?: number) => void;
}

const defaultToastContext: ToastContextType = {
  showToast: () => {},
};

const ToastContext = createContext<ToastContextType>(defaultToastContext);
export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  return ctx || defaultToastContext;
};

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const value = React.useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 99999,
        pointerEvents: 'none',
        alignItems: 'center'
      }}>
        <AnimatePresence>
          {toasts.map(t => {
            let Icon = Info;
            let color = 'var(--primary)';
            
            if (t.type === 'success') {
              Icon = CheckCircle2;
              color = '#10B981';
            } else if (t.type === 'error') {
              Icon = AlertCircle;
              color = '#EF4444';
            } else {
              color = '#3B82F6';
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(8px)', transition: { duration: 0.2 } }}
                style={{
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05) inset',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                  minWidth: '320px',
                  maxWidth: '500px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${color}15`,
                  borderRadius: '50%',
                  padding: '8px',
                  color: color
                }}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                
                <div style={{ flex: 1, color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, lineHeight: 1.4 }}>
                  {t.message}
                </div>
                
                <button 
                  onClick={() => removeToast(t.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
