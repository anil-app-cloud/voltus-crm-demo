import React from 'react';
import { cn } from '../../lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'border-primary',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className="relative flex justify-center items-center">
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-t-transparent',
          sizeClasses[size],
          color,
          className
        )}
      />
    </div>
  );
};

export default Spinner; 