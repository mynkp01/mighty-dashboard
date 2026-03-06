import React from 'react';
import { cn } from '../../utils/helper';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
  width?: string;
  height?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  lines = 1,
  width,
  height,
}) => {
  const baseClasses = 'skeleton-loader';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl h-48',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 ? 'w-3/4' : 'w-full',
              className,
            )}
            style={{ width: width, height: height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        variant === 'circular' ? 'w-12 h-12' : '',
        variant === 'rectangular' ? 'w-full h-4' : '',
        className,
      )}
      style={{ width: width, height: height }}
    />
  );
};

// Card Skeleton Component
export const CardSkeleton: React.FC<{
  className?: string;
  showDescription?: boolean;
}> = ({ className, showDescription = true }) => (
  <div
    className={cn(
      'p-6 border border-gray-200 dark:border-gray-700 rounded-xl',
      className,
    )}
  >
    <div className="flex items-center space-x-4 mb-4">
      <LoadingSkeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1">
        <LoadingSkeleton variant="text" className="h-4 w-3/4 mb-2" />
        <LoadingSkeleton variant="text" className="h-3 w-1/2" />
      </div>
    </div>
    {showDescription && <LoadingSkeleton variant="text" lines={3} />}
  </div>
);

// Table Skeleton Component
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-4">
    {/* Header */}
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={index} variant="text" className="h-4" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton key={colIndex} variant="text" className="h-4" />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
