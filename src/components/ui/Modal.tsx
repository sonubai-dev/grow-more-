import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  id = 'modal-dialog',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-10 my-auto flex flex-col transition-all animate-in zoom-in-95 duration-150`}>
        {(title || onClose) && (
          <div className="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 gap-4">
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h3>}
              {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
            </div>
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
