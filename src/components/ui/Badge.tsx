import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'primary';
  size?: 'sm' | 'md';
  id?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  id,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-100/90 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-0.5 font-semibold gap-1.5',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
