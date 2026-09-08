import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  id?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  id = 'loading-state',
}) => {
  return (
    <div id={id} className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};
