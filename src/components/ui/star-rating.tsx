import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: number;
  className?: string;
}

export const StarRating = ({ 
  value, 
  onChange, 
  disabled = false, 
  size = 20,
  className 
}: StarRatingProps) => {
  return (
    <div className={cn("flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(star)}
          className={cn(
            "transition-colors duration-150",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors duration-150",
              star <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-transparent text-muted-foreground hover:text-yellow-300"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {value > 0 ? `${value}/5` : "Não avaliado"}
      </span>
    </div>
  );
};