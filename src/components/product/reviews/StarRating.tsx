import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  id?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
  className = '',
  id,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getStarSizeClass = () => {
    if (typeof size === 'number') return `w-[${size}px] h-[${size}px]`;
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'md':
      default:
        return 'w-5 h-5';
    }
  };

  const starSizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      id={id || 'star-rating-container'}
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = currentDisplayRating >= starValue;
          const isHalf = !isFilled && currentDisplayRating >= starValue - 0.5;

          return (
            <button
              key={index}
              id={`star-btn-${starValue}`}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`relative transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-110 active:scale-95 focus:outline-none'
                  : 'cursor-default'
              }`}
              aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
            >
              {/* Background empty star */}
              <Star
                className={`${getStarSizeClass()} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400'
                    : 'text-neutral-300'
                }`}
                style={starSizeStyle}
                strokeWidth={1.5}
              />

              {/* Half-filled overlay if applicable */}
              {isHalf && (
                <span
                  className="absolute top-0 left-0 overflow-hidden w-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <Star
                    className={`${getStarSizeClass()} text-amber-400 fill-amber-400`}
                    style={starSizeStyle}
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1.5 text-xs font-semibold text-neutral-800 tracking-tight">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
