import React from 'react';
import { cn } from '../../utils/helper';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  animate = false,
}) => {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('completed') || statusLower.includes('success') || statusLower.includes('green')) {
      return 'bg-success-100 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-400';
    }
    if (statusLower.includes('pending') || statusLower.includes('warning') || statusLower.includes('yellow')) {
      return 'bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-400';
    }
    if (statusLower.includes('error') || statusLower.includes('failed') || statusLower.includes('red')) {
      return 'bg-error-100 text-error-700 border-error-200 dark:bg-error-900/20 dark:text-error-400';
    }
    if (statusLower.includes('progress') || statusLower.includes('info') || statusLower.includes('blue')) {
      return 'bg-blue-light-100 text-blue-light-700 border-blue-light-200 dark:bg-blue-light-900/20 dark:text-blue-light-400';
    }
    
    return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const variantClasses = {
    default: 'rounded-md border',
    dot: 'rounded-full border flex items-center gap-1.5',
    pill: 'rounded-full border',
  };

  const getDotColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('completed') || statusLower.includes('success') || statusLower.includes('green')) {
      return 'bg-success-500';
    }
    if (statusLower.includes('pending') || statusLower.includes('warning') || statusLower.includes('yellow')) {
      return 'bg-warning-500';
    }
    if (statusLower.includes('error') || statusLower.includes('failed') || statusLower.includes('red')) {
      return 'bg-error-500';
    }
    if (statusLower.includes('progress') || statusLower.includes('info') || statusLower.includes('blue')) {
      return 'bg-blue-light-500';
    }
    
    return 'bg-gray-500';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium transition-all duration-200',
        getStatusColor(status),
        sizeClasses[size],
        variantClasses[variant],
        animate ? 'animate-fadeIn' : '',
        'hover:scale-105'
      )}
    >
      {variant === 'dot' && (
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            getDotColor(status),
            animate ? 'animate-pulse' : ''
          )}
        />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;