import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  changePeriod?: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  id?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  changePeriod,
  subtitle,
  icon,
  iconBgColor = 'bg-indigo-50 text-indigo-600',
  id,
}) => {
  return (
    <Card id={id} className="relative overflow-hidden transition-all duration-150 hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</p>
          <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          {change && (
            <div className="flex items-center gap-1.5 min-w-0">
              {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
              {changeType === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <span
                className={`font-semibold truncate ${
                  changeType === 'positive'
                    ? 'text-emerald-700'
                    : changeType === 'negative'
                    ? 'text-rose-700'
                    : 'text-slate-600'
                }`}
              >
                {change}
              </span>
              {changePeriod && <span className="text-slate-400 shrink-0">{changePeriod}</span>}
            </div>
          )}
          {subtitle && <span className="text-slate-500 font-medium text-right shrink-0 truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
