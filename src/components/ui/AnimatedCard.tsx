import React, { ReactNode } from 'react';
import { cn } from '../../utils/helper';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  glass = false,
  delay = 0,
}) => {
  const baseClasses = 'rounded-xl p-6 transition-all duration-300 ease-out';
  
  const hoverClasses = hover 
    ? 'hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1' 
    : '';
    
  const gradientClasses = gradient 
    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' 
    : 'bg-white dark:bg-gray-800';
    
  const glassClasses = glass 
    ? 'backdrop-blur-md bg-white/10 border border-white/20' 
    : 'border border-gray-200 dark:border-gray-700';

  return (
    <div
      className={cn(
        baseClasses,
        hoverClasses,
        gradientClasses,
        glassClasses,
        'animate-fadeInUp',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;