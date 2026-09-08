import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 flex items-center shrink-0">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-rose-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
