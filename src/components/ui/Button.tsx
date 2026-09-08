import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'white' | 'outline-white' | 'outline-dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98] cursor-pointer select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[42px] gap-2',
    lg: 'text-base px-5 py-3 min-h-[48px] gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-xs shadow-indigo-600/20',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-xs',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs',
    'outline-dark': 'border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600',
    white: 'bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 shadow-sm border border-slate-200/60 font-semibold',
    'outline-white': 'border border-white/60 bg-transparent text-white hover:bg-white/10 hover:border-white focus-visible:ring-white',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs shadow-rose-600/20',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs shadow-emerald-600/20',
  };

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
