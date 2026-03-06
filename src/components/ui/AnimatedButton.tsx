import { Tooltip } from '@mui/material';
import React, { ReactNode } from 'react';
import { cn } from '../../utils/helper';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  showTooltip?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  showTooltip = '',
}) => {
  const baseClasses =
    'relative flex items-center overflow-hidden font-medium rounded-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:from-primary-700 hover:to-primary-700 shadow-lg hover:shadow-xl',
    secondary:
      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-700',
    outline:
      'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
    ghost:
      'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const hoverClasses = 'hover:scale-105 active:scale-95 micro-bounce';

  return (
    <Tooltip
      title={showTooltip && disabled ? 'Action not available' : showTooltip}
      placement="top"
      arrow
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          hoverClasses,
          'button-modern',
          className,
        )}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div
          className={`flex items-center w-fit mx-auto gap-2 min-w-0 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {children}
        </div>
      </button>
    </Tooltip>
  );
};

export default AnimatedButton;
