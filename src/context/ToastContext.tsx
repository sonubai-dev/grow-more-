import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-700'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-300" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-300" />}
            </div>
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              <div className="text-slate-200 leading-snug">{toast.message}</div>
            </div>
            <button
              id={`close-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
