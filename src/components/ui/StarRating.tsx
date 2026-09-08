import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { FeedbackRating } from '../../types';

export interface StarRatingProps {
  rating?: number;
  onChange?: (rating: FeedbackRating) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  id?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onChange,
  interactive = false,
  size = 'md',
  showLabel = false,
  id = 'star-rating',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8 sm:w-10 sm:h-10',
  };

  const buttonPadding = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-2 min-w-[42px] min-h-[42px]',
    xl: 'p-2.5 min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px]',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  const labels: Record<number, string> = {
    1: 'Poor / Needs Attention',
    2: 'Fair / Could Be Better',
    3: 'Average / Neutral',
    4: 'Great Experience!',
    5: 'Excellent / Outstanding!',
  };

  const handleKeyDown = (e: React.KeyboardEvent, star: FeedbackRating) => {
    if (!interactive || !onChange) return;

    let nextRating: FeedbackRating | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextRating = Math.min(5, (rating || star) + 1) as FeedbackRating;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextRating = Math.max(1, (rating || star) - 1) as FeedbackRating;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextRating = 1;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextRating = 5;
    } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      nextRating = Number(e.key) as FeedbackRating;
    }

    if (nextRating !== null) {
      onChange(nextRating);
      const nextBtn = document.getElementById(`${id}-star-${nextRating}`);
      if (nextBtn) nextBtn.focus();
    }
  };

  return (
    <div id={id} className="flex flex-col items-center gap-2.5">
      <div
        role={interactive ? 'radiogroup' : undefined}
        aria-label={interactive ? 'Customer satisfaction rating from 1 to 5 stars' : undefined}
        className="flex items-center gap-1 sm:gap-1.5 touch-manipulation select-none"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {([1, 2, 3, 4, 5] as FeedbackRating[]).map((star) => {
          const isFilled = star <= currentVal;
          const isSelected = rating === star;
          const tabIndex = !interactive ? -1 : isSelected || (rating === 0 && star === 1) ? 0 : -1;

          return (
            <button
              key={star}
              type="button"
              id={`${id}-star-${star}`}
              disabled={!interactive}
              role={interactive ? 'radio' : undefined}
              aria-checked={interactive ? isSelected : undefined}
              tabIndex={tabIndex}
              onClick={() => interactive && onChange && onChange(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              className={`${
                interactive
                  ? `cursor-pointer hover:scale-110 active:scale-95 transition-all duration-150 flex items-center justify-center ${buttonPadding[size]}`
                  : 'cursor-default p-0'
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-xl`}
              aria-label={`${star} star${star > 1 ? 's' : ''}: ${labels[star] || ''}`}
            >
              <Star
                className={`${starSizes[size]} transition-all duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-2xs scale-105'
                    : 'fill-slate-100 text-slate-300 hover:text-slate-400'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      {showLabel && currentVal > 0 && (
        <span
          aria-live="polite"
          className="text-xs sm:text-sm font-semibold text-slate-700 transition-opacity animate-in fade-in duration-150"
        >
          {labels[Math.round(currentVal)] || ''}
        </span>
      )}
    </div>
  );
};
