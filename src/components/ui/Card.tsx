import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  id,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white rounded-2xl border border-slate-200/80 shadow-xs',
    flat: 'bg-slate-50/70 rounded-2xl border border-slate-200/60',
    bordered: 'bg-white rounded-2xl border border-slate-300',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3.5 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      id={id}
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
